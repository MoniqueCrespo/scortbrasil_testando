import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Webhook received:', body);

    // Mercado Pago envia notificações no formato: { type: "payment", data: { id: "payment_id" } }
    if (body.type !== 'payment') {
      console.log('Ignoring non-payment notification');
      return new Response(JSON.stringify({ status: 'ignored' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      throw new Error('Payment ID not found in webhook');
    }

    // Obter token do Mercado Pago
    const mpAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!mpAccessToken) {
      throw new Error('Mercado Pago access token not configured');
    }

    // Buscar informações do pagamento
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`,
      },
    });

    if (!mpResponse.ok) {
      throw new Error('Failed to fetch payment details');
    }

    const payment = await mpResponse.json();
    console.log('Payment details:', payment);

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extrair referência externa
    let externalReference;
    try {
      externalReference = JSON.parse(payment.external_reference);
    } catch (e) {
      console.error('Failed to parse external reference:', e);
      return new Response(JSON.stringify({ status: 'error', message: 'Invalid external reference' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const { user_id, profile_id, package_id, type } = externalReference;

    // Processar de acordo com o tipo de pagamento
    if (type === 'boost') {
      // Buscar dados do pacote de boost
      const { data: boostPackage, error: packageError } = await supabase
        .from('boost_packages')
        .select('*')
        .eq('id', package_id)
        .single();

      if (packageError || !boostPackage) {
        throw new Error('Boost package not found');
      }

      if (payment.status === 'approved') {
        console.log('Payment approved, activating boost');

        // Calcular data de expiração
        const endDate = new Date();
        endDate.setHours(endDate.getHours() + boostPackage.duration_hours);

        // Criar boost ativo
        await supabase
          .from('active_boosts')
          .insert({
            user_id,
            profile_id,
            package_id,
            end_date: endDate.toISOString(),
            payment_method: 'mercadopago',
            payment_id: payment.id.toString(),
            status: 'active'
          });

        // Atualizar perfil para featured
        await supabase
          .from('model_profiles')
          .update({ featured: true })
          .eq('id', profile_id);

        // Criar notificação em tempo real
        await supabase
          .from('notifications')
          .insert({
            user_id,
            type: 'boost_activated',
            title: '🚀 Boost Ativado!',
            message: `Seu boost ${boostPackage.name} foi ativado com sucesso.`,
            metadata: {
              boost_name: boostPackage.name,
              duration_hours: boostPackage.duration_hours,
              profile_id,
              payment_id: payment.id.toString()
            }
          });

        console.log('Boost activated successfully');
      }

      return new Response(
        JSON.stringify({ status: 'processed' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Se não for boost, processar como assinatura premium
    const plan_id = package_id;
    
    // Buscar dados do plano
    const { data: plan, error: planError } = await supabase
      .from('premium_plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      throw new Error('Plan not found');
    }

    // Processar de acordo com o status do pagamento
    if (payment.status === 'approved') {
      console.log('Payment approved, activating subscription');

      // Calcular data de expiração
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration_days);

      // Atualizar assinatura para ativa
      const { error: updateError } = await supabase
        .from('premium_subscriptions')
        .update({
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          payment_id: payment.id.toString(),
        })
        .eq('user_id', user_id)
        .eq('plan_id', plan_id)
        .eq('profile_id', profile_id)
        .eq('status', 'pending');

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        throw updateError;
      }

      // Se o plano inclui destaque, ativar no perfil
      if (plan.name.toLowerCase().includes('destaque') || plan.name.toLowerCase().includes('premium')) {
        const { error: profileError } = await supabase
          .from('model_profiles')
          .update({ featured: true })
          .eq('id', profile_id);

        if (profileError) {
          console.error('Error updating profile featured status:', profileError);
        }
      }

      console.log('Subscription activated successfully');

    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
      console.log('Payment rejected/cancelled, updating subscription');

      // Atualizar assinatura para cancelada
      const { error: updateError } = await supabase
        .from('premium_subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', user_id)
        .eq('plan_id', plan_id)
        .eq('profile_id', profile_id)
        .eq('status', 'pending');

      if (updateError) {
        console.error('Error updating subscription:', updateError);
      }
    }

    return new Response(
      JSON.stringify({ status: 'processed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in mercadopago-webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

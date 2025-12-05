import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile_id, package_id, payment_method } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Buscar pacote de boost
    const { data: boostPackage, error: packageError } = await supabaseClient
      .from('boost_packages')
      .select('*')
      .eq('id', package_id)
      .eq('is_active', true)
      .single();

    if (packageError || !boostPackage) {
      throw new Error('Pacote de boost não encontrado');
    }

    if (payment_method === 'credits') {
      // Verificar saldo de créditos
      const { data: userCredits } = await supabaseClient
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!userCredits || userCredits.balance < boostPackage.credit_cost) {
        throw new Error('Saldo de créditos insuficiente');
      }

      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Deduzir créditos
      await supabaseAdmin
        .from('user_credits')
        .update({
          balance: userCredits.balance - boostPackage.credit_cost,
          total_spent: userCredits.total_spent + boostPackage.credit_cost,
        })
        .eq('user_id', user.id);

      // Registrar transação
      const { data: transaction } = await supabaseAdmin
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: -boostPackage.credit_cost,
          transaction_type: 'boost',
          description: `Ativação de ${boostPackage.name}`,
          reference_id: profile_id,
        })
        .select()
        .single();

      // Criar boost ativo
      const endDate = new Date();
      endDate.setHours(endDate.getHours() + boostPackage.duration_hours);

      await supabaseAdmin
        .from('active_boosts')
        .insert({
          user_id: user.id,
          profile_id,
          package_id,
          end_date: endDate.toISOString(),
          payment_method: 'credits',
          credit_transaction_id: transaction?.id,
        });

      // Atualizar perfil para featured
      await supabaseAdmin
        .from('model_profiles')
        .update({ featured: true })
        .eq('id', profile_id);

      return new Response(
        JSON.stringify({ success: true, message: 'Boost ativado com sucesso!' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Pagamento via Mercado Pago com PIX only
      const mercadopagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
      
      const preference = {
        items: [{
          title: `${boostPackage.name} - ${boostPackage.duration_hours}h`,
          quantity: 1,
          unit_price: Number(boostPackage.price),
          currency_id: 'BRL',
        }],
        back_urls: {
          success: `${req.headers.get('origin')}/dashboard/modelo?boost=success`,
          failure: `${req.headers.get('origin')}/dashboard/modelo?boost=failed`,
          pending: `${req.headers.get('origin')}/dashboard/modelo?boost=pending`,
        },
        auto_return: 'approved',
        external_reference: JSON.stringify({
          user_id: user.id,
          profile_id,
          package_id,
          type: 'boost'
        }),
        notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`,
      };

      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mercadopagoAccessToken}`,
        },
        body: JSON.stringify(preference),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Erro Mercado Pago:', data);
        throw new Error('Erro ao criar preferência de pagamento');
      }

      return new Response(
        JSON.stringify({ init_point: data.init_point }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
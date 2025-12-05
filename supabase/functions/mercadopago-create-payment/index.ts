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
    const { plan_id, profile_id } = await req.json();
    
    if (!plan_id || !profile_id) {
      throw new Error('Missing plan_id or profile_id');
    }

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obter informações do usuário do header de autorização
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Buscar dados do plano
    const { data: plan, error: planError } = await supabase
      .from('premium_plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      throw new Error('Plan not found');
    }

    // Buscar dados do perfil
    const { data: profile, error: profileError } = await supabase
      .from('model_profiles')
      .select('*')
      .eq('id', profile_id)
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Profile not found or unauthorized');
    }

    // Obter token do Mercado Pago
    const mpAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!mpAccessToken) {
      throw new Error('Mercado Pago access token not configured');
    }

    // Criar preferência de pagamento no Mercado Pago
    const preference = {
      items: [
        {
          title: plan.name,
          description: plan.description,
          quantity: 1,
          unit_price: Number(plan.price),
        }
      ],
      back_urls: {
        success: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`,
        failure: `${req.headers.get('origin')}/planos?payment=failed`,
        pending: `${req.headers.get('origin')}/planos?payment=pending`,
      },
      auto_return: 'approved',
      external_reference: JSON.stringify({
        user_id: user.id,
        plan_id: plan.id,
        profile_id: profile.id,
      }),
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`,
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error('Mercado Pago API error:', errorText);
      throw new Error('Failed to create payment preference');
    }

    const mpData = await mpResponse.json();

    // Criar registro de assinatura pendente
    const { error: subscriptionError } = await supabase
      .from('premium_subscriptions')
      .insert({
        user_id: user.id,
        profile_id: profile.id,
        plan_id: plan.id,
        status: 'pending',
        payment_method: 'mercadopago',
        payment_id: mpData.id,
      });

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError);
    }

    console.log('Payment preference created successfully:', mpData.id);

    return new Response(
      JSON.stringify({ 
        init_point: mpData.init_point,
        preference_id: mpData.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in mercadopago-create-payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});

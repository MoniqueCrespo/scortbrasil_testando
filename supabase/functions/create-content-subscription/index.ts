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
    const { tier_id, profile_id } = await req.json();

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

    // Get tier details
    const { data: tier, error: tierError } = await supabaseClient
      .from('subscription_tiers')
      .select('*, model_profiles!inner(name)')
      .eq('id', tier_id)
      .eq('is_active', true)
      .single();

    if (tierError || !tier) {
      throw new Error('Plano de assinatura não encontrado');
    }

    const mercadopagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!mercadopagoAccessToken) {
      throw new Error('Token do Mercado Pago não configurado');
    }

    // Calculate end date (30 days from now)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const preference = {
      items: [{
        title: `Assinatura: ${tier.model_profiles.name} - ${tier.tier_name}`,
        quantity: 1,
        unit_price: Number(tier.monthly_price),
        currency_id: 'BRL',
      }],
      back_urls: {
        success: `${req.headers.get('origin')}/minhas-assinaturas?payment=success`,
        failure: `${req.headers.get('origin')}/minhas-assinaturas?payment=failed`,
        pending: `${req.headers.get('origin')}/minhas-assinaturas?payment=pending`,
      },
      auto_return: 'approved',
      external_reference: JSON.stringify({
        user_id: user.id,
        profile_id: profile_id,
        tier_id: tier_id,
        type: 'content_subscription',
        end_date: endDate.toISOString()
      }),
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/process-subscription-payment`,
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

    // Create pending subscription
    const { error: subscriptionError } = await supabaseClient
      .from('content_subscriptions')
      .insert({
        subscriber_id: user.id,
        profile_id: profile_id,
        tier_id: tier_id,
        status: 'pending',
        end_date: endDate.toISOString(),
        payment_id: data.id,
      });

    if (subscriptionError) {
      console.error('Erro ao criar assinatura:', subscriptionError);
      throw new Error('Erro ao criar assinatura');
    }

    return new Response(
      JSON.stringify({ init_point: data.init_point, preference_id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

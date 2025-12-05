import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PLATFORM_FEE_PERCENT = 20;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ppv_content_id } = await req.json();

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

    // Get PPV content details
    const { data: ppvContent, error: ppvError } = await supabaseClient
      .from('ppv_content')
      .select('*, model_profiles!inner(name, user_id)')
      .eq('id', ppv_content_id)
      .eq('is_active', true)
      .single();

    if (ppvError || !ppvContent) {
      throw new Error('Conteúdo PPV não encontrado');
    }

    // Check if already purchased
    const { data: existingPurchase } = await supabaseClient
      .from('ppv_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('ppv_content_id', ppv_content_id)
      .maybeSingle();

    if (existingPurchase) {
      return new Response(
        JSON.stringify({ already_purchased: true, message: 'Você já possui este conteúdo' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mercadopagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!mercadopagoAccessToken) {
      throw new Error('Token do Mercado Pago não configurado');
    }

    const preference = {
      items: [{
        title: `PPV: ${ppvContent.title} - ${ppvContent.model_profiles.name}`,
        quantity: 1,
        unit_price: Number(ppvContent.price),
        currency_id: 'BRL',
      }],
      back_urls: {
        success: `${req.headers.get('origin')}/minhas-assinaturas?payment=success&type=ppv`,
        failure: `${req.headers.get('origin')}/minhas-assinaturas?payment=failed`,
        pending: `${req.headers.get('origin')}/minhas-assinaturas?payment=pending`,
      },
      auto_return: 'approved',
      external_reference: JSON.stringify({
        user_id: user.id,
        ppv_content_id: ppv_content_id,
        profile_id: ppvContent.profile_id,
        type: 'ppv_purchase',
      }),
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/process-ppv-payment`,
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

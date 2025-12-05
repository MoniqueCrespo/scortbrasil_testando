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
    const { package_id } = await req.json();

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

    const { data: package_data, error: packageError } = await supabaseClient
      .from('credit_packages')
      .select('*')
      .eq('id', package_id)
      .eq('is_active', true)
      .single();

    if (packageError || !package_data) {
      throw new Error('Pacote não encontrado');
    }

    const mercadopagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!mercadopagoAccessToken) {
      throw new Error('Token do Mercado Pago não configurado');
    }

    const totalCredits = package_data.credits + (package_data.bonus_credits || 0);

    const preference = {
      items: [{
        title: `${package_data.name} - ${totalCredits} Créditos`,
        quantity: 1,
        unit_price: Number(package_data.price),
        currency_id: 'BRL',
      }],
      back_urls: {
        success: `${req.headers.get('origin')}/dashboard/modelo?payment=success`,
        failure: `${req.headers.get('origin')}/dashboard/modelo?payment=failed`,
        pending: `${req.headers.get('origin')}/dashboard/modelo?payment=pending`,
      },
      auto_return: 'approved',
      external_reference: JSON.stringify({
        user_id: user.id,
        package_id: package_id,
        type: 'credits'
      }),
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook-credits`,
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
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
    const { subscription_id } = await req.json();

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

    // Verify subscription belongs to user
    const { data: subscription, error: fetchError } = await supabaseClient
      .from('content_subscriptions')
      .select('*')
      .eq('id', subscription_id)
      .eq('subscriber_id', user.id)
      .single();

    if (fetchError || !subscription) {
      throw new Error('Assinatura não encontrada');
    }

    if (subscription.status !== 'active') {
      throw new Error('Assinatura não está ativa');
    }

    // Cancel auto-renewal (subscription stays active until end_date)
    const { error: updateError } = await supabaseClient
      .from('content_subscriptions')
      .update({ auto_renew: false })
      .eq('id', subscription_id);

    if (updateError) {
      console.error('Erro ao cancelar assinatura:', updateError);
      throw new Error('Erro ao cancelar assinatura');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Renovação automática cancelada. Seu acesso permanece ativo até o fim do período pago.',
        end_date: subscription.end_date
      }),
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

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
    const { profile_id, service_id } = await req.json();

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

    // Buscar serviço premium
    const { data: service, error: serviceError } = await supabaseClient
      .from('premium_services')
      .select('*')
      .eq('id', service_id)
      .eq('is_active', true)
      .single();

    if (serviceError || !service) {
      throw new Error('Serviço não encontrado');
    }

    // Verificar saldo de créditos
    const { data: userCredits } = await supabaseClient
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!userCredits || userCredits.balance < service.credit_cost) {
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
        balance: userCredits.balance - service.credit_cost,
        total_spent: userCredits.total_spent + service.credit_cost,
      })
      .eq('user_id', user.id);

    // Registrar transação
    const { data: transaction } = await supabaseAdmin
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount: -service.credit_cost,
        transaction_type: 'premium_service',
        description: `Ativação de ${service.name}`,
        reference_id: profile_id,
      })
      .select()
      .single();

    // Criar serviço ativo
    const endDate = service.duration_days ? new Date() : null;
    if (endDate) {
      endDate.setDate(endDate.getDate() + service.duration_days);
    }

    await supabaseAdmin
      .from('active_premium_services')
      .insert({
        user_id: user.id,
        profile_id,
        service_id,
        end_date: endDate?.toISOString(),
        credit_transaction_id: transaction?.id,
      });

    return new Response(
      JSON.stringify({ success: true, message: 'Serviço premium ativado com sucesso!' }),
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
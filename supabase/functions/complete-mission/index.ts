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
    const { mission_id } = await req.json();

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

    // Buscar missão
    const { data: mission } = await supabaseClient
      .from('daily_missions')
      .select('*')
      .eq('id', mission_id)
      .eq('is_active', true)
      .single();

    if (!mission) {
      throw new Error('Missão não encontrada');
    }

    const today = new Date().toISOString().split('T')[0];

    // Verificar se já foi completada hoje
    const { data: progress } = await supabaseClient
      .from('user_mission_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('mission_id', mission_id)
      .eq('date', today)
      .single();

    if (progress?.completed) {
      throw new Error('Missão já completada hoje');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Marcar como completada
    await supabaseAdmin
      .from('user_mission_progress')
      .upsert({
        user_id: user.id,
        mission_id,
        current_value: mission.target_value,
        completed: true,
        completed_at: new Date().toISOString(),
        date: today,
      });

    // Creditar recompensa
    const { data: userCredits } = await supabaseAdmin
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (userCredits) {
      await supabaseAdmin
        .from('user_credits')
        .update({
          balance: userCredits.balance + mission.credit_reward,
          total_earned: userCredits.total_earned + mission.credit_reward,
        })
        .eq('user_id', user.id);
    } else {
      await supabaseAdmin
        .from('user_credits')
        .insert({
          user_id: user.id,
          balance: mission.credit_reward,
          total_earned: mission.credit_reward,
        });
    }

    // Registrar transação
    await supabaseAdmin
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount: mission.credit_reward,
        transaction_type: 'mission',
        description: `Missão completada: ${mission.name}`,
        reference_id: mission_id,
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        credits_earned: mission.credit_reward,
        message: `Parabéns! Você ganhou ${mission.credit_reward} créditos!` 
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
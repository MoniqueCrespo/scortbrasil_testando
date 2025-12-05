import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PayoutRequest {
  profileId: string;
  amount: number;
  pixKey: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { profileId, amount, pixKey }: PayoutRequest = await req.json();

    console.log('Processing payout request:', { profileId, amount, userId: user.id });

    // Verify profile ownership
    const { data: profile } = await supabase
      .from('model_profiles')
      .select('id')
      .eq('id', profileId)
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      throw new Error('Profile not found or unauthorized');
    }

    // Validate amount
    if (amount < 100) {
      throw new Error('Valor mínimo para saque é R$ 100,00');
    }

    // Get current earnings
    const { data: earnings } = await supabase
      .from('creator_earnings')
      .select('pending_payout')
      .eq('profile_id', profileId)
      .single();

    if (!earnings || earnings.pending_payout < amount) {
      throw new Error('Saldo insuficiente');
    }

    // Create payout request
    const { error: payoutError } = await supabase
      .from('creator_payouts')
      .insert({
        profile_id: profileId,
        amount,
        pix_key: pixKey,
        status: 'pending'
      });

    if (payoutError) throw payoutError;

    // Update earnings (move from pending to processing)
    const { error: earningsError } = await supabase
      .from('creator_earnings')
      .update({
        pending_payout: earnings.pending_payout - amount
      })
      .eq('profile_id', profileId);

    if (earningsError) throw earningsError;

    console.log('Payout request created successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Solicitação de saque de R$ ${amount.toFixed(2)} criada com sucesso! Aguarde a análise do administrador.`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error requesting payout:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
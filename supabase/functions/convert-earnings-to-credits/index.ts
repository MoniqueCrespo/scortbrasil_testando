import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConvertRequest {
  profileId: string;
  amount: number;
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

    const { profileId, amount }: ConvertRequest = await req.json();

    console.log('Converting earnings to credits:', { profileId, amount, userId: user.id });

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

    // Get current earnings
    const { data: earnings } = await supabase
      .from('creator_earnings')
      .select('pending_payout')
      .eq('profile_id', profileId)
      .single();

    if (!earnings || earnings.pending_payout < amount) {
      throw new Error('Saldo insuficiente');
    }

    // Calculate credits (R$ 1 = 1 crédito)
    const credits = Math.floor(amount);

    // Start transaction: Update earnings
    const { error: earningsError } = await supabase
      .from('creator_earnings')
      .update({
        pending_payout: earnings.pending_payout - amount,
        paid_out: supabase.rpc('increment', { x: amount })
      })
      .eq('profile_id', profileId);

    if (earningsError) throw earningsError;

    // Get current user credits
    const { data: userCredits } = await supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single();

    if (userCredits) {
      // Update existing credits
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ credits: userCredits.credits + credits })
        .eq('user_id', user.id);

      if (updateError) throw updateError;
    } else {
      // Create new credit record
      const { error: insertError } = await supabase
        .from('user_credits')
        .insert({ user_id: user.id, credits });

      if (insertError) throw insertError;
    }

    // Record transaction
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount: credits,
        transaction_type: 'earnings_conversion',
        description: `Conversão de R$ ${amount.toFixed(2)} em ${credits} créditos`,
      });

    console.log('Conversion successful:', { credits, amount });

    return new Response(
      JSON.stringify({ 
        success: true, 
        credits,
        message: `R$ ${amount.toFixed(2)} convertidos em ${credits} créditos!`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error converting earnings:', error);
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
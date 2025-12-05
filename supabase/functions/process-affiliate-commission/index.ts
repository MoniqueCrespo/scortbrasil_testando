import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Commission rates by transaction type
const COMMISSION_RATES: Record<string, number> = {
  credits: 10,
  boost: 15,
  premium: 20,
  subscription: 10,
  ppv: 10,
  geographic_boost: 15,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { userId, transactionType, transactionId, amount } = await req.json();

    console.log("Processing affiliate commission for:", {
      userId,
      transactionType,
      transactionId,
      amount,
    });

    // Check if user was referred by an affiliate
    const { data: referral, error: referralError } = await supabaseClient
      .from("affiliate_referrals")
      .select("*, affiliates(*)")
      .eq("referred_user_id", userId)
      .single();

    if (referralError || !referral) {
      console.log("No affiliate referral found for user:", userId);
      return new Response(
        JSON.stringify({ success: true, message: "No affiliate found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get tier bonus
    const { data: tierData } = await supabaseClient
      .from("affiliate_tiers")
      .select("commission_rate, bonus_rate")
      .eq("name", referral.affiliates.tier_level)
      .single();

    // Calculate commission
    const baseRate = COMMISSION_RATES[transactionType] || 0;
    const tierBonus = tierData?.commission_rate || 0;
    const totalRate = baseRate + tierBonus;
    const commissionAmount = (amount * totalRate) / 100;

    console.log("Commission calculation:", {
      baseRate,
      tierBonus,
      totalRate,
      commissionAmount,
    });

    // Create commission record
    const { error: commissionError } = await supabaseClient
      .from("affiliate_commissions")
      .insert({
        affiliate_id: referral.affiliate_id,
        referral_id: referral.id,
        transaction_type: transactionType,
        transaction_id: transactionId,
        transaction_amount: amount,
        commission_rate: totalRate,
        commission_amount: commissionAmount,
        status: "approved",
      });

    if (commissionError) throw commissionError;

    // Update affiliate totals
    const { error: affiliateUpdateError } = await supabaseClient
      .from("affiliates")
      .update({
        total_earned: referral.affiliates.total_earned + commissionAmount,
        pending_payout: referral.affiliates.pending_payout + commissionAmount,
      })
      .eq("id", referral.affiliate_id);

    if (affiliateUpdateError) throw affiliateUpdateError;

    // Update referral stats
    const { error: referralUpdateError } = await supabaseClient
      .from("affiliate_referrals")
      .update({
        total_transactions: referral.total_transactions + 1,
        total_revenue_generated: referral.total_revenue_generated + amount,
        total_commission_earned: referral.total_commission_earned + commissionAmount,
        status: "active",
        first_transaction_at: referral.first_transaction_at || new Date().toISOString(),
      })
      .eq("id", referral.id);

    if (referralUpdateError) throw referralUpdateError;

    // Send notification to affiliate
    await supabaseClient.from("notifications").insert({
      user_id: referral.affiliates.user_id,
      type: "affiliate_commission",
      title: "Nova Comissão Recebida! 🎉",
      message: `Você ganhou R$ ${commissionAmount.toFixed(2)} de comissão em uma transação de ${transactionType}`,
      metadata: {
        commission_amount: commissionAmount,
        transaction_type: transactionType,
        transaction_amount: amount,
      },
    });

    console.log("Commission processed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        commission_amount: commissionAmount,
        total_rate: totalRate,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing commission:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

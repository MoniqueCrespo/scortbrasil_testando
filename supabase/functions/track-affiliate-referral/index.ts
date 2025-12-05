import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const { affiliateCode, newUserId } = await req.json();

    console.log("Tracking affiliate referral:", { affiliateCode, newUserId });

    // Find affiliate by code
    const { data: affiliate, error: affiliateError } = await supabaseClient
      .from("affiliates")
      .select("id")
      .eq("affiliate_code", affiliateCode)
      .eq("status", "active")
      .single();

    if (affiliateError || !affiliate) {
      console.log("Affiliate not found or inactive:", affiliateCode);
      return new Response(
        JSON.stringify({ success: false, message: "Affiliate not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if referral already exists
    const { data: existingReferral } = await supabaseClient
      .from("affiliate_referrals")
      .select("id")
      .eq("affiliate_id", affiliate.id)
      .eq("referred_user_id", newUserId)
      .single();

    if (existingReferral) {
      console.log("Referral already exists");
      return new Response(
        JSON.stringify({ success: true, message: "Referral already tracked" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create referral record
    const { error: referralError } = await supabaseClient
      .from("affiliate_referrals")
      .insert({
        affiliate_id: affiliate.id,
        referred_user_id: newUserId,
        status: "pending",
      });

    if (referralError) throw referralError;

    console.log("Referral tracked successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Referral tracked successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error tracking referral:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

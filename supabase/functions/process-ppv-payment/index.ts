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
    const payload = await req.json();
    console.log('PPV Webhook payload:', JSON.stringify(payload));

    if (payload.type !== 'payment') {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const paymentId = payload.data?.id;
    if (!paymentId) {
      throw new Error('Payment ID not found');
    }

    const mercadopagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!mercadopagoAccessToken) {
      throw new Error('Mercado Pago access token not configured');
    }

    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${mercadopagoAccessToken}`,
      },
    });

    const payment = await paymentResponse.json();
    console.log('PPV Payment details:', JSON.stringify(payment));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const externalRef = JSON.parse(payment.external_reference || '{}');
    const { user_id, ppv_content_id, profile_id, type } = externalRef;

    if (type !== 'ppv_purchase') {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (payment.status === 'approved') {
      const totalAmount = parseFloat(payment.transaction_amount);
      const platformFee = totalAmount * (PLATFORM_FEE_PERCENT / 100);
      const creatorAmount = totalAmount - platformFee;

      // Record purchase
      const { error: purchaseError } = await supabase
        .from('ppv_purchases')
        .insert({
          user_id: user_id,
          ppv_content_id: ppv_content_id,
          price_paid: totalAmount,
          payment_id: paymentId.toString(),
        });

      if (purchaseError) {
        console.error('Error recording purchase:', purchaseError);
        throw new Error('Purchase already exists or error occurred');
      }

      // Update purchase count
      const { data: currentContent } = await supabase
        .from('ppv_content')
        .select('purchase_count')
        .eq('id', ppv_content_id)
        .single();

      if (currentContent) {
        await supabase
          .from('ppv_content')
          .update({ purchase_count: (currentContent.purchase_count || 0) + 1 })
          .eq('id', ppv_content_id);
      }

      // Update creator earnings
      const { data: earnings } = await supabase
        .from('creator_earnings')
        .select('*')
        .eq('profile_id', profile_id)
        .single();

      if (earnings) {
        await supabase
          .from('creator_earnings')
          .update({
            total_earned: earnings.total_earned + creatorAmount,
            platform_fee_total: earnings.platform_fee_total + platformFee,
            pending_payout: earnings.pending_payout + creatorAmount,
          })
          .eq('profile_id', profile_id);
      } else {
        await supabase
          .from('creator_earnings')
          .insert({
            profile_id: profile_id,
            total_earned: creatorAmount,
            platform_fee_total: platformFee,
            pending_payout: creatorAmount,
            paid_out: 0,
          });
      }

      // Get profile details
      const { data: profile } = await supabase
        .from('model_profiles')
        .select('user_id, name')
        .eq('id', profile_id)
        .single();

      if (profile) {
        // Notify creator
        await supabase
          .from('notifications')
          .insert({
            user_id: profile.user_id,
            type: 'ppv_purchase',
            title: 'Venda de Conteúdo PPV!',
            message: `Seu conteúdo PPV foi comprado! Você ganhou R$ ${creatorAmount.toFixed(2)}`,
            metadata: {
              ppv_content_id: ppv_content_id,
              amount: creatorAmount,
            },
          });
      }

      // Notify buyer
      await supabase
        .from('notifications')
        .insert({
          user_id: user_id,
          type: 'ppv_purchased',
          title: 'Compra Confirmada',
          message: `Sua compra foi confirmada! Aproveite o conteúdo exclusivo.`,
          metadata: {
            ppv_content_id: ppv_content_id,
          },
        });

      console.log('PPV purchase processed successfully');
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('PPV Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

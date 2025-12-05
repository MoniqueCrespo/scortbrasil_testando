import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PLATFORM_FEE_PERCENT = 20; // 20% platform fee

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log('Webhook payload:', JSON.stringify(payload));

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

    // Get payment details from Mercado Pago
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${mercadopagoAccessToken}`,
      },
    });

    const payment = await paymentResponse.json();
    console.log('Payment details:', JSON.stringify(payment));

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const externalRef = JSON.parse(payment.external_reference || '{}');
    const { user_id, profile_id, tier_id, type, end_date } = externalRef;

    if (type !== 'content_subscription') {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (payment.status === 'approved') {
      const totalAmount = parseFloat(payment.transaction_amount);
      const platformFee = totalAmount * (PLATFORM_FEE_PERCENT / 100);
      const creatorAmount = totalAmount - platformFee;

      // Update subscription to active
      const { data: subscription, error: subError } = await supabase
        .from('content_subscriptions')
        .update({
          status: 'active',
          start_date: new Date().toISOString(),
          payment_id: paymentId.toString(),
        })
        .eq('subscriber_id', user_id)
        .eq('profile_id', profile_id)
        .eq('tier_id', tier_id)
        .eq('status', 'pending')
        .select()
        .single();

      if (subError || !subscription) {
        console.error('Error updating subscription:', subError);
        throw new Error('Subscription not found or already processed');
      }

      // Record payment
      const { error: paymentError } = await supabase
        .from('subscription_payments')
        .insert({
          subscription_id: subscription.id,
          amount: totalAmount,
          platform_fee: platformFee,
          creator_amount: creatorAmount,
          payment_id: paymentId.toString(),
          status: 'paid',
        });

      if (paymentError) {
        console.error('Error recording payment:', paymentError);
      }

      // Update or create creator earnings
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

      // Get profile owner user_id
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
            type: 'new_subscriber',
            title: 'Novo Assinante!',
            message: `Você tem um novo assinante em seu conteúdo exclusivo!`,
            metadata: {
              subscription_id: subscription.id,
              amount: creatorAmount,
            },
          });
      }

      // Notify subscriber
      await supabase
        .from('notifications')
        .insert({
          user_id: user_id,
          type: 'subscription_active',
          title: 'Assinatura Ativa',
          message: `Sua assinatura foi ativada com sucesso! Aproveite o conteúdo exclusivo.`,
          metadata: {
            subscription_id: subscription.id,
            profile_name: profile?.name,
          },
        });

      console.log('Subscription activated successfully');
    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
      // Update subscription to cancelled
      await supabase
        .from('content_subscriptions')
        .update({ status: 'cancelled' })
        .eq('subscriber_id', user_id)
        .eq('profile_id', profile_id)
        .eq('tier_id', tier_id)
        .eq('status', 'pending');

      console.log('Subscription cancelled due to payment failure');
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

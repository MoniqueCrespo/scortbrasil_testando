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
    const payload = await req.json();
    console.log('Webhook recebido:', payload);

    if (payload.type !== 'payment') {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const paymentId = payload.data?.id;
    if (!paymentId) {
      throw new Error('Payment ID não encontrado');
    }

    const mercadopagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${mercadopagoAccessToken}`,
      },
    });

    const payment = await response.json();
    console.log('Pagamento:', payment);

    if (payment.status === 'approved') {
      console.log('Pagamento aprovado - processando créditos');
      
      const externalRef = JSON.parse(payment.external_reference);
      const { user_id, package_id } = externalRef;

      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: package_data, error: pkgError } = await supabaseClient
        .from('credit_packages')
        .select('*')
        .eq('id', package_id)
        .single();

      if (pkgError || !package_data) {
        throw new Error('Pacote não encontrado');
      }

      const totalCredits = package_data.credits + (package_data.bonus_credits || 0);

      // Buscar ou criar registro de créditos do usuário
      const { data: userCredits } = await supabaseClient
        .from('user_credits')
        .select('*')
        .eq('user_id', user_id)
        .single();

      if (userCredits) {
        // Atualizar créditos existentes
        await supabaseClient
          .from('user_credits')
          .update({
            balance: userCredits.balance + totalCredits,
            total_earned: userCredits.total_earned + totalCredits,
          })
          .eq('user_id', user_id);
      } else {
        // Criar novo registro
        await supabaseClient
          .from('user_credits')
          .insert({
            user_id,
            balance: totalCredits,
            total_earned: totalCredits,
            total_spent: 0,
          });
      }

      // Registrar transação
      await supabaseClient
        .from('credit_transactions')
        .insert({
          user_id,
          amount: totalCredits,
          transaction_type: 'purchase',
          description: `Compra de ${package_data.name} - ${totalCredits} créditos`,
          payment_id: paymentId.toString(),
        });

      // Criar notificação em tempo real
      await supabaseClient
        .from('notifications')
        .insert({
          user_id,
          type: 'payment_success',
          title: '🎉 Pagamento Confirmado!',
          message: `Seus ${totalCredits} créditos foram creditados com sucesso.`,
          metadata: {
            credits: totalCredits,
            package_name: package_data.name,
            payment_id: paymentId.toString()
          }
        });

      console.log(`✅ ${totalCredits} créditos creditados para usuário ${user_id}`);
      
    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
      console.log(`❌ Pagamento ${payment.status} - não creditando`);
    } else {
      console.log(`⏳ Pagamento pendente - status: ${payment.status}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
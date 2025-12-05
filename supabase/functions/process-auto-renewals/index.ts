import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processando auto-renovações...');

    // Buscar boosts prestes a expirar (nas próximas 24h) com auto-renovação habilitada
    const twentyFourHoursFromNow = new Date();
    twentyFourHoursFromNow.setHours(twentyFourHoursFromNow.getHours() + 24);

    const { data: expiringBoosts } = await supabase
      .from('active_boosts')
      .select(`
        *,
        model_profiles!inner(user_id),
        boost_packages(duration_hours, credit_cost, price)
      `)
      .eq('status', 'active')
      .eq('auto_renew', true)
      .lt('end_date', twentyFourHoursFromNow.toISOString())
      .gt('end_date', new Date().toISOString());

    console.log(`Encontrados ${expiringBoosts?.length || 0} boosts para renovar`);

    // Processar renovação de cada boost
    for (const boost of expiringBoosts || []) {
      try {
        const userId = boost.model_profiles.user_id;
        
        // Verificar créditos do usuário
        const { data: credits } = await supabase
          .from('user_credits')
          .select('balance')
          .eq('user_id', userId)
          .single();

        if (!credits || credits.balance < boost.boost_packages.credit_cost) {
          console.log(`Créditos insuficientes para usuário ${userId}`);
          
          // Criar notificação de créditos insuficientes
          await supabase.from('notifications').insert({
            user_id: userId,
            type: 'auto_renewal_failed',
            title: 'Renovação Automática Falhou',
            message: `Não foi possível renovar o boost. Saldo insuficiente.`,
            metadata: { boost_id: boost.id, reason: 'insufficient_credits' }
          });
          
          continue;
        }

        // Calcular nova data de término
        const currentEndDate = new Date(boost.end_date);
        const newEndDate = new Date(currentEndDate);
        newEndDate.setHours(newEndDate.getHours() + boost.boost_packages.duration_hours);

        // Criar transação de débito
        const { data: transaction } = await supabase
          .from('credit_transactions')
          .insert({
            user_id: userId,
            amount: -boost.boost_packages.credit_cost,
            transaction_type: 'auto_renewal',
            description: `Renovação automática de boost`,
            reference_id: boost.id
          })
          .select()
          .single();

        // Atualizar créditos do usuário
        await supabase.rpc('update_user_credits', {
          p_user_id: userId,
          p_amount: -boost.boost_packages.credit_cost
        });

        // Atualizar data de término do boost
        await supabase
          .from('active_boosts')
          .update({ end_date: newEndDate.toISOString() })
          .eq('id', boost.id);

        // Atualizar configuração de auto-renovação
        const { data: currentSettings } = await supabase
          .from('auto_renewal_settings')
          .select('renewal_count')
          .eq('user_id', userId)
          .eq('profile_id', boost.profile_id)
          .eq('renewal_type', 'boost')
          .eq('package_id', boost.package_id)
          .single();

        await supabase
          .from('auto_renewal_settings')
          .update({
            last_renewal_date: new Date().toISOString(),
            next_renewal_date: newEndDate.toISOString(),
            renewal_count: (currentSettings?.renewal_count || 0) + 1
          })
          .eq('user_id', userId)
          .eq('profile_id', boost.profile_id)
          .eq('renewal_type', 'boost')
          .eq('package_id', boost.package_id);

        // Criar notificação de sucesso
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'auto_renewal_success',
          title: 'Boost Renovado Automaticamente',
          message: `Seu boost foi renovado com sucesso até ${newEndDate.toLocaleDateString('pt-BR')}.`,
          metadata: { boost_id: boost.id, credits_spent: boost.boost_packages.credit_cost }
        });

        console.log(`Boost ${boost.id} renovado com sucesso`);
      } catch (error) {
        console.error(`Erro ao renovar boost ${boost.id}:`, error);
      }
    }

    // Processar serviços premium
    const { data: expiringServices } = await supabase
      .from('active_premium_services')
      .select(`
        *,
        model_profiles!inner(user_id),
        premium_services(duration_days, credit_cost)
      `)
      .eq('status', 'active')
      .eq('auto_renew', true)
      .lt('end_date', twentyFourHoursFromNow.toISOString())
      .gt('end_date', new Date().toISOString());

    console.log(`Encontrados ${expiringServices?.length || 0} serviços para renovar`);

    for (const service of expiringServices || []) {
      try {
        const userId = service.model_profiles.user_id;
        
        const { data: credits } = await supabase
          .from('user_credits')
          .select('balance')
          .eq('user_id', userId)
          .single();

        if (!credits || credits.balance < service.premium_services.credit_cost) {
          await supabase.from('notifications').insert({
            user_id: userId,
            type: 'auto_renewal_failed',
            title: 'Renovação Automática Falhou',
            message: `Não foi possível renovar o serviço premium. Saldo insuficiente.`,
            metadata: { service_id: service.id, reason: 'insufficient_credits' }
          });
          continue;
        }

        const currentEndDate = new Date(service.end_date);
        const newEndDate = new Date(currentEndDate);
        newEndDate.setDate(newEndDate.getDate() + service.premium_services.duration_days);

        await supabase.from('credit_transactions').insert({
          user_id: userId,
          amount: -service.premium_services.credit_cost,
          transaction_type: 'auto_renewal',
          description: `Renovação automática de serviço premium`,
          reference_id: service.id
        });

        await supabase.rpc('update_user_credits', {
          p_user_id: userId,
          p_amount: -service.premium_services.credit_cost
        });

        await supabase
          .from('active_premium_services')
          .update({ end_date: newEndDate.toISOString() })
          .eq('id', service.id);

        const { data: currentSettings } = await supabase
          .from('auto_renewal_settings')
          .select('renewal_count')
          .eq('user_id', userId)
          .eq('profile_id', service.profile_id)
          .eq('renewal_type', 'premium_service')
          .eq('package_id', service.service_id)
          .single();

        await supabase
          .from('auto_renewal_settings')
          .update({
            last_renewal_date: new Date().toISOString(),
            next_renewal_date: newEndDate.toISOString(),
            renewal_count: (currentSettings?.renewal_count || 0) + 1
          })
          .eq('user_id', userId)
          .eq('profile_id', service.profile_id)
          .eq('renewal_type', 'premium_service')
          .eq('package_id', service.service_id);

        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'auto_renewal_success',
          title: 'Serviço Renovado Automaticamente',
          message: `Seu serviço premium foi renovado até ${newEndDate.toLocaleDateString('pt-BR')}.`,
          metadata: { service_id: service.id, credits_spent: service.premium_services.credit_cost }
        });

        console.log(`Serviço ${service.id} renovado com sucesso`);
      } catch (error) {
        console.error(`Erro ao renovar serviço ${service.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        boosts_renewed: expiringBoosts?.length || 0,
        services_renewed: expiringServices?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erro no processamento de renovações:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
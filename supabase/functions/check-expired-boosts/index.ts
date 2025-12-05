import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (_req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar boosts expirados
    const { data: expiredBoosts, error } = await supabaseAdmin
      .from('active_boosts')
      .select('*, model_profiles(*)')
      .eq('status', 'active')
      .lt('end_date', new Date().toISOString());

    if (error) {
      throw error;
    }

    console.log(`Encontrados ${expiredBoosts?.length || 0} boosts expirados`);

    if (expiredBoosts && expiredBoosts.length > 0) {
      // Atualizar status dos boosts
      const boostIds = expiredBoosts.map(b => b.id);
      await supabaseAdmin
        .from('active_boosts')
        .update({ status: 'expired' })
        .in('id', boostIds);

      // Remover featured dos perfis (se não tiverem outros boosts ativos)
      for (const boost of expiredBoosts) {
        const { data: otherBoosts } = await supabaseAdmin
          .from('active_boosts')
          .select('id')
          .eq('profile_id', boost.profile_id)
          .eq('status', 'active')
          .neq('id', boost.id);

        if (!otherBoosts || otherBoosts.length === 0) {
          await supabaseAdmin
            .from('model_profiles')
            .update({ featured: false })
            .eq('id', boost.profile_id);
        }
      }

      console.log(`${expiredBoosts.length} boosts expirados processados`);
    }

    return new Response(
      JSON.stringify({ success: true, processed: expiredBoosts?.length || 0 }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
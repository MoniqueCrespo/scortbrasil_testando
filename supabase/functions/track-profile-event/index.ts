import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event_type, profile_id, user_id } = await req.json();
    
    if (!event_type || !profile_id) {
      throw new Error('Missing event_type or profile_id');
    }

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar ou criar registro de estatísticas
    let { data: stats, error: fetchError } = await supabase
      .from('profile_stats')
      .select('*')
      .eq('profile_id', profile_id)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 é "not found"
      throw fetchError;
    }

    // Se não existe, criar
    if (!stats) {
      const { data: newStats, error: createError } = await supabase
        .from('profile_stats')
        .insert({
          profile_id,
          views: event_type === 'view' ? 1 : 0,
          clicks: event_type === 'click' ? 1 : 0,
          favorites: event_type === 'favorite' ? 1 : 0,
          messages: event_type === 'message' ? 1 : 0,
        })
        .select()
        .single();

      if (createError) throw createError;
      
      console.log('Stats created:', newStats);
      
      return new Response(
        JSON.stringify({ success: true, stats: newStats }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Atualizar estatística existente
    const updates: any = { updated_at: new Date().toISOString() };
    
    switch (event_type) {
      case 'view':
        updates.views = (stats.views || 0) + 1;
        break;
      case 'click':
        updates.clicks = (stats.clicks || 0) + 1;
        break;
      case 'favorite':
        updates.favorites = (stats.favorites || 0) + 1;
        break;
      case 'unfavorite':
        updates.favorites = Math.max((stats.favorites || 0) - 1, 0);
        break;
      case 'message':
        updates.messages = (stats.messages || 0) + 1;
        break;
      default:
        throw new Error('Invalid event_type');
    }

    const { data: updatedStats, error: updateError } = await supabase
      .from('profile_stats')
      .update(updates)
      .eq('profile_id', profile_id)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log(`Event ${event_type} tracked for profile ${profile_id}`);

    return new Response(
      JSON.stringify({ success: true, stats: updatedStats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in track-profile-event:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

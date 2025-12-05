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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar boosts que expiram nas próximas 24 horas
    const now = new Date();
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const twentyFiveHoursLater = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const { data: expiringBoosts, error: fetchError } = await supabase
      .from('active_boosts')
      .select(`
        *,
        boost_packages (name),
        model_profiles (name, user_id)
      `)
      .eq('status', 'active')
      .gte('end_date', twentyFourHoursLater.toISOString())
      .lte('end_date', twentyFiveHoursLater.toISOString());

    if (fetchError) {
      console.error('Error fetching expiring boosts:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiringBoosts?.length || 0} boosts expiring in 24h`);

    const notifications = [];

    for (const boost of expiringBoosts || []) {
      const profile = boost.model_profiles as any;
      const package_info = boost.boost_packages as any;

      if (!profile?.user_id) continue;

      // Verificar se já existe notificação para este boost
      const { data: existingNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', profile.user_id)
        .eq('type', 'boost_expiring')
        .eq('metadata->>boost_id', boost.id)
        .maybeSingle();

      if (existingNotification) {
        console.log(`Notification already sent for boost ${boost.id}`);
        continue;
      }

      // Criar notificação
      const { data: notification, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: profile.user_id,
          type: 'boost_expiring',
          title: 'Seu Boost está Expirando!',
          message: `O boost "${package_info?.name}" para o perfil "${profile.name}" expira em 24 horas. Renove agora para manter sua visibilidade!`,
          metadata: {
            boost_id: boost.id,
            profile_id: boost.profile_id,
            profile_name: profile.name,
            package_name: package_info?.name,
            end_date: boost.end_date,
          },
        })
        .select()
        .single();

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      } else {
        notifications.push(notification);
        console.log(`Notification created for user ${profile.user_id}, boost ${boost.id}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        boosts_checked: expiringBoosts?.length || 0,
        notifications_created: notifications.length,
        notifications,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in check-expiring-boosts:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

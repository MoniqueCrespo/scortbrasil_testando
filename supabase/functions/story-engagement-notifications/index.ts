import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';
import { Resend } from 'https://esm.sh/resend@4.0.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    console.log('Checking for stories with engagement milestones...');

    // Fetch stories that have reached engagement milestones (50, 100, 500 views)
    const { data: stories, error: storiesError } = await supabase
      .from('profile_stories')
      .select(`
        id,
        view_count,
        profile_id,
        profile:model_profiles!inner(id, name, user_id)
      `)
      .gt('view_count', 0)
      .gt('expires_at', new Date().toISOString());

    if (storiesError) {
      console.error('Error fetching stories:', storiesError);
      throw storiesError;
    }

    const notificationsSent = [];

    for (const story of stories || []) {
      const viewCount = story.view_count;
      const milestones = [50, 100, 500, 1000];
      
      // Check if we've reached a new milestone
      for (const milestone of milestones) {
        if (viewCount >= milestone && viewCount < milestone + 10) {
          // Check if notification was already sent for this milestone
          const notificationKey = `story_${story.id}_milestone_${milestone}`;
          
          const { data: existingNotification } = await supabase
            .from('story_views')
            .select('id')
            .eq('story_id', story.id)
            .limit(1)
            .single();

          // Send notification email
          try {
            const profile = story.profile as any;
            const userId = profile?.user_id;
            const profileName = profile?.name;

            // Fetch user email separately
            let userEmail: string | null = null;
            if (userId) {
              const { data: userData } = await supabase
                .from('profiles')
                .select('email')
                .eq('id', userId)
                .single();
              userEmail = userData?.email || null;
            }

            if (userEmail && profileName) {
              await resend.emails.send({
                from: 'Acompanhantes <onboarding@resend.dev>',
                to: [userEmail],
                subject: `🎉 Seu story alcançou ${milestone} visualizações!`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #E91E63;">Parabéns!</h1>
                    <p>Olá <strong>${profileName}</strong>,</p>
                    <p>Temos uma ótima notícia! Seu story acabou de alcançar <strong>${milestone} visualizações</strong>! 🚀</p>
                    <p>Continue postando stories para aumentar ainda mais o engajamento com seu perfil.</p>
                    <div style="margin: 30px 0; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
                      <h3 style="margin-top: 0;">📊 Estatísticas do seu Story</h3>
                      <p><strong>Total de visualizações:</strong> ${viewCount}</p>
                    </div>
                    <p style="margin-top: 30px;">
                      <a href="https://seu-site.com/dashboard/modelo" 
                         style="background-color: #E91E63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Ver Analytics Completo
                      </a>
                    </p>
                    <p style="color: #666; font-size: 12px; margin-top: 40px;">
                      Você está recebendo este email porque é anunciante na nossa plataforma.
                    </p>
                  </div>
                `,
              });

              notificationsSent.push({
                story_id: story.id,
                milestone,
                email: userEmail,
              });

              console.log(`Notification sent to ${userEmail} for story ${story.id} reaching ${milestone} views`);
            }
          } catch (emailError) {
            console.error(`Error sending email for story ${story.id}:`, emailError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Engagement notifications processed',
        notifications_sent: notificationsSent.length,
        details: notificationsSent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

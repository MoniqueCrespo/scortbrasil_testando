import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export const useContentNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Subscribe to new content from subscribed profiles
    const contentChannel = supabase
      .channel('new-exclusive-content')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'exclusive_content',
        },
        async (payload) => {
          // Check if user is subscribed to this profile
          const { data: subscription } = await supabase
            .from('content_subscriptions')
            .select('model_profiles(name)')
            .eq('subscriber_id', user.id)
            .eq('profile_id', payload.new.profile_id)
            .eq('status', 'active')
            .gt('end_date', new Date().toISOString())
            .single();

          if (subscription) {
            toast.success(
              `Novo conteúdo de ${subscription.model_profiles?.name}!`,
              {
                description: payload.new.caption || 'Confira agora',
                action: {
                  label: 'Ver',
                  onClick: () => window.location.href = `/minhas-assinaturas`,
                },
              }
            );
          }
        }
      )
      .subscribe();

    // Subscribe to new subscribers (for creators)
    const subscribersChannel = supabase
      .channel('new-subscribers')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'content_subscriptions',
        },
        async (payload) => {
          // Check if this is for one of user's profiles
          const { data: profile } = await supabase
            .from('model_profiles')
            .select('name')
            .eq('id', payload.new.profile_id)
            .eq('user_id', user.id)
            .single();

          if (profile) {
            toast.success(
              'Novo assinante!',
              {
                description: `Você tem um novo assinante em ${profile.name}`,
                action: {
                  label: 'Ver',
                  onClick: () => window.location.href = `/dashboard/modelo?tab=conteudo`,
                },
              }
            );
          }
        }
      )
      .subscribe();

    // Subscribe to new comments on creator's content
    const commentsChannel = supabase
      .channel('new-comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'content_comments',
        },
        async (payload) => {
          // Check if this comment is on creator's content
          const { data: content } = await supabase
            .from('exclusive_content')
            .select('profile_id, model_profiles(user_id, name)')
            .eq('id', payload.new.content_id)
            .single();

          if (content?.model_profiles?.user_id === user.id && payload.new.user_id !== user.id) {
            toast.info(
              'Novo comentário!',
              {
                description: `Alguém comentou no seu conteúdo`,
              }
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(contentChannel);
      supabase.removeChannel(subscribersChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [user]);
};

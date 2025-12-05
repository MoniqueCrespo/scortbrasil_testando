import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const useRealtimeNotifications = (userId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    console.log('🔔 Iniciando escuta de notificações em tempo real para:', userId);

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('📬 Nova notificação recebida:', payload);
          
          const notification = payload.new as any;
          
          // Exibir toast com a notificação
          toast({
            title: notification.title,
            description: notification.message,
            duration: 5000,
          });

          // Invalidar queries relevantes
          if (notification.type === 'payment_success') {
            queryClient.invalidateQueries({ queryKey: ['user-credits'] });
            queryClient.invalidateQueries({ queryKey: ['credit-transactions'] });
          } else if (notification.type === 'boost_activated') {
            queryClient.invalidateQueries({ queryKey: ['active-boosts'] });
            queryClient.invalidateQueries({ queryKey: ['model-profiles'] });
          }

          // Marcar notificação como lida após 3 segundos
          setTimeout(async () => {
            await supabase
              .from('notifications')
              .update({ read: true })
              .eq('id', notification.id);
          }, 3000);
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da conexão realtime:', status);
      });

    return () => {
      console.log('🔕 Desconectando escuta de notificações');
      supabase.removeChannel(channel);
    };
  }, [userId, toast, queryClient]);
};

import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Zap, Sparkles, TrendingUp, Award } from "lucide-react";

export const useNotificationSystem = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Subscrever a mudanças nos créditos
    const creditsChannel = supabase
      .channel('credits_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'credit_transactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const transaction = payload.new;
          if (transaction.amount > 0) {
            toast.success(
              `🎉 Você ganhou ${transaction.amount} créditos!`,
              {
                description: transaction.description,
                icon: <Sparkles className="h-4 w-4" />,
              }
            );
          }
        }
      )
      .subscribe();

    // Subscrever a boosts prestes a expirar
    const checkExpiringBoosts = async () => {
      const twentyFourHoursFromNow = new Date();
      twentyFourHoursFromNow.setHours(twentyFourHoursFromNow.getHours() + 24);

      const { data: expiringBoosts } = await supabase
        .from('active_boosts')
        .select('*, boost_packages(name), model_profiles(name)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .lt('end_date', twentyFourHoursFromNow.toISOString())
        .gt('end_date', new Date().toISOString());

      if (expiringBoosts && expiringBoosts.length > 0) {
        expiringBoosts.forEach((boost: any) => {
          const hoursRemaining = Math.floor(
            (new Date(boost.end_date).getTime() - Date.now()) / (1000 * 60 * 60)
          );
          
          toast.warning(
            `⏰ Boost expirando em ${hoursRemaining}h`,
            {
              description: `${boost.model_profiles.name} - ${boost.boost_packages.name}`,
              icon: <Zap className="h-4 w-4" />,
              action: {
                label: 'Renovar',
                onClick: () => {
                  window.location.href = '/dashboard/modelo?tab=boosts';
                },
              },
            }
          );
        });
      }
    };

    // Verificar boosts expirando a cada hora
    checkExpiringBoosts();
    const expiringInterval = setInterval(checkExpiringBoosts, 60 * 60 * 1000);

    // Subscrever a novas missões completadas
    const missionsChannel = supabase
      .channel('missions_notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_mission_progress',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const progress = payload.new;
          if (progress.completed && !payload.old.completed) {
            // Buscar detalhes da missão
            supabase
              .from('daily_missions')
              .select('name, credit_reward')
              .eq('id', progress.mission_id)
              .single()
              .then(({ data: mission }) => {
                if (mission) {
                  toast.success(
                    `🎯 Missão completada!`,
                    {
                      description: `${mission.name} - Ganhou ${mission.credit_reward} créditos`,
                      icon: <Award className="h-4 w-4" />,
                    }
                  );
                }
              });
          }
        }
      )
      .subscribe();

    // Subscrever a novos boosts ativados
    const boostsChannel = supabase
      .channel('boosts_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'active_boosts',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const boost = payload.new;
          supabase
            .from('boost_packages')
            .select('name, badge_text')
            .eq('id', boost.package_id)
            .single()
            .then(({ data: package_data }) => {
              if (package_data) {
                toast.success(
                  `🚀 Boost ativado!`,
                  {
                    description: `${package_data.name} - Seu anúncio agora está em destaque`,
                    icon: <TrendingUp className="h-4 w-4" />,
                  }
                );
              }
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(creditsChannel);
      supabase.removeChannel(missionsChannel);
      supabase.removeChannel(boostsChannel);
      clearInterval(expiringInterval);
    };
  }, [user]);
};

export default useNotificationSystem;
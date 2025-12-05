import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FREE_PLAN_MAX_PHOTOS = 4;

interface ProfilePlan {
  maxPhotos: number;
  planName: string;
  isActive: boolean;
  isPremium: boolean;
}

export const useProfilePlan = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ['profile-plan', profileId],
    queryFn: async (): Promise<ProfilePlan> => {
      if (!profileId) {
        return {
          maxPhotos: FREE_PLAN_MAX_PHOTOS,
          planName: 'Gratuito',
          isActive: false,
          isPremium: false,
        };
      }

      // Check for active premium subscription
      const { data: subscription } = await supabase
        .from('premium_subscriptions')
        .select(`
          *,
          premium_plans (
            name,
            max_photos
          )
        `)
        .eq('profile_id', profileId)
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString())
        .single();

      if (subscription?.premium_plans) {
        return {
          maxPhotos: subscription.premium_plans.max_photos || 10,
          planName: subscription.premium_plans.name,
          isActive: true,
          isPremium: true,
        };
      }

      return {
        maxPhotos: FREE_PLAN_MAX_PHOTOS,
        planName: 'Gratuito',
        isActive: false,
        isPremium: false,
      };
    },
    enabled: !!profileId,
  });
};

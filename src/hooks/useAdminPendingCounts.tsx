import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PendingCounts {
  pendingAds: number;
  pendingVerifications: number;
  pendingReports: number;
}

export function useAdminPendingCounts() {
  const [counts, setCounts] = useState<PendingCounts>({
    pendingAds: 0,
    pendingVerifications: 0,
    pendingReports: 0,
  });

  useEffect(() => {
    fetchCounts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("admin-pending-counts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "model_profiles",
        },
        () => fetchCounts()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "verification_requests",
        },
        () => fetchCounts()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reports",
        },
        () => fetchCounts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCounts = async () => {
    try {
      // Pending ads
      const { count: adsCount } = await supabase
        .from("model_profiles")
        .select("*", { count: "exact", head: true })
        .eq("moderation_status", "pending");

      // Pending verifications
      const { count: verificationsCount } = await supabase
        .from("verification_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Pending reports
      const { count: reportsCount } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      setCounts({
        pendingAds: adsCount || 0,
        pendingVerifications: verificationsCount || 0,
        pendingReports: reportsCount || 0,
      });
    } catch (error) {
      console.error("Erro ao buscar contagens:", error);
    }
  };

  return counts;
}

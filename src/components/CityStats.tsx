import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Users, CheckCircle } from "lucide-react";

interface CityStatsProps {
  stateSlug: string;
  citySlug: string;
}

const CityStats = ({ stateSlug, citySlug }: CityStatsProps) => {
  const [stats, setStats] = useState({
    totalProfiles: 0,
    neighborhoods: 0,
    verifiedPercentage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total profiles
        const { count: totalCount } = await supabase
          .from("model_profiles")
          .select("*", { count: "exact", head: true })
          .eq("state", stateSlug)
          .eq("city", citySlug)
          .eq("is_active", true);

        // Get verified count
        const { count: verifiedCount } = await supabase
          .from("model_profiles")
          .select("*", { count: "exact", head: true })
          .eq("state", stateSlug)
          .eq("city", citySlug)
          .eq("is_active", true)
          .eq("verified", true);

        // Get unique neighborhoods
        const { data: profilesData } = await supabase
          .from("model_profiles")
          .select("neighborhoods")
          .eq("state", stateSlug)
          .eq("city", citySlug)
          .eq("is_active", true);

        const uniqueNeighborhoods = new Set<string>();
        profilesData?.forEach((profile) => {
          profile.neighborhoods?.forEach((n: string) => uniqueNeighborhoods.add(n));
        });

        const verifiedPercentage =
          totalCount && totalCount > 0
            ? Math.round(((verifiedCount || 0) / totalCount) * 100)
            : 0;

        setStats({
          totalProfiles: totalCount || 0,
          neighborhoods: uniqueNeighborhoods.size,
          verifiedPercentage,
        });
      } catch (error) {
        console.error("Error fetching city stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [stateSlug, citySlug]);

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant="secondary" className="animate-pulse h-6 w-24" />
        <Badge variant="secondary" className="animate-pulse h-6 w-20" />
        <Badge variant="secondary" className="animate-pulse h-6 w-28" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
        <Users className="w-3.5 h-3.5" />
        <span>{stats.totalProfiles} perfis ativos</span>
      </Badge>
      <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
        <MapPin className="w-3.5 h-3.5" />
        <span>{stats.neighborhoods} bairros</span>
      </Badge>
      {stats.verifiedPercentage > 0 && (
        <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{stats.verifiedPercentage}% verificados</span>
        </Badge>
      )}
    </div>
  );
};

export default CityStats;

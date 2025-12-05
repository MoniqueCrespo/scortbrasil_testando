import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface NeighborhoodLinksProps {
  stateSlug: string; // Should be state code (e.g., 'rj')
  citySlug: string;
}

interface NeighborhoodCount {
  neighborhood: string;
  count: number;
}

interface NeighborhoodCount {
  neighborhood: string;
  count: number;
}

const NeighborhoodLinks = ({ stateSlug, citySlug }: NeighborhoodLinksProps) => {
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNeighborhoods = async () => {
      try {
        // Buscar estado e cidade pelos slugs para obter os códigos corretos
        const { data: cityData } = await supabase
          .from("cities_seo")
          .select("state_code, city_slug")
          .eq("city_slug", citySlug)
          .single();

        if (!cityData) return;

        const { data } = await supabase
          .from("model_profiles")
          .select("neighborhoods")
          .eq("state", cityData.state_code)
          .eq("city", citySlug)
          .eq("is_active", true)
          .eq("moderation_status", "approved");

        const neighborhoodMap = new Map<string, number>();
        
        data?.forEach((profile) => {
          profile.neighborhoods?.forEach((n: string) => {
            neighborhoodMap.set(n, (neighborhoodMap.get(n) || 0) + 1);
          });
        });

        const sortedNeighborhoods = Array.from(neighborhoodMap.entries())
          .map(([neighborhood, count]) => ({ neighborhood, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setNeighborhoods(sortedNeighborhoods);
      } catch (error) {
        console.error("Error fetching neighborhoods:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNeighborhoods();
  }, [stateSlug, citySlug]);

  if (loading || neighborhoods.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold mb-4">Principais Bairros</h2>
      <div className="flex flex-wrap gap-2">
        {neighborhoods.map(({ neighborhood, count }) => {
          const neighborhoodSlug = neighborhood.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
          // URL correta: sempre /acompanhantes/{state}/{neighborhoodSlug}
          const neighborhoodUrl = `/acompanhantes/${stateSlug}/${neighborhoodSlug}`;
          
          return (
            <Link
              key={neighborhood}
              to={neighborhoodUrl}
            >
              <Badge
                variant="outline"
                className="hover:bg-muted transition-colors cursor-pointer px-3 py-1.5"
              >
                {neighborhood} ({count})
              </Badge>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default NeighborhoodLinks;

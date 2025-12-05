import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { getCitiesByState } from "@/data/locations";
import { MapPin } from "lucide-react";

interface NearbyCitiesProps {
  stateSlug: string;
  currentCitySlug: string;
}

interface CityCount {
  slug: string;
  name: string;
  count: number;
}

const NearbyCities = ({ stateSlug, currentCitySlug }: NearbyCitiesProps) => {
  const [cities, setCities] = useState<CityCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const { data: stateData } = await supabase
          .from("model_profiles")
          .select("city")
          .eq("state", stateSlug)
          .eq("is_active", true);

        if (!stateData) return;

        // Get unique cities from the data
        const uniqueCities = Array.from(new Set(stateData.map(p => p.city)));
        const otherCities = uniqueCities.filter((c) => c !== currentCitySlug);

        const citiesWithCounts = await Promise.all(
          otherCities.map(async (citySlug) => {
            const { count } = await supabase
              .from("model_profiles")
              .select("*", { count: "exact", head: true })
              .eq("state", stateSlug)
              .eq("city", citySlug)
              .eq("is_active", true);
            
            // Get city name from locations data
            const cityData = getCitiesByState(stateSlug).find(c => c.slug === citySlug);

            return {
              slug: citySlug,
              name: cityData?.name || citySlug,
              count: count || 0,
            };
          })
        );

        const sortedCities = citiesWithCounts
          .filter((c) => c.count > 0)
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);

        setCities(sortedCities);
      } catch (error) {
        console.error("Error fetching nearby cities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [stateSlug, currentCitySlug]);

  if (loading || cities.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold mb-4">
        Explorar Outras Cidades
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cities.map((city) => (
          <Link key={city.slug} to={`/acompanhantes/${stateSlug}/${city.slug}`}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex flex-col items-center text-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">{city.name}</p>
                  <p className="text-xs text-muted-foreground">{city.count} perfis</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default NearbyCities;

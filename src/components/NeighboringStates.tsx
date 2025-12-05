import { useMemo } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

import { getNeighboringStates } from "@/data/locations";
import { useAcompanhantes } from "@/hooks/useWordPressAPI";
import type { BrazilState } from "@/types/location";
import type { CategoryType } from "@/types/location";

interface NeighboringStatesProps {
  currentStateCode: string;
  category: CategoryType;
}

export const NeighboringStates = ({ currentStateCode, category }: NeighboringStatesProps) => {
  // Buscar perfis via WordPress API
  const { profiles, loading: isLoading } = useAcompanhantes({ 
    per_page: 500,
    categoria: category 
  });

  // Calcular contagem para estados vizinhos
  const statesWithCounts = useMemo(() => {
    const neighbors = getNeighboringStates(currentStateCode);
    
    return neighbors.slice(0, 5).map(state => {
      const count = profiles.filter(p => 
        (p.state || '').toUpperCase() === state.code.toUpperCase()
      ).length;
      return { state, count };
    }).filter(r => r.count > 0);
  }, [currentStateCode, profiles]);

  if (isLoading || statesWithCounts.length === 0) return null;

  return (
    <section className="mt-12 mb-8">
      <h2 className="text-2xl font-bold mb-2 text-foreground flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        Estados Vizinhos
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Explore perfis em estados próximos geograficamente
      </p>
      
      <div className="flex flex-wrap gap-2">
        {statesWithCounts.map(({ state, count }) => (
          <Link
            key={state.code}
            to={category === 'mulheres' 
              ? `/acompanhantes/${state.code.toLowerCase()}` 
              : `/acompanhantes/${state.code.toLowerCase()}/${category}`
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-foreground rounded-full text-sm transition-all duration-200 hover:bg-primary/10 hover:text-primary cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{state.name}</span>
            <span className="text-xs text-muted-foreground/70">
              ({count})
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

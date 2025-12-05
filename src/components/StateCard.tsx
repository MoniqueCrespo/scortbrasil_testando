import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ChevronRight } from "lucide-react";
import { BrazilState } from "@/types/location";
import { getCitiesByState } from "@/data/locations";

interface StateCardProps {
  state: BrazilState;
  profileCount?: number;
}

const StateCard = ({ state, profileCount = 0 }: StateCardProps) => {
  const cities = getCitiesByState(state.code);
  
  return (
    <Link to={`/acompanhantes/${state.code.toLowerCase()}`}>
      <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 group border-2 hover:border-primary">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                {state.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {cities.length} {cities.length === 1 ? 'cidade disponível' : 'cidades disponíveis'}
              </p>
              {profileCount > 0 && (
                <Badge variant="secondary" className="mt-2">
                  {profileCount} {profileCount === 1 ? 'perfil' : 'perfis'}
                </Badge>
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </Card>
    </Link>
  );
};

export default StateCard;

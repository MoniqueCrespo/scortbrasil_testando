import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ChevronRight } from "lucide-react";
import { City } from "@/types/location";

interface CityCardProps {
  city: City;
  stateSlug: string;
  profileCount?: number;
}

const CityCard = ({ city, stateSlug, profileCount = 0 }: CityCardProps) => {
  // stateSlug agora é sigla (RJ, SP, etc)
  return (
    <Link to={`/acompanhantes/${stateSlug}/${city.slug}/categorias`}>
      <Card className="p-5 hover:shadow-lg transition-all duration-300 hover:scale-105 group border hover:border-primary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                {city.name}
              </h3>
              {profileCount > 0 && (
                <Badge variant="secondary" className="mt-1">
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

export default CityCard;

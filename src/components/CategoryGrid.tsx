import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Users, 
  Heart, 
  UserCheck, 
  Sparkles 
} from "lucide-react";
import { CategoryType, LocationProfile } from "@/types/location";

interface CategoryGridProps {
  stateSlug: string;
  citySlug: string;
  profiles: LocationProfile[];
}

interface CategoryInfo {
  type: CategoryType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}

const categories: CategoryInfo[] = [
  {
    type: 'mulheres',
    name: 'Mulheres',
    description: 'Acompanhantes femininas',
    icon: User,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
  },
  {
    type: 'homens',
    name: 'Homens',
    description: 'Acompanhantes masculinos',
    icon: UserCheck,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/30',
  },
  {
    type: 'trans',
    name: 'Trans',
    description: 'Acompanhantes trans',
    icon: Sparkles,
    color: 'text-primary',
    bgColor: 'bg-primary/5',
    borderColor: 'border-primary/20',
  },
  {
    type: 'casais',
    name: 'Casais',
    description: 'Atendimento de casais',
    icon: Users,
    color: 'text-accent',
    bgColor: 'bg-accent/5',
    borderColor: 'border-accent/20',
  },
  {
    type: 'massagistas',
    name: 'Massagistas',
    description: 'Massagens e relaxamento',
    icon: Heart,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    borderColor: 'border-border',
  },
];

const CategoryGrid = ({ stateSlug, citySlug, profiles }: CategoryGridProps) => {
  const getProfileCount = (category: CategoryType) => {
    return profiles.filter(p => p.category === category).length;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const count = getProfileCount(cat.type);
        // stateSlug agora é sigla (rj, sp, etc)
        // Para "mulheres", não incluir categoria na URL (padrão SEO)
        const categoryUrl = cat.type === 'mulheres' 
          ? `/acompanhantes/${stateSlug}/${citySlug}`
          : `/acompanhantes/${stateSlug}/${citySlug}/${cat.type}`;
        
        return (
          <Link 
            key={cat.type} 
            to={categoryUrl}
            className="group"
          >
            <Card className={`${cat.bgColor} ${cat.borderColor} border-2 p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg`}>
              <div className="flex flex-col items-center gap-3">
                <div className={`${cat.color} p-4 rounded-full bg-background/50 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">{cat.description}</p>
                  <Badge variant="secondary" className="mt-2">
                    {count} {count === 1 ? 'perfil' : 'perfis'}
                  </Badge>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};

export default CategoryGrid;

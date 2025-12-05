import { MapPin, Star, Heart, Zap, Shield, Clock, Eye } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/OptimizedImage";
import { useFavorites } from "@/hooks/useFavorites";
import { useToast } from "@/hooks/use-toast";
import { brazilStates, cities } from "@/data/locations";
import { useState, useEffect } from "react";

interface ProfileListItemProps {
  id: string;
  name: string;
  location: string;
  age: number;
  rating: number;
  image: string;
  description: string;
  tags: string[];
  verified?: boolean;
  featured?: boolean;
  isNew?: boolean;
  isOnline?: boolean;
  state: string;
  city: string;
  category: string;
  price: number;
  isPremium?: boolean;
  services?: string[];
  slug?: string;
}

const ProfileListItem = ({ id, name, location, age, rating, image, description, tags, verified, featured, isNew, isOnline, state, city, category, price, isPremium, services, slug }: ProfileListItemProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const favorited = isFavorite(id);
  const [wasRecentlyViewed, setWasRecentlyViewed] = useState(false);
  
  useEffect(() => {
    const recentlyViewed = localStorage.getItem('recentlyViewed');
    if (recentlyViewed) {
      const viewedProfiles = JSON.parse(recentlyViewed);
      setWasRecentlyViewed(viewedProfiles.includes(id));
    }
  }, [id]);
  
  // Buscar nomes formatados de estado e cidade (state agora é código: MG, RJ, SP)
  const stateData = brazilStates.find(s => s.code === state);
  const cityData = cities.find(c => c.slug === city && c.state === state);
  const formattedLocation = cityData && stateData 
    ? `${cityData.name}, ${stateData.code}`
    : location;
  
  // URL para o perfil - usar sigla de estado, slug de cidade e perfil
  // Mulheres não inclui categoria na URL para SEO
  const stateCode = stateData?.code.toLowerCase() || state.toLowerCase();
  const profileIdentifier = slug || id;
  const profileUrl = category === 'mulheres'
    ? `/acompanhantes/${stateCode}/${city}/${profileIdentifier}`
    : `/acompanhantes/${stateCode}/${city}/${category}/${profileIdentifier}`;

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
    toast({
      title: favorited ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: favorited ? `${name} foi removido dos seus favoritos` : `${name} foi adicionado aos seus favoritos`,
      duration: 2000,
    });
  };

  return (
    <Link to={profileUrl}>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/10 hover:-translate-y-1 group relative h-full sm:h-80 p-0 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row h-full">
          <div className="relative w-full h-64 sm:w-56 sm:h-80 flex-shrink-0 overflow-hidden bg-muted">
            <OptimizedImage
              src={image}
              alt={`Perfil de ${name}, ${age} anos, localizada em ${location} - Avaliação ${rating} estrelas`}
              className="relative w-full h-full transition-transform duration-500 group-hover:scale-105 z-[1]"
              priority={false}
              sizes="(max-width: 640px) 100vw, 192px"
            />
            {verified && (
              <Badge variant="secondary" className="absolute top-2 left-2 flex items-center gap-1 z-10">
                <Shield className="h-3 w-3" />
                Verificado
              </Badge>
            )}
            {featured && (
              <Badge 
                className="absolute top-2 right-2 flex items-center gap-1 z-10"
                style={{ backgroundColor: 'hsl(var(--primary))' }}
              >
                <Zap className="h-3 w-3" />
                Destaque
              </Badge>
            )}
            {wasRecentlyViewed && (
              <Badge 
                variant="secondary" 
                className="absolute top-12 left-2 flex items-center gap-1 z-10 bg-accent/90 text-accent-foreground"
              >
                <Eye className="h-3 w-3" />
                Visto recentemente
              </Badge>
            )}
            {/* Favorite button */}
            <Button 
              size="icon" 
              variant="secondary"
              className="absolute bottom-3 right-3 z-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background hover:scale-110 transition-all duration-200"
              onClick={handleToggleFavorite}
            >
              <Heart className={`h-4 w-4 transition-all duration-300 ${favorited ? 'fill-primary text-primary scale-110' : ''}`} />
            </Button>
          </div>
          
          <div className="flex-1 p-5 flex flex-col overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{name}</h3>
                  {verified && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-xs">✓</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 bg-muted/80 backdrop-blur-sm px-2 py-1 rounded ml-2">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                <span className="text-sm font-medium text-foreground">{rating}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {formattedLocation}
              </span>
              <span>{age} anos</span>
              <span className="text-primary font-semibold">R$ {price}/h</span>
            </div>

            {(isOnline || featured || isNew || isPremium) && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {isPremium && (
                  <Badge className="bg-gradient-to-r from-primary to-primary text-primary-foreground border-0 flex items-center gap-1.5 animate-scale-in">
                    <Star className="h-3 w-3 fill-primary-foreground" />
                    Premium
                  </Badge>
                )}
                {isOnline && (
                  <Badge className="bg-accent text-accent-foreground border-0 flex items-center gap-1.5 animate-scale-in">
                    <span className="w-2 h-2 bg-accent-foreground rounded-full animate-pulse"></span>
                    Online
                  </Badge>
                )}
                <Badge className="border-accent/50 text-foreground/80 flex items-center gap-1.5 animate-scale-in" variant="outline">
                  <Zap className="h-3 w-3 text-primary" />
                  Responde rápido
                </Badge>
                {featured && (
                  <Badge className="bg-gradient-to-r from-primary to-primary border-0 text-primary-foreground animate-scale-in">
                    Destaque
                  </Badge>
                )}
                {isNew && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 border-0 animate-scale-in">
                    Novo
                  </Badge>
                )}
              </div>
            )}
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {description}
            </p>
            
            {services && services.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {services.slice(0, 3).map((service) => (
                  <Badge key={service} variant="outline" className="text-xs px-2 py-0.5 border-primary/30 text-foreground/80">
                    {service}
                  </Badge>
                ))}
              </div>
            )}
            
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ProfileListItem;

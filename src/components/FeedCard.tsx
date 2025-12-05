import { useState, useEffect, useRef } from "react";
import { Heart, User, MessageCircle, MapPin, Star, Shield, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "@/hooks/useFavorites";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { brazilStates } from "@/data/locations";

interface FeedCardProps {
  profile: {
    id: string;
    name: string;
    age: number;
    photos: string[];
    state: string;
    city: string;
    neighborhoods: string[];
    category: string;
    price: number;
    verified: boolean;
    rating: number | null;
    has_stories: boolean;
  };
  isActive: boolean;
  onInView: () => void;
}

const FeedCard = ({ profile, isActive, onInView }: FeedCardProps) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onInView();
          }
        });
      },
      { threshold: 0.7 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [onInView]);

  useEffect(() => {
    if (isActive && !hasTrackedView) {
      trackInteraction('view');
      setHasTrackedView(true);
    }
  }, [isActive, hasTrackedView]);

  const trackInteraction = async (type: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('feed_interactions').insert({
      profile_id: profile.id,
      viewer_id: user?.id || null,
      interaction_type: type
    });
  };

  const handleFavorite = () => {
    toggleFavorite(profile.id);
    trackInteraction('favorite');
    toast.success(isFavorite(profile.id) ? "Removido dos favoritos" : "Adicionado aos favoritos");
  };

  const handleViewProfile = () => {
    trackInteraction('profile_visit');
    const stateData = brazilStates.find(s => s.code === profile.state);
    const stateSlug = stateData?.code.toLowerCase() || profile.state.toLowerCase();
    const baseUrl = `/acompanhantes/${stateSlug}/${profile.city}/${profile.id}`;
    navigate(baseUrl);
  };

  const handleMessage = () => {
    trackInteraction('message');
    toast.info("Funcionalidade de mensagens em breve!");
  };

  const handlePhotoClick = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const clickX = e.clientX - rect.left;
    const halfWidth = rect.width / 2;
    
    if (clickX > halfWidth && currentPhotoIndex < profile.photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
    } else if (clickX < halfWidth && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
    }
  };

  return (
    <div
      id={`feed-card-${profile.id}`}
      ref={cardRef}
      className="relative h-screen w-full snap-start"
      onClick={handlePhotoClick}
    >
      {/* Background Image */}
      <div className="absolute inset-0 bg-black">
        <img
          src={profile.photos[currentPhotoIndex]}
          alt={profile.name}
          className="w-full h-full object-cover md:object-contain"
          loading={isActive ? "eager" : "lazy"}
        />
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      
      {/* Photo Indicators */}
      {profile.photos.length > 1 && (
        <div className="absolute top-4 left-4 right-4 flex gap-1">
          {profile.photos.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-all ${
                index === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
      
      {/* Stories Indicator */}
      {profile.has_stories && (
        <div className="absolute top-12 left-4 right-4">
          <div className="h-1 bg-gradient-to-r from-primary to-primary rounded-full" />
        </div>
      )}
      
      {/* Badges */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {profile.verified && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Verificado
          </Badge>
        )}
      </div>
      
      {/* Profile Info */}
      <div className="absolute bottom-24 left-4 right-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-3xl font-bold">
            {profile.name}, {profile.age}
          </h2>
          {profile.verified && (
            <Badge className="bg-primary border-none">
              ✓ Verificado
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-lg opacity-90 mb-2">
          <MapPin className="h-5 w-5" />
          <span>{profile.city}</span>
          {profile.neighborhoods[0] && <span>• {profile.neighborhoods[0]}</span>}
        </div>
        
        {profile.rating && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-5 w-5 fill-primary text-primary" />
            <span className="text-lg font-semibold text-white">{profile.rating.toFixed(1)}</span>
          </div>
        )}
        
        <p className="text-2xl font-bold">R$ {profile.price}/hora</p>
      </div>
      
      {/* Action Buttons */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-3">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 border-2 border-white/40"
          onClick={(e) => {
            e.stopPropagation();
            handleFavorite();
          }}
        >
          <Heart
            className={`h-6 w-6 ${
              isFavorite(profile.id) ? 'fill-primary text-primary' : 'text-white'
            }`}
          />
        </Button>
        
        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 border-2 border-white/40"
          onClick={(e) => {
            e.stopPropagation();
            handleViewProfile();
          }}
        >
          <User className="h-6 w-6 text-white" />
        </Button>
        
        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-gradient-to-r from-primary to-primary hover:opacity-90"
          onClick={(e) => {
            e.stopPropagation();
            handleMessage();
          }}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </div>
    </div>
  );
};

export default FeedCard;

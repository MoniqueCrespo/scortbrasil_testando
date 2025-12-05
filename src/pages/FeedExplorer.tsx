import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAcompanhantes } from "@/hooks/useWordPressAPI";
import FeedCard from "@/components/FeedCard";
import FeedFilters from "@/components/FeedFilters";
import FeedCardSkeleton from "@/components/FeedCardSkeleton";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeedProfile {
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
}

interface FilterState {
  category: string;
  state: string;
  city: string;
  neighborhoods: string[];
  priceRange: [number, number];
  onlyVerified: boolean;
  onlyWithStories: boolean;
}

const FeedExplorer = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filters, setFilters] = useState<FilterState>(() => {
    const saved = localStorage.getItem('feedFilters');
    return saved ? JSON.parse(saved) : {
      category: 'todos',
      state: 'todos',
      city: 'todos',
      neighborhoods: [],
      priceRange: [0, 1000],
      onlyVerified: false,
      onlyWithStories: false,
    };
  });

  // Buscar via WordPress API
  const { profiles: rawProfiles, loading: isLoading } = useAcompanhantes({
    per_page: 100,
    categoria: filters.category !== 'todos' ? filters.category : undefined,
    verificada: filters.onlyVerified ? true : undefined,
  });

  // Transformar e filtrar perfis
  const profiles: FeedProfile[] = useMemo(() => {
    let filtered = rawProfiles
      .filter(p => p.photos && p.photos.length > 0)
      .map(p => ({
        id: p.id,
        name: p.name,
        age: p.age,
        photos: p.photos || (p.image ? [p.image] : []),
        state: p.state || '',
        city: p.city || '',
        neighborhoods: p.neighborhoods || [],
        category: p.category || 'mulheres',
        price: p.price || 0,
        verified: p.verified || false,
        rating: p.rating || null,
        has_stories: false, // WordPress API não tem stories por enquanto
      }));

    // Filtrar por estado
    if (filters.state && filters.state !== 'todos') {
      filtered = filtered.filter(p => p.state.toUpperCase() === filters.state.toUpperCase());
    }

    // Filtrar por cidade
    if (filters.city && filters.city !== 'todos') {
      filtered = filtered.filter(p => p.city === filters.city);
    }

    // Filtrar por bairros
    if (filters.neighborhoods.length > 0) {
      filtered = filtered.filter(p => 
        p.neighborhoods.some(n => filters.neighborhoods.includes(n))
      );
    }

    // Filtrar por preço
    filtered = filtered.filter(p => 
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    return filtered;
  }, [rawProfiles, filters]);

  // Salvar filtros no localStorage
  useEffect(() => {
    localStorage.setItem('feedFilters', JSON.stringify(filters));
    setCurrentIndex(0);
  }, [filters]);

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && currentIndex < profiles.length - 1) {
        setCurrentIndex(prev => prev + 1);
        const nextCard = document.getElementById(`feed-card-${currentIndex + 1}`);
        nextCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (e.key === 'ArrowUp' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        const prevCard = document.getElementById(`feed-card-${currentIndex - 1}`);
        prevCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, profiles.length]);

  // Preload de imagens
  useEffect(() => {
    const preloadImages = profiles
      .slice(currentIndex + 1, currentIndex + 4)
      .map(p => p.photos[0])
      .filter(Boolean);
    
    preloadImages.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, [currentIndex, profiles]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header fixo */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="mx-auto max-w-full md:max-w-[450px] flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Feed</h1>
        </div>
      </div>
      
      {/* Espaçamento para o header fixo */}
      <div className="h-[57px]" />
      
      <FeedFilters filters={filters} onFilterChange={setFilters} />
      
      <div className="feed-container mx-auto max-w-full md:max-w-[450px]">
        {profiles.length === 0 && !isLoading && (
          <div className="h-screen flex items-center justify-center text-center px-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Nenhum perfil encontrado</h2>
              <p className="text-muted-foreground">Tente ajustar seus filtros para ver mais resultados</p>
            </div>
          </div>
        )}
        
        {profiles.map((profile, index) => (
          <FeedCard
            key={profile.id}
            profile={profile}
            isActive={index === currentIndex}
            onInView={() => setCurrentIndex(index)}
          />
        ))}
        
        {isLoading && (
          <>
            <FeedCardSkeleton />
            <FeedCardSkeleton />
          </>
        )}
        
        {isLoading && profiles.length > 0 && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>
      
      <style>{`
        .feed-container {
          scroll-snap-type: y mandatory;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        .feed-container > div {
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }
        
        @media (min-width: 768px) {
          .feed-container {
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.3);
          }
        }
      `}</style>
    </div>
  );
};

export default FeedExplorer;

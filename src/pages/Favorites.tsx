import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowLeft, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileCard from "@/components/ProfileCard";
import ProfileListItem from "@/components/ProfileListItem";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import { useAcompanhantes } from "@/hooks/useWordPressAPI";
import { Skeleton } from "@/components/ui/skeleton";
import type { LocationProfile } from "@/types/location";

const BATCH_SIZE = 12;

const Favorites = () => {
  const navigate = useNavigate();
  const [displayedCount, setDisplayedCount] = useState(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { favorites } = useFavorites();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const saved = localStorage.getItem('viewMode');
    return (saved === 'grid' || saved === 'list') ? saved : 'list';
  });

  // Buscar todos os perfis via WordPress API
  const { profiles: allProfiles, loading } = useAcompanhantes({ per_page: 200 });

  // Filtrar apenas os favoritos
  const favoriteProfiles = useMemo(() => {
    if (!favorites.length) return [];
    return allProfiles.filter(p => favorites.includes(p.id));
  }, [allProfiles, favorites]);

  // Scroll infinito
  const displayedProfiles = favoriteProfiles.slice(0, displayedCount);
  const hasMore = displayedCount < favoriteProfiles.length;

  // Reset displayedCount quando favoritos mudam
  useEffect(() => {
    setDisplayedCount(BATCH_SIZE);
  }, [favorites]);

  // Infinite scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 500;
      
      if (scrolled >= threshold && !isLoadingMore && hasMore) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setDisplayedCount(prev => prev + BATCH_SIZE);
          setIsLoadingMore(false);
        }, 300);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, hasMore]);

  // Transformar perfil
  const transformProfile = (profile: LocationProfile) => ({
    id: profile.id,
    slug: profile.name.toLowerCase().replace(/\s+/g, '-'),
    name: profile.name,
    age: profile.age,
    state: profile.state || '',
    city: profile.city || '',
    category: profile.category || 'mulheres',
    image: profile.image || '/placeholder.svg',
    location: profile.location,
    description: profile.description || 'Descrição não disponível',
    tags: profile.tags || [],
    price: profile.price || 0,
    rating: profile.rating || 4.5,
    verified: profile.verified || false,
    featured: profile.featured || false,
    isNew: profile.isNew || false,
    isOnline: profile.isOnline || false,
    isPremium: profile.featured || false,
    services: profile.services || [],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4 -ml-2 hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 fill-primary text-primary" />
            <h1 className="text-3xl font-bold">Meus Favoritos</h1>
          </div>
          <p className="text-muted-foreground">
            {displayedProfiles.length} {displayedProfiles.length === 1 ? 'perfil salvo' : 'perfis salvos'}
            {favoriteProfiles.length > displayedProfiles.length && ` (mostrando ${displayedProfiles.length} de ${favoriteProfiles.length})`}
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-gradient-to-r from-primary to-[hsl(320,75%,58%)]' : ''}
          >
            Grade
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-gradient-to-r from-primary to-[hsl(320,75%,58%)]' : ''}
          >
            Lista
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : favoriteProfiles.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-2xl font-semibold mb-2">Nenhum favorito ainda</h2>
            <p className="text-muted-foreground mb-6">
              Comece a adicionar perfis aos seus favoritos clicando no ícone de coração
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-primary to-[hsl(320,75%,58%)] hover:opacity-90"
            >
              Explorar Perfis
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedProfiles.map((profile) => (
              <ProfileCard key={profile.id} {...transformProfile(profile)} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {displayedProfiles.map((profile) => (
              <ProfileListItem key={profile.id} {...transformProfile(profile)} />
            ))}
          </div>
        )}

        {/* Loading indicator para scroll infinito */}
        {!loading && displayedProfiles.length > 0 && (isLoadingMore || hasMore) && (
          <div className="flex justify-center py-8 mt-6">
            {isLoadingMore ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Carregando mais perfis...</span>
              </div>
            ) : hasMore && (
              <p className="text-sm text-muted-foreground">Role para carregar mais perfis</p>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import StateCard from "@/components/StateCard";
import ProfileCard from "@/components/ProfileCard";
import ProfileListItem from "@/components/ProfileListItem";
import FilterBar from "@/components/FilterBar";
import AdvancedFilters from "@/components/AdvancedFilters";
import { StoriesBar } from "@/components/StoriesBar";
import { PillButton } from "@/components/PillButton";
import { useFilters } from "@/hooks/useFilters";
import { useFavorites } from "@/hooks/useFavorites";
import { brazilStates, getStateBySlug, getCityBySlug } from "@/data/locations";
import { useAcompanhantes, useDestaques, useCidades } from "@/hooks/useWordPressAPI";
import type { LocationProfile } from "@/types/location";
import { Search, MapPin, Sparkles, Users, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import SEOContent from "@/components/SEOContent";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface StateWithCount {
  state: typeof brazilStates[0];
  count: number;
}

const BATCH_SIZE = 24;

const Home = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeTab, setActiveTab] = useState<'profiles' | 'states'>('profiles');
  const [displayedCount, setDisplayedCount] = useState(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Hooks WordPress API
  const { profiles, total, loading: isLoading } = useAcompanhantes({ 
    per_page: 100,
    categoria: selectedCategory !== 'Todos' ? selectedCategory.toLowerCase() : undefined 
  });
  const { destaques: premiumProfiles, loading: loadingDestaques } = useDestaques(12);
  const { cidades } = useCidades();

  const {
    filters,
    updateFilter,
    resetFilters,
    savedFilters,
    saveCurrentFilters,
    loadSavedFilter,
    deleteSavedFilter,
  } = useFilters();

  const { favorites } = useFavorites();

  // Calcular contagem por estado
  const statesWithCounts = useMemo(() => {
    const counts = new Map<string, number>();
    profiles.forEach(p => {
      const state = p.state || 'SP';
      counts.set(state, (counts.get(state) || 0) + 1);
    });
    
    return brazilStates.map(state => ({
      state,
      count: counts.get(state.slug) || counts.get(state.code) || 0
    })).sort((a, b) => b.count - a.count);
  }, [profiles]);

  // Transformar perfil WordPress para formato do componente
  const transformProfile = (profile: LocationProfile) => {
    return {
      ...profile,
      id: profile.id,
      slug: profile.name.toLowerCase().replace(/\s+/g, '-'),
      location: profile.location,
      image: profile.image || '/placeholder.svg',
      rating: profile.rating || 4.5,
      tags: profile.tags || [],
      isNew: profile.isNew || false,
      isOnline: profile.isOnline || false,
      eyeColor: profile.eyeColor,
      hairColor: profile.hairColor,
      name: profile.name,
      age: profile.age,
      description: profile.description,
      verified: profile.verified,
      featured: profile.featured,
      category: profile.category,
      gender: profile.gender,
      state: profile.state,
      city: profile.city,
      price: profile.price,
      services: profile.services || [],
    };
  };

  // Filtrar perfis
  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      // Filtro de favoritos
      if (showOnlyFavorites && !favorites.includes(profile.id)) return false;

      // Filtro de busca
      if (searchTerm.trim()) {
        const search = searchTerm.toLowerCase();
        const matchesName = profile.name.toLowerCase().includes(search);
        const matchesLocation = profile.location?.toLowerCase().includes(search);
        if (!matchesName && !matchesLocation) return false;
      }

      // Filtro de categoria
      if (selectedCategory !== 'Todos') {
        if (selectedCategory === 'Destaque') {
          if (!profile.featured) return false;
        } else if (selectedCategory === 'Verificados') {
          if (!profile.verified) return false;
        } else {
          const categoryMap: Record<string, string> = {
            'Acompanhantes': 'mulheres',
            'Mulheres': 'mulheres',
            'Homens': 'homens',
            'Trans': 'trans',
            'Casais': 'casais',
            'Massagistas': 'massagistas'
          };
          const targetCategory = categoryMap[selectedCategory] || selectedCategory.toLowerCase();
          if (profile.category !== targetCategory) return false;
        }
      }

      // Filtros avançados
      if (filters.verifiedOnly && !profile.verified) return false;
      if (filters.onlineOnly && !profile.isOnline) return false;
      if (filters.minPrice && profile.price < filters.minPrice) return false;
      if (filters.maxPrice && profile.price > filters.maxPrice) return false;
      if (filters.minAge && profile.age < filters.minAge) return false;
      if (filters.maxAge && profile.age > filters.maxAge) return false;

      return true;
    });
  }, [profiles, searchTerm, selectedCategory, filters, showOnlyFavorites, favorites]);

  // Filtrar estados
  const filteredStates = useMemo(() => {
    if (!searchTerm.trim()) return statesWithCounts;
    const search = searchTerm.toLowerCase();
    return statesWithCounts.filter(({ state }) =>
      state.name.toLowerCase().includes(search) ||
      state.code.toLowerCase().includes(search)
    );
  }, [statesWithCounts, searchTerm]);

  // Perfis exibidos com paginação
  const displayedProfiles = filteredProfiles.slice(0, displayedCount);
  const hasMore = displayedCount < filteredProfiles.length;

  // Handler para toggle de favoritos
  const handleToggleFavorites = () => {
    setShowOnlyFavorites(!showOnlyFavorites);
  };

  // Carregar mais perfis
  const loadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayedCount(prev => prev + BATCH_SIZE);
      setIsLoadingMore(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Acompanhantes Brasil - Encontre Acompanhantes Verificadas"
        description="Encontre acompanhantes verificadas em todo o Brasil. Perfis com fotos reais, preços e contato direto."
      />
      
      <Header />
      
      <StoriesBar />
      
      <main className="container mx-auto px-4 py-6">
        {/* Busca */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar por nome, cidade ou estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>
        </div>

        {/* Tabs - Perfis ou Estados */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'profiles' | 'states')} className="mb-6">
          <TabsList className="grid w-full max-w-sm grid-cols-2 h-10">
            <TabsTrigger value="profiles" className="text-sm">
              <Users className="w-4 h-4 mr-2" />
              Perfis ({filteredProfiles.length})
            </TabsTrigger>
            <TabsTrigger value="states" className="text-sm">
              <MapPin className="w-4 h-4 mr-2" />
              Estados ({filteredStates.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profiles" className="mt-6 space-y-6">
            {/* Carrossel de Perfis Premium */}
            {!isLoading && premiumProfiles.length > 0 && !searchTerm && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Perfis em Destaque</h2>
                    {selectedCategory !== 'Todos' && selectedCategory !== 'Destaque' && selectedCategory !== 'Verificados' && (
                      <Badge variant="outline" className="text-xs">• {selectedCategory}</Badge>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs">Premium</Badge>
                </div>
                
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent>
                    {premiumProfiles.map((profile) => {
                      const transformed = transformProfile(profile);
                      return (
                        <CarouselItem key={profile.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                          <ProfileCard 
                            {...transformed}
                            state={profile.state}
                            city={profile.city}
                            category={profile.category}
                            services={profile.services || []}
                          />
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </section>
            )}
            
            <div className="mb-4">
              <FilterBar
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                onFiltersClick={() => setFiltersOpen(!filtersOpen)}
                showOnlyFavorites={showOnlyFavorites}
                onToggleFavorites={handleToggleFavorites}
              />
            </div>

            <AdvancedFilters
              open={filtersOpen}
              onOpenChange={setFiltersOpen}
              filters={filters}
              onFilterChange={updateFilter}
              onReset={resetFilters}
              savedFilters={savedFilters}
              onSaveFilters={saveCurrentFilters}
              onLoadFilter={loadSavedFilter}
              onDeleteFilter={deleteSavedFilter}
            />

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-lg text-muted-foreground">Carregando perfis...</p>
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-3">
                  Nenhum perfil encontrado
                </p>
                <Button onClick={resetFilters} variant="outline" size="sm">
                  Limpar Filtros
                </Button>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <article className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {displayedProfiles.map((profile) => {
                      const transformed = transformProfile(profile);
                      return (
                        <ProfileCard 
                          key={profile.id}
                          {...transformed}
                          state={profile.state}
                          city={profile.city}
                          category={profile.category}
                          services={profile.services || []}
                        />
                      );
                    })}
                  </article>
                ) : (
                  <article className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {displayedProfiles.map((profile) => {
                      const transformed = transformProfile(profile);
                      return (
                        <ProfileListItem 
                          key={profile.id}
                          {...transformed}
                          state={profile.state}
                          city={profile.city}
                          category={profile.category}
                          services={profile.services || []}
                        />
                      );
                    })}
                  </article>
                )}

                {/* Carregar mais */}
                {hasMore && (
                  <div className="flex justify-center py-8 mt-6">
                    {isLoadingMore ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Carregando mais perfis...</span>
                      </div>
                    ) : (
                      <Button onClick={loadMore} variant="outline">
                        Carregar mais perfis
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Conteúdo SEO */}
            {!isLoading && <SEOContent />}
          </TabsContent>

          <TabsContent value="states" className="mt-8 space-y-4">
            {/* Busca rápida de estados */}
            <div className="max-w-md mx-auto mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar estado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">
                  Selecione um Estado
                </h2>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                  <p className="text-lg text-muted-foreground">Carregando estados...</p>
                </div>
              ) : filteredStates.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">
                    Nenhum estado encontrado
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStates.map(({ state, count }) => (
                    <StateCard 
                      key={state.code} 
                      state={state} 
                      profileCount={count}
                    />
                  ))}
                </div>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Home;

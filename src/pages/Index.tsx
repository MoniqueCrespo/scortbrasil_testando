import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/HowItWorks";
import FilterBar from "@/components/FilterBar";
import ProfileCard from "@/components/ProfileCard";
import ProfileListItem from "@/components/ProfileListItem";
import AdvancedFilters from "@/components/AdvancedFilters";
import { EmptyState } from "@/components/EmptyState";
import { StoriesBar } from "@/components/StoriesBar";
import { useFilters } from "@/hooks/useFilters";
import { useFavorites } from "@/hooks/useFavorites";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useAcompanhantes, useDestaques, useCidades } from "@/hooks/useWordPressAPI";
import { getStateBySlug, getStateByCode, getCityBySlug } from "@/data/locations";
import type { LocationProfile } from "@/types/location";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import SEOHead from "@/components/SEOHead";

// Mapa de estados para nomes completos
const estadosNomes: Record<string, string> = {
  ac: "Acre", al: "Alagoas", ap: "Amapá", am: "Amazonas", ba: "Bahia",
  ce: "Ceará", df: "Distrito Federal", es: "Espírito Santo", go: "Goiás",
  ma: "Maranhão", mt: "Mato Grosso", ms: "Mato Grosso do Sul", mg: "Minas Gerais",
  pa: "Pará", pb: "Paraíba", pr: "Paraná", pe: "Pernambuco", pi: "Piauí",
  rj: "Rio de Janeiro", rn: "Rio Grande do Norte", rs: "Rio Grande do Sul",
  ro: "Rondônia", rr: "Roraima", sc: "Santa Catarina", sp: "São Paulo",
  se: "Sergipe", to: "Tocantins",
};

const BATCH_SIZE = 24;

const Index = () => {
  const navigate = useNavigate();
  const { state: stateParam, locationOrCategory: locationParam, category: categoryParam } = useParams<{
    state?: string;
    locationOrCategory?: string;
    category?: string;
  }>();

  // Resolver estado
  const state = stateParam
    ? stateParam.length === 2
      ? getStateByCode(stateParam.toUpperCase())
      : getStateBySlug(stateParam)
    : undefined;

  // Resolver cidade
  const city = locationParam && state
    ? getCityBySlug(locationParam, state.code)
    : undefined;

  // Estados do componente
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'Todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [displayedCount, setDisplayedCount] = useState(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Hooks WordPress API
  const { profiles, total, loading: isLoading } = useAcompanhantes({
    per_page: 100,
    cidade: city?.slug || locationParam,
    categoria: selectedCategory !== 'Todos' ? selectedCategory.toLowerCase() : undefined,
  });
  
  const { destaques: premiumProfiles } = useDestaques(12);

  // Hooks de filtros e favoritos
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

  // Título da página
  const pageTitle = useMemo(() => {
    if (city) return `Acompanhantes em ${city.name}`;
    if (state) return `Acompanhantes em ${state.name}`;
    return "Acompanhantes em Todo Brasil";
  }, [city, state]);

  // Transformar perfil para formato do componente
  const transformProfile = (profile: LocationProfile) => ({
    ...profile,
    id: profile.id,
    slug: profile.name.toLowerCase().replace(/\s+/g, '-'),
    location: profile.location,
    image: profile.image || '/placeholder.svg',
    rating: profile.rating || 4.5,
    tags: profile.tags || [],
    isNew: profile.isNew || false,
    isOnline: profile.isOnline || false,
    name: profile.name,
    age: profile.age,
    description: profile.description,
    verified: profile.verified,
    featured: profile.featured,
    category: profile.category,
    state: profile.state,
    city: profile.city,
    price: profile.price,
    services: profile.services || [],
  });

  // Filtrar perfis
  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      if (showOnlyFavorites && !favorites.includes(profile.id)) return false;

      if (selectedCategory !== 'Todos') {
        if (selectedCategory === 'Destaque' && !profile.featured) return false;
        if (selectedCategory === 'Verificados' && !profile.verified) return false;
        
        const categoryMap: Record<string, string> = {
          'Acompanhantes': 'mulheres',
          'Mulheres': 'mulheres',
          'Homens': 'homens',
          'Trans': 'trans',
          'Casais': 'casais',
          'Massagistas': 'massagistas'
        };
        const targetCategory = categoryMap[selectedCategory] || selectedCategory.toLowerCase();
        if (profile.category !== targetCategory && selectedCategory !== 'Destaque' && selectedCategory !== 'Verificados') {
          return false;
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
  }, [profiles, selectedCategory, filters, showOnlyFavorites, favorites]);

  // Perfis exibidos
  const displayedProfiles = filteredProfiles.slice(0, displayedCount);
  const hasMore = displayedCount < filteredProfiles.length;

  // Handlers
  const handleToggleFavorites = () => setShowOnlyFavorites(!showOnlyFavorites);
  
  const loadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayedCount(prev => prev + BATCH_SIZE);
      setIsLoadingMore(false);
    }, 500);
  };

  const handleBack = () => {
    if (city) navigate(`/${state?.slug}`);
    else if (state) navigate('/');
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${pageTitle} - Acompanhantes Verificadas`}
        description={`Encontre acompanhantes verificadas ${city ? `em ${city.name}` : state ? `em ${state.name}` : 'em todo Brasil'}. Perfis com fotos reais e contato direto.`}
      />
      
      <Header />
      <StoriesBar />

      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb/Voltar */}
        {(state || city) && (
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        )}

        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{pageTitle}</h1>
          <p className="text-muted-foreground mt-1">
            {filteredProfiles.length} perfis encontrados
          </p>
        </div>

        {/* Carrossel Premium */}
        {!isLoading && premiumProfiles.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Perfis em Destaque</h2>
              </div>
              <Badge variant="secondary">Premium</Badge>
            </div>
            
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent>
                {premiumProfiles.map((profile) => (
                  <CarouselItem key={profile.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <ProfileCard {...transformProfile(profile)} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </section>
        )}

        {/* Filtros */}
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

        {/* Lista de Perfis */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Carregando perfis...</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <EmptyState
            title="Nenhum perfil encontrado"
            description="Tente ajustar os filtros ou buscar em outra localização"
            action={
              <Button onClick={resetFilters} variant="outline">
                Limpar Filtros
              </Button>
            }
          />
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

            {/* Carregar mais */}
            {hasMore && (
              <div className="flex justify-center py-8">
                {isLoadingMore ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Carregando...</span>
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

        {/* Como Funciona */}
        {!state && !city && <HowItWorks />}
      </main>

      <Footer />
    </div>
  );
};

export default Index;

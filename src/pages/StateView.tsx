import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "@/hooks/useLocation";
import { getCitiesByState, getNeighborhoodsByCity } from "@/data/locations";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useFilters } from "@/hooks/useFilters";
import { useAcompanhantes, useDestaques } from "@/hooks/useWordPressAPI";
import type { LocationProfile, CategoryType } from "@/types/location";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import CityCard from "@/components/CityCard";
import FilterBar from "@/components/FilterBar";
import AdvancedFilters from "@/components/AdvancedFilters";
import ProfileCard from "@/components/ProfileCard";
import ProfileListItem from "@/components/ProfileListItem";
import ProfileCardSkeleton from "@/components/ProfileCardSkeleton";
import ProfileListItemSkeleton from "@/components/ProfileListItemSkeleton";
import InternalNavigation from "@/components/InternalNavigation";
import { EmptyState } from "@/components/EmptyState";
import { StoriesBar } from "@/components/StoriesBar";
import { NeighboringStates } from "@/components/NeighboringStates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Users, User, Sparkles, Heart, Flower2, Building2, X, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// Nomes dos estados para SEO
const estadosSEO: Record<string, string> = {
  ac: "Acre", al: "Alagoas", ap: "Amapá", am: "Amazonas", ba: "Bahia",
  ce: "Ceará", df: "Distrito Federal", es: "Espírito Santo", go: "Goiás",
  ma: "Maranhão", mt: "Mato Grosso", ms: "Mato Grosso do Sul", mg: "Minas Gerais",
  pa: "Pará", pb: "Paraíba", pr: "Paraná", pe: "Pernambuco", pi: "Piauí",
  rj: "Rio de Janeiro", rn: "Rio Grande do Norte", rs: "Rio Grande do Sul",
  ro: "Rondônia", rr: "Roraima", sc: "Santa Catarina", sp: "São Paulo",
  se: "Sergipe", to: "Tocantins",
};

const BATCH_SIZE = 12;

const StateView = () => {
  const { state, city, category, changeCategory } = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [neighborhoodCounts, setNeighborhoodCounts] = useState<Record<string, number>>({});

  const { filters, updateFilter, resetFilters, savedFilters, saveCurrentFilters, loadSavedFilter, deleteSavedFilter } =
    useFilters();

  // Buscar perfis via WordPress API
  const { profiles, loading: isLoading } = useAcompanhantes({
    cidade: city?.slug,
    per_page: 200
  });

  // Buscar destaques
  const { destaques: allDestaques } = useDestaques(20);

  if (!state) {
    navigate("/");
    return null;
  }

  const cities = getCitiesByState(state.code);
  const stateCode = state.code.toLowerCase();
  const stateName = estadosSEO[stateCode] || state.name;

  // Filtrar perfis do estado
  const stateProfiles = useMemo(() => {
    return profiles.filter(p => 
      p.state?.toUpperCase() === state.code.toUpperCase()
    );
  }, [profiles, state.code]);

  // Filtrar por categoria ativa
  const categoryProfiles = useMemo(() => {
    return stateProfiles.filter(p => p.category === category);
  }, [stateProfiles, category]);

  // Perfis premium do estado
  const premiumProfiles = useMemo(() => {
    return categoryProfiles.filter(p => p.featured);
  }, [categoryProfiles]);

  // Contagem por bairro
  useEffect(() => {
    const counts: Record<string, number> = {};
    categoryProfiles.forEach(profile => {
      profile.neighborhoods?.forEach(neighborhood => {
        const normalized = neighborhood.toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        counts[normalized] = (counts[normalized] || 0) + 1;
      });
    });
    setNeighborhoodCounts(counts);
  }, [categoryProfiles]);

  // Calcular contagem por categoria
  const getCategoryCount = (cat: CategoryType) => {
    return stateProfiles.filter(p => p.category === cat).length;
  };

  const categoryLabels: Record<string, string> = {
    mulheres: "Acompanhantes",
    homens: "Homens",
    trans: "Trans",
    casais: "Casais",
    massagistas: "Massagistas",
  };

  // Transformar perfil para formato do componente
  const transformProfile = (profile: LocationProfile) => ({
    ...profile,
    id: profile.id,
    slug: profile.name.toLowerCase().replace(/\s+/g, '-'),
    location: profile.location,
    image: profile.image || "/placeholder.svg",
    rating: profile.rating || 4.5,
    tags: profile.tags || [],
    isNew: profile.isNew || false,
    isOnline: profile.isOnline || false,
    eyeColor: profile.eyeColor,
    hairColor: profile.hairColor,
  });

  // Query params da URL
  const servicoParam = searchParams.get("servico");
  const bairroParam = searchParams.get("bairro");

  // Aplicar filtros
  let filteredProfiles = [...categoryProfiles];

  // Filtro de cidade dos filtros avançados
  if (filters.city && filters.city !== "all") {
    filteredProfiles = filteredProfiles.filter(p => p.city === filters.city);
  }

  // Filtros de categoria especial
  if (selectedCategory === "Destaque") {
    filteredProfiles = filteredProfiles.filter(p => p.featured);
  } else if (selectedCategory === "Verificados") {
    filteredProfiles = filteredProfiles.filter(p => p.verified);
  } else if (selectedCategory === "Premium") {
    filteredProfiles = filteredProfiles.filter(p => (p.price || 0) >= 500);
  } else if (selectedCategory === "Novos") {
    filteredProfiles = filteredProfiles.filter(p => p.isNew);
  }

  // Filtros avançados
  filteredProfiles = filteredProfiles.filter(profile => {
    if (filters.searchName && !profile.name.toLowerCase().includes(filters.searchName.toLowerCase())) {
      return false;
    }
    if (filters.ageRange && (profile.age < filters.ageRange[0] || profile.age > filters.ageRange[1])) {
      return false;
    }
    if (filters.priceRange && ((profile.price || 0) < filters.priceRange[0] || (profile.price || 0) > filters.priceRange[1])) {
      return false;
    }
    if (filters.height && profile.height && (profile.height < filters.height[0] || profile.height > filters.height[1])) {
      return false;
    }
    if (filters.weight && profile.weight && (profile.weight < filters.weight[0] || profile.weight > filters.weight[1])) {
      return false;
    }
    if (filters.eyeColor?.length > 0 && profile.eyeColor && !filters.eyeColor.includes(profile.eyeColor)) {
      return false;
    }
    if (filters.hairColor?.length > 0 && profile.hairColor && !filters.hairColor.includes(profile.hairColor)) {
      return false;
    }
    if (filters.services?.length > 0 && profile.services) {
      const hasService = filters.services.some(s => profile.services?.includes(s));
      if (!hasService) return false;
    }
    if (filters.availability?.length > 0 && profile.availability) {
      const hasAvailability = filters.availability.some(a => profile.availability?.includes(a));
      if (!hasAvailability) return false;
    }
    if (filters.neighborhoods?.length > 0 && profile.neighborhoods) {
      const hasNeighborhood = filters.neighborhoods.some(n => profile.neighborhoods?.includes(n));
      if (!hasNeighborhood) return false;
    }
    return true;
  });

  // Filtro de serviço da URL
  if (servicoParam) {
    filteredProfiles = filteredProfiles.filter(profile => {
      if (!profile.services) return false;
      const normalizedServices = profile.services.map(s =>
        s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")
      );
      return normalizedServices.includes(servicoParam);
    });
  }

  // Filtro de bairro da URL
  if (bairroParam) {
    filteredProfiles = filteredProfiles.filter(profile => {
      if (!profile.neighborhoods) return false;
      const normalizedNeighborhoods = profile.neighborhoods.map(n =>
        n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")
      );
      return normalizedNeighborhoods.includes(bairroParam);
    });
  }

  // Paginação
  const currentProfiles = filteredProfiles.slice(0, displayedCount);
  const hasMore = displayedCount < filteredProfiles.length;

  // Reset ao mudar filtros
  useEffect(() => {
    setDisplayedCount(BATCH_SIZE);
  }, [filters, selectedCategory, servicoParam, bairroParam]);

  // Infinite scroll
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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoadingMore, hasMore]);

  // Cidades com mais perfis
  const citiesWithCount = cities
    .map(city => ({
      ...city,
      count: stateProfiles.filter(p => p.city === city.slug && p.category === category).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // SEO
  const categoryTitle = category === "mulheres" ? "Acompanhantes" : `Acompanhantes ${categoryLabels[category] || category}`;
  const seoTitle = `${categoryTitle} em ${stateName}`;
  const cityNames = citiesWithCount.slice(0, 3).map(c => c.name).join(", ");
  const seoDescription = `Encontre ${categoryTitle.toLowerCase()} em ${stateName}. Perfis verificados em ${cityNames || 'diversas cidades'}. Contato direto via WhatsApp.`;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={`acompanhantes ${stateName}, escorts ${stateName}, ${category} ${stateName}`}
      />

      <Header />
      <StoriesBar />

      <main className="container mx-auto px-4 py-6">
        {/* Voltar */}
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">{seoTitle}</h1>
          <p className="text-muted-foreground mt-1">
            {filteredProfiles.length} perfis encontrados em {stateName}
          </p>
        </div>

        {/* Cidades em Destaque */}
        {citiesWithCount.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Cidades em Destaque</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {citiesWithCount.map(city => (
                <CityCard
                  key={city.slug}
                  city={city}
                  stateSlug={stateCode}
                  profileCount={city.count}
                />
              ))}
            </div>
          </section>
        )}

        {/* Tabs de Categorias */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {(['mulheres', 'homens', 'trans', 'casais', 'massagistas'] as CategoryType[]).map(cat => {
              const Icon = {
                mulheres: Users,
                homens: User,
                trans: Sparkles,
                casais: Heart,
                massagistas: Flower2
              }[cat];
              
              return (
                <Button
                  key={cat}
                  variant={category === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => changeCategory(cat)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {categoryLabels[cat]}
                  <Badge variant="secondary" className="ml-1">
                    {getCategoryCount(cat)}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Carrossel Premium */}
        {premiumProfiles.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Perfis em Destaque</h2>
                <Badge variant="outline">• {stateName}</Badge>
              </div>
              <Badge variant="secondary">Premium</Badge>
            </div>

            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent>
                {premiumProfiles.map(profile => (
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
        <FilterBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onFiltersClick={() => setFiltersOpen(true)}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <AdvancedFilters
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          filters={filters}
          onFilterChange={(key, value) => updateFilter(key, value)}
          onReset={resetFilters}
          savedFilters={savedFilters}
          onSaveFilters={saveCurrentFilters}
          onLoadFilter={loadSavedFilter}
          onDeleteFilter={deleteSavedFilter}
          cities={cities}
          neighborhoods={getNeighborhoodsByCity(filters.city !== "all" ? filters.city : undefined)}
        />

        {/* Grid de Perfis */}
        <div className="mt-6">
          {isLoading ? (
            <div className={viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "grid grid-cols-1 lg:grid-cols-2 gap-6"
            }>
              {Array.from({ length: BATCH_SIZE }).map((_, idx) =>
                viewMode === "grid" ? (
                  <ProfileCardSkeleton key={idx} />
                ) : (
                  <ProfileListItemSkeleton key={idx} />
                )
              )}
            </div>
          ) : currentProfiles.length === 0 ? (
            <EmptyState
              type="no-results"
              category={category}
              location={stateName}
              onClearFilters={() => {
                resetFilters();
                setSearchParams({});
                setSelectedCategory("Todos");
              }}
              onExploreNearby={() => navigate("/")}
            />
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                <p>
                  Mostrando <span className="font-semibold text-foreground">{currentProfiles.length}</span> de{" "}
                  <span className="font-semibold text-foreground">{filteredProfiles.length}</span> perfis
                </p>
              </div>

              <div className={viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "grid grid-cols-1 lg:grid-cols-2 gap-6"
              }>
                {currentProfiles.map(profile => {
                  const transformed = transformProfile(profile);
                  return viewMode === "grid" ? (
                    <ProfileCard key={profile.id} {...transformed} />
                  ) : (
                    <ProfileListItem key={profile.id} {...transformed} />
                  );
                })}
              </div>

              {(isLoadingMore || hasMore) && (
                <div className="flex justify-center py-8">
                  {isLoadingMore ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Carregando mais perfis...</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Role para carregar mais perfis</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <NeighboringStates currentStateCode={state.code} category={category} />
      </main>

      <InternalNavigation
        state={stateCode}
        city={city?.slug}
        category={category}
        neighborhoodCounts={neighborhoodCounts}
      />

      <Footer />
    </div>
  );
};

export default StateView;

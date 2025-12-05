import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAcompanhantes, useCategorias } from "@/hooks/useWordPressAPI";
import type { BrazilState, City, CategoryType } from "@/types/location";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, User, Sparkles, Heart, Flower2 } from "lucide-react";
import NearbyCities from "@/components/NearbyCities";

interface CityViewProps {
  state: BrazilState;
  city: City;
}

const CityView = ({ state, city }: CityViewProps) => {
  const navigate = useNavigate();

  // Buscar perfis da cidade via WordPress API
  const { profiles, loading: isLoading } = useAcompanhantes({
    cidade: city.slug,
    per_page: 200
  });

  // Calcular contagem por categoria
  const categoryCount = useMemo(() => {
    const counts: Record<CategoryType, number> = {
      mulheres: 0,
      homens: 0,
      trans: 0,
      casais: 0,
      massagistas: 0
    };

    profiles.forEach(profile => {
      const cat = profile.category as CategoryType;
      if (cat && counts[cat] !== undefined) {
        counts[cat]++;
      }
    });

    return counts;
  }, [profiles]);

  const handleCategoryClick = (category: CategoryType) => {
    const url = `/acompanhantes/${state.code.toLowerCase()}/${city.slug}/${category}`;
    navigate(url);
  };

  const categoryLabels: Record<CategoryType, string> = {
    mulheres: 'Acompanhantes',
    homens: 'Homens',
    trans: 'Trans',
    casais: 'Casais',
    massagistas: 'Massagistas'
  };

  const categoryIcons = {
    mulheres: Users,
    homens: User,
    trans: Sparkles,
    casais: Heart,
    massagistas: Flower2
  };

  const pageTitle = `Acompanhantes em ${city.name}, ${state.name} - Todas as Categorias`;
  const pageDescription = `Encontre acompanhantes em ${city.name}, ${state.name}. Navegue por categorias: mulheres, homens, trans, casais e massagistas. Perfis verificados com contato direto.`;
  const canonicalUrl = `/acompanhantes/${state.code.toLowerCase()}/${city.slug}/categorias`;

  return (
    <>
      <SEOHead 
        title={pageTitle}
        description={pageDescription}
        canonical={canonicalUrl}
        keywords={`acompanhantes ${city.name}, escorts ${city.name}, ${city.name} ${state.code}`}
      />
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/acompanhantes/${state.code.toLowerCase()}`)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para {state.name}
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Acompanhantes em {city.name}
            </h1>
            <p className="text-muted-foreground">
              Selecione uma categoria para ver os perfis disponíveis
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {(Object.keys(categoryLabels) as CategoryType[]).map((cat) => {
                const Icon = categoryIcons[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-lg hover:scale-[1.02]"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-lg">
                        {categoryCount[cat]}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-semibold mb-1">
                      {categoryLabels[cat]}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {categoryCount[cat] === 0 
                        ? 'Nenhum perfil disponível' 
                        : `${categoryCount[cat]} ${categoryCount[cat] === 1 ? 'perfil disponível' : 'perfis disponíveis'}`
                      }
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          <NearbyCities 
            stateSlug={state.code.toLowerCase()}
            currentCitySlug={city.slug}
          />
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default CityView;

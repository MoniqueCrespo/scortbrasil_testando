import { Link } from "react-router-dom";
import { getCitiesByState, getStateBySlug, getStateByCode } from "@/data/locations";
import { Tag, MapPin, Map } from "lucide-react";
import { useState, useEffect } from "react";
import InternalNavigationSkeleton from "./InternalNavigationSkeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface InternalNavigationProps {
  state: string;
  city?: string;
  category?: string;
  neighborhoodCounts?: Record<string, number>;
}

const specialties = [
  "Anal a combinar",
  "Atende 24 Horas",
  "Atende até Altas Horas",
  "Atende Casais",
  "Atende Com Local",
  "Atende homens",
  "Atende Mulheres",
  "Atende na casa do cliente",
  "Atende Somente Homens",
  "Atende Trans",
  "Beijo grego",
  "Beijo na boca",
  "Cachê R$300",
  "Cachê R$400",
  "Cachê R$500",
  "Chuva dourada",
  "Chuva marrom",
  "Com áudio",
  "Coroa",
  "Dominação",
  "Dupla penetração",
  "Estilo patricinha",
  "Festa e Eventos",
  "Fuma",
  "Gordinha",
  "Inversão de Papéis",
  "Luxo",
  "Magrinha",
  "Massagem tântrica",
  "Massagem tradicional",
  "Masturbação",
  "Mídia de comparação",
  "Mostra o Rosto",
  "Penetração com acessórios sexuais",
  "Permite filmagem",
  "Podolatria",
  "Pole dance",
  "Realiza fantasias",
  "Sexo anal com preservativo",
  "Sexo com voyeurismo/ser voyeur",
  "Sexo oral",
  "Sexo oral com preservativo",
  "Sexo oral sem preservativo",
  "Sexo vaginal com preservativo",
  "Sexo virtual",
  "Squirt",
  "Striptease",
  "Tem pircing",
  "Tem silicone",
  "Tem tatuagem",
  "Usa fantasias/uniformes",
  "Utiliza acessórios eróticos",
  "Viagem"
];

const InternalNavigation = ({ state, city, category, neighborhoodCounts = {} }: InternalNavigationProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [neighborhoodsFromDb, setNeighborhoodsFromDb] = useState<Array<{ neighborhood: string; citySlug: string; cityName: string }>>([]);
  
  useEffect(() => {
    const fetchNeighborhoods = async () => {
      setIsLoading(true);
      
      try {
        // Detectar se state é sigla (2 chars) ou slug completo
        const stateData = state.length === 2 
          ? getStateByCode(state.toUpperCase()) 
          : getStateBySlug(state);
        
        if (!stateData) {
          setIsLoading(false);
          return;
        }
        
        if (city) {
          // Primeiro: verificar se o city é um bairro ou uma cidade
          const { data: locationInfo } = await supabase
            .from('cities_seo')
            .select('is_neighborhood, parent_city_slug, city_name')
            .eq('city_slug', city)
            .eq('state_code', stateData.code)
            .single();
          
          let parentCitySlug = city;
          let currentCityName = locationInfo?.city_name || city;
          
          // Se for bairro, usar o parent_city_slug para buscar bairros irmãos
          if (locationInfo?.is_neighborhood && locationInfo?.parent_city_slug) {
            parentCitySlug = locationInfo.parent_city_slug;
          }
          
          // Buscar bairros da cidade pai (ou da própria cidade se não for bairro)
          const { data, error } = await supabase
            .from('cities_seo')
            .select('city_name, city_slug')
            .eq('state_code', stateData.code)
            .eq('parent_city_slug', parentCitySlug)
            .eq('is_neighborhood', true)
            .eq('is_active', true)
            .limit(50);
          
          if (!error && data) {
            const neighborhoods = data.map(item => ({
              neighborhood: item.city_name,
              citySlug: parentCitySlug,
              cityName: currentCityName
            }));
            setNeighborhoodsFromDb(neighborhoods);
          }
      } else {
        // Página de estado: buscar bairros das principais cidades diretamente do banco
        const { data: mainCities, error: citiesError } = await supabase
          .from('cities_seo')
          .select('city_name, city_slug')
          .eq('state_code', stateData.code)
          .eq('is_neighborhood', false)
          .eq('is_active', true)
          .order('city_name')
          .limit(3);
        
        console.log('Main cities query:', { mainCities, citiesError, stateCode: stateData.code });
        
        if (!citiesError && mainCities && mainCities.length > 0) {
          const neighborhoodsPromises = mainCities.map(async (cityData) => {
            const { data, error } = await supabase
              .from('cities_seo')
              .select('city_name, city_slug, parent_city_slug')
              .eq('state_code', stateData.code)
              .eq('parent_city_slug', cityData.city_slug)
              .eq('is_neighborhood', true)
              .eq('is_active', true)
              .limit(10);
            
            console.log('Neighborhoods for city:', cityData.city_slug, { data, error });
            
            if (!error && data) {
              return data.map(item => ({
                neighborhood: item.city_name,
                citySlug: cityData.city_slug,
                cityName: cityData.city_name
              }));
            }
            return [];
          });
          
          const results = await Promise.all(neighborhoodsPromises);
          const allNeighborhoods = results.flat();
          console.log('All neighborhoods fetched:', allNeighborhoods);
          setNeighborhoodsFromDb(allNeighborhoods);
        } else {
          console.log('No main cities found or error occurred');
        }
      }
      } catch (error) {
        console.error('Error fetching neighborhoods:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNeighborhoods();
  }, [state, city, category]);
  
  if (isLoading) {
    return <InternalNavigationSkeleton />;
  }
  
  // Detectar se state é sigla (2 chars) ou slug completo
  const stateData = state.length === 2 
    ? getStateByCode(state.toUpperCase()) 
    : getStateBySlug(state);
  const stateCode = stateData?.code.toLowerCase() || state;
  const cities = stateData ? getCitiesByState(stateData.code) : [];
  
  // Usar bairros do banco de dados
  const neighborhoodsToDisplay = neighborhoodsFromDb;
  
  // Ordenar bairros: populares primeiro (top 5 com contagem) + resto alfabético
  const sortedNeighborhoods = neighborhoodsToDisplay
    .map(item => {
      const normalizedNeighborhood = item.neighborhood
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return {
        ...item,
        count: neighborhoodCounts[normalizedNeighborhood] || 0
      };
    })
    .sort((a, b) => {
      // Primeiro: ordenar por contagem (descendente)
      if (b.count !== a.count) return b.count - a.count;
      // Empate: ordenar alfabeticamente
      return a.neighborhood.localeCompare(b.neighborhood, 'pt-BR');
    });

  // Separar top populares vs resto
  const topNeighborhoods = sortedNeighborhoods.filter(n => n.count > 0).slice(0, 5);
  const otherNeighborhoods = sortedNeighborhoods
    .filter(n => !topNeighborhoods.includes(n))
    .sort((a, b) => a.neighborhood.localeCompare(b.neighborhood, 'pt-BR'));

  const finalNeighborhoods = [...topNeighborhoods, ...otherNeighborhoods];
  
  
  // Se não há city (página de estado), mostrar todas as cidades (máximo 20)
  // Se há city (página de cidade), mostrar cidades próximas excluindo a atual (máximo 11)
  const nearbyCities = city 
    ? cities.filter(c => c.slug !== city).slice(0, 11)
    : cities.slice(0, 20);

  const createSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <section className="container mx-auto px-4 py-12 space-y-12">
      {/* Bairros Section */}
      {finalNeighborhoods.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-2 text-foreground flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {city 
              ? `Bairros em ${finalNeighborhoods[0]?.cityName}` 
              : `Principais Bairros em ${stateData?.name || state}`}
          </h2>
          
          {/* Texto SEO descritivo */}
          <p className="text-sm text-muted-foreground mb-4">
            {city 
              ? `Explore acompanhantes por bairro em ${finalNeighborhoods[0]?.cityName}. Selecione sua região preferida para ver perfis próximos a você.`
              : `Encontre acompanhantes nos principais bairros de ${stateData?.name || state}. Filtre por localização para encontrar perfis na sua região.`
            }
          </p>
          
          {/* Desktop: Flex wrap com pills */}
          <div className="hidden md:flex flex-wrap gap-2">
            {finalNeighborhoods.map((item, index) => {
              const neighborhoodSlug = createSlug(item.neighborhood);
              const isPopular = index < 5 && item.count > 0;
              
              // URL sempre: /acompanhantes/{state}/{neighborhoodSlug}
              // Bairros não incluem categoria na URL (categoria é filtrada dentro da página)
              const neighborhoodUrl = `/acompanhantes/${stateCode}/${neighborhoodSlug}`;
              
              return (
                <Link
                  key={`${item.citySlug}-${item.neighborhood}-${index}`}
                  to={neighborhoodUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-foreground rounded-full text-sm transition-all duration-200 hover:bg-primary/10 hover:text-primary cursor-pointer"
                >
                  <span>{item.neighborhood}</span>
                  {item.count > 0 && (
                    <span className="text-xs opacity-60">
                      ({item.count})
                    </span>
                  )}
                  {!city && (
                    <span className="text-xs opacity-60">
                      • {item.cityName}
                    </span>
                  )}
                  {isPopular && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      Popular
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
          
          {/* Mobile: Accordion colapsável */}
          <Accordion type="single" collapsible className="md:hidden">
            <AccordionItem value="neighborhoods">
              <AccordionTrigger className="text-sm font-medium">
                Ver bairros ({finalNeighborhoods.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2 pt-2">
                  {finalNeighborhoods.map((item, index) => {
                    const neighborhoodSlug = createSlug(item.neighborhood);
                    const isPopular = index < 5 && item.count > 0;
                    
                    // URL sempre: /acompanhantes/{state}/{neighborhoodSlug}
                    // Bairros não incluem categoria na URL (categoria é filtrada dentro da página)
                    const neighborhoodUrl = `/acompanhantes/${stateCode}/${neighborhoodSlug}`;
                    
                    return (
                      <Link
                        key={`${item.citySlug}-${item.neighborhood}-${index}`}
                        to={neighborhoodUrl}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-foreground rounded-full text-sm transition-all duration-200 hover:bg-primary/10 hover:text-primary cursor-pointer"
                      >
                        <span>{item.neighborhood}</span>
                        {item.count > 0 && (
                          <span className="text-xs opacity-60">
                            ({item.count})
                          </span>
                        )}
                        {isPopular && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            Popular
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {/* Especialidades Section */}
      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          Especialidades
        </h2>
        
        {/* Texto SEO descritivo */}
        <p className="text-sm text-muted-foreground mb-4">
          Refine sua busca por serviços e especialidades específicas. Encontre acompanhantes que oferecem exatamente o que você procura.
        </p>
        
        {/* Desktop: Flex wrap normal */}
        <div className="hidden md:flex flex-wrap gap-2">
          {specialties.map((specialty) => {
            const specialtySlug = createSlug(specialty);
            const baseUrl = city && category && category !== 'mulheres'
              ? `/acompanhantes/${stateCode}/${city}/${category}`
              : city 
                ? `/acompanhantes/${stateCode}/${city}`
                : category && category !== 'mulheres'
                  ? `/acompanhantes/${stateCode}/${category}`
                  : `/acompanhantes/${stateCode}`;
            
            return (
              <Link
                key={specialty}
                to={`${baseUrl}?servico=${specialtySlug}`}
                className="inline-flex items-center px-3 py-1.5 bg-muted text-foreground rounded-full text-sm transition-all duration-200 hover:bg-primary/10 hover:text-primary cursor-pointer"
              >
                {specialty}
              </Link>
            );
          })}
        </div>
        
        {/* Mobile: Accordion colapsável */}
        <Accordion type="single" collapsible className="md:hidden">
          <AccordionItem value="specialties">
            <AccordionTrigger className="text-sm font-medium">
              Ver especialidades ({specialties.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2 pt-2">
                {specialties.map((specialty) => {
                  const specialtySlug = createSlug(specialty);
                  const baseUrl = city && category && category !== 'mulheres'
                    ? `/acompanhantes/${stateCode}/${city}/${category}`
                    : city 
                      ? `/acompanhantes/${stateCode}/${city}`
                      : category && category !== 'mulheres'
                        ? `/acompanhantes/${stateCode}/${category}`
                        : `/acompanhantes/${stateCode}`;
                  
                  return (
                    <Link
                      key={specialty}
                      to={`${baseUrl}?servico=${specialtySlug}`}
                      className="inline-flex items-center px-3 py-1.5 bg-muted text-foreground rounded-full text-sm transition-all duration-200 hover:bg-primary/10 hover:text-primary cursor-pointer"
                    >
                      {specialty}
                    </Link>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Cidades Próximas Section */}
      {nearbyCities.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            {city ? 'Cidades Próximas' : 'Outras Cidades'}
          </h2>
          <div className="flex flex-wrap gap-2">
            {nearbyCities.map((nearbyCity) => {
              const baseUrl = category && category !== 'mulheres' 
                ? `/acompanhantes/${stateCode}/${nearbyCity.slug}/${category}`
                : `/acompanhantes/${stateCode}/${nearbyCity.slug}`;
              
              return (
                <Link
                  key={nearbyCity.slug}
                  to={baseUrl}
                  className="inline-flex items-center px-3 py-1.5 bg-muted text-foreground rounded-full text-sm transition-all duration-200 hover:bg-primary/10 hover:text-primary cursor-pointer"
                >
                  {nearbyCity.name}
                </Link>
              );
            })}
            <Link
              to={`/acompanhantes/${stateCode}`}
              className="inline-flex items-center px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium transition-all duration-200 hover:bg-primary hover:text-white cursor-pointer"
            >
              + Ver todas
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};

export default InternalNavigation;

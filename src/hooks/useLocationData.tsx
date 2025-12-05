import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { brazilStates } from "@/data/locations";

interface City {
  id: string;
  state_code: string;
  state_name: string;
  city_name: string;
  city_slug: string;
}

export const useLocationData = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Record<string, string[]>>({});
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [isLoadingNeighborhoods, setIsLoadingNeighborhoods] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await fetchCities();
      await fetchNeighborhoods();
    };
    loadData();
  }, []);

  const fetchCities = async () => {
    try {
      console.log('🔄 [useLocationData] Iniciando fetch de cidades...');
      
      // CRÍTICO: Carregar TODAS as cidades (sem limit padrão de 1000)
      let allCities: City[] = [];
      let from = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from("cities_seo")
          .select("id, state_code, state_name, city_name, city_slug")
          .eq("is_active", true)
          .order("state_code")
          .order("city_name")
          .range(from, from + pageSize - 1);

        if (error) {
          console.error("❌ [useLocationData] Erro ao carregar cidades:", error);
          throw error;
        }

        if (!data || data.length === 0) {
          hasMore = false;
        } else {
          allCities = [...allCities, ...data];
          from += pageSize;
          hasMore = data.length === pageSize; // Continue se retornou pageSize completo
        }
      }

      if (allCities.length === 0) {
        console.warn('⚠️ [useLocationData] Nenhuma cidade retornada do banco!');
        setCities([]);
        setIsLoadingCities(false);
        return;
      }

      // Atualizar estado ANTES de marcar como não loading
      setCities(allCities);
      
      // Debug detalhado
      console.log(`✅ [useLocationData] Cidades carregadas: ${allCities.length} no total`);
      
      // Contagem por estado
      const byState: Record<string, number> = {};
      allCities.forEach(city => {
        byState[city.state_code] = (byState[city.state_code] || 0) + 1;
      });
      
      console.log('📊 [useLocationData] Cidades por estado:', byState);
      console.log('📍 [useLocationData] Primeiras 5 cidades:', allCities.slice(0, 5).map(c => `${c.city_name} (${c.state_code})`).join(', '));
      
      // Aguardar um ciclo de renderização antes de marcar como não loading
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error("❌ [useLocationData] Erro fatal ao carregar cidades:", error);
      setCities([]);
    } finally {
      // Garantir que só marca como false quando dados estão realmente disponíveis
      setIsLoadingCities(false);
      console.log('✅ [useLocationData] Fetch de cidades concluído - isLoadingCities = false');
    }
  };

  const fetchNeighborhoods = async () => {
    try {
      const { data, error } = await supabase
        .from("neighborhoods")
        .select("city_slug, neighborhood_name")
        .eq("is_active", true)
        .order("neighborhood_name");

      if (error) throw error;
      
      // Agrupar bairros por cidade
      const grouped: Record<string, string[]> = {};
      data?.forEach((item) => {
        if (!grouped[item.city_slug]) {
          grouped[item.city_slug] = [];
        }
        grouped[item.city_slug].push(item.neighborhood_name);
      });
      
      setNeighborhoods(grouped);
    } catch (error) {
      console.error("Erro ao carregar bairros:", error);
      setNeighborhoods({});
    } finally {
      setIsLoadingNeighborhoods(false);
    }
  };

  const getCitiesByState = (stateCode: string) => {
    const filtered = cities.filter(city => city.state_code === stateCode);
    console.log(`[getCitiesByState] Buscando cidades para ${stateCode}`);
    console.log(`[getCitiesByState] Total no cache: ${cities.length}`);
    console.log(`[getCitiesByState] Filtradas para ${stateCode}: ${filtered.length}`);
    
    if (filtered.length > 0) {
      console.log(`[getCitiesByState] Exemplos de ${stateCode}:`, filtered.slice(0, 5).map(c => c.city_name).join(', '));
    } else {
      console.warn(`[getCitiesByState] ⚠️ NENHUMA cidade encontrada para ${stateCode}!`);
      console.log(`[getCitiesByState] Estados disponíveis:`, [...new Set(cities.map(c => c.state_code))].sort());
    }
    
    return filtered;
  };

  const getStateByCode = (code: string) => {
    return brazilStates.find(state => state.code === code);
  };

  const getNeighborhoodsByCity = (citySlug: string): string[] => {
    // First check if we have cached neighborhoods for this city
    if (neighborhoods[citySlug]) {
      return neighborhoods[citySlug];
    }

    // Find the city in our data
    const city = cities.find(c => c.city_slug === citySlug);
    if (!city) {
      return ['Centro', 'Zona Sul', 'Zona Norte', 'Zona Oeste', 'Zona Leste'];
    }

    // For now, return default neighborhoods based on state capital or major cities
    // This will be populated from the database in future
    const defaultNeighborhoods: Record<string, string[]> = {
      'sao-paulo': [
        'Jardins', 'Moema', 'Vila Mariana', 'Pinheiros', 'Itaim Bibi',
        'Vila Madalena', 'Brooklin', 'República', 'Consolação', 'Augusta',
        'Vila Olímpia', 'Santana', 'Tatuapé', 'Perdizes', 'Centro'
      ],
      'rio-de-janeiro': [
        'Copacabana', 'Ipanema', 'Leblon', 'Botafogo', 'Flamengo',
        'Barra da Tijuca', 'Recreio', 'Lapa', 'Centro', 'Tijuca',
        'Leme', 'Cinelândia', 'Jacarepaguá', 'Bangu', 'Campo Grande'
      ],
      'belo-horizonte': [
        'Savassi', 'Lourdes', 'Funcionários', 'Centro', 'Pampulha',
        'Buritis', 'Belvedere', 'Serra', 'Mangabeiras', 'Santo Agostinho'
      ],
      'brasilia': [
        'Asa Sul', 'Asa Norte', 'Lago Sul', 'Lago Norte', 'Taguatinga',
        'Águas Claras', 'Sudoeste', 'Noroeste', 'Ceilândia', 'Samambaia'
      ],
      'salvador': [
        'Barra', 'Ondina', 'Rio Vermelho', 'Itaigara', 'Pituba',
        'Caminho das Árvores', 'Centro', 'Pelourinho', 'Graça', 'Vitória'
      ],
      'fortaleza': [
        'Meireles', 'Aldeota', 'Praia de Iracema', 'Centro', 'Mucuripe',
        'Varjota', 'Dionísio Torres', 'Cocó', 'Papicu', 'Edson Queiroz'
      ],
      'recife': [
        'Boa Viagem', 'Pina', 'Piedade', 'Centro', 'Santo Amaro',
        'Setúbal', 'Espinheiro', 'Torre', 'Graças', 'Casa Forte'
      ],
      'porto-alegre': [
        'Centro', 'Moinhos de Vento', 'Bela Vista', 'Petrópolis', 'Cidade Baixa',
        'Menino Deus', 'Auxiliadora', 'Rio Branco', 'Higienópolis', 'Mont Serrat'
      ],
      'curitiba': [
        'Centro', 'Batel', 'Água Verde', 'Bigorrilho', 'Cabral',
        'Cristo Rei', 'Juvevê', 'Rebouças', 'Alto da XV', 'Mercês'
      ]
    };

    return defaultNeighborhoods[citySlug] || ['Centro', 'Zona Sul', 'Zona Norte', 'Zona Oeste', 'Zona Leste'];
  };

  return {
    states: brazilStates,
    cities,
    isLoadingCities, // NÃO combinar com neighborhoods - retornar apenas o loading de cities
    getCitiesByState,
    getStateByCode,
    getNeighborhoodsByCity,
  };
};

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { brazilStates, cities } from '@/data/locations';
import { useAcompanhantes, useCidades } from '@/hooks/useWordPressAPI';

export interface SearchResult {
  id: string;
  type: 'state' | 'city' | 'profile';
  title: string;
  subtitle?: string;
  url: string;
  image?: string;
}

export const useSearch = (query: string) => {
  const navigate = useNavigate();
  const [searchHistory, setSearchHistory] = useState<SearchResult[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // Buscar via WordPress API
  const { profiles, loading: isLoadingProfiles } = useAcompanhantes({ per_page: 100 });
  const { cidades, loading: isLoadingCidades } = useCidades();
  
  const isLoadingTrends = isLoadingProfiles || isLoadingCidades;

  // Perfis em destaque/trending
  const trendingProfiles = useMemo<SearchResult[]>(() => {
    return profiles
      .filter(p => p.featured || p.verified)
      .slice(0, 5)
      .map(profile => {
        const state = brazilStates.find(s => 
          s.code.toUpperCase() === (profile.state || '').toUpperCase()
        );
        const stateSlug = state?.code.toLowerCase() || (profile.state || 'rj').toLowerCase();
        const city = cities.find(c => c.slug === profile.city && c.state === state?.code);
        
        const profileSlug = profile.name.toLowerCase().replace(/\s+/g, '-');
        const profileUrl = profile.category === 'mulheres'
          ? `/acompanhantes/${stateSlug}/${profile.city}/${profileSlug}`
          : `/acompanhantes/${stateSlug}/${profile.city}/${profile.category}/${profileSlug}`;
        
        return {
          id: String(profile.id),
          type: 'profile' as const,
          title: profile.name,
          subtitle: city && state ? `${city.name}, ${state.code}` : profile.location,
          url: profileUrl,
          image: profile.image,
        };
      });
  }, [profiles]);

  // Cidades trending (com mais perfis)
  const trendingCities = useMemo<SearchResult[]>(() => {
    // Contar perfis por cidade
    const cityCount: Record<string, number> = {};
    profiles.forEach(profile => {
      if (profile.city && profile.state) {
        const key = `${profile.state}:${profile.city}`;
        cityCount[key] = (cityCount[key] || 0) + 1;
      }
    });

    // Ordenar e pegar top 5
    return Object.entries(cityCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([key, count]) => {
        const [stateCode, citySlug] = key.split(':');
        const state = brazilStates.find(s => 
          s.code.toUpperCase() === stateCode.toUpperCase()
        );
        const city = cities.find(c => c.slug === citySlug && c.state === state?.code);
        
        if (state && city) {
          return {
            id: city.id,
            type: 'city' as const,
            title: city.name,
            subtitle: `${count} perfis • ${state.name}`,
            url: `/acompanhantes/${state.code.toLowerCase()}/${city.slug}/categorias`,
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [profiles]);

  const results = useMemo(() => {
    // Se não há query, mostrar histórico ou tendências
    if (!query || query.trim().length < 2) {
      if (searchHistory.length > 0) {
        return searchHistory.slice(0, 5);
      }
      // Se não há histórico, mostrar tendências
      return [...trendingCities, ...trendingProfiles].slice(0, 8);
    }

    const normalizedQuery = query.toLowerCase().trim();
    const searchResults: SearchResult[] = [];

    // Buscar estados
    brazilStates.forEach(state => {
      if (
        state.name.toLowerCase().includes(normalizedQuery) ||
        state.code.toLowerCase().includes(normalizedQuery)
      ) {
        searchResults.push({
          id: state.code,
          type: 'state',
          title: state.name,
          subtitle: `Estado - ${state.code}`,
          url: `/acompanhantes/${state.code.toLowerCase()}`,
        });
      }
    });

    // Buscar cidades
    cities.forEach(city => {
      if (city.name.toLowerCase().includes(normalizedQuery)) {
        const state = brazilStates.find(s => s.code === city.state);
        if (state) {
          searchResults.push({
            id: city.id,
            type: 'city',
            title: city.name,
            subtitle: `Cidade - ${state.name}`,
            url: `/acompanhantes/${state.code.toLowerCase()}/${city.slug}/categorias`,
          });
        }
      }
    });

    // Buscar perfis por nome
    profiles.forEach(profile => {
      if (profile.name.toLowerCase().includes(normalizedQuery)) {
        const state = brazilStates.find(s => 
          s.code.toUpperCase() === (profile.state || '').toUpperCase()
        );
        const stateSlug = state?.code.toLowerCase() || 'rj';
        const profileSlug = profile.name.toLowerCase().replace(/\s+/g, '-');
        
        searchResults.push({
          id: String(profile.id),
          type: 'profile',
          title: profile.name,
          subtitle: profile.location,
          url: `/acompanhantes/${stateSlug}/${profile.city}/${profileSlug}`,
          image: profile.image,
        });
      }
    });

    return searchResults.slice(0, 8);
  }, [query, searchHistory, trendingCities, trendingProfiles, profiles]);

  const addToHistory = (result: SearchResult) => {
    const newHistory = [
      result,
      ...searchHistory.filter(item => item.id !== result.id),
    ].slice(0, 10);
    
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handleSelect = (result: SearchResult) => {
    addToHistory(result);
    navigate(result.url);
  };

  return {
    results,
    searchHistory,
    trendingProfiles,
    trendingCities,
    isLoadingTrends,
    clearHistory,
    handleSelect,
  };
};

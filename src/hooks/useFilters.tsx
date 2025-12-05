import { useState, useEffect } from 'react';

export interface FilterState {
  searchName: string;
  priceRange: [number, number];
  ageRange: [number, number];
  distance: number;
  height: [number, number];
  weight: [number, number];
  eyeColor: string[];
  hairColor: string[];
  services: string[];
  availability: string[];
  neighborhoods: string[];
  category: string;
  city: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: FilterState;
}

const defaultFilters: FilterState = {
  searchName: '',
  priceRange: [0, 1000],
  ageRange: [18, 50],
  distance: 50,
  height: [150, 190],
  weight: [45, 90],
  eyeColor: [],
  hairColor: [],
  services: [],
  availability: [],
  neighborhoods: [],
  category: 'Todos',
  city: 'all',
};

export const useFilters = () => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => {
    const saved = localStorage.getItem('savedFilters');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('savedFilters', JSON.stringify(savedFilters));
  }, [savedFilters]);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const saveCurrentFilters = (name: string) => {
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name,
      filters: { ...filters },
    };
    setSavedFilters(prev => [...prev, newFilter]);
  };

  const loadSavedFilter = (filterId: string) => {
    const saved = savedFilters.find(f => f.id === filterId);
    if (saved) {
      setFilters(saved.filters);
    }
  };

  const deleteSavedFilter = (filterId: string) => {
    setSavedFilters(prev => prev.filter(f => f.id !== filterId));
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    savedFilters,
    saveCurrentFilters,
    loadSavedFilter,
    deleteSavedFilter,
  };
};

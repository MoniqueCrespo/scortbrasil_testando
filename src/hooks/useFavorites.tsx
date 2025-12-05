import { useState, useEffect } from 'react';

export interface FavoriteProfile {
  id: string;
  name: string;
  image: string;
  addedAt: number;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favoriteProfiles');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('favoriteProfiles', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (profileId: string) => {
    setFavorites(prev => 
      prev.includes(profileId)
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };

  const isFavorite = (profileId: string) => {
    return favorites.includes(profileId);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  };
};

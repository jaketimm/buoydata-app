import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'buoyFavorites';

// Hook to manage favorites
export default function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Update the favorites in local storage when the favorites change
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Toggle a favorite
  const toggleFavorite = useCallback((stationId) => {
    setFavorites(prev => {
      if (prev.includes(stationId)) {
        return prev.filter(id => id !== stationId);
      } else {
        return [...prev, stationId];
      }
    });
  }, []);

  // Check if a station is a favorite
  const isFavorite = useCallback((stationId) => favorites.includes(stationId), [favorites]);

  return { favorites, toggleFavorite, isFavorite };
} 
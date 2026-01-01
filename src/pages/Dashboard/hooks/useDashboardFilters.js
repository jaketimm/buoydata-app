import { useMemo } from 'react';
import { StationList } from '../../../constants/stationList.js';

// Custom hook for dashboard filtering and display logic
const useDashboardFilters = (favorites, showAllStations, selectedBodyOfWater) => {
  return useMemo(() => {
    // Get unique bodies of water for filter dropdown
    const bodiesOfWater = [...new Set(Object.values(StationList).map(station => station.bodyOfWater))].sort();

    // Determine which stations to display based on view mode and filter
    let stationsToDisplay = showAllStations
      ? Object.entries(StationList)
      : Object.entries(StationList).filter(([stationId]) => favorites.includes(stationId));

    // Apply body of water filter if not 'all'
    if (selectedBodyOfWater !== 'all') {
      stationsToDisplay = stationsToDisplay.filter(([stationId, stationInfo]) =>
        stationInfo.bodyOfWater === selectedBodyOfWater
      );
    }

    // Get counts for display: number of stations, number of favorites, etc.
    const totalStations = Object.keys(StationList).length;
    const favoriteCount = favorites.length;
    const filteredAllCount = selectedBodyOfWater === 'all'
      ? totalStations
      : Object.values(StationList).filter(station => station.bodyOfWater === selectedBodyOfWater).length;
    const filteredFavoriteCount = selectedBodyOfWater === 'all'
      ? favoriteCount
      : favorites.filter(fav => StationList[fav]?.bodyOfWater === selectedBodyOfWater).length;

    return {
      bodiesOfWater,
      stationsToDisplay,
      totalStations,
      favoriteCount,
      filteredAllCount,
      filteredFavoriteCount
    };
  }, [favorites, showAllStations, selectedBodyOfWater]);
};

export default useDashboardFilters; 
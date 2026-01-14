import { useState } from 'react';
import { getHistoricalData } from '../utils/GetHistoricalBuoyData';

/**
 * Custom hook for managing historical buoy data
 * @returns {Object} Object containing historical data, loading states, errors, and fetch function
 */
const useHistoricalData = () => {
  // State for historical data
  const [historicalData, setHistoricalData] = useState({});
  const [historicalLoading, setHistoricalLoading] = useState({});
  const [historicalError, setHistoricalError] = useState({});

  /**
   * Fetches historical data for a specific station
   * @param {string} stationId - The station ID to fetch data for
   */
  const fetchHistoricalDataForStation = async (stationId) => {
    // Check if we already have data for this station
    if (historicalData[stationId]) {
      return; // Data already loaded
    }
    
    setHistoricalLoading(prev => ({ ...prev, [stationId]: true }));
    setHistoricalError(prev => ({ ...prev, [stationId]: null }));
    
    try {
      const data = await getHistoricalData(stationId);
      setHistoricalData(prev => ({ ...prev, [stationId]: data }));
    } catch (error) {
      console.error(`useHistoricalData: Error fetching historical data for station ${stationId}:`, error);
      setHistoricalError(prev => ({ ...prev, [stationId]: error.message }));
    } finally {
      setHistoricalLoading(prev => ({ ...prev, [stationId]: false }));
    }
  };


  return {
    historicalData,
    historicalLoading,
    historicalError,
    fetchHistoricalDataForStation,
  };
};

export default useHistoricalData; 
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

  /**
   * Clears historical data for a specific station
   * @param {string} stationId - The station ID to clear data for
   */
  const clearHistoricalData = (stationId) => {
    setHistoricalData(prev => {
      const newData = { ...prev };
      delete newData[stationId];
      return newData;
    });
    setHistoricalLoading(prev => {
      const newLoading = { ...prev };
      delete newLoading[stationId];
      return newLoading;
    });
    setHistoricalError(prev => {
      const newError = { ...prev };
      delete newError[stationId];
      return newError;
    });
  };

  /**
   * Clears all historical data
   */
  const clearAllHistoricalData = () => {
    setHistoricalData({});
    setHistoricalLoading({});
    setHistoricalError({});
  };

  return {
    historicalData,
    historicalLoading,
    historicalError,
    fetchHistoricalDataForStation,
    clearHistoricalData,
    clearAllHistoricalData
  };
};

export default useHistoricalData; 
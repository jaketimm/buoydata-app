import { fetchHistoricalBuoyData } from './api';

// Historical data cache
const HISTORICAL_CACHE_KEY = 'historical_data_cache';
const HISTORICAL_CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Fetches historical data for a specific station and returns daily highs
 * @param {string} stationId - The station ID to fetch historical data for
 * @returns {Promise<Array>} Array of daily high temperature entries for the station
 */
export const getHistoricalData = async (stationId) => {
  try {
    // Check cache first
    const cachedData = getCachedHistoricalData(stationId); 
    if (cachedData) {
      return cachedData;
    }

    // Fetch processed data from the API
    const chartData = await fetchHistoricalBuoyData(stationId);

    // Cache the data
    setCachedHistoricalData(stationId, chartData);

    return chartData;
  } catch (error) {
    console.error(`Error fetching historical data for station ${stationId}:`, error);
    throw new Error(`Failed to fetch historical data for station ${stationId}: ${error.message}`);
  }
};

/**
 * Gets cached historical data for a specific station
 * @param {string} stationId - The station ID
 * @returns {Array|null} Cached data if valid, null otherwise
 */
const getCachedHistoricalData = (stationId) => {
  try {
    const cachedString = localStorage.getItem(HISTORICAL_CACHE_KEY);
    if (!cachedString) return null;

    const cache = JSON.parse(cachedString);
    const stationData = cache[stationId];

    if (!stationData) return null;

    const now = new Date().getTime();
    if (now - stationData.timestamp < HISTORICAL_CACHE_DURATION) {
      return stationData.data;
    }

    return null;
  } catch (error) {
    console.warn('Error reading historical cache:', error);
    return null;
  }
};

/**
 * Sets cached historical data for a specific station
 * @param {string} stationId - The station ID
 * @param {Array} data - The historical data to cache
 */
const setCachedHistoricalData = (stationId, data) => {
  try {
    const cachedString = localStorage.getItem(HISTORICAL_CACHE_KEY);
    const cache = cachedString ? JSON.parse(cachedString) : {};

    cache[stationId] = {
      timestamp: new Date().getTime(),
      data: data
    };

    localStorage.setItem(HISTORICAL_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Error writing to historical cache:', error);
  }
};
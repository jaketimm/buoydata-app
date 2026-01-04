// utils/ProcessBuoyData.js
import { StationList } from '../../constants/stationList.js';

// Cache duration in milliseconds (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000;  
const CACHE_KEY = 'noaa_buoy_data_cache';
// Maximum age for cached data in milliseconds (12 hours)
const MAX_DATA_AGE = 12 * 60 * 60 * 1000;


/**
 * Checks if a data entry is too old based on its ISO timestamp
 * @param {Object} entry - Data entry with isoTimestamp
 * @returns {boolean} True if data is older than MAX_DATA_AGE
 */
const isDataTooOld = (entry) => {
  if (!entry.isoTimestamp) {
    return true; // Consider entries without timestamps as too old
  }
  
  try {
    const entryDate = new Date(entry.isoTimestamp);
    const now = new Date();
    const age = now - entryDate;
    
    return age > MAX_DATA_AGE;
  } catch (error) {
    console.error(`Error parsing timestamp for station ${entry["#STN"]}:`, error);
    return true; // If we can't parse the timestamp, consider it too old
  }
};

/**
 * Fetches NOAA data with intelligent caching and merging
 * @returns {Promise<Array>} Merged NOAA data (fresh + cached fallback)
 */
const getCachedBuoyData = async () => {
  let cachedData = null;
  let cachedDataMap = new Map();
  
  try {
    // Try to get cached data
    const cachedString = localStorage.getItem(CACHE_KEY);
    
    if (cachedString) {
      const { timestamp, data } = JSON.parse(cachedString);
      const now = new Date().getTime();
      
      // Check if we're within the rate limit window
      if (now - timestamp < CACHE_DURATION) {
        return data;
      }
      
      // Store cached data for merging
      cachedData = data;
      
      // Create a map of cached data by station ID for efficient lookup
      cachedData.forEach(entry => {
        const stationId = entry["#STN"];
        if (stationId) {
          // Store all entries for each station (in case we need historical data later)
          if (!cachedDataMap.has(stationId)) {
            cachedDataMap.set(stationId, []);
          }
          cachedDataMap.get(stationId).push(entry);
        }
      });
    }
  } catch (error) {
    console.warn('Error reading from cache:', error);
    // Continue without cached data
  }
  
  let freshData = [];
  try {
    // Always try to fetch fresh data after rate limit window
    freshData = await fetchCurrentBuoyData();
  } catch (error) {
    console.error('Error fetching fresh data:', error);
    // If fetch fails and we have cached data, return it
    if (cachedData) {
      return cachedData;
    }
    throw error; // Re-throw if we have no data at all
  }
  
  // Create a map of fresh data by station ID
  const freshDataMap = new Map();
  freshData.forEach(entry => {
    const stationId = entry["#STN"];
    if (stationId) {
      if (!freshDataMap.has(stationId)) {
        freshDataMap.set(stationId, []);
      }
      freshDataMap.get(stationId).push(entry);
    }
  });
  
  // Merge fresh and cached data
  const mergedDataMap = new Map();
  
  // First, add all fresh data to the merged data
  freshDataMap.forEach((entries, stationId) => {
    mergedDataMap.set(stationId, entries);
  });
  
  // If a station is not in the fresh data, use cached data (if it's less than 12 hours old)
  let staleStations = [];
  cachedDataMap.forEach((entries, stationId) => {
    if (!mergedDataMap.has(stationId)) {
      // Filter out entries that are too old
      const recentEntries = entries.filter(entry => !isDataTooOld(entry));
      
      if (recentEntries.length > 0) {
        mergedDataMap.set(stationId, recentEntries);
      } else {
        staleStations.push(stationId);
      }
    }
  });
  
  if (staleStations.length > 0) {
    console.log(`Excluded ${staleStations.length} stations with stale data: ${staleStations.join(', ')}`);
  }
  
  // Convert merged data back to array format
  const mergedData = [];
  mergedDataMap.forEach((entries) => {
    mergedData.push(...entries);
  });
  
  // Update cache with merged data
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: new Date().getTime(),
      data: mergedData
    }));
  } catch (error) {
    console.warn('Error writing to cache:', error);
  
  }
  
  return mergedData;
};


// Fetch current data from Flask App
export const fetchCurrentBuoyData = async () => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  try {
    const now = new Date();
    const dataHour = new Date(now.getTime() - 90 * 60 * 1000);
    const currentHour = String(dataHour.getUTCHours()).padStart(2, '0');

    const response = await fetch(
      `${API_URL}/api/real-time-noaa-data?hour=${currentHour}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json(); 
  } catch (error) {
    throw error;
  }
};





/**
 * Fetches NOAA data and filters for specific stations with top-of-hour readings only
 * @returns {Promise<Array>} Array of filtered station data objects
 */
export const getFilteredStationData = async () => {
  try {
    // Use cached/merged data
    const allData = await getCachedBuoyData();
    
    // Extract station IDs from the StationList object
    const stationIds = new Set(Object.keys(StationList));
    
    // Filter data for specified stations using the "#STN" field name
    const stationFilteredData = allData.filter(row => {
      const isTargetStation = stationIds.has(row["#STN"]);
      return isTargetStation;
    });

    // Group by station and find the newest reading for each
    const newestReadings = {};

    stationFilteredData.forEach(row => {
      const stationId = row["#STN"];

      // Use the timestamp field for comparison
      if (!newestReadings[stationId] ||
        row.timestamp > newestReadings[stationId].timestamp) {
        newestReadings[stationId] = row;
      }
    });
    
    // Convert back to array format
    const filteredData = Object.values(newestReadings);
    
    return filteredData;
  } catch (error) {
    console.error('Error fetching and filtering station data:', error);
    throw new Error(`Failed to get filtered station data: ${error.message}`);
  }
};


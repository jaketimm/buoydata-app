// shared/utils/getCurrentBuoyData.js
import { StationList } from '../../constants/stationList.js';
import { fetchCurrentBuoyData } from './api.js';

// Cache duration in milliseconds (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000;  
const CACHE_KEY = 'noaa_buoy_data_cache';
// Maximum age for cached data in milliseconds (8 hours)
const MAX_DATA_AGE = 8 * 60 * 60 * 1000;

const getStationId = entry => entry["#STN"];

// Fetches NOAA data, filters to stations defined in StationList, and falls back to recent cached readings when fresh data is unavailable.
export const getProcessedStationData = async () => {
  try {
    const allData = await getMergedBuoyData();

    const stationIds = new Set(Object.keys(StationList));

    const stationFilteredData = allData.filter(entry =>
      stationIds.has(getStationId(entry))
    );

    return getNewestReadingPerStation(stationFilteredData);
  } catch (error) {
    console.error('Error fetching and filtering station data:', error);
    throw new Error(`Failed to get filtered station data: ${error.message}`);
  }
};

// Retrieves buoy data using cached results when fresh fetches are rate-limited, and merges fresh data with recent cached data when needed.
const getMergedBuoyData = async () => {
   let cachedData = [];

  // retrieve cached data
  try {
    const cachedString = localStorage.getItem(CACHE_KEY);

    if (cachedString) {
      const { timestamp, data } = JSON.parse(cachedString);
      const now = Date.now();

      if (now - timestamp < CACHE_DURATION) {
        return data;
      }

      cachedData = data;
    }
  } catch (error) {
    console.warn('Error reading from cache:', error);
  }

  let freshData;
  try {
    freshData = await fetchCurrentBuoyData();
  } catch (error) {
    console.error('Error fetching fresh data:', error);
    if (cachedData) return cachedData;
    throw error;
  }

  const mergedData = mergeFreshAndCached(freshData, cachedData);

  // store merged data to cache
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data: mergedData
      })
    );
  } catch (error) {
    console.warn('Error writing to cache:', error);
  }

  return mergedData;
};

// Combines fresh buoy data with recent cached data, excluding cached readings older than 8 hours.
const mergeFreshAndCached = (freshData, cachedData = []) => {
  const freshByStation = groupByStation(freshData);
  const cachedByStation = groupByStation(cachedData);

  const staleStations = [];

  for (const [stationId, cachedEntries] of cachedByStation.entries()) {
    // Check if cached station ID is present in the fresh readings
    // If the ID is missing, use its cached readings if they are less than 8 hours old
    if (!freshByStation.has(stationId)) {
      const recentEntries = cachedEntries.filter(
        entry => !isDataTooOld(entry)
      );

      if (recentEntries.length > 0) {
        freshByStation.set(stationId, recentEntries);
      } else {
        staleStations.push(stationId);
      }
    }
  }

  if (staleStations.length > 0) {
    console.log(
      `Excluded ${staleStations.length} stations with stale data: ${staleStations.join(', ')}`
    );
  }

  // Flatten map back into array
  return Array.from(freshByStation.values()).flat();
};

// Groups buoy data entries by station ID.
const groupByStation = (entries = []) => {
  const map = new Map();

  for (const entry of entries) {
    const stationId = getStationId(entry);
    if (!stationId) continue;

    if (!map.has(stationId)) {
      map.set(stationId, []);
    }
    map.get(stationId).push(entry);
  }

  return map;
};

// Selects the most recent reading for each station based on timestamp
const getNewestReadingPerStation = (entries) => {
  const newestByStation = {};

  for (const entry of entries) {
    const stationId = getStationId(entry);
    if (!stationId) continue;

    if (
      !newestByStation[stationId] ||
      entry.timestamp > newestByStation[stationId].timestamp
    ) {
      newestByStation[stationId] = entry;
    }
  }

  return Object.values(newestByStation);
};

// Checks if a data entry is too old based on its ISO timestamp
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
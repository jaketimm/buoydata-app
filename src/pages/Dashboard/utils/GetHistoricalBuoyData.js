// utils/GetHistoricalBuoyData.js
import helpers from '../../../shared/helpers/unitConverter.js';

// Historical data cache
const HISTORICAL_CACHE_KEY = 'historical_data_cache';
const HISTORICAL_CACHE_DURATION = 12 * 60 * 60 * 1000; // only allow data to be updated every 12 hours

/**
 * Fetches 45 days of historical data for a specific station and returns daily highs
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

    // Use the Netlify serverless function to avoid CORS issues
    const response = await fetch(`/.netlify/functions/fetchHistoricalData?stationId=${stationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData = await response.text();

    // Parse the text data and extract daily highs
    const dailyHighs = parseDailyHighs(rawData);

    // Cache the daily highs data
    setCachedHistoricalData(stationId, dailyHighs);

    return dailyHighs;
  } catch (error) {
    console.error(`Error fetching historical data for station ${stationId}:`, error);
    throw new Error(`Failed to fetch historical data for station ${stationId}: ${error.message}`);
  }
};

/**
 * Parses raw historical data and extracts daily high temperatures
 * @param {string} rawData - The raw text data from NOAA
 * @returns {Array} Array of daily high temperature entries
 */
const parseDailyHighs = (rawData) => {
  // Parse the text data
  const parsedData = parseRawData(rawData);
  
  // Filter data to only include entries with valid temperature data
  const filteredData = filterValidTemperatureData(parsedData);
  
  // If no data after filtering, try a more lenient approach
  const dataToUse = filteredData.length === 0 ? 
    filterLenientTemperatureData(parsedData) : filteredData;
  
  // Process the data to extract daily high temperatures
  const dailyHighs = processDailyHighs(dataToUse);
  
  // Convert to array and sort by date
  const chartData = createFinalChartData(dailyHighs);
  
  return chartData;
};

/**
 * Parses raw text data into structured objects
 * @param {string} rawData - Raw text data from NOAA
 * @returns {Array} Array of parsed data objects
 */
const parseRawData = (rawData) => {
  const lines = rawData.trim().split('\n');
  const headers = lines[0].trim().split(/\s+/).map(header => header.replace('#', ''));

  return lines.slice(1).map(line => {
    const values = line.trim().split(/\s+/);
    const entry = {};

    headers.forEach((header, i) => {
      entry[header] = values[i];
    });

    // Add formatted timestamp fields for easier handling
    if (entry.YY && entry.MM && entry.DD && entry.hh && entry.mm) {
      // Handle both 2-digit and 4-digit years
      const year = entry.YY.length === 2 ? `20${entry.YY}` : entry.YY;

      // Create ISO timestamp for comparison
      const isoDate = `${year}-${entry.MM.padStart(2, '0')}-${entry.DD.padStart(2, '0')}T${entry.hh.padStart(2, '0')}:${entry.mm.padStart(2, '0')}:00Z`;
      entry.isoTimestamp = isoDate;
    } else {
      console.log(`ProcessBuoyData: Missing timestamp fields:`, {
        YY: entry.YY,
        MM: entry.MM,
        DD: entry.DD,
        hh: entry.hh,
        mm: entry.mm
      });
    }

    return entry;
  });
};

/**
 * Filters data to only include entries with valid temperature data
 * @param {Array} parsedData - Array of parsed data objects
 * @returns {Array} Filtered array with valid temperature data
 */
const filterValidTemperatureData = (parsedData) => {
  return parsedData.filter(entry => {
    // Check if at least one temperature value exists and is valid
    const hasValidAirTemp = entry.ATMP && entry.ATMP !== 'MM' && !isNaN(parseFloat(entry.ATMP));
    const hasValidWaterTemp = entry.WTMP && entry.WTMP !== 'MM' && !isNaN(parseFloat(entry.WTMP));
    
    return hasValidAirTemp || hasValidWaterTemp;
  });
};

/**
 * Filters data with a more lenient approach for temperature data
 * @param {Array} parsedData - Array of parsed data objects
 * @returns {Array} Filtered array with any valid temperature data
 */
const filterLenientTemperatureData = (parsedData) => {
  return parsedData.filter(entry => {
    // Try to find any temperature data
    const hasAnyTemp = (entry.ATMP && entry.ATMP !== 'MM' && !isNaN(parseFloat(entry.ATMP))) ||
      (entry.WTMP && entry.WTMP !== 'MM' && !isNaN(parseFloat(entry.WTMP)));

    return hasAnyTemp;
  });
};

/**
 * Processes data to extract daily high temperatures
 * @param {Array} dataToUse - Array of filtered data objects
 * @returns {Object} Object with daily high temperatures grouped by day
 */
const processDailyHighs = (dataToUse) => {
  return dataToUse
    .map(entry => {
      // Check if temperatures are valid before processing
      const hasValidAirTemp = entry.ATMP && entry.ATMP !== 'MM' && !isNaN(parseFloat(entry.ATMP));
      const hasValidWaterTemp = entry.WTMP && entry.WTMP !== 'MM' && !isNaN(parseFloat(entry.WTMP));
      
      // Convert Celsius to Fahrenheit only for valid temperatures
      const airTempC = hasValidAirTemp ? parseFloat(entry.ATMP) : null;
      const waterTempC = hasValidWaterTemp ? parseFloat(entry.WTMP) : null;

      // Create a day key for grouping (YYYY-MM-DD format)
      let dayKey = null;
      if (entry.isoTimestamp) {
        const date = new Date(entry.isoTimestamp);
        dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      } else if (entry.YY && entry.MM && entry.DD) {
        // Fallback to using YY, MM, DD fields
        const year = entry.YY.length === 2 ? `20${entry.YY}` : entry.YY;
        dayKey = `${year}-${entry.MM.padStart(2, '0')}-${entry.DD.padStart(2, '0')}`;
      }

      const mappedEntry = {
        timestamp: entry.isoTimestamp,
        airTemp: hasValidAirTemp ? helpers.celsiusToFahrenheit(airTempC) : null,
        waterTemp: hasValidWaterTemp ? helpers.celsiusToFahrenheit(waterTempC) : null,
        date: entry.isoTimestamp ? new Date(entry.isoTimestamp) : null,
        dayKey: dayKey
      };

      return mappedEntry;
    })
    .filter(entry => entry.dayKey !== null) // Remove entries without valid day keys
    .reduce((acc, entry) => {
      // Group by day and find the highest temperature for each day
      if (!acc[entry.dayKey]) {
        acc[entry.dayKey] = {
          date: entry.date,
          timestamp: entry.timestamp,
          airTemp: entry.airTemp,
          waterTemp: entry.waterTemp,
          dayKey: entry.dayKey
        };
      } else {
        // Update with higher temperatures if found (only for valid temperatures)
        if (entry.airTemp !== null && (acc[entry.dayKey].airTemp === null || entry.airTemp > acc[entry.dayKey].airTemp)) {
          acc[entry.dayKey].airTemp = entry.airTemp;
        }
        if (entry.waterTemp !== null && (acc[entry.dayKey].waterTemp === null || entry.waterTemp > acc[entry.dayKey].waterTemp)) {
          acc[entry.dayKey].waterTemp = entry.waterTemp;
        }
      }
      return acc;
    }, {});
};

/**
 * Creates the final chart data array from daily highs
 * @param {Object} dailyHighs - Object with daily high temperatures
 * @returns {Array} Final chart data array sorted by date
 */
const createFinalChartData = (dailyHighs) => {
  // Convert to array and sort by date
  let chartData = Object.values(dailyHighs)
    .filter(entry => entry.date !== null) // Filter out entries with null dates
    .sort((a, b) => a.date - b.date);

  // If no data with valid dates, try using entries without dates but with valid temperatures
  if (chartData.length === 0) {
    chartData = Object.values(dailyHighs)
      .filter(entry => entry.airTemp !== null || entry.waterTemp !== null); // Include entries with any valid temperature
  }

  return chartData;
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

    return null; // Cache expired
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

/**
 * Clears the historical data cache
 */
export const clearHistoricalCache = () => {
  try {
    localStorage.removeItem(HISTORICAL_CACHE_KEY);
  } catch (error) {
    console.warn('Error clearing historical cache:', error);
  }
};
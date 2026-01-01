// utils/helpers.js
import helpers from '../../../shared/helpers/unitConverter.js';

// Helper function to check if data is too old
const isDataTooOld = (stationData) => {
    if (!stationData.timestamp) return false;
    const dataDate = new Date(stationData.timestamp);
    const now = new Date();
    const ageInMs = now - dataDate;
    const fourHrsInMs = 4 * 60 * 60 * 1000;
    return ageInMs > fourHrsInMs;
  } 

// Treat each data field as a function that returns an object with label, value, and unit.
const formatData = (stationData) => {
  return [
    (() => {
      const value = helpers.celsiusToFahrenheit(stationData.ATMP);
      return { label: 'Air Temp', value, unit: value === 'Not Reported' ? '' : '°F' };
    })(),
    (() => {
      const value = helpers.celsiusToFahrenheit(stationData.WTMP);
      return { label: 'Water Temp', value, unit: value === 'Not Reported' ? '' : '°F' };
    })(),
    (() => {
      const value = helpers.mpsToMph(stationData.WSPD);
      return { label: 'Wind Speed', value, unit: value === 'Not Reported' ? '' : ' mph' };
    })(),
    (() => {
      const value = helpers.mapDegreesToDirection(stationData.WDIR);
      return { label: 'Wind Direction', value, unit: '' };
    })(),
    (() => {
      const value = helpers.metersToFeet(stationData.WVHT);
      return { label: 'Wave Height', value, unit: value === 'Not Reported' ? '' : ' ft' };
    })(),
  ];
};

const dashboardHelpers = { isDataTooOld, formatData };

export default dashboardHelpers;
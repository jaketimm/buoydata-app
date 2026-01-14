// shared/utils/displayHelpers.js

// Helper function to check if data is is more than 4 hours old
// Used to turn timestamps yellow on UI
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
      const value = stationData.ATMP;
      return { label: 'Air Temp', value, unit: value === 'Not Reported' ? '' : '°F' };
    })(),
    (() => {
      const value = stationData.WTMP;
      return { label: 'Water Temp', value, unit: value === 'Not Reported' ? '' : '°F' };
    })(),
    (() => {
      const value = stationData.WSPD;
      return { label: 'Wind Speed', value, unit: value === 'Not Reported' ? '' : ' mph' };
    })(),
    (() => {
      const value = stationData.WDIR;
      return { label: 'Wind Direction', value, unit: '' };
    })(),
    (() => {
      const value = stationData.WVHT;
      return { label: 'Wave Height', value, unit: value === 'Not Reported' ? '' : ' ft' };
    })(),
  ];
};

const buoyMapHelpers = { isDataTooOld, formatData };

export default buoyMapHelpers;
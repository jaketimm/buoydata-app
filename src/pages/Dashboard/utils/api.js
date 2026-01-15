// Fetch 45 day historical buoy readings from the Flask App
export const fetchHistoricalBuoyData = async (stationId) => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const response = await fetch(
    `${API_URL}/api/historical-noaa-data?stationId=${stationId}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
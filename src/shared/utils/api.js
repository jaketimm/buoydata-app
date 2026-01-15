// shared/utils/api

// Fetch current buoy readings from the Flask App
export const fetchCurrentBuoyData = async () => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
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

  return response.json();
};

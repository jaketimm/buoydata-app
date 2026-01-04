import { useState, useEffect } from 'react';
import { getProcessedStationData } from '../utils/getCurrentBuoyData';

// Hook to fetch buoy data from the API and store it in the state
export default function useBuoyData() {
  const [buoyData, setBuoyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch buoy data from the API and store it
  useEffect(() => {
    const loadBuoyData = async () => {
      setLoading(true);
      try {
        const data = await getProcessedStationData();
        setBuoyData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadBuoyData();
  }, []);

  return { buoyData, loading, error };
} 
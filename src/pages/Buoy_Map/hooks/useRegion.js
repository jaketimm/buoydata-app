import { useState, useMemo } from 'react';

// Regions and their default zoom levels
const REGIONS = {
  "East Coast": { center: [-75, 36], zoom: 5, mobileZoom: 4 },
  "Great Lakes": { center: [-84.5, 43.5], zoom: 6, mobileZoom: 5 },
  "Gulf of Mexico": { center: [-89, 27], zoom: 5.5, mobileZoom: 4 },
  "West Coast": { center: [-123, 38], zoom: 4.5, mobileZoom: 3.5 },
  "Hawaii": { center: [-157, 20.5], zoom: 7, mobileZoom: 5.5 },
  "Caribbean": { center: [-67, 17.5], zoom: 6, mobileZoom: 5 }
};

// Check if the device is mobile
function isMobile() {
  return window.innerWidth <= 640;
}

// Get the view state for a given region
function getRegionViewState(regionName) {
  const region = REGIONS[regionName];
  if (!region) return null;
  return {
    longitude: region.center[0],
    latitude: region.center[1],
    zoom: isMobile() ? region.mobileZoom : region.zoom
  };
}

// Hook to manage the selected region and view state
export default function useRegion() {
  // Initialize with East Coast as default 
  const [selectedRegion, setSelectedRegion] = useState("East Coast");

  const viewState = useMemo(() => {
    if (selectedRegion && REGIONS[selectedRegion]) {
      return getRegionViewState(selectedRegion);
    } else {
      // Default to East Coast
      return getRegionViewState("East Coast");
    }
  }, [selectedRegion]);

  return { selectedRegion, setSelectedRegion, viewState, REGIONS };
}
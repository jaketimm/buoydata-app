import React, { useState, useEffect } from 'react';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import './index.css';
import FullScreenLoading from '../../shared/components/FullScreenLoading.js';
import { StationList } from '../../constants/stationList';
import useFavorites from '../../shared/hooks/useFavorites';
import useRegion from './hooks/useRegion';
import useBuoyData from '../../shared/hooks/useBuoyData';

// Import map components
import MapLegend from './components/MapLegend/MapLegend';
import RegionSelector from './components/RegionSelector/RegionSelector';
import BuoyMarker from './components/BuoyMarker/BuoyMarker';
import StationPopup from './components/StationPopup/StationPopup';

// BuoyMap Component - Displays an interactive map with marine buoy stations
const BuoyMap = ({ darkMode = false }) => {

  const { toggleFavorite, isFavorite } = useFavorites();
  const { selectedRegion, setSelectedRegion, REGIONS, viewState: regionViewState } = useRegion();
  const { buoyData, loading, error } = useBuoyData();
  
  // Map view state - controls map position and zoom level
  const [viewState, setViewState] = useState(regionViewState || {
    longitude: -75,  // Default to East Coast US
    latitude: 36,
    zoom: 5
  });
  
  // Track current zoom level for conditional rendering
  const [currentZoom, setCurrentZoom] = useState(viewState.zoom);
  
  // Popup state - stores info about currently selected station
  const [popupInfo, setPopupInfo] = useState(null);
  
  // Map loading state - prevents rendering markers before map is ready
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Loading timeout state
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Determine map style based on color mode preference
  const mapStyle = darkMode 
    ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
    : "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

  // Effect: Update map view when region selection changes
  useEffect(() => {
    if (regionViewState) {
      setViewState(regionViewState);
      setCurrentZoom(regionViewState.zoom);
    }
  }, [regionViewState]);

  // Effect: Set timeout for loading - trigger error after 6 seconds
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // If still loading after 6 seconds, trigger timeout error
      if (loading || !mapLoaded) {
        setLoadingTimeout(true);
      }
    }, 6000); // 6 seconds

    // Clear timeout if loading completes or component unmounts
    return () => clearTimeout(timeoutId);
  }, [loading, mapLoaded]);

  // Throw error to be caught by ErrorBoundary if timeout occurs
  if (loadingTimeout) {
    throw new Error('Map failed to load. Please check your internet connection and try again.');
  }

  // Check if a station has available buoy data
  const stationHasData = (stationId) => {
    if (!Array.isArray(buoyData) || buoyData.length === 0) {
      return false;
    }
    
    // Look for station in the data array using the "#STN" field
    const stationData = buoyData.find(station => station && station["#STN"] === stationId);
    return stationData !== undefined;
  };

  // Handle map movement events (pan, zoom, etc.)
  const handleMove = (evt) => {
    setViewState(evt.viewState);
    setCurrentZoom(evt.viewState.zoom);
  };

  return (
    <div className="maps-buoy-map-container">
      {/* Region selection dropdown - allows users to jump to predefined map areas */}
      <RegionSelector
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        regions={REGIONS}
      />
      
      {/* Full screen loading overlay - shown during data fetch or map initialization */}
      {(loading || !mapLoaded) && <FullScreenLoading />}
      
      {/* Error message display for data fetch failures */}
      {error && <div className="maps-error-message">Error: {error}</div>}
      
      {/* Main map component with MapLibre GL */}
      <Map
        key={darkMode ? 'dark' : 'light'} // Force re-render when theme changes
        {...viewState}
        onMove={handleMove}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        onLoad={() => setMapLoaded(true)}
        onError={(e) => {
          console.error('Map error:', e);
          throw new Error('Map failed to initialize: ' + e.error.message);
        }}
        // Map interaction settings
        dragRotate={false}      // Disable 3D rotation
        touchRotate={false}     // Disable touch rotation
        bearing={0}             // Keep north facing up
        pitch={0}               // Keep map flat (no tilt)
        doubleClickZoom={true}  // Allow double-click to zoom
        scrollZoom={true}       // Allow scroll wheel zoom
        dragPan={true}          // Allow click-drag to pan
        keyboard={true}         // Enable keyboard navigation
        touchZoom={true}        // Allow pinch-to-zoom on touch
        touchPitch={false}      // Disable touch pitch/tilt
      >
        {/* Render buoy markers for each station in the station list */}
        {Object.entries(StationList).map(([stationId, stationData]) => (
          <BuoyMarker
            key={stationId}
            stationId={stationId}
            stationData={stationData}
            hasData={stationHasData(stationId)}
            onClick={setPopupInfo}
            darkMode={darkMode}
          />
        ))}
        
        {/* Station information popup - shows when a buoy is clicked */}
        <StationPopup
          popupInfo={popupInfo}
          currentZoom={currentZoom}
          onClose={() => setPopupInfo(null)}
          isFavorite={isFavorite}
          toggleFavorite={toggleFavorite}
          stationHasData={stationHasData}
          buoyData={buoyData}
        />
      </Map>
      
      {/* Map legend */}
      <MapLegend />
    </div>
  );
};

export default BuoyMap;
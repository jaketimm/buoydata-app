import React from 'react';
import { Marker } from 'react-map-gl/maplibre';
import './BuoyMarker.css';

// Diamond-shaped SVG icon that changes color based on data availability and theme
const DiamondMarker = ({ hasData, darkMode = false }) => {
  // Set colors based on theme and data status
  let color, strokeColor;
  
  if (darkMode) {
    // Dark mode: lighter colors for better contrast
    color = hasData ? '#36658b' : '#ca5b5b'; 
    strokeColor = hasData ? '#36658b' : '#ca5b5b';
  } else {
    // Light mode: darker colors
    color = hasData ? '#3e526d' : '#c85450'; 
    strokeColor = hasData ? '#3e526d' : '#b44e4bff';
  }
  
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path 
        d="M12 2 L22 12 L12 22 L2 12 Z" // Diamond shape path
        fill={color} 
        stroke={strokeColor} 
        strokeWidth="2" 
      />
    </svg>
  );
};

// Interactive map marker for buoy stations - shows location and data status
const BuoyMarker = ({ stationId, stationData, hasData, onClick, darkMode = false }) => {
  return (
    <Marker
      longitude={stationData.longitude}
      latitude={stationData.latitude}
      anchor="center"
      onClick={e => {
        // Prevent event bubbling to map
        e.originalEvent.stopPropagation();
        // Pass station info to click handler
        onClick({ stationId, ...stationData });
      }}
    >
      {/* Clickable button wrapper for accessibility */}
      <button
        className="map-marker-button"
        aria-label={stationData.name || `Station ${stationId}`}
        tabIndex={0}
        onKeyDown={e => {
          // Handle keyboard navigation (Enter or Space to activate)
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick({ stationId, ...stationData });
          }
        }}
      >
        <DiamondMarker hasData={hasData} darkMode={darkMode} />
      </button>
    </Marker>
  );
};

export default BuoyMarker;
import React from 'react';
import { Popup } from 'react-map-gl/maplibre';
import './StationPopup.css';
import displayHelpers from '../../../../shared/utils/displayHelpers.js';

// Popup component that displays station information and readings when a buoy marker is clicked
const StationPopup = ({ 
  popupInfo, 
  currentZoom, 
  onClose, 
  isFavorite, 
  toggleFavorite, 
  stationHasData, 
  buoyData 
}) => {
  // Hide popup if no station selected or zoom level is too low
  if (!popupInfo || currentZoom < 1) return null;

  // Render current buoy readings or appropriate message
  const renderBuoyReadings = (stationId) => {
    // Show loading message if data hasn't loaded yet
    if (!Array.isArray(buoyData) || buoyData.length === 0) {
      return <div className="maps-no-data-message">Buoy data is loading...</div>;
    }
    
    // Find data for this specific station
    const stationData = buoyData.find(station => station && station["#STN"] === stationId);
    
    // Show no data message if station not found in data
    if (!stationData) {
      return <div className="maps-no-data-message">No data available for this station</div>;
    }
    
    // Check if data is stale and format all readings for display
    const isDataOld = displayHelpers.isDataTooOld(stationData);
    const dataFields = displayHelpers.formatData(stationData);
    
    return (
      <div className="maps-buoy-readings">
        {/* Timestamp - highlighted if data is old */}
        <div className={`maps-datetime ${isDataOld ? 'old-data' : ''}`}>
          {stationData.displayTimestamp}
        </div>
        
        {/* Render each data field (temp, waves, wind, etc.) */}
        {dataFields.map((field, index) => (
          <div key={index} className="maps-reading-item">
            <span className="maps-reading-label">{field.label}:</span>
            <span className="maps-reading-value">
              {field.value !== 'N/A' ? `${field.value}${field.unit}` : 'N/A'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Popup
      longitude={popupInfo.longitude}
      latitude={popupInfo.latitude}
      anchor="top"
      offset={[0, 10]}
      closeOnClick={true}
      onClose={onClose}
      className="maps-custom-popup"
      maxWidth="300px"
    >
      <div className="maps-popup-content">
        {/* Station header with name, favorite button, and data status */}
        <div className="maps-station-details">
          <strong>{popupInfo.name}</strong>
          
          {/* Favorite toggle button */}
          <button
            className={`maps-favorite-button ${isFavorite(popupInfo.stationId) ? 'active' : ''}`}
            onClick={() => toggleFavorite(popupInfo.stationId)}
            title={isFavorite(popupInfo.stationId) ? 'Remove from favorites' : 'Add to favorites'}
            style={{ marginTop: 0, fontSize: 20 }}
          >
            {isFavorite(popupInfo.stationId) ? '★' : '☆'}
          </button>
          
          {/* Show "No Data Available" indicator if station has no current data */}
          {!stationHasData(popupInfo.stationId) && (
            <div className="maps-data-status no-data">No Data Available</div>
          )}
        </div>
        
        {/* Current readings section */}
        {renderBuoyReadings(popupInfo.stationId)}
      </div>
    </Popup>
  );
};

export default StationPopup;
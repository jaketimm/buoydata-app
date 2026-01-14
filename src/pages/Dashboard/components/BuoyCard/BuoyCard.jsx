import React from 'react';
import './BuoyCard.css';
import displayHelpers from '../../../../shared/utils/displayHelpers.js';

// Card component displaying current readings for a single buoy station
const BuoyCard = ({ 
  stationId, 
  stationInfo, 
  buoyData, 
  isFavorite, 
  toggleFavorite, 
  historicalLoading, 
  openTemperatureModal 
}) => {
  // Render current buoy data readings or no-data message
  const renderBuoyReadings = () => {
    // Find this station's data in the buoy data array
    const stationData = buoyData.find(station => station && station["#STN"] === stationId);

    if (!stationData) {
      return <div className="no-data-message">No data available for this station</div>;
    }

    // Check if data is stale (more than 4 hours old)
    const isDataOld = displayHelpers.isDataTooOld(stationData);

    // Format all data fields for display
    const dataFields = displayHelpers.formatData(stationData);

    return (
      <div className="buoy-data">
        {/* Timestamp - highlighted yellow if data is old */}
        <div className={`datetime ${isDataOld ? 'old-data' : ''}`}>
          {stationData.displayTimestamp}
        </div>
        
        {/* Render each data field (temperature, wave height, etc.) */}
        {dataFields.map((field, index) => (
          <div key={index} className="reading-item">
            <span className="reading-label">{field.label}:</span>
            <span className="reading-value">
              {field.value !== 'N/A' ? `${field.value}${field.unit}` : 'N/A'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="buoy-card">
      {/* Station header with name, ID, location and favorite button */}
      <div className="station-info">
        <div className="station-title">
          <h2>{stationInfo.name}</h2>
          <div className="station-id">Station: {stationId}</div>
          <div className="body-of-water">{stationInfo.bodyOfWater}</div>
        </div>
        
        {/* Favorite toggle button */}
        <button
          className={`favorite-button ${isFavorite ? 'active' : ''}`}
          onClick={() => toggleFavorite(stationId)}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>

      {/* Current readings section */}
      {renderBuoyReadings()}

      {/* Historical data section with chart button */}
      <div className="historical-data-section">
        <div className="historical-buttons">
          <button
            className="historical-data-button"
            onClick={() => openTemperatureModal(stationId, stationInfo)}
            disabled={historicalLoading[stationId]}
          >
            {historicalLoading[stationId] ? 'Loading...' : '45 Day Chart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuoyCard;
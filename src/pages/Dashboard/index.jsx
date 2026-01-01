import React, { useState } from 'react';
import { ViewControls, FilterControls, NoFavoritesMessage, NoFavoritesInBodyOfWater } from './components/DashboardControls/DashboardControls.jsx';
import dashboardHelpers from './utils/helpers.js';
import FullScreenLoading from '../../shared/components/FullScreenLoading.js';
import Modal from './components/Modal/Modal.jsx';
import TemperatureChart from './components/TemperatureChart/TemperatureChart.jsx';
import './index.css';
import useFavorites from '../../shared/hooks/useFavorites.js';
import useBuoyData from '../../shared/hooks/useBuoyData.js';
import useHistoricalData from './hooks/useHistoricalData.js';
import useDashboardFilters from './hooks/useDashboardFilters.js';

// Main dashboard component - displays grid of buoy stations with real-time data
const BuoyDashboard = () => {
  // Custom hooks for managing application state
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { buoyData, loading, error } = useBuoyData();
  const {
    historicalData,
    historicalLoading,
    historicalError,
    fetchHistoricalDataForStation
  } = useHistoricalData();

  // Modal state for temperature chart display
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);

  // View state - toggle between showing all stations vs favorites only
  const [showAllStations, setShowAllStations] = useState(false);
  
  // Filter state - filter stations by body of water
  const [selectedBodyOfWater, setSelectedBodyOfWater] = useState('all');

  // Open temperature chart modal and fetch historical data if needed
  const openTemperatureModal = async (stationId, stationInfo) => {
    setSelectedStation({ id: stationId, info: stationInfo });
    setIsModalOpen(true);

    // Fetch historical data if not already loaded for this station
    if (!historicalData[stationId] && !historicalLoading[stationId]) {
      await fetchHistoricalDataForStation(stationId);
    }
  };

  // Close modal and clear selected station
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStation(null);
  };

  // Get filtered stations and counts based on current view and filter settings
  const {
    bodiesOfWater,
    stationsToDisplay,
    filteredAllCount,
    filteredFavoriteCount
  } = useDashboardFilters(favorites, showAllStations, selectedBodyOfWater);

  // Show loading spinner while initial data is loading
  if (loading) {
    return <FullScreenLoading />;
  }

  return (
    <div className="buoy-dashboard">
      {/* Dashboard controls - view toggle and body of water filter */}
      <div className="dashboard-controls">
        <ViewControls
          showAllStations={showAllStations}
          setShowAllStations={setShowAllStations}
          filteredFavoriteCount={filteredFavoriteCount}
          filteredAllCount={filteredAllCount}
        />

        <FilterControls
          selectedBodyOfWater={selectedBodyOfWater}
          setSelectedBodyOfWater={setSelectedBodyOfWater}
          bodiesOfWater={bodiesOfWater}
        />
      </div>

      {/* Error state display */}
      {error && <ErrorMessage error={error} />}

      {/* No favorites selected state - prompt user to add favorites */}
      {!error && !showAllStations && favorites.length === 0 && (
        <NoFavoritesMessage setShowAllStations={setShowAllStations} />
      )}

      {/* No favorites match current filter - show options to show all favorites or view all */}
      {!error && !showAllStations && favorites.length > 0 && stationsToDisplay.length === 0 && (
        <NoFavoritesInBodyOfWater
          selectedBodyOfWater={selectedBodyOfWater}
          setSelectedBodyOfWater={setSelectedBodyOfWater}
          setShowAllStations={setShowAllStations}
        />
      )}

      {/* Main content - grid of buoy station cards */}
      {!error && stationsToDisplay.length > 0 && (
        <div className="buoy-grid">
          {stationsToDisplay.map(([stationId, stationInfo]) => (
            <BuoyCard
              key={stationId}
              stationId={stationId}
              stationInfo={stationInfo}
              buoyData={buoyData}
              isFavorite={isFavorite(stationId)}
              toggleFavorite={toggleFavorite}
              historicalLoading={historicalLoading}
              openTemperatureModal={openTemperatureModal}
            />
          ))}
        </div>
      )}

      {/* Temperature chart modal - shows 45-day historical data */}
      {selectedStation && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={`${selectedStation.info.name}`}
        >
          <TemperatureChart
            stationId={selectedStation.id}
            stationInfo={selectedStation.info}
            historicalData={historicalData}
            historicalLoading={historicalLoading}
            historicalError={historicalError}
            fetchHistoricalDataForStation={fetchHistoricalDataForStation}
          />
        </Modal>
      )}
    </div>
  );
};

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
    const isDataOld = dashboardHelpers.isDataTooOld(stationData);

    // Format all data fields for display
    const dataFields = dashboardHelpers.formatData(stationData);

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

// Simple error message component
const ErrorMessage = ({ error }) => {
  return <div className="error">Error: {error}</div>;
};

export default BuoyDashboard;
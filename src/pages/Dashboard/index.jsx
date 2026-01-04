import React, { useState } from 'react';
import { ViewControls, FilterControls, NoFavoritesMessage, NoFavoritesInBodyOfWater } from './components/DashboardControls/DashboardControls.jsx';
import BuoyCard from './components/BuoyCard/BuoyCard.jsx';
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


// Simple error message component
const ErrorMessage = ({ error }) => {
  return <div className="error">Error: {error}</div>;
};

export default BuoyDashboard;
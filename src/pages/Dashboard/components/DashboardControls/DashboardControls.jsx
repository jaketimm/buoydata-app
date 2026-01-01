import './DashboardControls.css';

// Controls for toggling between favorites and all stations view
const ViewControls = ({ showAllStations, setShowAllStations, filteredFavoriteCount, filteredAllCount }) => {
  return (
    <div className="view-controls">
      <button
        className={`view-toggle ${!showAllStations ? 'active' : ''}`}
        onClick={() => setShowAllStations(false)}
      >
        Favorites ({filteredFavoriteCount})
      </button>
      <button
        className={`view-toggle ${showAllStations ? 'active' : ''}`}
        onClick={() => setShowAllStations(true)}
      >
        All Stations ({filteredAllCount})
      </button>
    </div>
  );
};

// Controls for filtering by body of water
const FilterControls = ({ selectedBodyOfWater, setSelectedBodyOfWater, bodiesOfWater }) => {
  return (
    <div className="filter-controls">
      <label htmlFor="bodyOfWater">Filter by Body of Water:</label>
      <select
        id="bodyOfWater"
        value={selectedBodyOfWater}
        onChange={(e) => setSelectedBodyOfWater(e.target.value)}
        className="body-of-water-select"
      >
        <option value="all">All Bodies of Water</option>
        {bodiesOfWater.map(body => (
          <option key={body} value={body}>{body}</option>
        ))}
      </select>
    </div>
  );
};

// Message shown when no favorites are selected
const NoFavoritesMessage = ({ setShowAllStations }) => {
  return (
    <div className="no-favorites-message">
      <p>No favorite stations selected.</p>
      <button
        className="show-all-button"
        onClick={() => setShowAllStations(true)}
      >
        Show All Stations
      </button>
    </div>
  );
};

// Message shown when no favorites match the selected body of water
const NoFavoritesInBodyOfWater = ({ selectedBodyOfWater, setSelectedBodyOfWater, setShowAllStations }) => {
  return (
    <div className="no-stations-message">
      <p>No favorite stations found in {selectedBodyOfWater}.</p>
      <div className="filter-suggestions">
        <button
          className="filter-suggestion"
          onClick={() => setSelectedBodyOfWater('all')}
        >
          Show All Favorites
        </button>
        <button
          className="filter-suggestion"
          onClick={() => setShowAllStations(true)}
        >
          Show All Stations in {selectedBodyOfWater}
        </button>
      </div>
    </div>
  );
};

export { ViewControls, FilterControls, NoFavoritesMessage, NoFavoritesInBodyOfWater };
import React from 'react';
import './RegionSelector.css';

const RegionSelector = ({ selectedRegion, onRegionChange, regions }) => {
  return (
    <div className="maps-region-selector-container">
      <label htmlFor="region-select" className="maps-region-label">
        Region:
      </label>
      <select
        id="region-select"
        value={selectedRegion}
        onChange={e => onRegionChange(e.target.value)}
        className="maps-region-select"
      >
        {Object.keys(regions).map(region => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RegionSelector;
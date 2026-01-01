import React from 'react';
import './MapLegend.css';

const MapLegend = () => {
  return (
    <div className="maps-map-legend">
      <div className="maps-legend-item">
        <div className="maps-legend-icon maps-legend-icon-available"></div>
        <span>Data Available</span>
      </div>
      <div className="maps-legend-item">
        <div className="maps-legend-icon maps-legend-icon-unavailable"></div>
        <span>No Data</span>
      </div>
      <div className="maps-legend-item">
        <span>Click icons to view data</span>
      </div>
    </div>
  );
};

export default MapLegend;
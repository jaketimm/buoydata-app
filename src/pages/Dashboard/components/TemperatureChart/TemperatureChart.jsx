import React, { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../utils/chartThemeColors';
import './TemperatureChart.css';

// Chart component displaying 45-day historical temperature data for air and water temps
const TemperatureChart = ({
  stationId,
  stationInfo,
  historicalData,
  historicalLoading,
  historicalError,
  fetchHistoricalDataForStation
}) => {
  const theme = useTheme();

  // Fetch historical data on component mount if not already loaded
  useEffect(() => {
    if (!historicalData[stationId] && !historicalLoading[stationId] && !historicalError[stationId]) {
      fetchHistoricalDataForStation(stationId);
    }
  }, [stationId, historicalData, historicalLoading, historicalError, fetchHistoricalDataForStation]);

  // Show loading message while fetching data
  if (historicalLoading[stationId]) {
    return (
      <div className="chart-loading">
        <p>Loading temperature data...</p>
      </div>
    );
  }

  // Show error message if data fetch failed
  if (historicalError[stationId]) {
    return (
      <div className="chart-error">
        <p>Error loading temperature data: {historicalError[stationId]}</p>
      </div>
    );
  }

  // Get data for this specific station
  const data = historicalData[stationId];

  // Handle case where no data exists for this station
  if (!data || data.length === 0) {
    return (
      <div className="no-chart-data">
        <p>No temperature data available for this station.</p>
        <p>Debug: historicalData keys: {Object.keys(historicalData).join(', ')}</p>
      </div>
    );
  }

  // Process and format data for the chart
  const chartData = data.map(entry => ({
    ...entry,
    // Format date for readable x-axis labels
    displayDate: entry.timestamp
      ? new Date(entry.timestamp).toLocaleDateString()
      : entry.dayKey
  }));

  // Handle case where data exists but no valid temperature readings
  if (chartData.length === 0) {
    return (
      <div className="no-chart-data">
        <p>No valid temperature data available for this station.</p>
        <p>Data format: {data.length > 0 ? `Found ${data.length} entries, but no valid temperature readings` : 'No data found'}</p>
      </div>
    );
  }

  // Calculate optimal Y-axis range based on temperature data
  const allTemps = chartData.flatMap(entry => [entry.airTemp, entry.waterTemp]).filter(temp => temp != null && !isNaN(temp));

  if (allTemps.length === 0) {
    return (
      <div className="no-chart-data">
        <p>No valid temperature values found in the data.</p>
      </div>
    );
  }

  // Set Y-axis domain with padding for better visualization
  const minTemp = Math.min(...allTemps);
  const maxTemp = Math.max(...allTemps);
  const yAxisPadding = 10;
  const yAxisDomain = [Math.floor(minTemp - yAxisPadding), Math.ceil(maxTemp + yAxisPadding)];

  return (
    <div className="temperature-chart">
      <div className="chart-container">
        <div className="chart-scroll-wrapper">
          <ResponsiveContainer width="90%" height="75%">
            <LineChart data={chartData}>
              {/* Chart grid lines */}
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />

              {/* X-axis for dates */}
              <XAxis
                dataKey="displayDate"
                angle={-45}                    // Rotate labels to prevent overlap
                textAnchor="end"
                height={80}                    // Extra space for rotated labels
                interval="preserveStartEnd"    // Show first and last labels
                tick={{ fill: theme.text }}
                stroke={theme.axis}
              />

              {/* Y-axis for temperature values */}
              <YAxis
                label={{ value: 'Temperature (°F)', angle: -90, position: 'insideLeft', fill: theme.textSecondary }}
                tick={{ fill: theme.text }}
                domain={yAxisDomain}           // Use calculated range
                stroke={theme.axis}
              />

              {/* Hover tooltip with formatted temperature display */}
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'airTemp') {
                    return [`Air Temp: ${value}°F`, 'Air Temperature'];
                  } else if (name === 'waterTemp') {
                    return [`Water Temp: ${value}°F`, 'Water Temperature'];
                  }
                  return [`High Temp: ${value}°F`];
                }}
                labelFormatter={(label) => `${label}`}
                contentStyle={{
                  backgroundColor: theme.tooltipBg,
                  color: theme.tooltipText,
                  border: `1px solid ${theme.tooltipBorder}`,
                  borderRadius: '4px',
                  boxShadow: `0 2px 8px ${theme.tooltipShadow}`
                }}
              />

              {/* Chart legend */}
              <Legend
                wrapperStyle={{ color: theme.text }}
              />

              {/* Air temperature line */}
              <Line
                type="monotone"
                dataKey="airTemp"
                stroke={theme.lineAir}
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Daily High Air Temperature"
              />

              {/* Water temperature line */}
              <Line
                type="monotone"
                dataKey="waterTemp"
                stroke={theme.lineWater}
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Daily High Water Temperature"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TemperatureChart;
import React, { useEffect } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from './chartThemeColors';
import './TemperatureChart.css';

// Chart component displaying 45-day historical temperature data for air, water temps, and wave heights
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
        <p>Error loading temperature data</p>
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
      </div>
    );
  }

  // Calculate left y-axis range based on temperature data
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

  // True/False flag for if wave and temp data are available (count how many valid values are avialable). Hides Y-axis and legends for missing data
  const hasWaveData = (chartData.map(entry => entry.waveHeight).filter(height => height != null && !isNaN(height))).length > 0;
  const hasAirTemps = (chartData.map(entry => entry.airTemp).filter(airTemp => airTemp != null && !isNaN(airTemp))).length > 0;
  const hasWaterTemps = (chartData.map(entry => entry.waterTemp).filter(waterTemp => waterTemp != null && !isNaN(waterTemp))).length > 0;

  let waveHeightDomain = [0, 15]; // Default right y-axis domain

  return (
    <div className="temperature-chart">
      <div className="chart-container">
        <div className="chart-scroll-wrapper">
          <ResponsiveContainer width="90%" height="75%">
            <ComposedChart data={chartData}>
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

              {/* Left Y-axis for temperature values */}
              <YAxis
                yAxisId="left"
                label={{ value: 'Temperature (°F)', angle: -90, position: 'insideLeft', fill: theme.textSecondary }}
                tick={{ fill: theme.text }}
                domain={yAxisDomain}           // Use calculated range
                stroke={theme.axis}
              />

              {/* Right Y-axis for wave height */}
              <YAxis
                yAxisId="right"
                orientation="right"
                label={hasWaveData ? { value: 'Avgerage Wave Height (ft)', angle: 90, position: 'insideRight', fill: theme.textSecondary } : undefined}
                tick={{ fill: theme.text }}
                domain={waveHeightDomain}
                stroke={theme.axis}
              />

              {/* Hover tooltip with formatted temperature and wave height display */}
              <Tooltip
                separator=": "
                formatter={(value, name) => {
                  if (name === 'Daily High Air Temperature') {
                    return [`${value} °F`, 'Air Temperature'];
                  } else if (name === 'Daily High Water Temperature') {
                    return [`${value} °F`, 'Water Temperature'];
                  } else if (name === 'Average Wave Height') {
                    return [`${value} ft`, 'Wave Height'];
                  }
                  return [value];
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

              {/* Wave height bars */}
              {hasWaveData && <Bar
                yAxisId="right"
                dataKey="waveHeight"
                fill={theme.barWave || '#8884d8'}
                opacity={0.6}
                name="Average Wave Height"
              />}

              {/* Air temperature line */}
              {hasAirTemps && <Line
                yAxisId="left"
                type="monotone"
                dataKey="airTemp"
                stroke={theme.lineAir}
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Daily High Air Temperature"
              />}

              {/* Water temperature line */}
              {hasWaterTemps && <Line
                yAxisId="left"
                type="monotone"
                dataKey="waterTemp"
                stroke={theme.lineWater}
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Daily High Water Temperature"
              />}


            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TemperatureChart;

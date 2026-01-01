const axios = require('axios');

exports.handler = async function (event, context) {
  const stationId = event.queryStringParameters.stationId;

  if (!stationId) {
    return {
      statusCode: 400,
      body: 'Missing stationId parameter',
    };
  }

  const url = `https://www.ndbc.noaa.gov/data/realtime2/${stationId}.txt`;

  try {
    const response = await axios.get(url, {
      responseType: 'text',
      timeout: 10000
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store',
      },
      body: response.data,
    };
  } catch (error) {
    console.error('NOAA historical data fetch error:', error.message);
    return {
      statusCode: 500,
      body: `Failed to fetch historical data for station ${stationId}`,
    };
  }
}; 
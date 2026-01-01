const axios = require('axios');

exports.handler = async function (event, context) {
  const hour = event.queryStringParameters.hour;

  if (!hour) {
    return {
      statusCode: 400,
      body: 'Missing hour parameter',
    };
  }

  const url = `https://www.ndbc.noaa.gov/data/hourly2/hour_${hour}.txt`;

  try {
    const response = await axios.get(url, {
      responseType: 'text',
      timeout: 5000
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
    console.error('NOAA fetch error:', error.message);
    return {
      statusCode: 500,
      body: 'Failed to fetch NOAA data',
    };
  }
};

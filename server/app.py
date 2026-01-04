from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

from utils.data_formatting import parse_text_data


app = Flask(__name__)
CORS(app)  # Configure this with your specific origins in production i.e. neflify site URL

@app.route('/api/health', methods=['GET'])
def test():
    return jsonify({'message': 'App is running'}), 200


@app.route('/api/real-time-noaa-data', methods=['GET'])
def fetch_realtime_noaa_data():
    """Fetch NOAA buoy data for a specific hour"""
    hour = request.args.get('hour')
    
    if not hour:
        return jsonify({'error': 'Missing hour parameter'}), 400
    
    url = f'https://www.ndbc.noaa.gov/data/hourly2/hour_{hour}.txt'
    
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        
        # Parse the data
        parsed_data = parse_text_data(response.text)
        
        return jsonify(parsed_data), 200, {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
        }
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Request timed out'}), 504
    except requests.exceptions.RequestException as e:
        print(f'NOAA fetch error: {str(e)}')
        return jsonify({'error': 'Failed to fetch NOAA data'}), 500



if __name__ == '__main__':
    app.run(debug=True, port=5000)
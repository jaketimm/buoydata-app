from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

from utils.process_realtime_data import parse_real_time_data
from utils.process_historical_data import parse_historical_data


app = Flask(__name__)
CORS(app)  # Configure this with neflify site URL

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
        
        parsed_data = parse_real_time_data(response.text)
        
        return jsonify(parsed_data), 200, {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
        }
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Request timed out'}), 504
    except requests.exceptions.RequestException as e:
        print(f'NOAA fetch error: {str(e)}')
        return jsonify({'error': 'Failed to fetch NOAA data'}), 500


@app.route('/api/historical-noaa-data', methods=['GET'])
def fetch_historical_noaa_data():
    """Fetch and process historical NOAA buoy data for a specific station"""
    station_id = request.args.get('stationId')
    
    if not station_id:
        return jsonify({'error': 'Missing stationId parameter'}), 400
    
    url = f'https://www.ndbc.noaa.gov/data/realtime2/{station_id}.txt'
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        chart_data = parse_historical_data(response.text)
        
        return jsonify(chart_data), 200, {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
        }
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Request timed out'}), 504
    except requests.exceptions.RequestException as e:
        print(f'NOAA historical fetch error: {str(e)}')
        return jsonify({'error': f'Failed to fetch historical data for station {station_id}'}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
import numpy as np


def parse_historical_data(text):
    """
    Orchestrator function for historical data processing.
    Parses raw NOAA data and returns daily highs for charting.
    """
    entries = parse_raw_entries(text)
    valid_entries = filter_valid_entries(entries)
    daily_readings = calculate_daily_readings(valid_entries)
    chart_data = format_chart_data(daily_readings)
    return chart_data


def parse_raw_entries(text):
    """
    Parse raw NOAA text data into structured entries.
    No unit conversions - just structure parsing with timestamps.
    """
    lines = text.strip().split('\n')
    
    if len(lines) < 2:
        return []
    
    # Parse headers, removing '#' prefix if present
    headers = [h.replace('#', '') for h in lines[0].split()]
    data_lines = lines[1:]
    
    parsed_entries = []
    
    for line in data_lines:
        values = line.split()
        
        if len(values) != len(headers):
            continue
        
        entry = dict(zip(headers, values))
        
        # Add timestamp and dayKey fields
        if all(key in entry for key in ['YY', 'MM', 'DD', 'hh', 'mm']):
            try:
                year = f"20{entry['YY']}" if len(entry['YY']) == 2 else entry['YY']
                
                iso_date = f"{year}-{entry['MM'].zfill(2)}-{entry['DD'].zfill(2)}T{entry['hh'].zfill(2)}:{entry['mm'].zfill(2)}:00Z"
                entry['isoTimestamp'] = iso_date
                
                entry['dayKey'] = f"{year}-{entry['MM'].zfill(2)}-{entry['DD'].zfill(2)}"
            except (ValueError, KeyError):
                pass
        
        parsed_entries.append(entry)
    
    return parsed_entries


def filter_valid_entries(entries):
    """
    Filter entries to only include those with at least one valid reading.
    Valid means: exists, not 'MM', and is a valid number.
    Checks ATMP, WTMP, and WVHT.
    """
    def is_valid_value(value):
        if value is None or value == 'MM':
            return False
        try:
            float(value)
            return True
        except (ValueError, TypeError):
            return False
    
    return [
        entry for entry in entries
        if (is_valid_value(entry.get('ATMP')) or 
            is_valid_value(entry.get('WTMP')) or 
            is_valid_value(entry.get('WVHT')))
    ]


def calculate_daily_readings(entries):
    """
    Group entries by day and find the highest values for each day.
    Temperatures use max values, wave height uses average.
    Returns a dict keyed by dayKey.
    """

    def to_float(value):
        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    daily_readings = {}

    for entry in entries:
        day_key = entry.get('dayKey')
        if not day_key:
            continue

        if day_key not in daily_readings:
            daily_readings[day_key] = {
                'dayKey': day_key,
                'timestamp': entry.get('isoTimestamp'),
                'airTemps': [],
                'waterTemps': [],
                'waveHeights': []
            }

        air = to_float(entry.get('ATMP'))
        if air is not None:
            daily_readings[day_key]['airTemps'].append(air)

        water = to_float(entry.get('WTMP'))
        if water is not None:
            daily_readings[day_key]['waterTemps'].append(water)

        wave = to_float(entry.get('WVHT'))
        if wave is not None:
            daily_readings[day_key]['waveHeights'].append(wave)

    # Reduce with NumPy
    for entry in daily_readings.values():
        entry['airTemp'] = (
            float(np.max(entry['airTemps']))
            if entry['airTemps'] else None
        )

        entry['waterTemp'] = (
            float(np.max(entry['waterTemps']))
            if entry['waterTemps'] else None
        )

        entry['waveHeight'] = (
            float(np.mean(entry['waveHeights']))
            if entry['waveHeights'] else None
        )

        del entry['airTemps']
        del entry['waterTemps']
        del entry['waveHeights']

    return daily_readings


def format_chart_data(daily_readings):
    """
    Convert daily highs dict to sorted list for charting.
    Converts temperatures from Celsius to Fahrenheit.
    Converts wave height from meters to feet.
    """
    chart_data = []
    
    for day_key in sorted(daily_readings.keys()):
        entry = daily_readings[day_key]
        
        chart_entry = {
            'dayKey': entry['dayKey'],
            'timestamp': entry['timestamp'],
            'airTemp': celsius_to_fahrenheit(entry['airTemp']),
            'waterTemp': celsius_to_fahrenheit(entry['waterTemp']),
            'waveHeight': meters_to_feet(entry['waveHeight'])
        }
        
        chart_data.append(chart_entry)
    
    return chart_data


def celsius_to_fahrenheit(celsius):
    """
    Convert Celsius to Fahrenheit for historical data.
    Returns None if input is None (for Recharts compatibility).
    """
    if celsius is None:
        return None
    try:
        return round((celsius * 9/5 + 32) * 10) / 10
    except (ValueError, TypeError):
        return None


def meters_to_feet(meters):
    """
    Convert meters to feet for historical data.
    Returns None if input is None (for Recharts compatibility).
    """
    if meters is None:
        return None
    try:
        return round(meters * 3.28084 * 10) / 10
    except (ValueError, TypeError):
        return None
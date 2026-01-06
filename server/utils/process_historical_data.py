def parse_historical_data(text):
    """
    Orchestrator function for historical data processing.
    Parses raw NOAA data and returns daily highs for charting.
    """
    entries = parse_raw_entries(text)
    valid_entries = filter_valid_entries(entries)
    daily_highs = calculate_daily_highs(valid_entries)
    chart_data = format_chart_data(daily_highs)
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


def calculate_daily_highs(entries):
    """
    Group entries by day and find the highest values for each day.
    Temperatures and wave heights remain in original units during this step.
    Returns a dict keyed by dayKey.
    """
    def parse_value(value):
        """Parse numeric value, return None if invalid"""
        if value is None or value == 'MM':
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None
    
    daily_highs = {}
    
    for entry in entries:
        day_key = entry.get('dayKey')
        if not day_key:
            continue
        
        air_temp = parse_value(entry.get('ATMP'))
        water_temp = parse_value(entry.get('WTMP'))
        wave_height = parse_value(entry.get('WVHT'))
        
        if day_key not in daily_highs:
            daily_highs[day_key] = {
                'dayKey': day_key,
                'timestamp': entry.get('isoTimestamp'),
                'airTemp': air_temp,
                'waterTemp': water_temp,
                'waveHeight': wave_height
            }
        else:
            current = daily_highs[day_key]
            
            if air_temp is not None:
                if current['airTemp'] is None or air_temp > current['airTemp']:
                    current['airTemp'] = air_temp
            
            if water_temp is not None:
                if current['waterTemp'] is None or water_temp > current['waterTemp']:
                    current['waterTemp'] = water_temp
            
            if wave_height is not None:
                if current['waveHeight'] is None or wave_height > current['waveHeight']:
                    current['waveHeight'] = wave_height
    
    return daily_highs


def format_chart_data(daily_highs):
    """
    Convert daily highs dict to sorted list for charting.
    Converts temperatures from Celsius to Fahrenheit.
    Converts wave height from meters to feet.
    """
    chart_data = []
    
    for day_key in sorted(daily_highs.keys()):
        entry = daily_highs[day_key]
        
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
from datetime import datetime 


# ==================== Real-Time Data Processing ====================

def parse_real_time_data(text):
    """Parse NOAA real-time text data into structured format with unit conversions"""
    lines = text.strip().split('\n')
    
    if len(lines) < 2:
        return []
    
    headers = lines[0].split()
    data_lines = lines[1:]
    
    parsed_entries = []
    
    for line in data_lines:
        values = line.split()
        
        if len(values) != len(headers):
            continue
        
        entry = dict(zip(headers, values))
        
        # Add formatted timestamp fields
        if all(key in entry for key in ['YY', 'MM', 'DD', 'hh', 'mm']):
            try:
                year = f"20{entry['YY']}" if len(entry['YY']) == 2 else entry['YY']
                
                iso_date = f"{year}-{entry['MM'].zfill(2)}-{entry['DD'].zfill(2)}T{entry['hh'].zfill(2)}:{entry['mm'].zfill(2)}:00Z"
                
                timestamp = datetime.strptime(iso_date, '%Y-%m-%dT%H:%M:%SZ')
                
                entry['timestamp'] = timestamp.isoformat()
                entry['isoTimestamp'] = iso_date
                entry['displayTimestamp'] = f"{entry['MM']}/{entry['DD']}/{year} {entry['hh']}:{entry['mm']} UTC"
            except (ValueError, KeyError):
                pass
        
        # Apply Unit Conversions
        if 'ATMP' in entry:
            entry['ATMP'] = celsius_to_fahrenheit(entry['ATMP'])
        
        if 'WTMP' in entry:
            entry['WTMP'] = celsius_to_fahrenheit(entry['WTMP'])
        
        if 'WVHT' in entry:
            entry['WVHT'] = meters_to_feet(entry['WVHT'])
        
        if 'WSPD' in entry:
            entry['WSPD'] = mps_to_mph(entry['WSPD'])
        
        if 'GST' in entry:
            entry['GST'] = mps_to_mph(entry['GST'])
        
        if 'WDIR' in entry:
            entry['WDIR'] = map_degrees_to_direction(entry['WDIR'])
        
        parsed_entries.append(entry)
    
    return parsed_entries


# ==================== Historical Data Processing ====================

def parse_historical_data(text):
    """
    Orchestrator function for historical data processing.
    Parses raw NOAA data and returns daily high temperatures for charting.
    """
    entries = parse_raw_entries(text)
    valid_entries = filter_valid_temperature_entries(entries)
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


def filter_valid_temperature_entries(entries):
    """
    Filter entries to only include those with at least one valid temperature reading.
    Valid means: exists, not 'MM', and is a valid number.
    """
    def is_valid_temp(value):
        if value is None or value == 'MM':
            return False
        try:
            float(value)
            return True
        except (ValueError, TypeError):
            return False
    
    return [
        entry for entry in entries
        if is_valid_temp(entry.get('ATMP')) or is_valid_temp(entry.get('WTMP'))
    ]


def calculate_daily_highs(entries):
    """
    Group entries by day and find the highest temperature for each day.
    Temperatures remain in Celsius during this step.
    Returns a dict keyed by dayKey.
    """
    def parse_temp(value):
        """Parse temperature value, return None if invalid"""
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
        
        air_temp = parse_temp(entry.get('ATMP'))
        water_temp = parse_temp(entry.get('WTMP'))
        
        if day_key not in daily_highs:
            daily_highs[day_key] = {
                'dayKey': day_key,
                'timestamp': entry.get('isoTimestamp'),
                'airTemp': air_temp,
                'waterTemp': water_temp
            }
        else:
            current = daily_highs[day_key]
            
            if air_temp is not None:
                if current['airTemp'] is None or air_temp > current['airTemp']:
                    current['airTemp'] = air_temp
            
            if water_temp is not None:
                if current['waterTemp'] is None or water_temp > current['waterTemp']:
                    current['waterTemp'] = water_temp
    
    return daily_highs


def format_chart_data(daily_highs):
    """
    Convert daily highs dict to sorted list for charting.
    Converts temperatures from Celsius to Fahrenheit.
    """
    chart_data = []
    
    for day_key in sorted(daily_highs.keys()):
        entry = daily_highs[day_key]
        
        chart_entry = {
            'dayKey': entry['dayKey'],
            'timestamp': entry['timestamp'],
            'airTemp': celsius_to_fahrenheit_or_null(entry['airTemp']),
            'waterTemp': celsius_to_fahrenheit_or_null(entry['waterTemp'])
        }
        
        chart_data.append(chart_entry)
    
    return chart_data


def celsius_to_fahrenheit_or_null(celsius):
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


# ==================== Unit Conversions (Real-Time) ====================

def celsius_to_fahrenheit(celsius):
    """Convert Celsius to Fahrenheit"""
    try:
        temp = float(celsius)
        return round((temp * 9/5 + 32) * 10) / 10
    except (ValueError, TypeError):
        return 'Not Reported'


def meters_to_feet(meters):
    """Convert meters to feet"""
    try:
        distance = float(meters)
        return round(distance * 3.28084 * 10) / 10
    except (ValueError, TypeError):
        return 'Not Reported'


def mps_to_mph(mps):
    """Convert meters per second to miles per hour"""
    try:
        speed = float(mps)
        return round(speed * 2.237 * 10) / 10
    except (ValueError, TypeError):
        return 'Not Reported'


def map_degrees_to_direction(degrees):
    """Map degrees to compass direction"""
    try:
        degrees = float(degrees)
        degrees = degrees % 360
        
        if degrees < 22.5 or degrees >= 337.5:
            return 'North'
        elif degrees < 67.5:
            return 'Northeast'
        elif degrees < 112.5:
            return 'East'
        elif degrees < 157.5:
            return 'Southeast'
        elif degrees < 202.5:
            return 'South'
        elif degrees < 247.5:
            return 'Southwest'
        elif degrees < 292.5:
            return 'West'
        else:
            return 'Northwest'
    except (ValueError, TypeError):
        return 'Not Reported'
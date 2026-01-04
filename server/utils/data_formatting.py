from datetime import datetime 


def parse_text_data(text):
    """Parse NOAA text data into structured format"""
    lines = text.strip().split('\n')
    
    if len(lines) < 2:
        return []
    
    headers = lines[0].split()
    data_lines = lines[1:]  # Skip header line
    
    parsed_entries = []
    
    for line in data_lines:
        values = line.split()
        
        if len(values) != len(headers):
            continue  # Skip malformed lines
        
        entry = dict(zip(headers, values))
        
        # Add formatted timestamp fields
        if all(key in entry for key in ['YY', 'MM', 'DD', 'hh', 'mm']):
            try:
                # Handle both 2-digit and 4-digit years
                year = f"20{entry['YY']}" if len(entry['YY']) == 2 else entry['YY']
                
                # Create ISO timestamp
                iso_date = f"{year}-{entry['MM'].zfill(2)}-{entry['DD'].zfill(2)}T{entry['hh'].zfill(2)}:{entry['mm'].zfill(2)}:00Z"
                
                # Parse to datetime object
                timestamp = datetime.strptime(iso_date, '%Y-%m-%dT%H:%M:%SZ')
                
                entry['timestamp'] = timestamp.isoformat()
                entry['isoTimestamp'] = iso_date
                entry['displayTimestamp'] = f"{entry['MM']}/{entry['DD']}/{year} {entry['hh']}:{entry['mm']} UTC"
            except (ValueError, KeyError):
                pass  # Skip timestamp formatting if parsing fails
            
        
        # Apply Unit Converions
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


# Unit Conversions
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
        # Normalize degrees to 0-360 range
        degrees = degrees % 360
        
        # Map degrees to compass directions
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
    

// utils/noaaUnitConverter.js

function celsiusToFahrenheit(celsius){
  const temp = parseFloat(celsius);
  return isNaN(temp) ? 'Not Reported' : Math.round((temp * 9/5 + 32) * 10) / 10;
};

function metersToFeet (meters){
  const distance = parseFloat(meters);
  return isNaN(distance) ? 'Not Reported' : Math.round(distance * 3.28084 * 10) / 10;
};

function mpsToMph (mps) {
  const speed = parseFloat(mps);
  return isNaN(speed) ? 'Not Reported' : Math.round(speed * 2.237 * 10) / 10;
};


function mapDegreesToDirection(degrees) {
    // Handle null/undefined cases
    if (isNaN(degrees)) {
        return 'Not Reported';
    }
    
    // Normalize degrees to 0-360 range
    degrees = degrees % 360;
    
    // Map degrees to compass directions
    if (degrees < 22.5 || degrees >= 337.5) {
        return 'North';
    } else if (degrees < 67.5) {
        return 'Northeast';
    } else if (degrees < 112.5) {
        return 'East';
    } else if (degrees < 157.5) {
        return 'Southeast';
    } else if (degrees < 202.5) {
        return 'South';
    } else if (degrees < 247.5) {
        return 'Southwest';
    } else if (degrees < 292.5) {
        return 'West';
    } else {
        return 'Northwest';
    }
}


// Assign to a named variable before exporting 
const helpers = {
  celsiusToFahrenheit,
  metersToFeet,
  mpsToMph,
  mapDegreesToDirection
}

export default helpers;
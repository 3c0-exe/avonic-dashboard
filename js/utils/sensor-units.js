// utils/sensor-units.js - Sensor Unit Mappings

/**
 * Get the unit symbol for a given sensor type
 * @param {string} sensorName - Name of the sensor
 * @returns {string} Unit symbol (e.g., '°C', '%', 'ppm')
 */
function getSensorUnit(sensorName) {
  const units = {
    'Soil Moisture': '%',
    'Temperature': '°C',
    'Humidity': '%',
    'Gas Levels': 'ppm',
    'DS18B20 Temp': '°C'
  };
  return units[sensorName] || '';
}

/**
 * Sensor path mapping for data extraction
 * Maps user-friendly sensor names to data structure paths
 */
const SENSOR_PATH_MAP = {
  'Soil Moisture': 'soil',
  'Temperature': 'temp',
  'Humidity': 'humidity',
  'Gas Levels': 'gas',
  'DS18B20 Temp': 'ds18b20'
};

/**
 * Get sensor path for a given bin and sensor name
 * @param {number} binNumber - Bin number (1 or 2)
 * @param {string} sensorName - Sensor name
 * @returns {string} Path like 'bin1.temp'
 */
function getSensorPath(binNumber, sensorName) {
  const field = SENSOR_PATH_MAP[sensorName];
  return field ? `bin${binNumber}.${field}` : null;
}

console.log('✅ Sensor units & mappings loaded');
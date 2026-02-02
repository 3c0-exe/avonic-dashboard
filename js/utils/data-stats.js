// utils/data-stats.js - Statistical Calculations

/**
 * Calculate min, average, and max from array of values
 * @param {Array<number>} values - Array of numeric values
 * @returns {Object} { min, avg, max }
 */
function calculateStats(values) {
  const filtered = values.filter(v => v != null && !isNaN(v));
  if (filtered.length === 0) return { min: 0, avg: 0, max: 0 };
  
  return {
    min: Math.min(...filtered),
    avg: (filtered.reduce((a, b) => a + b, 0) / filtered.length).toFixed(1),
    max: Math.max(...filtered)
  };
}

/**
 * Group readings by date and calculate daily stats
 * @param {Array<Object>} readings - Array of sensor readings with timestamps
 * @param {string} sensorPath - Dot notation path to sensor value (e.g., 'bin1.temp')
 * @returns {Object} { 'date': avgValue, ... }
 */
function groupByDate(readings, sensorPath) {
  const grouped = {};
  
  readings.forEach(reading => {
    const date = new Date(reading.timestamp).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric'
    });
    
    // Navigate nested object using dot notation
    const value = sensorPath.split('.').reduce((obj, key) => obj?.[key], reading);
    
    if (value != null && !isNaN(value)) {
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(value);
    }
  });
  
  // Calculate daily averages
  const dailyAverages = {};
  Object.keys(grouped).forEach(date => {
    const stats = calculateStats(grouped[date]);
    dailyAverages[date] = parseFloat(stats.avg);
  });
  
  return dailyAverages;
}

console.log('✅ Data statistics utilities loaded');
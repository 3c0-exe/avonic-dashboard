// utils/dummy-data.js - Dummy Data Generator

/**
 * Generate dummy sensor data for testing
 * @param {Object} config - Sensor configuration with minValue, maxValue
 * @returns {Object} { labels, values } for chart
 */
function generateDummyData(config) {
    const labels = [];
    const values = [];
    const today = new Date();
    
    // Generate 7 days of data
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        labels.push(`${month}/${day}`);
        
        // Random value within range
        const randomValue = Math.floor(Math.random() * (config.maxValue - config.minValue + 1)) + config.minValue;
        values.push(randomValue);
    }
    
    return { labels, values };
}

console.log('✅ Dummy data generator loaded');
// ========================================
// QUICK INSIGHTS - STATISTICS CALCULATOR
// js/insights/stats-calculator.js
// ========================================

/**
 * Calculate min, max, and average from array of values
 * @param {number[]} values - Array of numeric values
 * @returns {Object} { min, max, avg }
 */
function calculateStats(values) {
    if (!values || values.length === 0) {
        return { min: 0, max: 0, avg: 0 };
    }
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    
    return {
        min: min.toFixed(1),
        max: max.toFixed(1),
        avg: avg.toFixed(1)
    };
}

/**
 * Determine status and CSS class for a sensor reading
 * @param {number} value - Sensor value
 * @param {string} sensorType - Type of sensor (temperature, soilMoisture, etc.)
 * @returns {Object} { status, statusClass }
 */
function determineStatus(value, sensorType) {
    let status = 'Normal';
    let statusClass = '';
    
    switch (sensorType) {
        case 'temperature':
            if (value < 15 || value > 35) {
                status = 'Critical';
                statusClass = 'status-high';
            } else if (value < 20 || value > 30) {
                status = 'Warning';
                statusClass = 'status-low';
            }
            break;
            
        case 'soilMoisture':
            if (value < 40) {
                status = 'Dry';
                statusClass = 'status-low';
            } else if (value > 80) {
                status = 'Wet';
                statusClass = 'status-high';
            }
            break;
            
        case 'humidity':
            if (value < 30) {
                status = 'Low';
                statusClass = 'status-low';
            } else if (value > 80) {
                status = 'High';
                statusClass = 'status-high';
            }
            break;
            
        case 'gasLevels':
            if (value > 200) {
                status = 'Critical';
                statusClass = 'status-high';
            } else if (value > 100) {
                status = 'High';
                statusClass = 'status-high';
            }
            break;
    }
    
    return { status, statusClass };
}

/**
 * Format timestamp into readable time and date strings
 * @param {Date|string} timestamp - Reading timestamp
 * @returns {Object} { timeStr, dateStr }
 */
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    const timeStr = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
    });
    
    const dateStr = daysDiff > 1 
        ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
        : '';
    
    return { timeStr, dateStr };
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.QI_StatsCalculator = {
        calculateStats,
        determineStatus,
        formatTimestamp
    };
}

console.log('✅ Quick Insights stats calculator loaded');
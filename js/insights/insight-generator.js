// ========================================
// QUICK INSIGHTS - INSIGHT GENERATOR
// js/insights/insight-generator.js
// ========================================

/**
 * Generate contextual insight message based on sensor values
 * @param {number[]} values - Array of sensor values
 * @param {string} sensorType - Type of sensor
 * @returns {string} Insight message
 */
function generateRealInsight(values, sensorType) {
    if (!values || values.length === 0) {
        return "No data available.";
    }
    
    const avgVal = values.reduce((a, b) => a + b, 0) / values.length;
    
    switch (sensorType) {
        case 'soilMoisture':
            if (avgVal < 50) return "Soil moisture is low. Consider watering.";
            if (avgVal > 80) return "Soil moisture is high. Good hydration.";
            return "Soil moisture is optimal for composting.";
            
        case 'temperature':
            if (avgVal > 30) return "Temperature is elevated. Check ventilation.";
            if (avgVal < 20) return "Temperature is low. Composting may be slow.";
            return "Temperature is in the optimal range.";
            
        case 'humidity':
            if (avgVal < 50) return "Humidity is low. Consider adding moisture.";
            if (avgVal > 80) return "Humidity is high. Monitor for excess moisture.";
            return "Humidity levels are stable.";
            
        case 'gasLevels':
            if (avgVal > 100) return "Gas levels elevated. Check ventilation.";
            return "Gas levels are normal.";
            
        default:
            return "Readings appear stable.";
    }
}

/**
 * Update insight display element with message and styling
 * @param {HTMLElement} element - Insight text element
 * @param {string} message - Insight message
 * @param {boolean} isRealData - Whether data is from API or demo
 */
function updateInsightDisplay(element, message, isRealData = true) {
    if (!element) return;
    
    if (isRealData) {
        element.textContent = message + ' ✅ Recent Data';
        element.style.color = '#4CAF50';
    } else {
        element.textContent = '📊 Demo Data (No live readings yet)';
        element.style.color = '#FF9800';
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.QI_InsightGenerator = {
        generateRealInsight,
        updateInsightDisplay
    };
}

console.log('✅ Quick Insights insight generator loaded');
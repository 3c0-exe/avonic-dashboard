// ========================================
// BIN FLUCTUATIONS - INSIGHTS GENERATOR
// js/fluctuations/insights-generator.js
// ========================================

/**
 * Generate insight message based on sensor data
 * @param {string} sensorType - Sensor type
 * @param {Object} stats - Statistics object with avg value
 * @returns {string} Insight message
 */
function generateInsightMessage(sensorType, stats) {
    if (!stats) {
        return 'No data available';
    }

    const avgVal = parseFloat(stats.avg);
    let insightText = '';

    switch(sensorType) {
        case 'temperature':
            if (avgVal < 15) {
                insightText = '❄️ Temperature is very low. Composting activity may be minimal.';
            } else if (avgVal < 20) {
                insightText = '🌡️ Temperature is below optimal. Consider adding more materials.';
            } else if (avgVal <= 30) {
                insightText = '✅ Temperature is in the optimal range for composting.';
            } else if (avgVal <= 35) {
                insightText = '⚠️ Temperature is elevated. Monitor closely.';
            } else {
                insightText = '🔥 Temperature is too high! Improve ventilation immediately.';
            }
            break;

        case 'soilMoisture':
            if (avgVal < 40) {
                insightText = '💧 Soil is too dry. Add water to maintain moisture.';
            } else if (avgVal <= 60) {
                insightText = '✅ Soil moisture is optimal for vermicomposting.';
            } else if (avgVal <= 80) {
                insightText = '⚠️ Soil moisture is high. Monitor drainage.';
            } else {
                insightText = '💦 Soil is oversaturated! Reduce watering and improve drainage.';
            }
            break;

        case 'humidity':
            if (avgVal < 30) {
                insightText = '🏜️ Humidity is very low. Consider adding moisture.';
            } else if (avgVal <= 60) {
                insightText = '✅ Humidity levels are ideal for composting.';
            } else if (avgVal <= 80) {
                insightText = '⚠️ Humidity is elevated. Ensure proper ventilation.';
            } else {
                insightText = '💨 Humidity is too high! Increase airflow.';
            }
            break;

        case 'gasLevels':
            if (avgVal < 50) {
                insightText = '✅ Gas levels are normal. Composting is healthy.';
            } else if (avgVal <= 100) {
                insightText = '⚠️ Gas levels are elevated. Check for anaerobic conditions.';
            } else if (avgVal <= 200) {
                insightText = '🚨 Gas levels are high! Improve ventilation.';
            } else {
                insightText = '☠️ Gas levels are critical! Immediate action required.';
            }
            break;

        default:
            insightText = 'Monitoring sensor data...';
    }

    return insightText;
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.BF_InsightsGenerator = {
        generateInsightMessage
    };
}

console.log('✅ Bin Fluctuations insights generator loaded');
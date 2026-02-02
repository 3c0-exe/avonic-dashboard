// ========================================
// BIN FLUCTUATIONS - UI UPDATER
// js/fluctuations/ui-updater.js
// ========================================

/**
 * Update sensor UI elements with statistics
 * @param {string} sensorType - Sensor type
 * @param {Object} stats - Statistics object
 * @param {Object} config - Sensor configuration
 */
function updateSensorUI(sensorType, stats, config) {
    const sensorSection = document.querySelector(`.dashboard-section[data-sensor="${sensorType}"]`);
    
    if (!sensorSection) {
        console.warn(`⚠️ Could not find dashboard section for ${sensorType}`);
        return;
    }

    // If no data, show placeholder
    if (!stats) {
        const avgValueEl = sensorSection.querySelector('.dashboard-average-value');
        if (avgValueEl) {
            avgValueEl.textContent = '--';
        }
        return;
    }

    // Update average value
    const avgValueEl = sensorSection.querySelector('.dashboard-average-value');
    const avgUnitEl = sensorSection.querySelector('.dashboard-average-unit');
    
    if (avgValueEl) {
        avgValueEl.textContent = stats.avg;
    }
    if (avgUnitEl) {
        avgUnitEl.textContent = config.unit;
    }

    console.log(`✅ Updated ${config.label}: Avg=${stats.avg}${config.unit}, Min=${stats.min}, Max=${stats.max}`);
}

/**
 * Show loading state for all sensors
 */
function showLoadingState() {
    const allSections = document.querySelectorAll('.dashboard-section[data-sensor]');
    allSections.forEach(section => {
        const avgValueEl = section.querySelector('.dashboard-average-value');
        const insightsEl = section.querySelector('.dashboard-insights-content');
        
        if (avgValueEl) {
            avgValueEl.textContent = '--';
        }
        if (insightsEl) {
            insightsEl.textContent = '⏳ Loading data...';
            insightsEl.style.color = '';
        }
    });
}

/**
 * Show error state for all sensors
 * @param {string} errorMessage - Error message to display
 */
function showErrorState(errorMessage) {
    const allSections = document.querySelectorAll('.dashboard-section[data-sensor]');
    allSections.forEach(section => {
        const insightsEl = section.querySelector('.dashboard-insights-content');
        if (insightsEl) {
            insightsEl.textContent = `⚠️ ${errorMessage}`;
            insightsEl.style.color = '#D32F2F';
        }
    });
}

/**
 * Update insights text for a sensor
 * @param {string} sensorType - Sensor type
 * @param {string} insightText - Insight message
 */
function updateInsightsText(sensorType, insightText) {
    const sensorSection = document.querySelector(`.dashboard-section[data-sensor="${sensorType}"]`);
    if (!sensorSection) return;

    const insightsEl = sensorSection.querySelector('.dashboard-insights-content');
    if (!insightsEl) return;

    insightsEl.textContent = insightText;
    insightsEl.style.color = ''; // Reset color
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.BF_UIUpdater = {
        updateSensorUI,
        showLoadingState,
        showErrorState,
        updateInsightsText
    };
}

console.log('✅ Bin Fluctuations UI updater loaded');
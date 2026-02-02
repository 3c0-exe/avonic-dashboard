// ========================================
// QUICK INSIGHTS - TABLE RENDERER
// js/insights/table-renderer.js
// ========================================

/**
 * Render fluctuations table with real API data
 * @param {Array} processedReadings - Array of {value, timestamp, sensorType}
 * @param {string} sensorType - Type of sensor
 * @param {Object} config - Sensor configuration
 * @returns {string} HTML string for table rows
 */
function renderRealDataTable(processedReadings, sensorType, config) {
    const rowsHTML = processedReadings.map(reading => {
        const { value, timestamp } = reading;
        
        // Format timestamp
        const { timeStr, dateStr } = window.QI_StatsCalculator.formatTimestamp(timestamp);
        
        // Determine status
        const { status, statusClass } = window.QI_StatsCalculator.determineStatus(value, sensorType);
        
        return `
            <tr class="${statusClass}">
                <td>${dateStr ? `${dateStr} ` : ''}${timeStr}</td>
                <td>${value.toFixed(1)}${config.unit}</td>
                <td>${status}</td>
            </tr>
        `;
    }).join('');
    
    return rowsHTML;
}

/**
 * Render fluctuations table with dummy data (fallback)
 * @param {Array} dummyReadings - Dummy data readings
 * @param {Object} config - Sensor configuration
 * @returns {string} HTML string for table rows
 */
function renderDummyDataTable(dummyReadings, config) {
    const rowsHTML = dummyReadings.map(reading => {
        let statusClass = '';
        if (reading.status === 'High' || reading.status === 'Critical') {
            statusClass = 'status-high';
        } else if (reading.status === 'Low' || reading.status === 'Dry') {
            statusClass = 'status-low';
        }
        
        return `
            <tr class="${statusClass}">
                <td>${reading.time}</td>
                <td>${reading.value}${config.unit}</td>
                <td>${reading.status}</td>
            </tr>
        `;
    }).join('');
    
    return rowsHTML;
}

/**
 * Update statistics display (min, max, avg)
 * @param {Object} stats - { min, max, avg }
 * @param {string} unit - Unit symbol
 */
function updateStatisticsDisplay(stats, unit) {
    const minEl = document.getElementById('qi-min-value');
    const maxEl = document.getElementById('qi-max-value');
    const avgEl = document.getElementById('qi-avg-value');
    
    if (minEl) minEl.textContent = stats.min;
    if (maxEl) maxEl.textContent = stats.max;
    if (avgEl) avgEl.textContent = stats.avg;
    
    // Update units
    const minUnit = document.getElementById('qi-min-unit');
    const avgUnit = document.getElementById('qi-avg-unit');
    const maxUnit = document.getElementById('qi-max-unit');
    
    if (minUnit) minUnit.textContent = unit;
    if (avgUnit) avgUnit.textContent = unit;
    if (maxUnit) maxUnit.textContent = unit;
}

/**
 * Show loading state in table
 */
function showLoadingState() {
    const tableBody = document.getElementById('qi-table-body');
    if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px;">⏳ Loading...</td></tr>';
    }
    
    const insightEl = document.getElementById('qi-insight-text');
    if (insightEl) {
        insightEl.textContent = 'Fetching latest data...';
    }
}

/**
 * Update date and time display
 */
function updateDateTime() {
    const now = new Date();
    const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', dateOptions);
    
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const timeStr = `${displayHours}:${minutes.toString().padStart(2, '0')}${ampm}`;
    
    const dateEl = document.getElementById('qi-current-date');
    const timeEl = document.getElementById('qi-last-updated');
    
    if (dateEl) dateEl.textContent = dateStr;
    if (timeEl) timeEl.textContent = timeStr;
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.QI_TableRenderer = {
        renderRealDataTable,
        renderDummyDataTable,
        updateStatisticsDisplay,
        showLoadingState,
        updateDateTime
    };
}

console.log('✅ Quick Insights table renderer loaded');
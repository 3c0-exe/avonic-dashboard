// ========================================
// QUICK INSIGHTS - TAB HANDLER
// js/insights/tab-handler.js
// ========================================

/**
 * Handle sensor tab clicks
 * @param {Event} event - Click event
 * @param {Function} updateCallback - Callback to trigger data update
 * @returns {string} Selected sensor type
 */
function handleSensorTabClick(event, updateCallback) {
    const clickedTab = event.currentTarget;
    const sensor = clickedTab.dataset.sensor;
    
    if (!sensor) return null;
    
    // Remove active class from all tabs
    document.querySelectorAll('.qi-sensor-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Add active class to clicked tab
    clickedTab.classList.add('active');
    
    // Trigger update callback if provided
    if (updateCallback) {
        updateCallback(sensor);
    }
    
    return sensor;
}

/**
 * Handle bin dropdown change
 * @param {Event} event - Change event
 * @param {Function} updateCallback - Callback to trigger data update
 * @returns {string} Selected bin number
 */
function handleBinChange(event, updateCallback) {
    const selectedBin = event.target.value;
    
    console.log(`🔄 Bin changed to: ${selectedBin}`);
    
    // Trigger update callback if provided
    if (updateCallback) {
        updateCallback(selectedBin);
    }
    
    return selectedBin;
}

/**
 * Handle tab switcher (Quick Insights ↔ Bin Fluctuations)
 * @param {Event} event - Click event
 */
function handleTabSwitch(event) {
    const clickedBtn = event.currentTarget;
    const targetTab = clickedBtn.dataset.tab;
    
    // Remove active class from all buttons
    document.querySelectorAll('.dashboard-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    clickedBtn.classList.add('active');
    
    // Show/hide content
    const quickInsights = document.getElementById('quickInsightsContent');
    const binFluctuations = document.getElementById('binFluctuationsContent');
    
    if (targetTab === 'quick-insights') {
        if (quickInsights) {
            quickInsights.classList.add('active');
            quickInsights.style.display = '';
        }
        if (binFluctuations) {
            binFluctuations.classList.remove('active');
            binFluctuations.style.display = 'none';
        }
    } else {
        if (quickInsights) {
            quickInsights.classList.remove('active');
            quickInsights.style.display = 'none';
        }
        if (binFluctuations) {
            binFluctuations.classList.add('active');
            binFluctuations.style.display = '';
        }
    }

    // Show/hide bin fluctuations nav bar
    const nav = document.getElementById('binFluctuationsNav');
    if (nav) {
        if (targetTab === 'bin-fluctuations') {
            nav.classList.add('active');
            nav.style.display = 'grid';
        } else {
            nav.classList.remove('active');
            nav.style.display = 'none';
        }
    }
    
    console.log(`✅ Switched to: ${targetTab}`);
}

/**
 * Setup all event listeners for Quick Insights
 * @param {Object} callbacks - { onSensorChange, onBinChange }
 */
function setupEventListeners(callbacks) {
    // Tab switcher (Quick Insights ↔ Bin Fluctuations)
    document.querySelectorAll('.dashboard-tab-btn').forEach(btn => {
        btn.addEventListener('click', handleTabSwitch);
    });
    
    // Sensor tabs
    document.querySelectorAll('.qi-sensor-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            handleSensorTabClick(e, callbacks.onSensorChange);
        });
    });
    
    // Bin selector dropdown
    const binDropdown = document.getElementById('qi-bin-dropdown');
    if (binDropdown) {
        binDropdown.addEventListener('change', (e) => {
            handleBinChange(e, callbacks.onBinChange);
        });
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.QI_TabHandler = {
        handleSensorTabClick,
        handleBinChange,
        handleTabSwitch,
        setupEventListeners
    };
}

console.log('✅ Quick Insights tab handler loaded');
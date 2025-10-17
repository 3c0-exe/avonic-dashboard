// AVONIC Data Integration
// Fetches sensor data from ESP32 and updates UI components

// Configuration
const DATA_ENDPOINT = '/data';
const POLL_INTERVAL = 2000; // 2 seconds

// Global data store
let sensorData = null;
let lastUpdateTime = null;

// Fetch data from ESP32
async function fetchSensorData() {
    try {
        const response = await fetch(DATA_ENDPOINT);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        sensorData = await response.json();
        lastUpdateTime = new Date();
        updateUI();
        console.log('✅ Data updated:', sensorData);
    } catch (error) {
        console.error('❌ Error fetching sensor data:', error);
    }
}

// Update all UI components with new data
// Update all UI components with new data
// Update all UI components with new data
function updateUI() {
    if (!sensorData) return;

    // ✅ Update HOME PAGE cards (no binId) - these should always update
    updateSensorCard('Battery', sensorData.battery_percent || 0, null);
    updateSensorCard('Water', calculateWaterLevel(sensorData.ultrasonic), null);
    updateSensorCard('Water Temp', sensorData.ds18b20_temp, null);

    // ✅ Update BIN 1 sensors (binId = 1)
    updateSensorCard('Soil Moisture', sensorData.soil1_percent, 1);
    updateSensorCard('Temperature', sensorData.temp1, 1);
    updateSensorCard('Humidity', sensorData.hum1, 1);
    updateSensorCard('Gas Level', sensorData.gas1_ppm, 1);

    // ✅ Update BIN 2 sensors (binId = 2)
    updateSensorCard('Soil Moisture', sensorData.soil2_percent, 2);
    updateSensorCard('Temperature', sensorData.temp2, 2);
    updateSensorCard('Humidity', sensorData.hum2, 2);
    updateSensorCard('Gas Level', sensorData.gas2_ppm, 2);

    // Update time stamp
    updateTimeStamp();

    // Update connection status
    console.log(`📡 WiFi: ${sensorData.wifi_connected}, MQTT: ${sensorData.mqtt_connected}`);
}

// Update individual sensor card by finding it and calling setCardValue
function updateSensorCard(label, value, binId = null) {
    const cards = document.querySelectorAll('status-card');
    
    cards.forEach(card => {
        const cardLabel = card.getAttribute('dataLabel');
        const cardBinId = card.getAttribute('binId');
        
        // ✅ FIXED LOGIC:
        // If we're updating a specific bin (binId is 1 or 2)
        if (binId !== null) {
            // Skip cards that don't match this bin
            if (!cardBinId || cardBinId !== String(binId)) {
                return;
            }
        } else {
            // If we're updating home page cards (binId is null)
            // Skip cards that belong to bins
            if (cardBinId) {
                return;
            }
        }
        
        if (cardLabel === label) {
            const cardStats = card.querySelector('.card_stats');
            if (cardStats && typeof setCardValue === 'function') {
                // Check if value is valid, otherwise show "--"
                if (value === null || value === undefined || value === -1 || isNaN(value)) {
                    const valueElem = cardStats.querySelector('.card_value');
                    const unitElem = cardStats.querySelector('.card_unit');
                    if (valueElem) valueElem.textContent = '--';
                    if (unitElem) unitElem.textContent = '';
                } else {
                    setCardValue(cardStats, value);
                }
            }
        }
    });
}

// Calculate water level percentage from ultrasonic sensor
function calculateWaterLevel(distance) {
    if (distance === -1 || distance === null) return 0; // Sensor error
    
    // Tank configuration (adjust based on your actual tank)
    const EMPTY_DISTANCE = 30; // cm - distance when tank is empty
    const FULL_DISTANCE = 5;   // cm - distance when tank is full
    
    if (distance >= EMPTY_DISTANCE) return 0;
    if (distance <= FULL_DISTANCE) return 100;
    
    const percentage = ((EMPTY_DISTANCE - distance) / (EMPTY_DISTANCE - FULL_DISTANCE)) * 100;
    return Math.max(0, Math.min(100, percentage));
}

// Update "Updated X seconds ago" timestamp
function updateTimeStamp() {
    if (!lastUpdateTime) return;
    
    const now = new Date();
    const secondsAgo = Math.floor((now - lastUpdateTime) / 1000);
    
    const timeElement = document.querySelector('.time-updated');
    if (timeElement) {
        timeElement.textContent = `Updated ${secondsAgo}s ago`;
    }
}

// Refresh button handler
function setupRefreshButton() {
    const refreshButtons = document.querySelectorAll('.refresh-sensors');
    refreshButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('🔄 Manual refresh triggered');
            fetchSensorData();
            
            // Visual feedback
            button.style.opacity = '0.5';
            setTimeout(() => {
                button.style.opacity = '1';
            }, 300);
        });
    });
}

// Initialize data polling
function startDataPolling() {
    console.log('🚀 Starting data polling every 2 seconds...');
    fetchSensorData(); // Fetch immediately
    setInterval(fetchSensorData, POLL_INTERVAL); // Then poll every 2 seconds
}

// Wait for both DOM and the setCardValue function to be available
function initializeWhenReady() {
    // Check if main_components.js has loaded and defined setCardValue
    if (typeof setCardValue === 'function') {
        console.log('✅ setCardValue function detected');
        setupRefreshButton();
        startDataPolling();
    } else {
        console.log('⏳ Waiting for main_components.js to load...');
        setTimeout(initializeWhenReady, 100); // Check again in 100ms
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWhenReady);
} else {
    initializeWhenReady();
}

// Export for debugging in console
window.avonicData = {
    getCurrentData: () => sensorData,
    forceRefresh: fetchSensorData,
    lastUpdate: () => lastUpdateTime
};

console.log('📦 data_integration.js loaded');
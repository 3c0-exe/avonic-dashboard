// ========================================
// QUICK INSIGHTS - DATA FETCHER
// js/insights/data-fetcher.js
// ========================================

/**
 * Fetch sensor readings from API
 * @param {string} espID - Device ESP ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>} { success, readings, error }
 */
async function fetchSensorReadings(espID, token) {
    if (!espID) {
        return {
            success: false,
            error: "No devices found. Please claim a device first.",
            readings: []
        };
    }
    
    if (!token) {
        return {
            success: false,
            error: "Not logged in",
            readings: []
        };
    }
    
    try {
        const API_BASE = window.API_BASE || 'https://avonic-main-hub-production.up.railway.app';
        const response = await fetch(
            `${API_BASE}/api/devices/${espID}/valid-readings?limit=50`, 
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (!response.ok) {
            // If 403, the device might have been unclaimed
            if (response.status === 403) {
                console.warn('⚠️ Device unauthorized - clearing stored ESP ID');
                localStorage.removeItem('selected_espID');
            }
            
            return {
                success: false,
                error: `API Error: ${response.status}`,
                readings: []
            };
        }
        
        const result = await response.json();
        const readings = result.readings || [];
        
        console.log(`📊 Fetched ${readings.length} VALID readings for ${espID}`);
        
        if (readings.length === 0) {
            return {
                success: false,
                error: "No valid sensor readings found.",
                readings: []
            };
        }
        
        return {
            success: true,
            readings,
            error: null
        };
        
    } catch (error) {
        console.error('❌ Fetch Error:', error);
        return {
            success: false,
            error: error.message,
            readings: []
        };
    }
}

/**
 * Extract sensor values from readings for a specific bin and sensor type
 * @param {Array} readings - API readings array
 * @param {string} currentBin - Bin number ('1' or '2')
 * @param {string} sensorType - Sensor type (temperature, soilMoisture, etc.)
 * @param {string} dbKey - Database key for sensor (temp, soil, humidity, gas)
 * @returns {Array} Array of processed reading objects
 */
function extractSensorValues(readings, currentBin, sensorType, dbKey) {
    const validValues = [];
    const processedReadings = [];
    
    readings.forEach(reading => {
        const binData = currentBin === '1' ? reading.bin1 : reading.bin2;
        if (!binData || binData[dbKey] === undefined || binData[dbKey] === null) {
            return;
        }
        
        const val = parseFloat(binData[dbKey]);
        if (isNaN(val)) return;
        
        validValues.push(val);
        
        processedReadings.push({
            value: val,
            timestamp: reading.timestamp,
            sensorType
        });
    });
    
    return { validValues, processedReadings };
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.QI_DataFetcher = {
        fetchSensorReadings,
        extractSensorValues
    };
}

console.log('✅ Quick Insights data fetcher loaded');
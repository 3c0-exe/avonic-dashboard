// ========================================
// BIN FLUCTUATIONS - DATA FETCHER
// js/fluctuations/data-fetcher.js
// ========================================

/**
 * Fetch and update bin fluctuations data
 * @param {number} binId - Bin ID (1 or 2)
 * @returns {Promise<Object>} { success, readings, error }
 */
async function fetchBinFluctuationsData(binId) {
    console.log(`🔄 Loading Bin Fluctuations data for Bin ${binId}`);
    
    try {
        const token = localStorage.getItem('avonic_token');
        if (!token) {
            throw new Error("Not logged in");
        }

        // Get Device ID
        let espID = await getValidEspID();

        if (!espID) {
            throw new Error("No devices found");
        }

        // Build API URL
        const API_BASE = window.API_BASE || 'https://avonic-main-hub-production.up.railway.app';
        let url = `${API_BASE}/api/devices/${espID}/valid-readings?limit=100`;
        
        // Add date range parameters if active
        const dateParams = window.BF_State.getDateRangeParams();
        if (dateParams) {
            url += `&startDate=${dateParams.startDate}&endDate=${dateParams.endDate}`;
            console.log(`📅 Filtering data: ${dateParams.startDate} to ${dateParams.endDate}`);
        }
        
        // Fetch data
        const response = await fetch(url, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const result = await response.json();
        let readings = result.readings || [];

        // Client-side date filtering if needed
        if (window.BF_State.isDateRangeActive && window.BF_State.startDate && window.BF_State.endDate) {
            readings = readings.filter(reading => {
                const readingDate = new Date(reading.timestamp);
                return readingDate >= window.BF_State.startDate && readingDate <= window.BF_State.endDate;
            });
            console.log(`📅 Filtered to ${readings.length} readings in date range`);
        }

        console.log(`✅ Fetched ${readings.length} valid readings for Bin ${binId}`);

        if (readings.length === 0) {
            throw new Error("No valid sensor readings found for this date range");
        }

        return {
            success: true,
            readings,
            error: null
        };
        
    } catch (error) {
        console.error('❌ Bin Fluctuations Error:', error.message);
        return {
            success: false,
            readings: [],
            error: error.message
        };
    }
}

/**
 * Get valid ESP ID from localStorage or API
 * @returns {Promise<string|null>}
 */
async function getValidEspID() {
    let espID = localStorage.getItem('selected_espID');
    
    if (!espID) {
        const token = localStorage.getItem('avonic_token');
        const API_BASE = window.API_BASE || 'https://avonic-main-hub-production.up.railway.app';
        
        const devRes = await fetch(`${API_BASE}/api/devices/claimed`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!devRes.ok) {
            return null;
        }
        
        const devData = await devRes.json();
        
        if (devData.devices && devData.devices.length > 0) {
            espID = devData.devices[0].espID;
            localStorage.setItem('selected_espID', espID);
        }
    }
    
    return espID;
}

/**
 * Extract sensor data for a specific sensor and bin
 * @param {Array} readings - API readings
 * @param {number} binId - Bin ID (1 or 2)
 * @param {string} sensorType - Sensor type
 * @param {string} dbKey - Database key
 * @returns {Array} Array of data points
 */
function extractSensorData(readings, binId, sensorType, dbKey) {
    const dataPoints = [];
    
    readings.forEach(reading => {
        const binData = binId === 1 ? reading.bin1 : reading.bin2;
        
        if (binData && binData[dbKey] !== undefined && binData[dbKey] !== null) {
            const val = parseFloat(binData[dbKey]);
            if (!isNaN(val)) {
                dataPoints.push({
                    value: val,
                    timestamp: new Date(reading.timestamp)
                });
            }
        }
    });

    // Sort by timestamp (oldest to newest)
    dataPoints.sort((a, b) => a.timestamp - b.timestamp);

    return dataPoints;
}

/**
 * Calculate statistics from data points
 * @param {Array} dataPoints - Array of data points
 * @returns {Object} Statistics object
 */
function calculateStatistics(dataPoints) {
    if (dataPoints.length === 0) {
        return null;
    }

    const values = dataPoints.map(d => d.value);
    
    return {
        min: Math.min(...values).toFixed(1),
        max: Math.max(...values).toFixed(1),
        avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1),
        latest: values[values.length - 1].toFixed(1),
        count: values.length
    };
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.BF_DataFetcher = {
        fetchBinFluctuationsData,
        extractSensorData,
        calculateStatistics
    };
}

console.log('✅ Bin Fluctuations data fetcher loaded');
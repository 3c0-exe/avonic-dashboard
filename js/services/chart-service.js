// services/chart-service.js - Chart Data Management

/**
 * Fetch historical sensor data for charts
 * @param {string} espID - Device ESP ID
 * @param {number} binNumber - Bin number (1 or 2)
 * @param {number} days - Number of days to fetch (default: 7)
 * @returns {Promise<Array|null>} Array of readings or null
 */
async function fetchChartData(espID, binNumber, days = 7) {
  const token = getAuthToken();
  if (!token) {
    console.warn('⚠️ No auth token - cannot fetch chart data');
    return null;
  }

  try {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const response = await fetch(
      `${API_BASE}/api/devices/${espID}/readings?` +
      `start=${start.toISOString()}&end=${end.toISOString()}&limit=1000`,
      { headers: getAuthHeaders() }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`📊 Fetched ${data.readings.length} readings for ${espID}`);
    
    return data.readings;
    
  } catch (error) {
    console.error('❌ Fetch chart data error:', error);
    return null;
  }
}

/**
 * Initialize all charts on dashboard page
 * Fetches device data and renders charts for each sensor
 */
async function initializeDashboardCharts() {
  const token = getAuthToken();
  if (!token) {
    console.warn('⚠️ No auth token - skipping chart initialization');
    return;
  }

  try {
    // Get first claimed device
    const devices = await fetchClaimedDevices();
    
    if (!devices || devices.length === 0) {
      console.log('ℹ️ No devices to display charts for');
      return;
    }

    const device = devices[0];
    const espID = device.espID;
    
    // Get current bin from UI
    const binDisplay = document.getElementById('current-bin');
    const currentBin = binDisplay ? 
      parseInt(binDisplay.textContent.replace('Bin ', '')) : 1;

    // Find all chart sections
    const chartSections = document.querySelectorAll('section-sensor-fluctuation');
    
    // Update each chart
    for (const section of chartSections) {
      const sensorName = section.getAttribute('sensor_name');
      const canvas = section.querySelector('canvas');
      
      if (canvas && sensorName) {
        await updateChart(canvas, espID, currentBin, sensorName);
      }
    }
    
    console.log('✅ Dashboard charts initialized');
    
  } catch (error) {
    console.error('❌ Initialize charts error:', error);
  }
}

console.log('✅ Chart service loaded');
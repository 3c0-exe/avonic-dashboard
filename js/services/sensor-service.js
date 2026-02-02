// services/sensor-service.js - Sensor Data Management with Caching

// ====== Request Management & Caching ======
let pendingRequest = null; // Prevent duplicate requests
let lastFetchTime = 0; // Track last fetch timestamp
let cachedSensorData = null; // Cache latest data
const MIN_FETCH_INTERVAL = 3000; // Minimum 3 seconds between requests

/**
 * Fetch latest sensor data with deduplication and caching
 * @param {boolean} forceRefresh - Force fetch even if cache is fresh
 * @returns {Promise<Object|null>} Sensor data or null
 */
async function fetchLatestSensorData(forceRefresh = false) {
  const token = getAuthToken();
  if (!token) {
    console.warn('⚠️ No auth token - skipping sensor fetch');
    return null;
  }

  const now = Date.now();
  const timeSinceLastFetch = now - lastFetchTime;

  // Return cached data if recent fetch and not forced
  if (!forceRefresh && cachedSensorData && timeSinceLastFetch < MIN_FETCH_INTERVAL) {
    console.log(`📦 Using cached data (${Math.round(timeSinceLastFetch/1000)}s old)`);
    processSensorData(cachedSensorData);
    return cachedSensorData;
  }

  // If there's already a pending request, wait for it
  if (pendingRequest) {
    console.log('⏳ Request already in flight, waiting...');
    try {
      const data = await pendingRequest;
      processSensorData(data);
      return data;
    } catch (error) {
      console.error('❌ Pending request failed:', error);
      return null;
    }
  }

  // Create new request
  console.log('🌐 Fetching fresh sensor data...');
  pendingRequest = fetchSensorDataFromAPI();

  try {
    const data = await pendingRequest;
    lastFetchTime = Date.now();
    cachedSensorData = data;
    processSensorData(data);
    return data;
  } catch (error) {
    console.error('❌ Fetch sensor error:', error);
    
    const timeElem = document.querySelector('.time-updated');
    if (timeElem) {
      timeElem.textContent = 'Update failed';
      timeElem.style.color = '#df5e45ff';
    }
    
    return null;
  } finally {
    pendingRequest = null;
  }
}

/**
 * Actual API fetch (internal helper)
 * @returns {Promise<Object>} Sensor data from API
 */
async function fetchSensorDataFromAPI() {
  const response = await fetch(`${API_BASE}/api/sensors/latest`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.readings || data.readings.length === 0) {
    console.log('ℹ️ No sensor readings available yet');
    return null;
  }

  console.log(`📊 Received data for ${data.readings.length} device(s):`, 
              data.readings.map(r => r.espID));
  
  return data;
}

/**
 * Process sensor data and update UI
 * @param {Object} data - Sensor data object with readings array
 */
function processSensorData(data) {
  if (!data || !data.readings) return;

  // Check if current page device has data
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const currentEspId = urlParams.get('espID');
  const isOnBinPage = window.location.hash.includes('/bin');
  
  if (isOnBinPage && currentEspId) {
    const hasDataForCurrentDevice = data.readings.some(r => r.espID === currentEspId);
    
    if (!hasDataForCurrentDevice) {
      console.warn(`⚠️ No data received for ${currentEspId} - showing NULL values`);
      showNullDataForDevice(currentEspId);
      return; // Don't update cards with wrong device data
    }
  }

  // Update all sensor cards with latest data
  data.readings.forEach(reading => {
    console.log(`🔄 Processing reading for: ${reading.espID}`);
    updateSensorCards(reading);
  });

  // Update timestamp
  const timeElem = document.querySelector('.time-updated');
  if (timeElem) {
    timeElem.textContent = 'Updated just now';
    timeElem.style.color = '';
  }

  console.log('✅ Sensor data update complete');
}

/**
 * Show NULL values for devices with no data
 * @param {string} espID - Device ESP ID
 */
function showNullDataForDevice(espID) {
  const cards = document.querySelectorAll('.card_stats[data-type="Sensors"]');
  
  cards.forEach(card => {
    const valueElem = card.querySelector('.card_value');
    const unitElem = card.querySelector('.card_unit');
    const circle = card.querySelector('.card_progress');
    const subLabel = card.querySelector('.sub_status_label');
    
    if (valueElem) valueElem.textContent = '--';
    if (unitElem) unitElem.textContent = '';
    
    if (circle) {
      const circumference = 2 * Math.PI * 45;
      circle.style.strokeDashoffset = circumference;
      circle.style.stroke = '#ddd';
    }
    
    if (subLabel) {
      subLabel.textContent = 'No Data Received';
      subLabel.style.color = '#999';
    }
  });
  
  console.log(`🔴 Displayed NULL values for ${espID}`);
}

/**
 * Update sensor cards with real data
 * @param {Object} reading - Single device reading with bin1/bin2 data
 */
function updateSensorCards(reading) {
  const cards = document.querySelectorAll('.card_stats[data-type="Sensors"]');
  
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const currentEspId = urlParams.get('espID');
  
  const isOnBinPage = window.location.hash.includes('/bin');
  
  // Skip if viewing different device
  if (isOnBinPage && currentEspId && reading.espID !== currentEspId) {
    console.log(`⏭️ Skipping update - viewing ${currentEspId}, got data for ${reading.espID}`);
    return;
  }
  
  cards.forEach(card => {
    const binId = card.getAttribute('data-bin-id');
    const label = card.querySelector('.status_label')?.textContent || '';
    
    const binData = binId === '2' ? reading.bin2 : reading.bin1;
    
    if (!binData) return;
    
    let value = null;
    
    // Match sensor by label
    if (label.includes('Soil Moisture') && binData.soil !== undefined) {
      value = binData.soil;
    } else if (label.includes('Temperature') && binData.temp !== undefined) {
      value = binData.temp;
    } else if (label.includes('Humidity') && binData.humidity !== undefined) {
      value = binData.humidity;
    } else if (label.includes('Gas') && binData.gas !== undefined) {
      value = binData.gas;
    } else if (label.includes('DS18B20') && binData.ds18b20 !== undefined) {
      value = binData.ds18b20;
    }
    
    if (value !== null) {
      setCardValue(card, value);
      console.log(`✅ Updated ${label} for ${reading.espID} Bin ${binId}: ${value}`);
    }
  });
  
  // Update home page specific cards
  const isOnHomePage = window.location.hash === '#/home' || 
                       window.location.hash === '#/' || 
                       window.location.hash === '';
  
  if (isOnHomePage) {
    // Battery level
    if (reading.system?.battery_level !== undefined) {
      const batteryCard = document.querySelector('.card_stats[data-type="battery"]');
      if (batteryCard) {
        setCardValue(batteryCard, reading.system.battery_level);
        console.log(`✅ Updated battery: ${reading.system.battery_level}%`);
      }
    }
    
    // Water tank data
    if (reading.bin2) {
      const waterCard = document.querySelector('.card_stats[data-type="water-tank"]');
      if (waterCard && reading.bin2.water_level !== undefined) {
        setCardValue(waterCard, reading.bin2.water_level);
        console.log(`✅ Updated water level: ${reading.bin2.water_level}%`);
      }
      
      const waterTempCard = document.querySelector('.card_stats[data-type="water-temp"]');
      if (waterTempCard && reading.bin2.temp !== undefined) {
        setCardValue(waterTempCard, reading.bin2.temp);
        console.log(`✅ Updated water temp: ${reading.bin2.temp}°C`);
      }
    }
  }
}

console.log('✅ Sensor service loaded');
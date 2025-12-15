ck// js/data_integration.js - AVONIC Real Data Integration with Rate Limit Protection

// // ✅ Use API_BASE from main_components.js or define only if missing
// if (typeof API_BASE === 'undefined') {
//   var API_BASE = 'https://avonic-main-hub-production.up.railway.app';
// }

// ====== Request Management ======
let pendingRequest = null; // Prevent duplicate requests
let lastFetchTime = 0; // Track last fetch timestamp
let cachedSensorData = null; // Cache latest data
const MIN_FETCH_INTERVAL = 3000; // Minimum 3 seconds between requests
let isInitialized = false; // Prevent multiple initializations

// ====== Helper Functions ======

function getAuthToken() {
  return localStorage.getItem('avonic_token');
}

function getAuthHeaders() {
  return {
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json'
  };
}

// Calculate min/avg/max from array
function calculateStats(values) {
  const filtered = values.filter(v => v != null && !isNaN(v));
  if (filtered.length === 0) return { min: 0, avg: 0, max: 0 };
  
  return {
    min: Math.min(...filtered),
    avg: (filtered.reduce((a, b) => a + b, 0) / filtered.length).toFixed(1),
    max: Math.max(...filtered)
  };
}

// Group readings by date and calculate daily stats
function groupByDate(readings, sensorPath) {
  const grouped = {};
  
  readings.forEach(reading => {
    const date = new Date(reading.timestamp).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric'
    });
    
    const value = sensorPath.split('.').reduce((obj, key) => obj?.[key], reading);
    
    if (value != null && !isNaN(value)) {
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(value);
    }
  });
  
  const dailyAverages = {};
  Object.keys(grouped).forEach(date => {
    const stats = calculateStats(grouped[date]);
    dailyAverages[date] = parseFloat(stats.avg);
  });
  
  return dailyAverages;
}

// ====== Fetch Latest Sensor Data with Deduplication ======

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

// Actual API fetch (separated for cleaner code)
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

// Process sensor data (update UI)
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

// ====== Show NULL for devices with no data ======

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

// ====== Update Sensor Cards with Real Data ======

function updateSensorCards(reading) {
  const cards = document.querySelectorAll('.card_stats[data-type="Sensors"]');
  
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const currentEspId = urlParams.get('espID');
  
  const isOnBinPage = window.location.hash.includes('/bin');
  
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
  
  const isOnHomePage = window.location.hash === '#/home' || 
                       window.location.hash === '#/' || 
                       window.location.hash === '';
  
  if (isOnHomePage) {
    if (reading.system?.battery_level !== undefined) {
      const batteryCard = document.querySelector('.card_stats[data-type="battery"]');
      if (batteryCard) {
        setCardValue(batteryCard, reading.system.battery_level);
        console.log(`✅ Updated battery: ${reading.system.battery_level}%`);
      }
    }
    
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

// ====== Fetch Historical Data for Charts ======

async function fetchChartData(espID, binNumber, days = 7) {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const response = await fetch(
      `${API_BASE}/api/devices/${espID}/readings?` +
      `start=${start.toISOString()}&end=${end.toISOString()}&limit=1000`,
      { headers: getAuthHeaders() }
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    
    console.log(`📊 Fetched ${data.readings.length} readings for ${espID}`);
    
    return data.readings;
    
  } catch (error) {
    console.error('❌ Fetch chart data error:', error);
    return null;
  }
}

// ====== Update Chart with Real Data ======

async function updateChart(chartElement, espID, binNumber, sensorName) {
  const readings = await fetchChartData(espID, binNumber, 7);
  
  if (!readings || readings.length === 0) {
    console.warn(`⚠️ No data for ${sensorName} chart`);
    return;
  }

  const sensorMap = {
    'Soil Moisture': `bin${binNumber}.soil`,
    'Temperature': `bin${binNumber}.temp`,
    'Humidity': `bin${binNumber}.humidity`,
    'Gas Levels': `bin${binNumber}.gas`,
    'DS18B20 Temp': `bin${binNumber}.ds18b20`
  };

  const sensorPath = sensorMap[sensorName];
  if (!sensorPath) return;

  const dailyData = groupByDate(readings, sensorPath);
  
  const sortedDates = Object.keys(dailyData).sort((a, b) => {
    return new Date(a) - new Date(b);
  });

  const labels = sortedDates.map(date => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });
  
  const values = sortedDates.map(date => dailyData[date]);

  const stats = calculateStats(values);
  
  const chartId = chartElement.id;
  const minElem = document.getElementById(`${chartId}-min`);
  const aveElem = document.getElementById(`${chartId}-ave`);
  const maxElem = document.getElementById(`${chartId}-max`);
  
  if (minElem) minElem.textContent = stats.min.toFixed(1);
  if (aveElem) aveElem.textContent = stats.avg;
  if (maxElem) maxElem.textContent = stats.max.toFixed(1);

  if (chartElement._chartInstance) {
    chartElement._chartInstance.destroy();
  }

  const ctx = chartElement.getContext('2d');
  const unit = getSensorUnit(sensorName);
  
  chartElement._chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: `Daily Average`,
        data: values,
        backgroundColor: '#F8B84E',
        borderColor: '#00000080',
        borderWidth: 1.2,
        borderRadius: 8,
        barThickness: 35,
      }]
    },
    options: {
      plugins: {
        datalabels: {
          anchor: 'end',
          align: 'end',
          color: 'black',
          font: { size: 12, weight: 'bold' },
          formatter: (value) => value != null ? `${value.toFixed(1)}${unit}` : ''
        },
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          ticks: { 
            font: { size: 10, weight: 'bold', family: 'Arial' }, 
            color: 'black' 
          }
        },
        y: {
          min: 0,
          max: Math.max(...values) * 1.2,
          ticks: { display: false },
          grid: { display: false, drawBorder: false }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    },
    elements: {
      bar: {
        borderSkipped: false
      }
    },
    plugins: [ChartDataLabels]
  });
  
  console.log(`✅ Chart updated: ${sensorName} (${values.length} days)`);
}

// ====== Get Sensor Unit ======

function getSensorUnit(sensorName) {
  const units = {
    'Soil Moisture': '%',
    'Temperature': '°C',
    'Humidity': '%',
    'Gas Levels': 'ppm',
    'DS18B20 Temp': '°C'
  };
  return units[sensorName] || '';
}

// ====== Initialize All Charts on Dashboard ======

async function initializeDashboardCharts() {
  const token = getAuthToken();
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}/api/devices/claimed`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Failed to fetch devices');

    const data = await response.json();
    
    if (!data.devices || data.devices.length === 0) {
      console.log('ℹ️ No devices to display charts for');
      return;
    }

    const device = data.devices[0];
    const espID = device.espID;
    
    const binDisplay = document.getElementById('current-bin');
    const currentBin = binDisplay ? 
      parseInt(binDisplay.textContent.replace('Bin ', '')) : 1;

    const chartSections = document.querySelectorAll('section-sensor-fluctuation');
    
    for (const section of chartSections) {
      const sensorName = section.getAttribute('sensor_name');
      const canvas = section.querySelector('canvas');
      
      if (canvas && sensorName) {
        await updateChart(canvas, espID, currentBin, sensorName);
      }
    }
    
  } catch (error) {
    console.error('❌ Initialize charts error:', error);
  }
}

// ====== Auto-refresh Timer ======

let refreshInterval;

function startAutoRefresh() {
  if (refreshInterval) {
    console.log('⚠️ Auto-refresh already running');
    return;
  }
  
  // Refresh sensor data every 5 seconds
  refreshInterval = setInterval(() => {
    fetchLatestSensorData();
  }, 5000);
  
  console.log('🔄 Auto-refresh started (5s interval)');
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log('⏸️ Auto-refresh stopped');
  }
}

// ====== Initialization ======

function initializeDataIntegration() {
  if (isInitialized) {
    console.log('⚠️ Data integration already initialized');
    return;
  }
  
  isInitialized = true;
  console.log('🚀 Initializing data integration...');
  
  // Initial load with slight delay to let page settle
  setTimeout(() => {
    fetchLatestSensorData(true); // Force refresh on init
    startAutoRefresh();
    
    // Load dashboard charts if on dashboard page
    if (window.location.hash === '#/dashboard') {
      setTimeout(initializeDashboardCharts, 500);
    }
  }, 100);
}

// ====== Event Listeners ======

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDataIntegration);
} else {
  initializeDataIntegration();
}

// Refresh on manual button click
document.addEventListener('click', (e) => {
  if (e.target.closest('.refresh-sensors') || e.target.closest('.insightsRefresh')) {
    fetchLatestSensorData(true); // Force refresh
    
    const timeElem = document.querySelector('.time-updated');
    if (timeElem) {
      timeElem.textContent = 'Refreshing...';
      timeElem.style.opacity = '1';
    }
  }
});

// Reload charts when navigating to dashboard
window.addEventListener('hashchange', () => {
  if (window.location.hash === '#/dashboard') {
    setTimeout(initializeDashboardCharts, 500);
  }
});

// Export functions for global use
window.fetchLatestSensorData = fetchLatestSensorData;
window.updateChart = updateChart;
window.initializeDashboardCharts = initializeDashboardCharts;

console.log('✅ Data integration loaded');
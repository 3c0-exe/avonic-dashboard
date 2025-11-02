// js/data_integration.js - AVONIC Real Data Integration

const API_BASE = 'https://avonic-main-hub-production.up.railway.app';

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
    
    // Extract value from nested path (e.g., "bin1.temp")
    const value = sensorPath.split('.').reduce((obj, key) => obj?.[key], reading);
    
    if (value != null && !isNaN(value)) {
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(value);
    }
  });
  
  // Calculate daily averages
  const dailyAverages = {};
  Object.keys(grouped).forEach(date => {
    const stats = calculateStats(grouped[date]);
    dailyAverages[date] = parseFloat(stats.avg);
  });
  
  return dailyAverages;
}

// ====== Fetch Latest Sensor Data (Real-time Cards) ======

async function fetchLatestSensorData() {
  const token = getAuthToken();
  if (!token) {
    console.warn('⚠️ No auth token - skipping sensor fetch');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/sensors/latest`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.readings || data.readings.length === 0) {
      console.log('ℹ️ No sensor readings available yet');
      return;
    }

    // Update all sensor cards with latest data
    data.readings.forEach(reading => {
      updateSensorCards(reading);
    });

    // Update timestamp
    const timeElem = document.querySelector('.time-updated');
    if (timeElem) {
      timeElem.textContent = 'Updated just now';
    }

    console.log('✅ Sensor data updated:', data.readings.length, 'devices');
    
  } catch (error) {
    console.error('❌ Fetch sensor error:', error);
    
    const timeElem = document.querySelector('.time-updated');
    if (timeElem) {
      timeElem.textContent = 'Update failed';
      timeElem.style.color = '#df5e45ff';
    }
  }
}

// ====== Update Sensor Cards with Real Data ======

function updateSensorCards(reading) {
  const cards = document.querySelectorAll('.card_stats[data-type="Sensors"]');
  
  console.log('🔍 Total sensor cards found:', cards.length);
  
  cards.forEach(card => {
    const binId = card.getAttribute('binId');
    const label = card.querySelector('.status_label')?.textContent || '';
    
    console.log('📍 Card:', label, '| binId:', binId, '| Will use:', binId === '2' ? 'BIN 2' : 'BIN 1');
    
    // Select correct bin data
    const binData = binId === '2' ? reading.bin2 : reading.bin1;
    
    if (!binData) {
      console.warn('⚠️ No data for bin:', binId);
      return;
    }
    
    // Match sensor type and update
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
      console.log('✅ Updating', label, 'to', value);
      setCardValue(card, value);
    }
  });

// ====== Fetch Historical Data for Charts ======

async function fetchChartData(espID, binNumber, days = 7) {
  const token = getAuthToken();
  if (!token) return null;

  try {
    // Calculate date range
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

  // Determine sensor path based on name
  const sensorMap = {
    'Soil Moisture': `bin${binNumber}.soil`,
    'Temperature': `bin${binNumber}.temp`,
    'Humidity': `bin${binNumber}.humidity`,
    'Gas Levels': `bin${binNumber}.gas`,
    'DS18B20 Temp': `bin${binNumber}.ds18b20`
  };

  const sensorPath = sensorMap[sensorName];
  if (!sensorPath) return;

  // Group by date and get daily averages
  const dailyData = groupByDate(readings, sensorPath);
  
  // Sort dates chronologically
  const sortedDates = Object.keys(dailyData).sort((a, b) => {
    return new Date(a) - new Date(b);
  });

  const labels = sortedDates.map(date => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });
  
  const values = sortedDates.map(date => dailyData[date]);

  // Calculate summary stats
  const stats = calculateStats(values);
  
  // Update summary cards
  const chartId = chartElement.id;
  const minElem = document.getElementById(`${chartId}-min`);
  const aveElem = document.getElementById(`${chartId}-ave`);
  const maxElem = document.getElementById(`${chartId}-max`);
  
  if (minElem) minElem.textContent = stats.min.toFixed(1);
  if (aveElem) aveElem.textContent = stats.avg;
  if (maxElem) maxElem.textContent = stats.max.toFixed(1);

  // Destroy existing chart if exists
  if (chartElement._chartInstance) {
    chartElement._chartInstance.destroy();
  }

  // Create new chart
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
  // Get user's first device (or selected device)
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

    // Use first device by default
    const device = data.devices[0];
    const espID = device.espID;
    
    // Get current bin selection (default to 1)
    const binDisplay = document.getElementById('current-bin');
    const currentBin = binDisplay ? 
      parseInt(binDisplay.textContent.replace('Bin ', '')) : 1;

    // Find all chart canvases
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
  // Refresh sensor data every 5 seconds
  refreshInterval = setInterval(() => {
    fetchLatestSensorData();
  }, 5000);
  
  console.log('🔄 Auto-refresh started (5s interval)');
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    console.log('⏸️ Auto-refresh stopped');
  }
}

// ====== Event Listeners ======

document.addEventListener('DOMContentLoaded', () => {
  // Initial load
  fetchLatestSensorData();
  
  // Start auto-refresh
  startAutoRefresh();
  
  // Load dashboard charts if on dashboard page
  if (window.location.hash === '#/dashboard') {
    setTimeout(initializeDashboardCharts, 500);
  }
});

// Refresh on manual button click
document.addEventListener('click', (e) => {
  if (e.target.closest('.refresh-sensors') || e.target.closest('.insightsRefresh')) {
    fetchLatestSensorData();
    
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
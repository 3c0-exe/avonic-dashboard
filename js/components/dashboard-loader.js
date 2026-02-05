// ========================================
// 📊 DASHBOARD & HOME PAGE LOADER
// ========================================

// Function to load and render dashboard dynamically
async function loadDashboard() {
  const token = localStorage.getItem('avonic_token');
  
  if (!token) {
    router.navigateTo('/');
    return;
  }

  try {
    // Fetch user's devices
    const response = await fetch(`${API_BASE}/api/devices/claimed`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch devices');

    const data = await response.json();
    const devices = data.devices || [];

    // Get the container where we'll render devices
    const quickInsightsContainer = document.querySelector('.quick_insights_card_container');
    const binFluctuationsSection = document.querySelector('.bin-fluctuations');

    if (!quickInsightsContainer || !binFluctuationsSection) return;

    // Clear existing content
    quickInsightsContainer.innerHTML = '';
    binFluctuationsSection.innerHTML = '';

    // Handle empty state
    if (devices.length === 0) {
      quickInsightsContainer.innerHTML = `
        <div class="empty-state">
          <h3>No Devices Claimed</h3>
          <p>Claim your first device to start monitoring your compost bins!</p>
          <button onclick="router.navigateTo('/claim-device')" class="btn-primary">
            ➕ Claim Device
          </button>
        </div>
      `;
      binFluctuationsSection.style.display = 'none';
      return;
    }

    // Render Quick Insights for all devices
    devices.forEach(device => {
      const espID = device.espID;
      const nickname = device.nickname || 'Unclaimed Device';

      // Create two bin cards per device
      quickInsightsContainer.innerHTML += `
        <qinsights-bin
          ic_name="${nickname} - Bin 1"
          ic_status="Stable"
          ic_moremsg=""
          is_clickable="true"
          data-device-id="${espID}"
          data-bin="1">
        </qinsights-bin>

        <qinsights-bin
          ic_name="${nickname} - Bin 2"
          ic_status="Stable"
          ic_moremsg=""
          is_clickable="true"
          data-device-id="${espID}"
          data-bin="2">
        </qinsights-bin>
      `;
    });

    // Render Bin Fluctuations section for the first device (default view)
    if (devices.length > 0) {
      renderBinFluctuations(devices[0], devices);
    }

  } catch (error) {
    console.error('❌ Dashboard load error:', error);
    if (typeof showNotification === 'function') {
      showNotification('Failed to load devices', 'error');
    }
  }
}

// Render the bin fluctuations section for a specific device
function renderBinFluctuations(device, allDevices) {
  const binFluctuationsSection = document.querySelector('.bin-fluctuations');
  const espID = device.espID;
  const nickname = device.nickname || 'Unclaimed Device';

  binFluctuationsSection.innerHTML = `
    <div class="bin-fluctuations-nav">
      <div class="device-selection">
        <label for="device-select">Device:</label>
        <select id="device-select" class="device-selector">
          ${allDevices.map(d => `
            <option value="${d.espID}" ${d.espID === espID ? 'selected' : ''}>
              ${d.nickname || d.espID}
            </option>
          `).join('')}
        </select>
      </div>

      <div class="bin-selection">
        <img class="arrow left" src="img/indicators/Arrow.svg" alt="">
        <div class="bin" id="current-bin">Bin 1</div>
        <img class="arrow right" src="img/indicators/Arrow.svg" alt="">
      </div>

      <div class="bf-content">
        <div class="title">Bin Fluctuation</div>
        <div class="fluctuationDisplayDate">
          <p>July 12, 2025 - July 21, 2025</p>
        </div>
      </div>

      <div class="select-date">
        <img src="img/calendarIcon.svg" alt="" class="calendar-icon">
        <p class="selection">Select Date</p>
      </div>
    </div>

    <section-sensor-fluctuation
      sensor_name="Soil Moisture"
      sensor_unit="%"
      sensor_icon="SoilMoistureIcon"
      data-device-id="${espID}"
      data-bin="1">
    </section-sensor-fluctuation>
    <hr>
    
    <section-sensor-fluctuation
      sensor_name="Temperature"
      sensor_unit="°C"
      sensor_icon="TempIcon"
      data-device-id="${espID}"
      data-bin="1">
    </section-sensor-fluctuation>
    <hr>
    
    <section-sensor-fluctuation
      sensor_name="Humidity"
      sensor_unit="%"
      sensor_icon="HumidityIcon"
      data-device-id="${espID}"
      data-bin="1">
    </section-sensor-fluctuation>
    <hr>
    
    <section-sensor-fluctuation
      sensor_name="Gas Levels"
      sensor_unit="ppm"
      sensor_icon="GasIcon"
      data-device-id="${espID}"
      data-bin="1">
    </section-sensor-fluctuation>
    <hr>
    
    <section-sensor-fluctuation
      sensor_name="DS18B20 Temp"
      sensor_unit="°C"
      sensor_icon="TempIcon"
      data-device-id="${espID}"
      data-bin="1">
    </section-sensor-fluctuation>
  `;

  // Add event listener for device selector
  const deviceSelect = document.getElementById('device-select');
  if (deviceSelect) {
    deviceSelect.addEventListener('change', (e) => {
      const selectedDevice = allDevices.find(d => d.espID === e.target.value);
      if (selectedDevice) {
        renderBinFluctuations(selectedDevice, allDevices);
      }
    });
  }

  // Add bin switching logic
  let currentBin = 1;
  const binDisplay = document.getElementById('current-bin');
  const leftArrow = binFluctuationsSection.querySelector('.arrow.left');
  const rightArrow = binFluctuationsSection.querySelector('.arrow.right');

  if (leftArrow) {
    leftArrow.addEventListener('click', () => {
      if (currentBin > 1) {
        currentBin--;
        binDisplay.textContent = `Bin ${currentBin}`;
        updateSensorBin(currentBin);
      }
    });
  }

  if (rightArrow) {
    rightArrow.addEventListener('click', () => {
      if (currentBin < 2) {
        currentBin++;
        binDisplay.textContent = `Bin ${currentBin}`;
        updateSensorBin(currentBin);
      }
    });
  }
}

// Update all sensor sections to show data for the selected bin
function updateSensorBin(binNumber) {
  const sensorSections = document.querySelectorAll('section-sensor-fluctuation');
  sensorSections.forEach(section => {
    section.setAttribute('data-bin', binNumber);
  });
}

// ========================================
// 🏠 HOME PAGE - DYNAMIC BIN CARDS LOADER
// ========================================

async function loadBinCards() {
  const token = localStorage.getItem('avonic_token');
  const binContainer = document.getElementById('binCardsContainer');
  
  if (!binContainer) {
    console.warn('⚠️ Bin container not found');
    return;
  }

  if (!token) {
    console.warn('⚠️ No auth token - user not logged in');
    showEmptyState(binContainer, 'Please log in to view your devices');
    return;
  }

  // Show loading state
  binContainer.innerHTML = '<div class="loading-spinner">Loading your bins...</div>';
  
  // Remove existing Machine Status sections and selector
  const existingStatusSections = document.querySelectorAll('.machine_status:not(:has(#binCardsContainer))');
  existingStatusSections.forEach(section => section.remove());
  
  const existingSelector = document.querySelector('.device-selector-wrapper');
  if (existingSelector) existingSelector.remove();

  try {
    const response = await fetch(`${API_BASE}/api/devices/claimed`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const devices = data.devices || [];

    console.log(`✅ Fetched ${devices.length} devices`);

    // Clear container
    binContainer.innerHTML = '';

    // Handle empty state
    if (devices.length === 0) {
      showEmptyState(binContainer);
      // Clear the navbar connection controls
      clearNavbarConnectionControls();
      return;
    }

    // CREATE DEVICE SELECTOR IN NAVBAR (only if multiple devices)
    if (devices.length >= 1) {
      createNavbarConnectionControls(devices);
    }

    // Get remembered device or use first device
    const rememberedESPID = localStorage.getItem('selected_espID');
    const deviceToShow = rememberedESPID 
      ? devices.find(d => d.espID === rememberedESPID) || devices[0]
      : devices[0];
    
    console.log(`📱 Showing device: ${deviceToShow.espID} ${rememberedESPID ? '(remembered)' : '(default)'}`);
    renderDeviceData(deviceToShow, devices);

  } catch (error) {
    console.error('❌ Failed to load bin cards:', error);
    showEmptyState(binContainer, 'Failed to load devices. Please refresh.');
  }
}

// ========================================
// 🔝 NAVBAR CONNECTION CONTROLS
// ========================================

// CREATE NAVBAR CONNECTION CONTROLS
function createNavbarConnectionControls(devices) {
  const navbarContainer = document.getElementById('topbar-connection-controls');
  
  if (!navbarContainer) {
    console.error('❌ Navbar connection controls container not found');
    return;
  }

  // Get remembered ESP-ID from localStorage
  const rememberedESPID = localStorage.getItem('selected_espID');
  
  // Determine which device should be selected
  let selectedESPID = devices[0]?.espID;
  
  if (rememberedESPID) {
    const rememberedDevice = devices.find(d => d.espID === rememberedESPID);
    if (rememberedDevice) {
      selectedESPID = rememberedESPID;
      console.log(`✅ Restored remembered device: ${selectedESPID}`);
    } else {
      console.log(`⚠️ Remembered device ${rememberedESPID} not found, using first device`);
    }
  }

  // Create connection controls HTML
  navbarContainer.innerHTML = `
    <div class="connection-controls-row">
      <div class="connection-label">Connected to:</div>
      
      <div class="device-select-wrapper">
        <div class="select-icon-left">
          <img src="img/icons/bin-icon-selection.png" alt="">
        </div>

        <select class="device-select-pill" id="navbar-device-selector">
          ${devices.map((device) => `
            <option value="${device.espID}" ${device.espID === selectedESPID ? 'selected' : ''}>
              ${device.nickname || device.espID} ${device.nickname ? `(${device.espID.slice(-6)})` : ''}
            </option>
          `).join('')}
        </select>

        <div class="select-icon-right">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>

      <button class="edit-nickname-btn" 
        data-esp-id="${selectedESPID}" 
        data-nickname="${devices.find(d => d.espID === selectedESPID)?.nickname || ''}" 
        title="Edit nickname">
        <img src="img/icons/edit-icon.svg" alt="">
      </button>
    </div>
  `;

  // Add change event listener with memory
  const selector = document.getElementById('navbar-device-selector');
  if (selector) {
    selector.addEventListener('change', (e) => {
      const selectedDevice = devices.find(d => d.espID === e.target.value);
      if (selectedDevice) {
        console.log(`🔄 Switching to device: ${selectedDevice.espID}`);
        
        // Save the selected ESP-ID to localStorage
        localStorage.setItem('selected_espID', selectedDevice.espID);
        console.log(`💾 Saved device selection: ${selectedDevice.espID}`);
        
        // Update edit button attributes
        const editBtn = navbarContainer.querySelector('.edit-nickname-btn');
        if (editBtn) {
          editBtn.dataset.espId = selectedDevice.espID;
          editBtn.dataset.nickname = selectedDevice.nickname || '';
        }
        
        renderDeviceData(selectedDevice, devices);
      }
    });
  }

  console.log('✅ Navbar connection controls created with', devices.length, 'devices');
}

// CLEAR NAVBAR CONNECTION CONTROLS
function clearNavbarConnectionControls() {
  const navbarContainer = document.getElementById('topbar-connection-controls');
  if (navbarContainer) {
    navbarContainer.innerHTML = '';
  }
}

// RENDER DATA FOR SELECTED DEVICE
function renderDeviceData(device, allDevices) {
  const espID = device.espID;
  const nickname = device.nickname || espID;
  
  // Remove existing Machine Status sections
  const existingStatusSections = document.querySelectorAll('.machine_status:not(:has(#binCardsContainer))');
  existingStatusSections.forEach(section => section.remove());

  // Find the bin container parent section
  const binSection = document.querySelector('.machine_status:has(#binCardsContainer)');
  if (!binSection) {
    console.error('❌ Bin section not found');
    return;
  }

  // CREATE NEW MACHINE STATUS SECTION
  const newStatusSection = document.createElement('div');
  newStatusSection.className = 'machine_status';
  newStatusSection.setAttribute('data-esp-id', espID);
  
  const titleContainer = document.createElement('div');
  titleContainer.className = 'title-container';
  titleContainer.innerHTML = `
    <h1>Machine Status - ${nickname}</h1>
    <div class="refresh-sensors">
      <img class="refresh_icon" src="img/icons/refresh_icon.svg" alt="">
    </div>
  `;
  
  newStatusSection.appendChild(titleContainer);
  
  // Insert before the "Vermicompost Bins" section
  binSection.parentNode.insertBefore(newStatusSection, binSection);
  
  // Create the status cards for this device
  createMachineStatusCards(newStatusSection, espID, nickname);
  
  // UPDATE BIN CARDS
  const binContainer = document.getElementById('binCardsContainer');
  binContainer.innerHTML = '';
  
  // Create Bin 1
  const bin1Card = createBinCardElement(espID, nickname, 1);
  binContainer.appendChild(bin1Card);
  
  // Create Bin 2
  const bin2Card = createBinCardElement(espID, nickname, 2);
  binContainer.appendChild(bin2Card);

  console.log(`✅ Rendered device data for ${espID}`);
  
  // Fetch sensor data for this device
  fetchSensorDataForDevice(espID);
}

// CREATE MACHINE STATUS CARDS FOR A DEVICE
function createMachineStatusCards(parentSection, espID, nickname) {
  const statusContainer = document.createElement('div');
  statusContainer.className = 'machine_status_container';
  statusContainer.setAttribute('data-esp-id', espID);
  
  // Battery card
  const batteryCard = document.createElement('status-card');
  batteryCard.setAttribute('dataType', 'battery');
  batteryCard.setAttribute('dataLabel', 'Battery');
  batteryCard.setAttribute('subDataLabel', ' ');
  batteryCard.setAttribute('dataUnit', '%');
  batteryCard.setAttribute('icon', 'img/icons/tankIcons/BatteryIcon.svg');
  batteryCard.setAttribute('data-esp-id', espID);
  
  // Water card
  const waterCard = document.createElement('status-card');
  waterCard.setAttribute('dataType', 'water-tank');
  waterCard.setAttribute('dataLabel', 'Water');
  waterCard.setAttribute('subDataLabel', ' ');
  waterCard.setAttribute('dataUnit', '%');
  waterCard.setAttribute('icon', 'img/icons/tankIcons/WaterTankIcon.svg');
  waterCard.setAttribute('data-esp-id', espID);
  
  // Water temp card
  const waterTempCard = document.createElement('status-card');
  waterTempCard.setAttribute('dataType', 'water-temp');
  waterTempCard.setAttribute('dataLabel', 'Water Temp');
  waterTempCard.setAttribute('subDataLabel', '');
  waterTempCard.setAttribute('dataUnit', '°C');
  waterTempCard.setAttribute('icon', 'img/icons/tankIcons/WaterTankIcon.svg');
  waterTempCard.setAttribute('data-esp-id', espID);
  
  statusContainer.appendChild(batteryCard);
  statusContainer.appendChild(waterCard);
  statusContainer.appendChild(waterTempCard);
  
  parentSection.appendChild(statusContainer);
  
  console.log(`✅ Created machine status cards for ${espID}`);
}

// CREATE BIN CARD ELEMENT
function createBinCardElement(espID, nickname, binNumber) {
  const binCard = document.createElement('bin-card');
  
  const isAutoMode = binNumber === 1;
  const modeIndicator = isAutoMode 
    ? 'img/indicators/color coded mode indicator - auto.png'
    : 'img/indicators/color coded mode indicator - manual.png';
  const modeText = isAutoMode ? 'Auto-Mode' : 'Manual-Mode';
  
  binCard.setAttribute('bin_name', `${nickname} - Bin ${binNumber}`);
  binCard.setAttribute('indicator', modeIndicator);
  binCard.setAttribute('mode', modeText);
  binCard.setAttribute('navigateTo', `#/bin${binNumber === 2 ? '2' : ''}?espID=${espID}`);
  binCard.setAttribute('data-esp-id', espID);
  binCard.setAttribute('data-bin-number', binNumber);
  
  return binCard;
}

// FETCH SENSOR DATA FOR SPECIFIC DEVICE
async function fetchSensorDataForDevice(espID) {
  const token = localStorage.getItem('avonic_token');
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}/api/devices/${espID}/latest`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
    });

    if (!response.ok) {
      console.warn(`⚠️ No data for ${espID}`);
      return;
    }

    const jsonResponse = await response.json();
    const sensorData = jsonResponse.data; 

    if (sensorData) {
      updateCardsForDevice(espID, sensorData);
      console.log(`✅ Sensor data loaded for ${espID}`);
    } else {
      console.warn(`⚠️ Device ${espID} exists but has no sensor data yet.`);
    }

  } catch (error) {
    console.error(`❌ Fetch sensor error for ${espID}:`, error);
  }
}

// UPDATE CARDS FOR SPECIFIC DEVICE
function updateCardsForDevice(espID, reading) {
  const statusCards = document.querySelectorAll(`status-card[data-esp-id="${espID}"]`);

  if (statusCards.length === 0) return;

  statusCards.forEach(customEl => {
    const card = customEl.querySelector('.card_stats');
    if (!card) return;

    const dataType = card.dataset.type;

    // Battery
    if (dataType === 'battery') {
      let val = reading.battery;
      if (val === undefined && reading.system?.battery_level !== undefined) {
        val = reading.system.battery_level;
      }
      if (val !== undefined) setCardValue(card, val);
    }

    // Water Level
    if (dataType === 'water-tank') {
      let val = reading.water_level;
      if (val === undefined && reading.bin2?.water_level !== undefined) {
        val = reading.bin2.water_level;
      }
      if (val !== undefined) setCardValue(card, val);
    }

    // Water Temp
    if (dataType === 'water-temp') {
      let val = reading.water_temp;
      if (val === undefined && reading.bin1?.ds18b20 !== undefined) {
        val = reading.bin1.ds18b20;
      }
      if (val !== undefined) setCardValue(card, val);
    }
  });
}

// SHOW EMPTY STATE
function showEmptyState(container, message = null) {
  container.innerHTML = `
    <div class="empty-state-card">
      <h3>No Devices Claimed</h3>
      <p>${message || 'Claim your first device to start monitoring your compost bins!'}</p>
      <button class="btn-primary" onclick="window.location.hash='#/claim-device'">
        ➕ Claim Device
      </button>
    </div>
  `;
}

// ========================================
// 🔄 ROUTER SETUP
// ========================================

// Listen for route changes
window.addEventListener('hashchange', () => {
  const hash = window.location.hash;
  if (hash === '#/dashboard') {
    setTimeout(() => loadDashboard(), 100);
  }
  if (hash === '#/home' || hash === '#/' || hash === '') {
    setTimeout(() => loadBinCards(), 100);
  } else {
    // Clear navbar controls when navigating away from home
    clearNavbarConnectionControls();
  }
});

// Initial load - ONLY if explicitly on dashboard or home
if (window.location.hash === '#/dashboard') {
  setTimeout(() => loadDashboard(), 100);
} else if (window.location.hash === '#/home' || window.location.hash === '#/' || window.location.hash === '') {
  setTimeout(() => loadBinCards(), 100);
}

console.log('✅ Dashboard & Home loader initialized');
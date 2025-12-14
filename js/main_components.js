// ========================================
// 🔧 DEVELOPMENT MODE CONFIGURATION
// ========================================
// Place this at the TOP of main_components.js

const DEV_MODE = false; // Set to false when connecting to real backend
const MOCK_DELAY = 300; // Simulate network delay (ms)

// ========================================
// 📦 MOCK DATA
// ========================================

const MOCK_DEVICES = [
  {
    espID: 'AVONIC-DEV001',
    nickname: 'Office Compost Bin',
    claimedAt: new Date().toISOString()
  },
  {
    espID: 'AVONIC-DEV002',
    nickname: 'Garden Bin',
    claimedAt: new Date().toISOString()
  },
  {
    espID: 'AVONIC-DEV003',
    nickname: 'Rooftop Compost',
    claimedAt: new Date().toISOString()
  }
];

const MOCK_SENSOR_DATA = {
  'AVONIC-DEV001': {
    espID: 'AVONIC-DEV001',
    battery: 85,
    water_level: 65,
    water_temp: 24,
    bin1: {
      soil: 72,
      temp: 26,
      humidity: 68,
      gas: 45,
      ds18b20: 25.5
    },
    bin2: {
      soil: 58,
      temp: 28,
      humidity: 75,
      gas: 89,
      ds18b20: 27.2
    },
    timestamp: new Date().toISOString()
  },
  'AVONIC-DEV002': {
    espID: 'AVONIC-DEV002',
    battery: 92,
    water_level: 78,
    water_temp: 22,
    bin1: {
      soil: 80,
      temp: 24,
      humidity: 71,
      gas: 32,
      ds18b20: 23.8
    },
    bin2: {
      soil: 65,
      temp: 26,
      humidity: 69,
      gas: 56,
      ds18b20: 25.1
    },
    timestamp: new Date().toISOString()
  },
  'AVONIC-DEV003': {
    espID: 'AVONIC-DEV003',
    battery: 45,
    water_level: 28,
    water_temp: 26,
    bin1: {
      soil: 45,
      temp: 30,
      humidity: 55,
      gas: 120,
      ds18b20: 29.5
    },
    bin2: {
      soil: 38,
      temp: 32,
      humidity: 48,
      gas: 145,
      ds18b20: 31.2
    },
    timestamp: new Date().toISOString()
  }
};

// ========================================
// 🎭 MOCK API FUNCTIONS
// ========================================

async function mockFetch(url, options = {}) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  
  console.log('🔧 DEV MODE: Mocking API call to:', url);
  console.log('📤 Request options:', options);
  
  const method = options.method || 'GET';
  
  // Mock: Get claimed devices
  if (url.includes('/api/devices/claimed') && method === 'GET') {
    return {
      ok: true,
      json: async () => ({
        success: true,
        devices: MOCK_DEVICES
      })
    };
  }
  
  // Mock: Get all devices (dashboard)
  if (url.includes('/api/devices') && method === 'GET') {
    return {
      ok: true,
      json: async () => ({
        success: true,
        devices: MOCK_DEVICES
      })
    };
  }
  
  // Mock: Claim device
  if (url.includes('/api/devices/claim') && method === 'POST') {
    const body = JSON.parse(options.body);
    const newDevice = {
      espID: body.espID,
      nickname: `My Device ${MOCK_DEVICES.length + 1}`,
      claimedAt: new Date().toISOString()
    };
    MOCK_DEVICES.push(newDevice);
    
    return {
      ok: true,
      json: async () => ({
        success: true,
        message: 'Device claimed successfully',
        device: newDevice
      })
    };
  }
  
  // Mock: Update nickname
  if (url.includes('/nickname') && method === 'PUT') {
    const espID = url.split('/').slice(-2)[0];
    const body = JSON.parse(options.body);
    const device = MOCK_DEVICES.find(d => d.espID === espID);
    
    if (device) {
      device.nickname = body.nickname;
      return {
        ok: true,
        json: async () => ({
          success: true,
          message: 'Nickname updated',
          device
        })
      };
    }
  }
  
  // Mock: Get latest sensor data for specific device
  if (url.includes('/api/sensors/latest/')) {
    const espID = url.split('/').pop();
    const data = MOCK_SENSOR_DATA[espID];
    
    if (data) {
      // Add some randomness to make it feel live
      const randomized = JSON.parse(JSON.stringify(data));
      randomized.bin1.soil += Math.random() * 4 - 2;
      randomized.bin1.temp += Math.random() * 2 - 1;
      randomized.bin2.soil += Math.random() * 4 - 2;
      randomized.bin2.temp += Math.random() * 2 - 1;
      randomized.timestamp = new Date().toISOString();
      
      return {
        ok: true,
        json: async () => randomized
      };
    }
    
    return {
      ok: false,
      json: async () => ({ error: 'Device not found' })
    };
  }
  
  // Mock: Get latest sensor data (all devices)
  if (url.includes('/api/sensors/latest') && method === 'GET') {
    return {
      ok: true,
      json: async () => ({
        success: true,
        readings: Object.values(MOCK_SENSOR_DATA)
      })
    };
  }
  
  // Mock: Control device (pump/fan)
  if ((url.includes('/pump') || url.includes('/fan')) && method === 'POST') {
    const body = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({
        success: true,
        message: `Device ${body.state === 'on' ? 'activated' : 'deactivated'}`,
        state: body.state
      })
    };
  }
  
  // Mock: Login
  if (url.includes('/auth/login') && method === 'POST') {
    return {
      ok: true,
      json: async () => ({
        success: true,
        token: 'mock_dev_token_' + Date.now(),
        user: {
          email: 'dev@avonic.com',
          name: 'Dev User'
        }
      })
    };
  }
  
  // Default fallback
  return {
    ok: true,
    json: async () => ({ success: true, message: 'Mock response' })
  };
}

// ========================================
// 🔄 OVERRIDE FETCH GLOBALLY
// ========================================

if (DEV_MODE) {
  console.log('🔧 DEVELOPMENT MODE ENABLED');
  console.log('📦 Mock data loaded with', MOCK_DEVICES.length, 'devices');
  
  // Store original fetch
  window._originalFetch = window.fetch;
  
  // Override fetch
  window.fetch = function(url, options) {
    // Only mock API calls, let other fetches go through
    if (url.includes('api/') || url.includes('auth/')) {
      return mockFetch(url, options);
    }
    // Let image/resource fetches work normally
    return window._originalFetch(url, options);
  };
  
  // Auto-login for dev mode
  if (!localStorage.getItem('avonic_token')) {
    localStorage.setItem('avonic_token', 'mock_dev_token');
    console.log('✅ Auto-logged in for dev mode');
  }
}

// ========================================
// 🛠️ DEV MODE UTILITIES
// ========================================

// Add mock sensor data for a specific device
window.addMockDevice = function(espID, nickname) {
  const newDevice = {
    espID,
    nickname,
    claimedAt: new Date().toISOString()
  };
  
  MOCK_DEVICES.push(newDevice);
  
  MOCK_SENSOR_DATA[espID] = {
    espID,
    battery: Math.floor(Math.random() * 40) + 60,
    water_level: Math.floor(Math.random() * 50) + 30,
    water_temp: Math.floor(Math.random() * 10) + 20,
    bin1: {
      soil: Math.floor(Math.random() * 40) + 40,
      temp: Math.floor(Math.random() * 15) + 20,
      humidity: Math.floor(Math.random() * 40) + 40,
      gas: Math.floor(Math.random() * 100),
      ds18b20: Math.random() * 15 + 20
    },
    bin2: {
      soil: Math.floor(Math.random() * 40) + 40,
      temp: Math.floor(Math.random() * 15) + 20,
      humidity: Math.floor(Math.random() * 40) + 40,
      gas: Math.floor(Math.random() * 100),
      ds18b20: Math.random() * 15 + 20
    },
    timestamp: new Date().toISOString()
  };
  
  console.log('✅ Added mock device:', espID);
  return newDevice;
};

// Randomize sensor values (simulate live updates)
window.randomizeSensorData = function(espID) {
  const data = MOCK_SENSOR_DATA[espID || MOCK_DEVICES[0].espID];
  if (!data) return;
  
  data.bin1.soil = Math.max(0, Math.min(100, data.bin1.soil + (Math.random() * 10 - 5)));
  data.bin1.temp = Math.max(15, Math.min(40, data.bin1.temp + (Math.random() * 4 - 2)));
  data.bin1.humidity = Math.max(30, Math.min(100, data.bin1.humidity + (Math.random() * 8 - 4)));
  data.bin1.gas = Math.max(0, Math.min(250, data.bin1.gas + (Math.random() * 20 - 10)));
  
  data.bin2.soil = Math.max(0, Math.min(100, data.bin2.soil + (Math.random() * 10 - 5)));
  data.bin2.temp = Math.max(15, Math.min(40, data.bin2.temp + (Math.random() * 4 - 2)));
  data.bin2.humidity = Math.max(30, Math.min(100, data.bin2.humidity + (Math.random() * 8 - 4)));
  data.bin2.gas = Math.max(0, Math.min(250, data.bin2.gas + (Math.random() * 20 - 10)));
  
  data.timestamp = new Date().toISOString();
  
  console.log('🔄 Randomized sensor data for', espID);
};

// Clear all mock data
window.clearMockData = function() {
  MOCK_DEVICES.length = 0;
  Object.keys(MOCK_SENSOR_DATA).forEach(key => delete MOCK_SENSOR_DATA[key]);
  console.log('🗑️ Cleared all mock data');
};

console.log('✅ Development mode utilities loaded');
console.log('💡 Try: addMockDevice("AVONIC-TEST", "Test Device")');
console.log('💡 Try: randomizeSensorData("AVONIC-DEV001")');


// bin cards

class Bincard extends HTMLElement {
    connectedCallback() {
        const bin_name = this.getAttribute("bin_name");
        const indicator = this.getAttribute("indicator");
        const mode = this.getAttribute("mode");
        const navigateTo = this.getAttribute("navigateTo");
        
        this.innerHTML = `
            <div class="bin card">
                <div class="card header">
                    <div class="bin_name">${bin_name}</div>
                    <div class="mode-text">
                        <img class="indicator" src="${indicator}" alt="">
                        <span class="mode">${mode}</span>
                    </div>
                </div>
                <img class="mode-confirmation-dummy bin-card" src="img/cliparts/Bin(Hero-sec).png" alt="">
                <a class="btn bin" href="${navigateTo}">Select bin</a>
            </div>
        `;
    }
}

customElements.define("bin-card", Bincard)




// ========================================
// 1. 🎨 STYLE DEFINITIONS (Matches your Screenshots)
// ========================================
const modalStyles = `
/* Clean Modal Wrapper */
.custom-modal-wrapper {
    position: relative;
    max-width: 440px;
    width: 95%;
    margin: 0 auto;
    font-family: "Hoss Round", sans-serif;
    color: #000;
}

/* Main Card Container */
.custom-card-inner {
    background: #F8F7F2;
    border-radius: 32px;
    padding: 24px;
    border: 3px solid #000;
    box-shadow: 8px 8px 0 #000; /* Brutalist Shadow */
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* Header (Title + Close) */
.custom-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}
.custom-header-title {
    font-size: 24px;
    font-weight: 800;
    margin: 0;
}
.custom-close-btn {
    background: #D4D4D4;
    border: 2px solid #000;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.1s;
}
.custom-close-btn:hover { background: #C4C4C4; }
.custom-close-btn:active { transform: scale(0.95); }

/* Reading Box (White Card) */
.custom-reading-box {
    background: #FFFFFF;
    border: 2px solid #000;
    border-radius: 24px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.reading-top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.reading-label {
    font-weight: 700;
    font-size: 18px;
}
.custom-refresh-btn {
    width: 24px;
    height: 24px;
    cursor: pointer;
    transition: transform 0.5s ease;
}

/* Data Display Row (Number + Worm) */
.data-display-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.data-left-col {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.big-value-text {
    font-size: 64px;
    font-weight: 800;
    line-height: 1;
}
.unit-text { font-size: 32px; }

.status-badge {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    font-size: 18px;
    color: #555;
}
.status-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 1px solid rgba(0,0,0,0.1);
}
.status-dot.optimal { background: #4CAF50; } /* Green */
.status-dot.warning { background: #FF9800; } /* Orange */
.status-dot.critical { background: #F44336; } /* Red */

.worm-img-display {
    width: 100px;
    height: auto;
    object-fit: contain;
}

/* Manual Actions Box */
.custom-manual-box {
    background: #FFFFFF;
    border: 2px solid #000;
    border-radius: 24px;
    padding: 24px;
}
.manual-title {
    font-weight: 800;
    font-size: 18px;
    margin-bottom: 16px;
    display: block;
}
.manual-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 2px solid #F0F0F0;
}
.manual-row:last-child { border: none; padding-bottom: 0; }

.manual-item-left {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 700;
    font-size: 16px;
}

/* Toggle Switch */
.custom-toggle {
    width: 56px;
    height: 32px;
    background: #D4D4D4;
    border: 2px solid #000;
    border-radius: 16px;
    position: relative;
    cursor: pointer;
    transition: 0.2s;
}
.custom-toggle.active { background: #4CAF50; } /* Green when active */
.custom-toggle::after {
    content: '';
    position: absolute;
    width: 24px;
    height: 24px;
    background: #FFF;
    border: 2px solid #000;
    border-radius: 50%;
    top: 2px;
    left: 2px;
    transition: 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}
.custom-toggle.active::after { left: 26px; }
`;

// Inject Styles
if (!document.getElementById('final-status-styles')) {
    const s = document.createElement("style");
    s.id = 'final-status-styles';
    s.innerText = modalStyles;
    document.head.appendChild(s);
}

// ========================================
// 1. ⚙️ SENSOR & WORM CONFIGURATION
// ========================================

// Used for generating realistic random data limits
const SENSOR_CONFIGS = {
    temperature: { title: 'Temperature', unit: '°C', minValue: 15, maxValue: 40 },
    soilMoisture: { title: 'Soil Moisture', unit: '%', minValue: 30, maxValue: 100 },
    humidity: { title: 'Humidity', unit: '%', minValue: 30, maxValue: 100 },
    gasLevels: { title: 'Gas Levels', unit: 'ppm', minValue: 0, maxValue: 250 }
};

// 🪱 AFRICAN NIGHTCRAWLER RANGES (Exact Match)
const WORM_CONDITIONS = {
    temperature: {
        optimal_min: 22, optimal_max: 28,
        critical_min: 15, critical_max: 35
    },
    soilMoisture: {
        optimal_min: 60, optimal_max: 80,
        critical_min: 40, critical_max: 90
    },
    humidity: {
        optimal_min: 60, optimal_max: 80,
        critical_min: 40, critical_max: 90
    },
    gasLevels: {
        optimal_min: 0, optimal_max: 100,
        critical_max: 200
    }
};

// ========================================
// 2. 🎨 EVALUATE CONDITION LOGIC
// ========================================
function evaluateCondition(sensorType, value) {
    // Safety check: if sensor type doesn't exist, return default
    if (!WORM_CONDITIONS[sensorType]) {
        return { status: 'Unknown', statusClass: 'warning', wormImage: 'Normal.png' };
    }

    const ranges = WORM_CONDITIONS[sensorType];
    let status = 'Optimal';
    let statusClass = 'optimal'; // optimal (green), warning (orange), critical (red)
    let wormImage = 'Normal.png';

    switch(sensorType) {
        // --- TEMPERATURE ---
        case 'temperature':
            if (value < ranges.critical_min) {
                status = 'Critically Cold';
                statusClass = 'critical';
                wormImage = 'Too Dry.png'; // Using provided mapping for cold
            } else if (value < ranges.optimal_min) {
                status = 'Too Cold';
                statusClass = 'warning';
                wormImage = 'Too Dry.png';
            } else if (value > ranges.critical_max) {
                status = 'Critically Hot';
                statusClass = 'critical';
                wormImage = 'Too Hot.png';
            } else if (value > ranges.optimal_max) {
                status = 'Too Hot';
                statusClass = 'warning';
                wormImage = 'Too Hot.png';
            }
            break;

        // --- SOIL MOISTURE & HUMIDITY ---
        case 'soilMoisture':
        case 'humidity':
            if (value < ranges.critical_min) {
                status = 'Critically Dry';
                statusClass = 'critical';
                wormImage = 'Too Dry.png';
            } else if (value < ranges.optimal_min) {
                status = 'Dry';
                statusClass = 'warning';
                wormImage = 'Too Dry.png';
            } else if (value > ranges.critical_max) {
                status = 'Critically Wet';
                statusClass = 'critical';
                wormImage = 'Too Wet.png';
            } else if (value > ranges.optimal_max) {
                status = 'Wet';
                statusClass = 'warning';
                wormImage = 'Too Wet.png';
            }
            break;

        // --- GAS LEVELS ---
        case 'gasLevels':
            if (value > ranges.critical_max) {
                status = 'Toxic Gas';
                statusClass = 'critical';
                wormImage = 'Gas Too High.png';
            } else if (value > ranges.optimal_max) {
                status = 'High Gas';
                statusClass = 'warning';
                wormImage = 'Gas Too High.png';
            }
            break;
    }

    // Default return (Optimal) if no conditions met
    return { status, statusClass, wormImage };
}

// ========================================
// 3. 🧩 STATUS CARD COMPONENT (Conditional Manual Controls)
// ========================================
class Statuscard extends HTMLElement {
  connectedCallback() {
    // Get Attributes
    const dataType = this.getAttribute("dataType");
    const dataUnit = this.getAttribute("dataUnit");
    const dataLabel = this.getAttribute("dataLabel");
    const subDataLabel = this.getAttribute("subDataLabel");
    const icon = this.getAttribute("icon");
    const isClickable = this.getAttribute("isClickable") === "true";
    const showWaterPressure = this.getAttribute("showWaterPressure") === "true";
    const showFanRPM = this.getAttribute("showFanRPM") === "true";
    const binId = this.getAttribute("data-bin-id");

    // Render Dashboard Mini-Card
    this.innerHTML = `
      <div class="card_stats ${isClickable ? "clickable" : ""}" 
           data-max="100" 
           data-unit="${dataUnit}" 
           data-type="${dataType}"
           data-bin-id="${binId}">
        
        <div class="status_label">${dataLabel}</div>
        <div class="sub_status_label">${subDataLabel}</div>
        
        <div class="percentage">
          <span class="card_value">--</span>
          <span class="card_unit">${dataUnit}</span>
        </div>
        
        <div class="visual_graphics">
          <div class="circle">
            <svg width="48" height="48">
              <circle cx="24" cy="24" r="19" stroke="#ddd" stroke-width="4" fill="none" />
              <circle class="card_progress" cx="24" cy="24" r="19"
                      stroke="#4da6ff" stroke-width="4" fill="none"
                      stroke-linecap="round"
                      stroke-dasharray="119" stroke-dashoffset="119" />
            </svg>
            <div class="circle-icon"><img src="${icon}" alt=""></div>
          </div>
        </div>
      </div>
    `;

    // Click Handler
    if (isClickable) {
      const cardElement = this.querySelector(".card_stats");
      cardElement.addEventListener("click", () => {
        
        // 1. Get Values
        let currentVal = parseFloat(cardElement.querySelector(".card_value").innerText);
        if (isNaN(currentVal)) currentVal = 0;
        
        // 2. Determine Sensor Key
        let sensorKey = 'temperature'; 
        if (dataLabel.includes('Moisture')) sensorKey = 'soilMoisture';
        else if (dataLabel.includes('Humidity')) sensorKey = 'humidity';
        else if (dataLabel.includes('Gas')) sensorKey = 'gasLevels';

        // 3. Evaluate Status
        const evaluation = evaluateCondition(sensorKey, currentVal);
        
        // 4. Check Global Manual Mode State
        const isManual = (typeof isManualMode !== 'undefined') ? isManualMode : false;

        // 5. Build Manual Controls (ONLY IF MANUAL MODE IS ON)
        let manualHTML = '';
        
        if (isManual && (showWaterPressure || showFanRPM)) {
            // ✅ Only enters here if Manual Mode is TRUE
            manualHTML = `
            <div class="custom-manual-box">
                <span class="manual-title">Manual Actions</span>
                ${showWaterPressure ? `
                <div class="manual-row">
                    <div class="manual-item-left">
                        <img src="img/icons/water.svg" alt="Water" style="width: 24px; height: 24px;">
                        <span>Water Pump</span>
                    </div>
                    <div class="custom-toggle" onclick="this.classList.toggle('active'); controlDeviceFromModal(${binId}, 'pump', this.classList.contains('active'))"></div>
                </div>` : ''}
                
                ${showFanRPM ? `
                <div class="manual-row">
                    <div class="manual-item-left">
                        <img src="img/icons/fan.svg" alt="Fan" style="width: 24px; height: 24px;">
                        <span>Fan RPM</span>
                    </div>
                    <div class="custom-toggle" onclick="this.classList.toggle('active'); controlDeviceFromModal(${binId}, 'fan', this.classList.contains('active'))"></div>
                </div>` : ''}
            </div>`;
        } 
        // If isManual is false, manualHTML remains empty, so nothing renders.

        // 6. Open Modal
        const modal = openModal({
          cleanMode: true, 
          title: "", 
          defaultContent: `
            <div class="custom-modal-wrapper">
                <div class="custom-card-inner">
                    <div class="custom-header-row">
                        <h1 class="custom-header-title">${dataLabel}</h1>
                        <div class="custom-close-btn modalCancel">
                             <img src="img/cliparts/closeIcon.svg" style="width:14px;" onerror="this.src='img/icons/navIcons/closeIcon.svg'">
                        </div>
                    </div>

                    <div class="custom-reading-box">
                        <div class="reading-top-row">
                            <span class="reading-label">Current Reading</span>
                            <img src="img/cliparts/refresh_icon.svg" class="custom-refresh-btn" id="modalRefreshBtn" style="width:20px;" onerror="this.src='img/icons/refresh_icon.svg'">
                        </div>

                        <div class="data-display-row">
                            <div class="data-left-col">
                                <div class="big-value-text">
                                    <span id="modalVal">${currentVal}</span>
                                    <span class="unit-text">${dataUnit}</span>
                                </div>
                                <div class="status-badge">
                                    <div id="modalDot" class="status-dot ${evaluation.statusClass}"></div>
                                    <span id="modalStatus">${evaluation.status}</span>
                                </div>
                            </div>
                            <img id="modalWorm" class="worm-img-display" 
                                 src="img/worm-conditions/${evaluation.wormImage}" 
                                 alt="Worm Status"
                                 onerror="this.style.display='none'">
                        </div>
                    </div>

                    ${manualHTML}
                </div>
            </div>
          `,
          syncValues: {
            valueElem: this.querySelector(".card_value"),
            unitElem: this.querySelector(".card_unit"),
          },
          card: cardElement,
          binId: binId
        });

        // 7. Attach Events
        const closeBtn = modal.querySelector('.modalCancel');
        if(closeBtn) closeBtn.addEventListener('click', () => modal.remove());

        // Refresh Simulation
        const refreshBtn = modal.querySelector('#modalRefreshBtn');
        if(refreshBtn) {
            let rot = 0;
            refreshBtn.addEventListener('click', () => {
                rot += 360;
                refreshBtn.style.transform = `rotate(${rot}deg)`;

                // Generate Random Value
                const config = SENSOR_CONFIGS[sensorKey] || { minValue: 0, maxValue: 100 };
                const min = config.minValue - 5; 
                const max = config.maxValue + 5;
                const randomValue = (Math.random() * (max - min) + min).toFixed(1);
                const newVal = parseFloat(randomValue);

                // Re-Evaluate
                const newEval = evaluateCondition(sensorKey, newVal);

                // Update DOM
                const valEl = modal.querySelector('#modalVal');
                const statusEl = modal.querySelector('#modalStatus');
                const dotEl = modal.querySelector('#modalDot');
                const wormEl = modal.querySelector('#modalWorm');

                if(valEl) valEl.textContent = newVal;
                if(statusEl) statusEl.textContent = newEval.status;
                if(dotEl) dotEl.className = `status-dot ${newEval.statusClass}`;
                if(wormEl) {
                    wormEl.src = `img/worm-conditions/${newEval.wormImage}`;
                    wormEl.style.display = 'block';
                }

                console.log(`🔄 Simulated ${sensorKey}: ${newVal}${dataUnit} -> ${newEval.status}`);
            });
        }
      });
    }
  }
}

customElements.define("status-card", Statuscard);

// dummydata and refresh sensor function

document.querySelector(".refresh-sensors").addEventListener("click", () => {
  // ✅ Let data_integration.js handle the refresh
  if (typeof fetchSensorData === 'function') {
    fetchSensorData();
  }
  
  const timeElem = document.querySelector(".time-updated");
  if (timeElem) {
    timeElem.textContent = "Refreshing...";
    timeElem.style.opacity = "1"; 
    setTimeout(() => {
      timeElem.textContent = "Updated just now";
    }, 500);
  }
});

// ---------------------------------------------------------
// ✅ FIXED: Mode Switcher Component
// ---------------------------------------------------------

let isManualMode = JSON.parse(localStorage.getItem("isManualMode")) || false;

// 1. helper: update button label + color
function updateManualButton(btn) {
  if (!btn) return;
  
  // Update text
  btn.textContent = isManualMode ? "Mode: Manual" : "Mode: Auto";
  
  // Update styling
  btn.style.backgroundColor = isManualMode
    ? "var(--manual-mode-clr, #FF5E5E)" // Fallback red if var missing
    : "var(--auto-mode-clr, #4da6ff)";  // Fallback blue if var missing
    
  // Update accessibility state
  btn.setAttribute("aria-pressed", isManualMode ? "true" : "false");
}

// 2. The Web Component
class ModeSwitcher extends HTMLElement {
  connectedCallback() {
    // Prevent duplicate rendering if connectedCallback runs twice
    if (this.querySelector('.btn.control.manual')) return;

    // Grab help content if it exists
    const helpTemplate = this.querySelector("template.help");
    this._helpContent = helpTemplate ? helpTemplate.innerHTML.trim() : "";
    if (helpTemplate) helpTemplate.remove();

    // Create the button
    const btn = document.createElement("div");
    btn.className = "btn control manual";
    btn.setAttribute("role", "button");
    // Force some basic styles to ensure visibility even if CSS fails
    btn.style.cursor = "pointer"; 
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.padding = "10px 20px";
    btn.style.borderRadius = "30px";
    btn.style.color = "#FFF"; // Ensure text is white
    btn.style.fontWeight = "bold";

    this.appendChild(btn);
    this.button = btn;

    // Set initial state immediately
    updateManualButton(this.button);

    // Attach click event
    this.button.addEventListener("click", () => {
      confirmModeSwitch(this.button, this._helpContent);
    });
  }
}
customElements.define("mode-switcher", ModeSwitcher);


// 3. Global Mode Switch Logic (The Confirmation Modal)

function confirmModeSwitch(manualBtn, helpContent = "") {
  
  const targetMode = isManualMode ? "Auto" : "Manual";

  // Content Configuration
  const contentConfig = {
    Manual: {
      title: "Activate Manual Mode?",
      desc: "Turning on Manual Mode disables auto-mode, which also means risk for potential human errors.",
      img: "img/cliparts/manual-mode-illustration.png",
      btnText: "Activate for this bin"
    },
    Auto: {
      title: "Activate Auto Mode?",
      desc: "Turning on auto-mode makes the system operate by itself.",
      img: "img/cliparts/auto-mode-illustration.png",
      btnText: "Activate for this bin"
    }
  };

  const config = contentConfig[targetMode];

  // 1. Open Modal with New HTML Structure
  const modal = openModal({
    title: "Confirmation", // This will be hidden by CSS now
    defaultContent: `
      <div class="modal-card">
        <div class="illustration">
           <img src="${config.img}" alt="${targetMode} Mode" style="max-width:100%; height:auto;">
        </div>
        
        <h2 class="modal-title" style="margin-top:10px;">${config.title}</h2>
        <p class="modal-description">${config.desc}</p>
        
        <div class="modal-buttons">
           <button class="modal-btn modalConfirm">${config.btnText}</button>
           <button class="modal-btn btn-cancel modalCancel">Cancel</button>
        </div>
      </div>
    `,
    // We pass empty help content or ignore it since CSS hides the button anyway
    helpContent: "" 
  });

  // ✅ CRITICAL: This class triggers the CSS to hide the header and bg
  modal.classList.add('clean-modal-override');

  // 2. Attach Logic
  const confirmBtn = modal.querySelector(".modalConfirm");
  const cancelBtn  = modal.querySelector(".modalCancel");

  // Activate Button Logic
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      isManualMode = !isManualMode;
      localStorage.setItem("isManualMode", JSON.stringify(isManualMode));

      // Update the button that triggered this
      updateManualButton(manualBtn);
      
      // Sync all other manual buttons
      document.querySelectorAll('mode-switcher .btn.control.manual').forEach(btn => {
          updateManualButton(btn);
      });

      // Update UI components (sliders, inputs, etc.)
      if (typeof applyManualModeTo === "function") {
          document.querySelectorAll(".status_modal").forEach(applyManualModeTo);
      }

      modal.remove(); // Close modal
      console.log(`Switched to ${isManualMode ? 'Manual' : 'Auto'} Mode`);
    });
  }

  // Cancel Button Logic (Acts as the close button now)
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
        modal.remove(); // Simply remove the modal from DOM
    });
  }
}

// ========================================
// 1. 🛠️ UPDATED OPEN MODAL (The Fix for Double Backgrounds)
// ========================================
// Replaces your existing openModal function to allow "cleanMode"
function openModal({ title, defaultContent, helpContent, syncValues = {}, card, cleanMode = false }) {
  const modal = document.createElement("div");
  modal.classList.add("status_modal"); // Keeps the fixed overlay positioning

  if (cleanMode) {
    // 🟢 CLEAN MODE: Renders ONLY your content, no extra white boxes or headers
    modal.innerHTML = `
      <div class="modal-clean-wrapper" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
         ${defaultContent}
      </div>
    `;
  } else {
    // 🟠 LEGACY MODE: The standard white card (keeps existing logic for other parts of app)
    modal.innerHTML = `
      <div class="modal">
        <div class="modalHeader">
          <div class="sensorName"><h1>${title}</h1></div>
          <div class="close_btn"><img src="img/icons/navIcons/closeIcon.svg" alt=""></div>
        </div>
        <div class="modalCard">
          <div class="modalContent defaultContent active">${defaultContent}</div>
          <div class="QmarkIcon modal"><img src="img/icons/navIcons/QmarkIcon.svg" alt=""></div>
        </div>
        <div class="modalContent helpContent">
          <div class="helpHeader">
            <img class="back_btn" src="img/icons/navIcons/backIcon.svg" alt="">
            <h2>Help Guide</h2>
          </div>
          <div class="helpBody">${helpContent}</div>
        </div>
      </div>
    `;

    // Legacy listeners
    modal.querySelector(".close_btn").addEventListener("click", () => modal.remove());
    const qmark = modal.querySelector(".QmarkIcon");
    const back = modal.querySelector(".back_btn");
    const def = modal.querySelector(".defaultContent");
    const help = modal.querySelector(".helpContent");
    if(qmark) qmark.addEventListener("click", () => { def.classList.remove("active"); help.classList.add("active"); });
    if(back) back.addEventListener("click", () => { help.classList.remove("active"); def.classList.add("active"); });
  }

  document.body.appendChild(modal);
  
  // Apply manual mode logic if function exists
  if (typeof applyManualModeTo === 'function') applyManualModeTo(modal);

  // Sync Values Logic
  if (syncValues.valueElem && syncValues.unitElem) {
    const val = parseFloat(syncValues.valueElem.textContent) || 0;
    const unit = syncValues.unitElem.textContent || "";
    const v2Val = modal.querySelector(".card_value_v2");
    const v2Unit = modal.querySelector(".card_unit_v2");
    if(v2Val) v2Val.textContent = val;
    if(v2Unit) v2Unit.textContent = unit;
    if (card && typeof setCardValue === 'function') setCardValue(card, val);
  }

  return modal;
}

//MANUAL BUTTON UPDATES
// helper: show small transient popup at x,y (keeps your original behaviour)
function showManualPopup(x, y, text = "Manual mode is off") {
  const popup = document.createElement("div");
  popup.className = "manual-popup";
  popup.textContent = text;
  document.body.appendChild(popup);

  const left = Math.min(Math.max(x, 16), window.innerWidth - 16);
  const top = Math.max(y - 36, 8); // above point a bit

  popup.style.left = left + "px";
  popup.style.top = top + "px";

  // fade then remove
  setTimeout(() => popup.classList.add("fade"), 30);
  setTimeout(() => { if (popup && popup.parentNode) popup.parentNode.removeChild(popup); }, 1800);
}

// convenience: show popup anchored to the center/top of the control card
function showManualPopupAtControl(control, text = "Manual mode is off") {
  const rect = control.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  // show above card center a bit (change offset if you prefer)
  const y = rect.top + rect.height * 0.15;
  showManualPopup(x, y, text);
}

/* REPLACEMENT applyManualModeTo:
   - DOES NOT append DOM message (avoids duplicates)
   - disables form inputs (prevents slider movement)
   - adds a long-press listener (pointerdown + pointerup/leave) when disabled
*/
function applyManualModeTo(container) {
    if (container.querySelector(".mode-switcher-modal")) return
  const control = container.querySelector(".manualControl");
  if (!control) return;

  // visual class + opacity
  control.classList.toggle("disabled", !isManualMode);
  control.style.opacity = isManualMode ? "1" : "0.5";

  // disable interactive children (so sliders and buttons cannot be used)
  control.querySelectorAll("input, select, button, textarea").forEach(el => {
    el.disabled = !isManualMode;
  });

  // attach long-press handler once
  if (!control.dataset.popupInit) {
    control.dataset.popupInit = "1";

    let holdTimer = null;
    const HOLD_MS = 600; // long-press threshold

    const startHold = (evt) => {
      // only when manual is OFF (auto)
      if (isManualMode) return;

      // ignore right-clicks (evt.button === 2)
      if (typeof evt.button !== "undefined" && evt.button !== 0) return;

      // start timer
      holdTimer = setTimeout(() => {
        showManualPopupAtControl(control, "Manual mode is off");
        holdTimer = null;
      }, HOLD_MS);
    };

    const cancelHold = () => {
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }
    };

    // Preferred: pointer events (works for mouse + touch + pen)
    control.addEventListener("pointerdown", startHold);
    control.addEventListener("pointerup", cancelHold);
    control.addEventListener("pointercancel", cancelHold);
    control.addEventListener("pointerleave", cancelHold);

    // Fallbacks for older platforms (safe to keep):
    control.addEventListener("mousedown", startHold);
    control.addEventListener("mouseup", cancelHold);
    control.addEventListener("mouseleave", cancelHold);

    // touch events fallback (some mobile browsers treat touches differently)
    control.addEventListener("touchstart", startHold, { passive: true });
    control.addEventListener("touchend", cancelHold);
    control.addEventListener("touchcancel", cancelHold);

    // short clicks should not do anything by default when disabled.
    // But we prevent accidental click bubbling when disabled:
    control.addEventListener("click", (e) => {
      if (!isManualMode) {
        e.stopPropagation();
        e.preventDefault();
      }
    });

    
  }
}


//code for the circle visual

const radius = 19;
const circumference = 2 * Math.PI * radius;

function setCardValue(card, value) {
  const max = parseFloat(card.dataset.max) || 100;
  const unit = card.dataset.unit || "%";

  const valueElem = card.querySelector(".card_value");
  const unitElem = card.querySelector(".card_unit");
  const circle = card.querySelector(".card_progress");
  const message = card.querySelector(".status-message");
  const subLabel = card.querySelector(".sub_status_label"); // element where ${subDataLabel} ends up

  // Set value text
  valueElem.innerText = value.toFixed();
  unitElem.innerText = unit;

  // Progress circle math
  const percent = Math.min(value / max, 1);
  const offset = circumference - percent * circumference;
  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = offset;

  // === Determine color + status ===
  let color = "";
  let statusText = "";

  if (card.dataset.type === "water-tank") {
    if (value < max * 0.33) {
      color = "#df5e45ff"; // red
      statusText = "Water low, refill tank";
    } else if (value < max * 0.66) {
      color = "#d5df45ff"; // orange
      statusText = "Medium Capacity";
    } else {
      color = "#45df8aff"; // green
      statusText = "Full Capacity";
    }
  }

if (card.dataset.type === "water-temp") {
    if (value < max * 0.33) {
      color = "#456edfff";  
      statusText = "Water is Cold";
    } else if (value < max * 0.66) {
      color = "#d5df45ff"; // orange
      statusText = "Water is Warm";
    } else {
      color = "#df4545ff";   
      statusText = "Room Temperature";
    }
  }


  if (card.dataset.type === "battery") {
    if (value < max * 0.33) {
      color = "#df5e45ff"; // red
      statusText = "Low Battery, Please Charge";
    } else if (value < max * 0.66) {
      color = "#d5df45ff"; // orange
      statusText = "Medium Capacity";
    } else {
      color = "#45df8aff"; // green
      statusText = "Full Charged";
    }
  }

  if (card.dataset.type === "Sensors") {
    if (value < max * 0.33) {
      color = "#df5e45ff"; // red
      statusText = "Low";
    } else if (value < max * 0.66) {
      color = "#4A6C59"; // green
      statusText = "Stable";
    } else {
      color = "#df5e45ff"; // red again
      statusText = "Critical";
    }
  }

  // Apply styles
  if (color) {
    circle.style.stroke = color;
    if (message) {
      message.style.backgroundColor = color;
      message.style.color = "#fff";
    }
  }
 
 

  // Sync modal if open
  const modal = document.querySelector(".status_modal");
  if (modal) {
    const readingsBox = modal.querySelector(".readings");
    const modalValue = modal.querySelector(".card_value_v2");
    const modalUnit = modal.querySelector(".card_unit_v2");
    const sensorStatus = modal.querySelector(".sensorStatus");

     if (modalValue && modalUnit && sensorStatus && readingsBox) {
      modalValue.innerText = value.toFixed();
      modalUnit.innerText = unit;
      sensorStatus.innerText = statusText;

      // 🔥 Background color logic
      readingsBox.style.backgroundColor = color;
      readingsBox.style.color = "#fff";
      sensorStatus.style.backgroundColor = color;
      sensorStatus.style.color = "#fff";
    }
  }

 
  // 🔹 Update the placeholder text for subDataLabel
  if (subLabel) subLabel.innerText = statusText;
  
}

// === Refresh function ===
function refreshReading(card) {
  const max = parseFloat(card.dataset.max) || 100;
  setCardValue(card, newValue);
}


// === Init + event binding ===
document.querySelectorAll(".card_stats").forEach(card => {
  const refreshBtn = card.querySelector(".refresh_btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => refreshReading(card));
  }
  
  // ✅ Initialize with "--" instead of random values
  const valueElem = card.querySelector(".card_value");
  const unitElem = card.querySelector(".card_unit");
  if (valueElem) valueElem.textContent = '--';
  if (unitElem) unitElem.textContent = '';
});


function getContrastMode(rgbArray) {
  let [r, g, b] = rgbArray;
  let luminance = (0.299*r + 0.587*g + 0.114*b) / 255;
  return luminance > 0.5 ? "light-mode" : "dark-mode";
}

function rgbStringToArray(rgbString) {
  return rgbString.match(/\d+/g).map(Number);
}

const header = document.querySelector(".page-header.help-sec");
const sections = document.querySelectorAll("section.section");


const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // get section background
        const bg = window.getComputedStyle(entry.target).backgroundColor;
        const rgbArray = rgbStringToArray(bg);
        const mode = getContrastMode(rgbArray);

        // reset classes then add mode
        header.classList.remove("light-mode", "dark-mode");
        header.classList.add(mode);
      }
    });
  },
  { threshold: 0.6 }
);

sections.forEach(sec => observer.observe(sec));


 

// ====== ADD TO main_components.js ======

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
    showNotification('Failed to load devices', 'error');
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

  leftArrow.addEventListener('click', () => {
    if (currentBin > 1) {
      currentBin--;
      binDisplay.textContent = `Bin ${currentBin}`;
      updateSensorBin(currentBin);
    }
  });

  rightArrow.addEventListener('click', () => {
    if (currentBin < 2) {
      currentBin++;
      binDisplay.textContent = `Bin ${currentBin}`;
      updateSensorBin(currentBin);
    }
  });
}

// Update all sensor sections to show data for the selected bin
function updateSensorBin(binNumber) {
  const sensorSections = document.querySelectorAll('section-sensor-fluctuation');
  sensorSections.forEach(section => {
    section.setAttribute('data-bin', binNumber);
    // Trigger data reload here if needed
  });
}

// ====== ROUTER SETUP ======
// Add this to your router initialization or where routes are defined

// Listen for route changes
window.addEventListener('hashchange', () => {
  const hash = window.location.hash;
  if (hash === '#/dashboard') {
    setTimeout(() => loadDashboard(), 100);
  }
});

// Initial load - ONLY if explicitly on dashboard
if (window.location.hash === '#/dashboard') {
  setTimeout(() => loadDashboard(), 100);
}

 // ====== CLAIM DEVICE HANDLER ======
async function handleClaimSubmit(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  console.log('🎯 Claim button clicked!');
  
  const espID = document.getElementById('espID').value.trim();
  const alertBox = document.getElementById('claimAlertBox');
  const claimBtn = document.getElementById('claimBtn');
  const loadingSpinner = document.getElementById('claimLoadingSpinner');
  const deviceInfo = document.getElementById('claimDeviceInfo');

  // Validate ESP-ID format
  if (!espID.startsWith('AVONIC-') || espID.length < 17) {
    showClaimAlert('Please enter a valid ESP-ID (format: AVONIC-XXXXXXXXXXXX)', 'error');
    return;
  }

  // Hide previous alerts
  if (alertBox) alertBox.style.display = 'none';
  if (deviceInfo) deviceInfo.style.display = 'none';

  // Show loading
  claimBtn.disabled = true;
  if (loadingSpinner) loadingSpinner.style.display = 'block';

  try {
    const token = localStorage.getItem('avonic_token');
    
    console.log('📡 Sending claim request for:', espID);
    
    const response = await fetch(`${API_BASE}/api/devices/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ espID })
    });

    const data = await response.json();
    if (loadingSpinner) loadingSpinner.style.display = 'none';

    if (response.ok) {
      document.getElementById('claimedESPID').textContent = data.device.espID;
      document.getElementById('claimedNickname').textContent = data.device.nickname || 'My Compost Bin';
      if (deviceInfo) deviceInfo.style.display = 'block';

      console.log('✅ Device claimed:', data.device);

      setTimeout(() => {
        window.location.hash = '#/dashboard';
      }, 2000);

    } else {
      showClaimAlert(data.error || 'Failed to claim device', 'error');
      claimBtn.disabled = false;
    }

  } catch (error) {
    console.error('❌ Claim error:', error);
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    showClaimAlert('Network error. Please check your connection.', 'error');
    claimBtn.disabled = false;
  }
}

function showClaimAlert(message, type) {
  const alertBox = document.getElementById('claimAlertBox');
  if (alertBox) {
    alertBox.textContent = message;
    alertBox.className = `alert ${type}`;
    alertBox.style.display = 'block';
  }
}

// ====== BUTTON CLICK LISTENER (not form submit) ======
document.body.addEventListener('click', function(e) {
  if (e.target.id === 'claimBtn') {
    console.log('🔘 Claim button clicked via delegation!');
    handleClaimSubmit(e);
  }
});

console.log('✅ Claim device functionality loaded');

// ====== NICKNAME MANAGEMENT ======

// Open nickname edit modal
function openNicknameModal(espID, currentNickname) {
  const modal = document.createElement('div');
  modal.className = 'status_modal nickname-modal';
  
  modal.innerHTML = `
    <div class="modal">
      <div class="modalHeader">
        <h1>Edit Device Nickname</h1>
        <div class="close_btn">
          <img src="img/icons/navIcons/closeIcon.svg" alt="">
        </div>
      </div>
      
      <div class="modalCard">
        <div class="modalContent defaultContent active">
          <div class="nickname-form">
            <div class="form-group">
              <label for="nicknameInput">Device ID:</label>
              <input type="text" value="${espID}" disabled class="disabled-input">
            </div>
            
            <div class="form-group">
              <label for="nicknameInput">Nickname:</label>
              <input 
                type="text" 
                id="nicknameInput" 
                value="${currentNickname || ''}" 
                placeholder="Enter device nickname"
                maxlength="50"
              >
            </div>
            
            <div class="nickname-alert" style="display:none;"></div>
            
            <div class="manualControl">
              <div class="btn modalConfirm" id="saveNicknameBtn">Save</div>
              <div class="btn modalCancel">Cancel</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Focus input
  const input = modal.querySelector('#nicknameInput');
  input.focus();
  input.select();
  
  // Close button
  modal.querySelector('.close_btn').addEventListener('click', () => modal.remove());
  modal.querySelector('.modalCancel').addEventListener('click', () => modal.remove());
  
  // Save button
  modal.querySelector('#saveNicknameBtn').addEventListener('click', () => {
    saveNickname(espID, input.value.trim(), modal);
  });
  
  // Enter key to save
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveNickname(espID, input.value.trim(), modal);
    }
  });
}

// Save nickname to backend
async function saveNickname(espID, newNickname, modal) {
  const token = localStorage.getItem('avonic_token');
  const alertBox = modal.querySelector('.nickname-alert');
  const saveBtn = modal.querySelector('#saveNicknameBtn');
  
  if (!newNickname) {
    showNicknameAlert(alertBox, 'Please enter a nickname', 'error');
    return;
  }
  
  // Show loading
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';
  
  try {
    const response = await fetch(`${API_BASE}/api/devices/${espID}/nickname`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ nickname: newNickname })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showNicknameAlert(alertBox, '✅ Nickname saved!', 'success');
      
      // Update UI elements with new nickname
      updateNicknameInUI(espID, newNickname);
      
      setTimeout(() => modal.remove(), 1000);
      
    } else {
      showNicknameAlert(alertBox, data.error || 'Failed to save nickname', 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save';
    }
    
  } catch (error) {
    console.error('❌ Save nickname error:', error);
    showNicknameAlert(alertBox, 'Network error. Please try again.', 'error');
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
}

// Show alert in nickname modal
function showNicknameAlert(alertBox, message, type) {
  alertBox.textContent = message;
  alertBox.className = `nickname-alert ${type}`;
  alertBox.style.display = 'block';
  
  if (type === 'success') {
    setTimeout(() => {
      alertBox.style.display = 'none';
    }, 2000);
  }
}

// Update nickname throughout the UI
function updateNicknameInUI(espID, newNickname) {
  // Update device selector
  const selector = document.getElementById('home-device-selector');
  if (selector) {
    const option = selector.querySelector(`option[value="${espID}"]`);
    if (option) {
      option.textContent = `${newNickname} (${espID.slice(-6)})`;
    }
  }
  
  // Update bin cards
  const binCards = document.querySelectorAll(`bin-card[data-esp-id="${espID}"]`);
  binCards.forEach(card => {
    const binNumber = card.getAttribute('data-bin-number');
    card.setAttribute('bin_name', `${newNickname} - Bin ${binNumber}`);
    const nameElement = card.querySelector('.bin_name');
    if (nameElement) {
      nameElement.textContent = `${newNickname} - Bin ${binNumber}`;
    }
  });
  
  // Update machine status title
  const statusSection = document.querySelector(`.machine_status[data-esp-id="${espID}"]`);
  if (statusSection) {
    const title = statusSection.querySelector('h1');
    if (title) {
      title.textContent = `Machine Status - ${newNickname}`;
    }
  }
  
  // Update edit button
  const editBtn = document.querySelector('.edit-nickname-btn');
  if (editBtn) {
    editBtn.dataset.nickname = newNickname;
  }
  
  console.log(`✅ Updated nickname in UI: ${espID} -> ${newNickname}`);
}

// Add edit button click listener
document.body.addEventListener('click', function(e) {
  if (e.target.closest('.edit-nickname-btn')) {
    const btn = e.target.closest('.edit-nickname-btn');
    const espID = btn.dataset.espId;
    const currentNickname = btn.dataset.nickname;
    
    console.log('✏️ Edit nickname clicked:', espID);
    openNicknameModal(espID, currentNickname);
  }
});

console.log('✅ Nickname management loaded');

// Fetch and display sensor data
async function fetchSensorData() {
  const token = localStorage.getItem('avonic_token');
  if (!token) return;
  
  try {
    const response = await fetch('https://avonic-main-hub-production.up.railway.app/api/sensors/latest', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to fetch');
    
    const data = await response.json();
    
    // Update each card with the latest reading
    data.readings.forEach(reading => {
      updateCardWithReading(reading);
    });
    
    console.log('✅ Sensor data loaded:', data.readings.length, 'readings');
  } catch (error) {
    console.error('❌ Fetch sensor error:', error);
  }
}

// Update a card with sensor reading
// Update cards with sensor reading
function updateCardWithReading(reading) {
  if (!reading || !reading.bin1 || !reading.bin2) return;
  
  const cards = document.querySelectorAll('.card_stats');
  
  cards.forEach(card => {
    const dataType = card.dataset.type;
    const binId = card.getAttribute('binId'); // Get which bin this card is for
    
    if (dataType === 'Sensors') {
      const label = card.querySelector('.status_label')?.textContent || '';
      
      // Determine which bin's data to use
      const binData = binId === '2' ? reading.bin2 : reading.bin1;
      
      // Match sensor type and update
      if (label.includes('Soil Moisture') && binData.soil !== undefined) {
        setCardValue(card, binData.soil);
      } else if (label.includes('Temperature') && binData.temp !== undefined) {
        setCardValue(card, binData.temp);
      } else if (label.includes('Humidity') && binData.humidity !== undefined) {
        setCardValue(card, binData.humidity);
      } else if (label.includes('Gas') && binData.gas !== undefined) {
        setCardValue(card, binData.gas);
      } else if (label.includes('DS18B20') && binData.ds18b20 !== undefined) {
        setCardValue(card, binData.ds18b20);
      }
    }
    
    // Update water tank if present
    if (dataType === 'water-tank' && reading.bin2?.water_level !== undefined) {
      setCardValue(card, reading.bin2.water_level);
    }
  });
  
  console.log('✅ Cards updated with latest readings');
}


// ====== DYNAMIC HOME PAGE WITH DEVICE SELECTOR ======

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
  
  // ✅ Remove existing Machine Status sections and selector
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
      return;
    }

// ✅ CREATE DEVICE SELECTOR (only if multiple devices)
    if (devices.length > 1) {
      createDeviceSelector(devices);
    }

    // ✅ Get remembered device or use first device
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

// ✅ CREATE STYLISH DEVICE SELECTOR DROPDOWN
function createDeviceSelector(devices) {
  const homeContent = document.querySelector('.content.home');
  const pageHeader = homeContent.querySelector('.page-header');
  
  if (!pageHeader) return;

    if (document.querySelector('.device-selector-wrapper')) {
    console.log('⚠️ Selector already exists, skipping...');
    return;
  }

  // ✅ Get remembered ESP-ID from localStorage
  const rememberedESPID = localStorage.getItem('selected_espID');
  
  // ✅ Determine which device should be selected
  let selectedESPID = devices[0]?.espID; // Default to first device
  
  if (rememberedESPID) {
    // Check if the remembered device still exists in the user's devices
    const rememberedDevice = devices.find(d => d.espID === rememberedESPID);
    if (rememberedDevice) {
      selectedESPID = rememberedESPID;
      console.log(`✅ Restored remembered device: ${selectedESPID}`);
    } else {
      console.log(`⚠️ Remembered device ${rememberedESPID} not found, using first device`);
    }
  }

  // Create selector wrapper
  const selectorWrapper = document.createElement('div');
  selectorWrapper.className = 'device-selector-wrapper';
  
selectorWrapper.innerHTML = `
<div class="connection-status-section">
  <div class="connection-label">Connected to:</div>

  <div class="connection-controls-row">
    
    <div class="device-select-wrapper">
      <div class="select-icon-left">
      <img src="img/icons/bin-icon-selection.png" alt="">
      </div>

      <select class="device-select-pill" id="home-device-selector">
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
</div>
`;

  // Insert after page header
  pageHeader.insertAdjacentElement('afterend', selectorWrapper);

// ✅ Add change event listener with memory
  const selector = document.getElementById('home-device-selector');
selector.addEventListener('change', (e) => {
    const selectedDevice = devices.find(d => d.espID === e.target.value);
    if (selectedDevice) {
      console.log(`🔄 Switching to device: ${selectedDevice.espID}`);
      
      // ✅ Save the selected ESP-ID to localStorage
      localStorage.setItem('selected_espID', selectedDevice.espID);
      console.log(`💾 Saved device selection: ${selectedDevice.espID}`);
      
      // ✅ Update edit button attributes
      const editBtn = selectorWrapper.querySelector('.edit-nickname-btn');
      if (editBtn) {
        editBtn.dataset.espId = selectedDevice.espID;
        editBtn.dataset.nickname = selectedDevice.nickname || '';
      }
      
      renderDeviceData(selectedDevice, devices);
    }
  });
  

  console.log('✅ Device selector created with', devices.length, 'devices');
}

// ✅ RENDER DATA FOR SELECTED DEVICE
function renderDeviceData(device, allDevices) {
  const espID = device.espID;
  const nickname = device.nickname || espID;
  
  // ✅ Remove existing Machine Status sections
  const existingStatusSections = document.querySelectorAll('.machine_status:not(:has(#binCardsContainer))');
  existingStatusSections.forEach(section => section.remove());

  // ✅ Find the bin container parent section
  const binSection = document.querySelector('.machine_status:has(#binCardsContainer)');
  if (!binSection) {
    console.error('❌ Bin section not found');
    return;
  }

  // ✅ CREATE NEW MACHINE STATUS SECTION
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
  
  // ✅ Insert before the "Vermicompost Bins" section
  binSection.parentNode.insertBefore(newStatusSection, binSection);
  
  // Create the status cards for this device
  createMachineStatusCards(newStatusSection, espID, nickname);
  
  // ✅ UPDATE BIN CARDS
  const binContainer = document.getElementById('binCardsContainer');
  binContainer.innerHTML = '';
  
  // Create Bin 1
  const bin1Card = createBinCardElement(espID, nickname, 1);
  binContainer.appendChild(bin1Card);
  
  // Create Bin 2
  const bin2Card = createBinCardElement(espID, nickname, 2);
  binContainer.appendChild(bin2Card);

  console.log(`✅ Rendered device data for ${espID}`);
  
  // ✅ Fetch sensor data for this device
  fetchSensorDataForDevice(espID);
}

// ✅ CREATE MACHINE STATUS CARDS FOR A DEVICE
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

// ✅ CREATE BIN CARD ELEMENT
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

// ✅ FETCH SENSOR DATA FOR SPECIFIC DEVICE
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
    
    const data = await response.json();
    
    // Update cards for this specific device
    updateCardsForDevice(espID, data);
    
    console.log(`✅ Sensor data loaded for ${espID}`);
  } catch (error) {
    console.error(`❌ Fetch sensor error for ${espID}:`, error);
  }
}

// ✅ UPDATE CARDS FOR SPECIFIC DEVICE
function updateCardsForDevice(espID, reading) {
  const cards = document.querySelectorAll(`.card_stats[data-esp-id="${espID}"]`);
  
  cards.forEach(card => {
    const dataType = card.dataset.type;
    
    if (dataType === 'battery' && reading.battery !== undefined) {
      setCardValue(card, reading.battery);
    }
    
    if (dataType === 'water-tank' && reading.water_level !== undefined) {
      setCardValue(card, reading.water_level);
    }
    
    if (dataType === 'water-temp' && reading.water_temp !== undefined) {
      setCardValue(card, reading.water_temp);
    }
  });
  
  console.log(`✅ Cards updated for ${espID}`);
}

// ✅ SHOW EMPTY STATE
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

// ====== BIN PAGE GUARDS & DATA LOADING ======

// Track which page is currently loaded to prevent duplicate fetches
let currentBinPage = null;
let isLoadingBinData = false;

// Load data for specific bin page
/*async function loadBinPageData(binNumber) {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const espID = urlParams.get('espID');
  
  // ✅ Guard: Check if we're already loading
  if (isLoadingBinData) {
    console.log('⏳ Already loading bin data, skipping...');
    return;
  }
  
  // ✅ Guard: Check if ESP-ID exists
  if (!espID) {
    console.error('❌ No ESP-ID in URL, cannot load bin data');
    showBinError(binNumber, 'No device selected');
    return;
  }
  
  // ✅ Guard: Check if we're already on this bin page
  if (currentBinPage === `bin${binNumber}-${espID}`) {
    console.log(`✅ Already viewing Bin ${binNumber} for ${espID}`);
    return;
  }
  
  console.log(`🔄 Loading Bin ${binNumber} data for ${espID}...`);
  isLoadingBinData = true;
  currentBinPage = `bin${binNumber}-${espID}`;
  
  const token = localStorage.getItem('avonic_token');
  if (!token) {
    console.error('❌ No auth token');
    isLoadingBinData = false;
    return;
  }
  
  try {
    // Show loading state
    updateBinCards(binNumber, 'loading');
    
    const response = await fetch(`${API_BASE}/api/devices/${espID}/latest`, { 
    headers: { 'Authorization': `Bearer ${token}` } 
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // ✅ Update cards for the correct bin
    updateBinCards(binNumber, 'success', data, espID);
    
    console.log(`✅ Bin ${binNumber} data loaded successfully`);
    
  } catch (error) {
    console.error(`❌ Failed to load Bin ${binNumber} data:`, error);
    updateBinCards(binNumber, 'error');
  } finally {
    isLoadingBinData = false;
  }
}*/

async function loadBinPageData(binNumber) {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const espID = urlParams.get('espID');
  
  // ✅ Guard: Check if we're already loading
  if (isLoadingBinData) {
    console.log('⏳ Already loading bin data, skipping...');
    return;
  }
  
  // ✅ Guard: Check if ESP-ID exists
  if (!espID) {
    console.error('❌ No ESP-ID in URL, cannot load bin data');
    showBinError(binNumber, 'No device selected');
    return;
  }
  
  // ✅ Guard: Check if we're already on this bin page
  if (currentBinPage === `bin${binNumber}-${espID}`) {
    console.log(`✅ Already viewing Bin ${binNumber} for ${espID}`);
    return;
  }
  
  console.log(`🔄 Loading Bin ${binNumber} data for ${espID}...`);
  isLoadingBinData = true;
  currentBinPage = `bin${binNumber}-${espID}`;
  
  const token = localStorage.getItem('avonic_token');
  if (!token) {
    console.error('❌ No auth token');
    isLoadingBinData = false;
    return;
  }
  
  try {
    // Show loading state
    updateBinCards(binNumber, 'loading');
    
    // ✅ Correct URL structure
    const response = await fetch(`${API_BASE}/api/devices/${espID}/latest`, { 
      headers: { 'Authorization': `Bearer ${token}` } 
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();

    // 🛑 FIX: UNWRAP THE DATA OBJECT HERE
    // The backend sends: { success: true, data: { bin1: {...}, bin2: {...} } }
    // We need just the inner 'data' part to pass to updateBinCards
    const sensorData = result.data; 
    
    if (!sensorData) {
        console.warn(`⚠️ No sensor data found for device ${espID}`);
        // Optional: you can show an empty state here if you want
    }

    // ✅ Pass the unwrapped 'sensorData' instead of the raw 'result'
    updateBinCards(binNumber, 'success', sensorData, espID);
    
    console.log(`✅ Bin ${binNumber} data loaded successfully`);
    
  } catch (error) {
    console.error(`❌ Failed to load Bin ${binNumber} data:`, error);
    updateBinCards(binNumber, 'error');
  } finally {
    isLoadingBinData = false;
  }
}

// Update bin page cards with data
function updateBinCards(binNumber, state, data = null, espID = null) {
  const binPage = binNumber === 2 
    ? document.querySelector('.content.bin2')
    : document.querySelector('.content.bin');
  
  if (!binPage) return;
  
  const cards = binPage.querySelectorAll('.card_stats');
  
  cards.forEach(card => {
    const dataType = card.dataset.type;
    const label = card.querySelector('.status_label')?.textContent || '';
    const valueElem = card.querySelector('.card_value');
    const unitElem = card.querySelector('.card_unit');
    
    if (state === 'loading') {
      if (valueElem) valueElem.textContent = '--';
      if (unitElem) unitElem.textContent = '';
      return;
    }
    
    if (state === 'error') {
      if (valueElem) valueElem.textContent = 'ERR';
      if (unitElem) unitElem.textContent = '';
      return;
    }
    
    if (state === 'success' && data) {
      // Get the correct bin data
      const binData = binNumber === 2 ? data.bin2 : data.bin1;
      
      if (!binData) {
        console.warn(`⚠️ No data for bin${binNumber}`);
        return;
      }
      
      // Update sensor cards
      if (dataType === 'Sensors') {
        if (label.includes('Soil Moisture') && binData.soil !== undefined) {
          setCardValue(card, binData.soil);
        } else if (label.includes('Temperature') && binData.temp !== undefined) {
          setCardValue(card, binData.temp);
        } else if (label.includes('Humidity') && binData.humidity !== undefined) {
          setCardValue(card, binData.humidity);
        } else if (label.includes('Gas') && binData.gas !== undefined) {
          setCardValue(card, binData.gas);
        } else if (label.includes('DS18B20') && binData.ds18b20 !== undefined) {
          setCardValue(card, binData.ds18b20);
        }
      }
    }
  });
  
  // Update ESP-ID display
  const espDisplay = binPage.querySelector('.esp-id-display');
  if (espDisplay && espID) {
    espDisplay.textContent = `Device: ${espID}`;
  }
}

// Show error message on bin page
function showBinError(binNumber, message) {
  const binPage = binNumber === 2 
    ? document.querySelector('.content.bin2')
    : document.querySelector('.content.bin');
  
  if (!binPage) return;
  
  const cards = binPage.querySelectorAll('.card_stats');
  cards.forEach(card => {
    const valueElem = card.querySelector('.card_value');
    const unitElem = card.querySelector('.card_unit');
    if (valueElem) valueElem.textContent = '--';
    if (unitElem) unitElem.textContent = '';
  });
}

// ✅ Route handler with guards
window.addEventListener('hashchange', () => {
  const hash = window.location.hash;
  
  // Reset current page if navigating away from bins
  if (!hash.includes('#/bin')) {
    currentBinPage = null;
    isLoadingBinData = false;
  }
  
  // Load Bin 1 data
  if (hash.startsWith('#/bin?') || hash.startsWith('#/bin1?')) {
    setTimeout(() => loadBinPageData(1), 100);
  }
  
  // Load Bin 2 data
  if (hash.startsWith('#/bin2?')) {
    setTimeout(() => loadBinPageData(2), 100);
  }
  
  // Load home page
  if (hash === '#/home' || hash === '#/' || hash === '') {
    currentBinPage = null;
    setTimeout(() => loadBinCards(), 100);
  }
});

// ✅ Initial load with guard
document.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash;
  
  if (hash.startsWith('#/bin2?')) {
    setTimeout(() => loadBinPageData(2), 200);
  } else if (hash.startsWith('#/bin?') || hash.startsWith('#/bin1?')) {
    setTimeout(() => loadBinPageData(1), 200);
  } else if (hash === '#/home' || hash === '#/' || hash === '') {
    setTimeout(() => loadBinCards(), 200);
  }
});

console.log('✅ Bin page guards initialized');

// ====== DISPLAY ESP-ID ON BIN PAGES ======
window.addEventListener('hashchange', displayCurrentDevice);
document.addEventListener('DOMContentLoaded', displayCurrentDevice);

function displayCurrentDevice() {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const espID = urlParams.get('espID');
  
  const espDisplay = document.querySelector('.esp-id-display');
  if (espDisplay && espID) {
    espDisplay.textContent = `Device: ${espID}`;
  }
}

console.log('✅ ESP-ID display handler loaded');

// ✅ ADD THIS GLOBAL FUNCTION (place at bottom of main_components.js)
// ========================================
// 🍞 TOAST NOTIFICATION SYSTEM (Fixes ReferenceError)
// ========================================

window.showToast = function(message, type = 'info') {
    // 1. Remove existing toast if any
    const existing = document.querySelector('.avonic-toast');
    if (existing) existing.remove();

    // 2. Create Element
    const toast = document.createElement('div');
    toast.className = `avonic-toast ${type}`;
    
    // 3. Add Content
    toast.innerHTML = `
        <div class="toast-dot"></div>
        <span>${message}</span>
    `;

    // 4. Inject styles if they don't exist yet
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .avonic-toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-50px); background: #fff; border: 2px solid #000; padding: 12px 24px; border-radius: 50px; z-index: 10000; opacity: 0; transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55); box-shadow: 4px 4px 0 #000; font-weight: 700; display: flex; align-items: center; gap: 8px; font-family: sans-serif; pointer-events: none; }
            .avonic-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
            .avonic-toast.success .toast-dot { background: #4CAF50; }
            .avonic-toast.error .toast-dot { background: #F44336; }
            .avonic-toast.warning .toast-dot { background: #FF9800; }
            .toast-dot { width: 12px; height: 12px; border-radius: 50%; border: 1px solid #000; }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // 5. Animate In
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
    });

    // 6. Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300); 
    }, 3000);
};

window.controlDeviceFromModal = async function(binId, device, state) {
  // Check if manual mode is enabled
  if (!isManualMode) {
    showToast("⚠️ Switch to Manual Mode to control devices", "warning");
    return;
  }
  
  const endpoint = `${API_BASE}/api/bin${binId}/${device}`;
  const statusId = `modal-bin${binId}-${device}-status`;
  const statusElement = document.getElementById(statusId);
  
  // Disable buttons temporarily
  const modal = document.querySelector('.status_modal');
  if (modal) {
    const buttons = modal.querySelectorAll('.control-btn');
    buttons.forEach(btn => btn.disabled = true);
  }
  
  // Show loading state
  if (statusElement) {
    statusElement.textContent = '⏳ Sending command...';
    statusElement.style.color = '#FFA500';
  }
  
  try {
    const token = localStorage.getItem('avonic_token');
    
    if (!token) {
      throw new Error('Not logged in');
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ state: state ? 'on' : 'off' })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Update modal status
      if (statusElement) {
        statusElement.textContent = state ? '🟢 ON' : '⚪ OFF';
        statusElement.style.color = state ? '#4CAF50' : '#757575';
      }
      
      showToast(`✅ ${device.toUpperCase()} turned ${state ? 'ON' : 'OFF'}`, 'success');
      
      console.log('✅ Control successful:', data);
    } else {
      throw new Error(data.error || 'Control failed');
    }
  } catch (error) {
    console.error('❌ Control error:', error);
    if (statusElement) {
      statusElement.textContent = '❌ Failed';
      statusElement.style.color = '#f44336';
    }
    showToast('❌ ' + error.message, 'error');
  } finally {
    // Re-enable buttons
    if (modal) {
      const buttons = modal.querySelectorAll('.control-btn');
      buttons.forEach(btn => btn.disabled = false);
    }
  }
}
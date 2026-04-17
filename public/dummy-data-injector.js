/* ════════════════════════════════════════════
   dummy-data-injector.js (Pure Stealth Online Edition)
   Invisible Background Test Data Tool
   
   HOTKEYS (Hold Shift):
   Shift + S : Start STABLE simulation loop
   Shift + U : Start UNSTABLE (Bad) simulation loop
   Shift + L : Start LIVE simulation loop
   Shift + R : RESET to real backend polling
   Shift + D : Dev Login Bypass
   ════════════════════════════════════════════ */

let dummyInterval = null;
window.dummyActive = false; 
let currentSimMode = 'stable'; 

// ── Audio Beep System ─────────────────────────────────────────
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playBeep(frequency, duration) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  
  gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime); // Volume (keep it quiet)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
}

// ── Intercept Real Cloud Polling (Silent) ───────────────────────
function interceptRealPolling() {
  if (typeof API !== 'undefined' && !API._dummyPatched) {
    const origGet = API.get;
    API.get = async function() {
      if (window.dummyActive && typeof S !== 'undefined' && S.data) {
        return S.data; 
      }
      return origGet.apply(this, arguments);
    };
    API._dummyPatched = true;
    // Removed console.log for stealth demo
  }
}

// ── Hotkey Listener ─────────────────────────────────────────────
document.addEventListener('keydown', function(e) {
  // Ignore keystrokes if the user is typing in an input or textarea
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  // Only trigger if Shift is held
  if (e.shiftKey) {
    switch (e.key.toLowerCase()) {
      case 's': // STABLE
        playBeep(600, 0.15); // High beep
        setSimMode('stable');
        break;
      case 'u': // UNSTABLE
        playBeep(250, 0.25); // Low warning beep
        setSimMode('unstable');
        break;
      case 'l': // LIVE
        playBeep(450, 0.15); // Mid beep
        setSimMode('live');
        break;
      case 'r': // RESET
        playBeep(150, 0.3); // Deep shutdown beep
        resetInjector();
        break;
      case 'd': // DEV BYPASS
        playBeep(800, 0.1); 
        setTimeout(() => playBeep(1000, 0.15), 120); // Double chime
        devBypassLogin();
        break;
    }
  }
});

// ── Instant History Injection for Dashboard Charts ──────────────
function prefillHistory(mode) {
  if (typeof S === 'undefined' || !S.hist) return;

  // Wipe current history structure
  S.hist.labels = [];
  S.hist.b1 = { temperature: [], soilMoisture: [], humidity: [], gasLevels: [] };
  S.hist.b2 = { temperature: [], soilMoisture: [], humidity: [], gasLevels: [] };

  const now = new Date();
  const points = 48; // 48 points for the chart
  const rnd = (min, max) => +(Math.random() * (max - min) + min).toFixed(1);

  for (let i = points - 1; i >= 0; i--) {
    const past = new Date(now.getTime() - i * 10 * 60000);
    const label = past.getHours().toString().padStart(2, '0') + ':' + past.getMinutes().toString().padStart(2, '0');

    const b1 = generateBinSensors(rnd, mode);
    const b2 = generateBinSensors(rnd, mode);

    S.hist.labels.push(label);
    S.hist.b1.temperature.push(b1.temp);
    S.hist.b1.soilMoisture.push(b1.soil);
    S.hist.b1.humidity.push(b1.hum);
    S.hist.b1.gasLevels.push(b1.gas);

    S.hist.b2.temperature.push(b2.temp);
    S.hist.b2.soilMoisture.push(b2.soil);
    S.hist.b2.humidity.push(b2.hum);
    S.hist.b2.gasLevels.push(b2.gas);
  }
}

// ── Core Logic ──────────────────────────────────────────────────
window.setSimMode = function(mode) {
  currentSimMode = mode;
  window.dummyActive = true;
  
  // Clear any existing loop
  clearInterval(dummyInterval);
  
  // Instantly populate history so charts aren't empty
  prefillHistory(mode);
  
  // Inject immediately, then start a 3-second loop
  window.injectDummyData(); 
  dummyInterval = setInterval(window.injectDummyData, 3000);
  
  // Removed toast for stealth
};

function generateBinSensors(rnd, mode) {
  if (mode === 'stable') {
    return {
      temp: rnd(23.5, 26.5), hum: rnd(68, 75), soil: rnd(68, 78), gas: rnd(10, 45),
      fan_in: false, fan_out: false, pump: false,
      battery: Math.floor(rnd(80, 95)), water: Math.floor(rnd(75, 90)), water_temp: rnd(23.5, 25.5)
    };
  } else if (mode === 'unstable') {
    return {
      temp: rnd(36.0, 41.5), hum: rnd(20.0, 35.0), soil: rnd(92.0, 98.5), gas: rnd(210, 260),
      fan_in: true, fan_out: true, pump: false,
      battery: Math.floor(rnd(8, 18)), water: Math.floor(rnd(5, 15)), water_temp: rnd(36, 40)
    };
  } else {
    return {
      temp: rnd(15, 35), hum: rnd(35, 95), soil: rnd(35, 95), gas: rnd(0, 250),
      fan_in: Math.random() > 0.5, fan_out: Math.random() > 0.5, pump: Math.random() > 0.5,
      battery: Math.floor(rnd(10, 100)), water: Math.floor(rnd(10, 100)), water_temp: rnd(15, 35)
    };
  }
}

function generateDummyData() {
  const rnd = (min, max) => +(Math.random() * (max - min) + min).toFixed(1);

  let binsToUse = [];
  if (typeof S !== 'undefined' && S.bins && S.bins.length > 0) {
    binsToUse = S.bins; 
  } else {
    binsToUse = [
      { bin_id: "AV-B92", name: "Main Garden",  status: "online" },
      { bin_id: "AV-X11", name: "Kitchen Hub",  status: "online" }
    ];
  }

  const b1 = generateBinSensors(rnd, currentSimMode);
  const b2 = generateBinSensors(rnd, currentSimMode);

  return {
    user_profile: {
      username: (typeof S !== 'undefined' && S.user) ? S.user.username : "DevUser_2026",
      email: (typeof S !== 'undefined' && S.user) ? S.user.email : "dev@avonic.online",
      last_login: new Date().toLocaleString()
    },

    claimed_bins: binsToUse,
    battery_percent:   b1.battery,
    water_level:       b1.water,
    ds18b20_temp:      b1.water_temp,

    temp1: b1.temp,  hum1: b1.hum,  soil1_percent: b1.soil,  gas1_ppm: b1.gas,
    bin1_intake_fan_state: b1.fan_in, bin1_exhaust_fan_state: b1.fan_out, bin1_pump_state: b1.pump,

    temp2: b2.temp,  hum2: b2.hum,  soil2_percent: b2.soil,  gas2_ppm: b2.gas,
    bin2_intake_fan_state: b2.fan_in, bin2_exhaust_fan_state: b2.fan_out, bin2_pump_state: b2.pump,

    peltier_main_state: Math.random() > 0.5,
    peltier_pump_state: Math.random() > 0.5,
    charging:           false,
    wifi_connected:     true,
    lastUpdate:         "T+" + Math.floor(Date.now() / 1000) + "s"
  };
}

window.injectDummyData = function() {
  window.dummyActive = true; 
  const d = generateDummyData();
  
  if (typeof S !== 'undefined') {
    S.data = Object.assign({}, S.data || {}, d);
    S.user = d.user_profile; 
    
    if (!S.bins || S.bins.length === 0) {
      S.bins = d.claimed_bins;
      if (typeof updateGlobalBinDropdown === 'function') {
        updateGlobalBinDropdown(S.bins);
      }
    }

    if (typeof pushHist === 'function') pushHist(d);
  }

  if (typeof renderPage === 'function' && typeof Router !== 'undefined') {
    renderPage(Router.cur(), d);
  }
  
  if (typeof updateBatteryIcon === 'function') {
    updateBatteryIcon(d.battery_percent, d.charging || false);
  }

  // Updates modals if currently open
  const modal = document.getElementById('sensor-detail-modal');
  if (modal && modal.classList.contains('show') && typeof updateSensorModalData === 'function') {
    updateSensorModalData(S.activeModalBin, S.activeModalSensor, d);
    if (S.mode && S.mode[S.activeModalBin] === 'manual' && typeof populateManualActions === 'function') {
      populateManualActions(S.activeModalBin, S.activeModalSensor, document.getElementById('sm-actuator-grid'), d);
    }
  }
};

window.resetInjector = function() {
  window.dummyActive = false;
  clearInterval(dummyInterval);
  dummyInterval = null;

  if (typeof StatusModal !== 'undefined') {
    StatusModal.dismissed = { battery: false, water: false };
    StatusModal._lastBatState = null;
    StatusModal._lastWaterState = null;
  }

  if (typeof fetchAndRender === 'function') {
    fetchAndRender(); 
  }
  
  // Removed toast for stealth
};

window.devBypassLogin = function() {
  if (typeof Auth === 'undefined') return;
  Auth.loggedIn = true;
  Auth.username = 'dev';
  if (typeof authHide === 'function') authHide();
  const el = document.getElementById('dev-loggedin-user');
  if (el) el.textContent = 'dev (bypassed)';
  if (typeof startPolling === 'function') startPolling();
  // Removed toast for stealth
};

// Initialize the API interceptor silently
document.addEventListener('DOMContentLoaded', interceptRealPolling);
/* ════════════════════════════════════════════
   dummy-data-injector.js
   Floating Test Data Tool (Neo-Brutalist UI)
   ════════════════════════════════════════════ */

let dummyInterval = null;

function initDummyInjector() {
  // 1. Inject the CSS dynamically
  const style = document.createElement('style');
  style.textContent = `
    .dummy-widget {
      position: fixed; bottom: 80px; right: 16px; z-index: 9999;
      background: #ffffff; border: 2px solid #111; border-radius: 14px;
      box-shadow: 3px 3px 0px rgba(0,0,0,1); width: 210px;
      overflow: hidden; transition: transform 0.2s;
    }
    .dummy-widget.collapsed .dummy-body { display: none; }
    .dummy-header {
      background: #F4A261; padding: 9px 12px; font-weight: 700; font-size: 12px;
      display: flex; justify-content: space-between; cursor: pointer; color: #111;
      border-bottom: 2px solid #111; user-select: none;
    }
    .dummy-widget.collapsed .dummy-header { border-bottom: none; }
    .dummy-body { padding: 10px 10px 12px; display: flex; flex-direction: column; gap: 8px; }
    .dummy-section-label {
      font-size: 9px; font-weight: 800; color: #999; text-transform: uppercase;
      letter-spacing: .6px; margin-top: 2px;
    }
    .dummy-row { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .dummy-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
    .dummy-btn {
      background: #111; color: #fff; border: none; padding: 7px 4px; border-radius: 7px;
      font-size: 10px; font-weight: 600; cursor: pointer; transition: background 0.15s;
      text-align: center; line-height: 1.3;
    }
    .dummy-btn:hover { background: #333; }
    .dummy-btn:active { transform: scale(0.95); }
    .dummy-btn.full { grid-column: 1 / -1; }
    .dummy-btn.red   { background: #dc2626; }
    .dummy-btn.green { background: #16a34a; }
    .dummy-btn.amber { background: #d97706; color: #fff; }
    .dummy-btn.grey  { background: #6b7280; }
    .dummy-btn.accent { background: #F4A261; color: #111; }
    .dummy-label {
      font-size: 11px; font-weight: 600; display: flex; align-items: center;
      gap: 7px; cursor: pointer; color: #111;
    }
    .dummy-divider { border: none; border-top: 1px solid #e5e5e5; margin: 0; }
  `;
  document.head.appendChild(style);

  // 2. Inject the HTML dynamically
  const widget = document.createElement('div');
  widget.id = 'dummy-widget';
  widget.className = 'dummy-widget collapsed';
  widget.innerHTML = `
    <div class="dummy-header" onclick="toggleDummyWidget()">
      <span>🧪 Test Data</span>
      <span id="dummy-toggle-icon">▲</span>
    </div>
    <div class="dummy-body">

      <!-- General -->
      <div class="dummy-row">
        <button class="dummy-btn full" onclick="injectDummyData()">⚡ Inject Once</button>
      </div>
      <label class="dummy-label">
        <input type="checkbox" id="dummy-auto-toggle" onchange="toggleAutoInject(this)">
        Auto (3s)
      </label>

      <hr class="dummy-divider">

      <!-- Battery -->
      <div class="dummy-section-label">🔋 Battery</div>
      <div class="dummy-row">
        <button class="dummy-btn red"   onclick="injectStatusPill('battery','low')">Low</button>
        <button class="dummy-btn green" onclick="injectStatusPill('battery','full')">Full</button>
      </div>
      <div class="dummy-row">
        <button class="dummy-btn amber" onclick="injectBatteryCharging(true)">Charging</button>
        <button class="dummy-btn grey"  onclick="injectBatteryCharging(false)">Stop</button>
      </div>

      <hr class="dummy-divider">

      <!-- Water -->
      <div class="dummy-section-label">💧 Water Tank</div>
      <div class="dummy-row">
        <button class="dummy-btn red"   onclick="injectStatusPill('water','low')">Low</button>
        <button class="dummy-btn green" onclick="injectStatusPill('water','full')">Full</button>
      </div>

      <hr class="dummy-divider">

      <!-- Water Temperature -->
      <div class="dummy-section-label">🌡️ Water Temp</div>
      <div class="dummy-row">
        <button class="dummy-btn" style="background:#2563eb;" onclick="injectWaterTemp('cold')">Cold</button>
        <button class="dummy-btn green"                        onclick="injectWaterTemp('optimal')">OK</button>
      </div>
      <div class="dummy-row">
        <button class="dummy-btn amber" onclick="injectWaterTemp('warm')">Warm</button>
        <button class="dummy-btn red"   onclick="injectWaterTemp('hot')">Hot</button>
      </div>

      <hr class="dummy-divider">

      <!-- Reset + Bypass -->
      <div class="dummy-row">
        <button class="dummy-btn grey"   onclick="injectStatusPill('reset','normal')">↩ Reset</button>
        <button class="dummy-btn accent" onclick="devBypassLogin()">⚡ Login</button>
      </div>

      <hr class="dummy-divider">

      <!-- Loading State -->
      <div class="dummy-section-label">⏳ Loading Screen</div>
      <div class="dummy-row">
        <button class="dummy-btn full" onclick="LoadingState && LoadingState.show()">Show</button>
      </div>
      <div class="dummy-row">
        <button class="dummy-btn grey" onclick="LoadingState && LoadingState.hide()">Hide</button>
        <button class="dummy-btn red"  onclick="LoadingState && LoadingState.hideNow()">Force ✕</button>
      </div>

    </div>
  `;
  document.body.appendChild(widget);
}

// Attach functions to the global window object so the injected HTML can use them
window.toggleDummyWidget = function() {
  const w = document.getElementById('dummy-widget');
  const icon = document.getElementById('dummy-toggle-icon');
  if (w.classList.contains('collapsed')) {
    w.classList.remove('collapsed'); 
    icon.textContent = '▼';
  } else {
    w.classList.add('collapsed'); 
    icon.textContent = '▲';
  }
};

function generateDummyData() {
  // Helper: Random float between min and max
  const rnd = (min, max) => +(Math.random() * (max - min) + min).toFixed(1);
  
  return {
    battery_percent: Math.floor(rnd(10, 100)), 
    water_level: Math.floor(rnd(10, 100)), 
    ds18b20_temp: rnd(20, 35),
    
    // Bin 1 Data
    temp1: rnd(15, 35), 
    hum1: rnd(35, 95), 
    soil1_percent: rnd(35, 95), 
    gas1_ppm: rnd(0, 250),
    bin1_intake_fan_state: Math.random() > 0.5, 
    bin1_exhaust_fan_state: Math.random() > 0.5, 
    bin1_pump_state: Math.random() > 0.5,
    
    // Bin 2 Data
    temp2: rnd(15, 35), 
    hum2: rnd(35, 95), 
    soil2_percent: rnd(35, 95), 
    gas2_ppm: rnd(0, 250),
    bin2_intake_fan_state: Math.random() > 0.5, 
    bin2_exhaust_fan_state: Math.random() > 0.5, 
    bin2_pump_state: Math.random() > 0.5,
    
    peltier_main_state: Math.random() > 0.5, 
    peltier_pump_state: Math.random() > 0.5,
    
    charging: false,
    wifi_connected: true, 
    lastUpdate: "T+" + Math.floor(Date.now() / 1000) + "s"
  };
}

window.injectDummyData = function() {
  const d = generateDummyData();
  
  // Connects to global variables defined in app.js
  if (typeof S !== 'undefined') S.data = d; 
  if (typeof pushHist === 'function') pushHist(d);
  if (typeof renderPage === 'function' && typeof Router !== 'undefined') renderPage(Router.cur(), d);
  
  // Update battery icon directly in case renderHome isn't called
  if (typeof updateBatteryIcon === 'function') updateBatteryIcon(d.battery_percent, d.charging || false);
  
  // Updates modals if currently open
  const modal = document.getElementById('sensor-detail-modal');
  if (modal && modal.classList.contains('show') && typeof updateSensorModalData === 'function') {
    updateSensorModalData(S.activeModalBin, S.activeModalSensor, d);
    if (S.mode[S.activeModalBin] === 'manual' && typeof populateManualActions === 'function') {
      populateManualActions(S.activeModalBin, S.activeModalSensor, document.getElementById('sm-actuator-grid'), d);
    }
  }
};

window.toggleAutoInject = function(checkbox) {
  if (checkbox.checked) {
    window.injectDummyData();
    dummyInterval = setInterval(window.injectDummyData, 3000);
    if (typeof toast === 'function') toast('⚙️ Auto-Inject Started', 'ok');
  } else {
    clearInterval(dummyInterval); 
    dummyInterval = null;
    if (typeof toast === 'function') toast('🛑 Auto-Inject Stopped', 'err');
  }
};

// Build the injector UI once the main DOM is fully loaded
document.addEventListener('DOMContentLoaded', initDummyInjector);

// ── Status Pill Isolated Injector ────────────────────────────
// Isolated from the main data injector — only patches battery/water
// values and re-runs the pill alert logic without touching sensor data.
window.injectStatusPill = function(type, state) {
  if (typeof S === 'undefined' || typeof updateStatusPillAlerts !== 'function') {
    console.warn('[StatusPill] app.js not ready.');
    return;
  }

  // Ensure we have a data object to patch
  if (!S.data) S.data = {};

  // Reset dismissed flags so the modal can show again
  if (typeof StatusModal !== 'undefined') {
    if (type === 'battery' || type === 'reset') StatusModal.dismissed.battery = false;
    if (type === 'water'   || type === 'reset') StatusModal.dismissed.water   = false;
    // Force state transition detection
    if (type === 'reset') {
      StatusModal._lastBatState   = null;
      StatusModal._lastWaterState = null;
    }
  }

  if (type === 'battery') {
    if (state === 'low')    S.data.battery_percent = 10;
    if (state === 'full')   S.data.battery_percent = 98;
    if (state === 'normal') S.data.battery_percent = 55;
    // Force transition detection
    if (typeof StatusModal !== 'undefined') StatusModal._lastBatState = null;
  }

  if (type === 'water') {
    if (state === 'low')    S.data.water_level = 10;
    if (state === 'full')   S.data.water_level = 95;
    if (state === 'normal') S.data.water_level = 55;
    if (typeof StatusModal !== 'undefined') StatusModal._lastWaterState = null;
  }

  if (type === 'reset') {
    S.data.battery_percent = 55;
    S.data.water_level     = 55;
  }

  // Update pill colors & auto-trigger modal if thresholds hit
  updateStatusPillAlerts(S.data);

  // Also update the pill text values
  const batEl = document.getElementById('bat-pct-text');
  if (batEl && S.data.battery_percent != null) batEl.textContent = S.data.battery_percent + '%';
  const waterEl = document.getElementById('water-pct-text');
  if (waterEl && S.data.water_level != null) waterEl.textContent = S.data.water_level + '%';

  if (typeof toast === 'function') {
    const labels = { battery: '🔋 Battery', water: '💧 Water', reset: '↩ Pills' };
    toast(`${labels[type] || type} → ${state}`, 'ok');
  }
};

// ── Battery Charging Toggle ───────────────────────────────────
window.injectBatteryCharging = function(charging) {
  if (typeof S === 'undefined') return;
  if (!S.data) S.data = {};
  S.data.charging = charging;
  const pct = S.data.battery_percent != null ? S.data.battery_percent : 60;
  if (typeof updateBatteryIcon === 'function') updateBatteryIcon(pct, charging);
  if (typeof toast === 'function') toast(charging ? '🔋 Charging animation ON' : '🔋 Charging animation OFF', 'ok');
};

// ── Water Temperature Injector ────────────────────────────────
// Patches ds18b20_temp and syncs the temp modal SVG live if open.
// Zones match WORM_CONFIGS: critical_min=15 optimal=22-28 critical_max=35
window.injectWaterTemp = function(zone) {
  if (typeof S === 'undefined') return;
  if (!S.data) S.data = {};

  const tempMap = {
    cold:    13.0,  // below critical_min (15)
    optimal: 25.0,  // mid optimal range  (22–28)
    warm:    30.5,  // above optimal, below critical_max (35)
    hot:     37.0,  // above critical_max (35)
  };

  const val = tempMap[zone];
  if (val == null) return;
  S.data.ds18b20_temp = val;

  // Update home pill text if present
  const el = document.getElementById('home-temp-val');
  if (el) el.textContent = val.toFixed(1) + ' C°';

  // Re-render current page if on home
  if (typeof renderPage === 'function' && typeof Router !== 'undefined') {
    renderPage(Router.cur(), S.data);
  }

  // Live-update temp modal SVG and description if the modal is open
  if (typeof updateTempModalSVG === 'function') {
    updateTempModalSVG(val);
  }
  const descEl = document.getElementById('status-modal-temp-desc');
  if (descEl && document.getElementById('status-modal-temp')?.classList.contains('show')) {
    descEl.textContent = `Current water temperature is ${val.toFixed(1)} °C.`;
  }

  const labels = { cold: '🥶 Cold ('+val+'°C)', optimal: '✅ Optimal ('+val+'°C)', warm: '🌡️ Warm ('+val+'°C)', hot: '🔥 Hot ('+val+'°C)' };
  if (typeof toast === 'function') toast('Temp → ' + labels[zone], 'ok');
};

// ── Esc key: instantly exit the loading screen overlay ────────
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && typeof LoadingState !== 'undefined') {
    LoadingState.hideNow();
  }
});


// Skips the auth screen entirely for local Live Server development.
// The real ESP32 login is unavailable from a browser not on the device's network.
window.devBypassLogin = function() {
  if (typeof Auth === 'undefined') {
    console.warn('Auth module not found. Make sure app.js is loaded.');
    return;
  }
  Auth.loggedIn = true;
  Auth.username = 'dev';

  // Hide auth overlay
  if (typeof authHide === 'function') authHide();

  // Update the "logged in as" label in settings
  const el = document.getElementById('dev-loggedin-user');
  if (el) el.textContent = 'dev (bypassed)';

  // Start polling (will fail silently since /data doesn't exist on Live Server)
  if (typeof startPolling === 'function') startPolling();

  if (typeof toast === 'function') toast('⚡ Login bypassed — dev mode', 'ok');
  console.log('%c⚡ AVONIC Dev Bypass Active', 'color:#F4A261;font-weight:bold;font-size:14px');
};
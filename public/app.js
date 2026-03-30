/* ═══════════════════════════════════
   AVONIC  –  app.js  v6.0  (Online)
   Connected to Railway + MongoDB backend
   ═══════════════════════════════════ */
'use strict';

// ── Backend URL ───────────────────────────────────────────────
// Change this to your Railway URL once deployed
const BASE_URL = 'https://avonic-main-hub-production.up.railway.app';

// ── Sensor Configs & Worm Conditions ──────────────────────────
const WORM_CONFIGS = {
  temperature: { optimal_min: 22, optimal_max: 28, critical_min: 15, critical_max: 35, unit: '°C' },
  soilMoisture: { optimal_min: 60, optimal_max: 80, critical_min: 40, critical_max: 90, unit: '%' },
  humidity: { optimal_min: 60, optimal_max: 80, critical_min: 40, critical_max: 90, unit: '%' },
  gasLevels: { optimal_min: 0, optimal_max: 100, critical_max: 200, unit: 'ppm' }
};

const CFG = {
  POLL: 10000, // 10s — less aggressive for cloud polling vs local
  HIST: 48,
  OPT: WORM_CONFIGS
};

// ── State ───────────────────────────
const S = {
  data: null,
  mode: { 1:'auto', 2:'auto' },
  hist: {
    labels:[],
    b1:{ temperature:[], soilMoisture:[], humidity:[], gasLevels:[] },
    b2:{ temperature:[], soilMoisture:[], humidity:[], gasLevels:[] }
  },
  bfChart: null,
  qiBin:1, qiSens:'soilMoisture',
  bfBin:1, bfSens:'soilMoisture',
  activeModalBin: 1,
  activeModalSensor: null,
  activeEspID: null,    // currently selected device ESP ID
  bins: [],             // list of claimed devices
  user: null            // logged-in user profile
};

// ── DOM helpers ─────────────────────
const $ = (id) => document.getElementById(id);
const setText = (id, v) => { const e = $(id); if(e) e.textContent = v; };
const fmt = (v) => v != null ? parseFloat(v).toFixed(1) : '--';

// ════════════════════════════════════
// AUTH TOKEN HELPERS
// ════════════════════════════════════
const Token = {
  get() { return localStorage.getItem('avonic_token'); },
  set(t) { localStorage.setItem('avonic_token', t); },
  clear() { localStorage.removeItem('avonic_token'); },
  headers() {
    const t = this.get();
    return t ? { 'Authorization': 'Bearer ' + t, 'Content-Type': 'application/json' }
             : { 'Content-Type': 'application/json' };
  }
};

// ════════════════════════════════════
// 🎨 EVALUATE CONDITION LOGIC
// ════════════════════════════════════
function evaluateCondition(sensorType, value) {
    if (!WORM_CONFIGS[sensorType]) {
        return { status: 'Unknown', statusClass: 'warning', wormImage: 'Normal.png' };
    }
    const ranges = WORM_CONFIGS[sensorType];
    let status = 'Optimal';
    let statusClass = 'optimal';
    let wormImage = 'Normal.png';

    switch(sensorType) {
        case 'temperature':
            if (value < ranges.critical_min) { status = 'Critically Cold'; statusClass = 'critical'; wormImage = 'Too Dry.png'; }
            else if (value < ranges.optimal_min) { status = 'Too Cold'; statusClass = 'warning'; wormImage = 'Too Dry.png'; }
            else if (value > ranges.critical_max) { status = 'Critically Hot'; statusClass = 'critical'; wormImage = 'Too Hot.png'; }
            else if (value > ranges.optimal_max) { status = 'Too Hot'; statusClass = 'warning'; wormImage = 'Too Hot.png'; }
            break;
        case 'soilMoisture':
        case 'humidity':
            if (value < ranges.critical_min) { status = 'Critically Dry'; statusClass = 'critical'; wormImage = 'Too Dry.png'; }
            else if (value < ranges.optimal_min) { status = 'Dry'; statusClass = 'warning'; wormImage = 'Too Dry.png'; }
            else if (value > ranges.critical_max) { status = 'Critically Wet'; statusClass = 'critical'; wormImage = 'Too Wet.png'; }
            else if (value > ranges.optimal_max) { status = 'Wet'; statusClass = 'warning'; wormImage = 'Too Wet.png'; }
            break;
        case 'gasLevels':
            if (value > ranges.critical_max) { status = 'Toxic Gas'; statusClass = 'critical'; wormImage = 'Gas Too High.png'; }
            else if (value > ranges.optimal_max) { status = 'High Gas'; statusClass = 'warning'; wormImage = 'Gas Too High.png'; }
            break;
    }
    return { status, statusClass, wormImage };
}

// ════════════════════════════════════
// ROUTER & SIDEBAR
// ════════════════════════════════════
const ROUTES = {
  '': 'home', 'home': 'home',
  'bin1': 'bin1', 'bin2': 'bin2',
  'dashboard': 'dashboard',
  'quick-insights': 'quick-insights',
  'bin-fluctuation': 'bin-fluctuation',
  'settings': 'settings'
};

const Router = (() => {
  function cur() { return ROUTES[window.location.hash.slice(2)] || 'home'; }
  function apply() {
    const id = cur();
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pg = $('page-' + id);
    if (pg) pg.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navId = (id === 'quick-insights' || id === 'bin-fluctuation') ? 'dashboard' : id;
    const ni = document.querySelector(`.nav-item[data-route="${navId}"]`);
    if (ni) ni.classList.add('active');

    document.querySelectorAll('.bnav-item').forEach(n => n.classList.remove('active'));
    const bi = document.querySelector(`.bnav-item[data-route="${navId}"]`);
    if (bi) bi.classList.add('active');

    if (S.data) renderPage(id, S.data);
    if (id === 'bin-fluctuation') initBFChart();
    closeSidebar();
  }
  function init() {
    window.addEventListener('hashchange', apply);
    apply();
  }
  return { init, cur };
})();

function setupSidebar() {
  const ham = $('hamburger'), ov = $('sidebar-overlay'), sb = document.querySelector('.sidebar');
  if(ham) ham.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-expanded');
  });
  if(ov) ov.addEventListener('click', closeSidebar);
}

function closeSidebar() {
  document.body.classList.remove('sidebar-expanded');
}

// ════════════════════════════════════
// API — Online Backend
// ════════════════════════════════════
const API = {
  // Fetch latest sensor data from the active device
  async get() {
    if (!S.activeEspID) throw new Error('NO_DEVICE');
    const r = await fetch(`${BASE_URL}/api/sensors/${S.activeEspID}/latest`, {
      headers: Token.headers(),
      cache: 'no-store'
    });
    if (r.status === 401) throw new Error('401');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const json = await r.json();
    // Flatten the nested MongoDB structure into the flat format the UI expects
    return flattenSensorData(json);
  },

  // Send actuator command via backend → MQTT → ESP32
  async cmd(ep, val) {
    const r = await fetch(`${BASE_URL}/api${ep}`, {
      method: 'POST',
      headers: Token.headers(),
      body: JSON.stringify({ state: val })
    });
    if (r.status === 401) throw new Error('401');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  },

  // Get all claimed devices for the logged-in user
  async getDevices() {
    const r = await fetch(`${BASE_URL}/api/devices/claimed`, {
      headers: Token.headers()
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  },

  // Claim a device by espID
  async claimDevice(espID) {
    const r = await fetch(`${BASE_URL}/api/devices/claim`, {
      method: 'POST',
      headers: Token.headers(),
      body: JSON.stringify({ espID })
    });
    if (!r.ok) {
      const d = await r.json();
      throw new Error(d.error || 'Claim failed');
    }
    return r.json();
  },

  // Unclaim a device
  async unclaimDevice(espID) {
    const r = await fetch(`${BASE_URL}/api/devices/${espID}/unclaim`, {
      method: 'DELETE',
      headers: Token.headers()
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  },

  // Rename a device
  async renameDevice(espID, nickname) {
    const r = await fetch(`${BASE_URL}/api/devices/${espID}/nickname`, {
      method: 'PUT',
      headers: Token.headers(),
      body: JSON.stringify({ nickname })
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  },

  // Get user profile
  async getProfile() {
    const r = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: Token.headers()
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  },

  // Update user profile
  async updateProfile(username, email) {
    const r = await fetch(`${BASE_URL}/api/user/profile`, {
      method: 'PUT',
      headers: Token.headers(),
      body: JSON.stringify({ username, email })
    });
    if (!r.ok) {
      const d = await r.json();
      throw new Error(d.error || 'Update failed');
    }
    return r.json();
  },

  // Get mode state for active device
  async getMode() {
    if (!S.activeEspID) return null;
    const r = await fetch(`${BASE_URL}/api/devices/${S.activeEspID}/mode`, {
      headers: Token.headers()
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  },

  // Set mode for a bin
  async setMode(bin, mode) {
    if (!S.activeEspID) return;
    const r = await fetch(`${BASE_URL}/api/devices/${S.activeEspID}/mode`, {
      method: 'POST',
      headers: Token.headers(),
      body: JSON.stringify({ bin, mode })
    });
    if (!r.ok) {
      const d = await r.json();
      throw new Error(d.error || 'Mode change failed');
    }
    return r.json();
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    const r = await fetch(`${BASE_URL}/api/user/change-password`, {
      method: 'POST',
      headers: Token.headers(),
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    });
    if (!r.ok) {
      const d = await r.json();
      throw new Error(d.error || 'Password change failed');
    }
    return r.json();
  }
};

// ── Flatten MongoDB sensor doc → flat UI format ───────────────
// The backend stores data as { bin1: {temp, humidity, soil, gas,...}, bin2: {...}, system: {...} }
// The UI expects flat keys like temp1, hum1, soil1_percent, gas1_ppm etc.
function flattenSensorData(json) {
  const d = json.data || json;
  if (!d) return null;

  const b1  = d.bin1   || {};
  const b2  = d.bin2   || {};
  const sys = d.system || {};
  const pel = d.peltier || {};

  return {
    // Bin 1
    temp1:                  b1.temp         ?? null,
    hum1:                   b1.humidity     ?? null,
    soil1_percent:          b1.soil         ?? null,
    gas1_ppm:               b1.gas          ?? null,
    ds18b20_temp:           b1.ds18b20      ?? null,
    ultrasonic:             b1.ultrasonic   ?? null,
    bin1_exhaust_fan_state: b1.exhaust_fan  ?? false,
    bin1_intake_fan_state:  b1.intake_fan   ?? false,
    bin1_pump_state:        b1.pump         ?? false,

    // Bin 2
    temp2:                  b2.temp         ?? null,
    hum2:                   b2.humidity     ?? null,
    soil2_percent:          b2.soil         ?? null,
    gas2_ppm:               b2.gas          ?? null,
    water_level:            b2.water_level  ?? null,
    bin2_exhaust_fan_state: b2.exhaust_fan  ?? false,
    bin2_intake_fan_state:  b2.intake_fan   ?? false,
    bin2_pump_state:        b2.pump         ?? false,

    // Peltier
    peltier_main_state:     pel.main        ?? false,
    peltier_pump_state:     pel.pump        ?? false,

    // System
    battery_percent:        sys.battery_level    ?? null,
    charging:               sys.battery_charging ?? false,
    wifi_connected:         sys.wifi_rssi != null,
    uptime:                 sys.uptime      ?? null,

    lastUpdate: d.timestamp
      ? new Date(d.timestamp).toLocaleTimeString()
      : '--',
    espID: d.espID || S.activeEspID
  };
}

// ── Load devices and populate state ──────────────────────────
async function loadDevices() {
  try {
    const res = await API.getDevices();
    const devices = res.devices || res;
    if (!devices || devices.length === 0) {
      S.bins = [];
      S.activeEspID = null;
      renderClaimedBins([]);
      return;
    }

    S.bins = devices.map(d => ({
      bin_id: d.espID,
      name: d.nickname || d.espID,
      status: d.mqtt_connected ? 'online' : 'offline',
      last_seen: d.last_seen
    }));

    // Set first device as active if none selected
    if (!S.activeEspID) {
      S.activeEspID = S.bins[0].bin_id;
    }

    renderClaimedBins(S.bins);
    updateGlobalBinDropdown(S.bins);
  } catch(e) {
    console.error('Failed to load devices:', e);
  }
}

// ── Load user profile ─────────────────────────────────────────
async function loadProfile() {
  try {
    const res = await API.getProfile();
    S.user = res.user || res;
    if (S.user) {
      setText('acc-username', S.user.username || '--');
      setText('acc-email', S.user.email || '--');
      setText('acc-last-login', S.user.last_login
        ? new Date(S.user.last_login).toLocaleString()
        : '--');
      setText('dev-loggedin-user', S.user.username);
    }
  } catch(e) {
    console.error('Failed to load profile:', e);
  }
}

// ════════════════════════════════════
// POLLING
// ════════════════════════════════════
async function fetchAndRender() {
  document.querySelectorAll('.refresh-btn, .refresh-spin').forEach(b => b.classList.add('spinning'));
  try {
    if (!S.activeEspID) {
      // No device selected — just show empty state
      return;
    }
    const d = await API.get();
    if (!d) return;
    S.data = d;
    pushHist(d);
    renderPage(Router.cur(), d);

    if ($('sensor-detail-modal') && $('sensor-detail-modal').classList.contains('show')) {
      updateSensorModalData(S.activeModalBin, S.activeModalSensor, d);
      if (S.mode[S.activeModalBin] === 'manual') {
        populateManualActions(S.activeModalBin, S.activeModalSensor, $('sm-actuator-grid'), d);
      }
    }
  } catch(e) {
    if (e.message && e.message.includes('401')) {
      Token.clear();
      Auth.loggedIn = false;
      authShow();
      toast('Session expired — please log in again', 'err');
    } else if (e.message === 'NO_DEVICE') {
      // Silently skip — no device claimed yet
    } else {
      console.error('Fetch error:', e.message);
    }
  } finally {
    document.querySelectorAll('.refresh-btn, .refresh-spin').forEach(b => b.classList.remove('spinning'));
  }
}

function pushHist(d) {
  const h = S.hist;
  const now = new Date();
  h.labels.push(now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0'));
  h.b1.temperature.push(d.temp1); h.b1.soilMoisture.push(d.soil1_percent);
  h.b1.humidity.push(d.hum1);     h.b1.gasLevels.push(d.gas1_ppm);
  h.b2.temperature.push(d.temp2); h.b2.soilMoisture.push(d.soil2_percent);
  h.b2.humidity.push(d.hum2);     h.b2.gasLevels.push(d.gas2_ppm);
  if (h.labels.length > CFG.HIST) {
    h.labels.shift();
    ['temperature','soilMoisture','humidity','gasLevels'].forEach(k => { h.b1[k].shift(); h.b2[k].shift(); });
  }
}

function startPolling() {
  fetchAndRender();
  setInterval(fetchAndRender, CFG.POLL);
}

// ════════════════════════════════════
// PAGE RENDERERS
// ════════════════════════════════════
function renderPage(id, d) {
  switch(id) {
    case 'home':            renderHome(d); break;
    case 'bin1':            renderBin(1,d); break;
    case 'bin2':            renderBin(2,d); break;
    case 'quick-insights':  renderQI(); break;
    case 'bin-fluctuation': renderBF(); break;
    case 'settings':        renderSettings(d); break;
  }
}

function renderHome(d) {
  const pct = d.battery_percent || 0;
  setText('bat-pct-text', pct + '%');
  setText('water-pct-text', (d.water_level != null ? d.water_level : '--') + '%');

  updateBatteryIcon(pct, d.charging || false);

  if (d.ds18b20_temp != null) {
    setText('home-temp-val', fmt(d.ds18b20_temp) + ' C°');
  } else if (d.temp1 != null || d.temp2 != null) {
    const t = ((d.temp1 || 0) + (d.temp2 || 0)) / (d.temp1 != null && d.temp2 != null ? 2 : 1);
    setText('home-temp-val', fmt(t) + ' C°');
  } else {
    setText('home-temp-val', '-- C°');
  }

  if ($('home-b1-mode')) $('home-b1-mode').innerHTML = `<span class="bin-dot"></span> ${S.mode[1]==='auto'?'Auto Mode':'Manual Mode'}`;
  if ($('home-b2-mode')) $('home-b2-mode').innerHTML = `<span class="bin-dot"></span> ${S.mode[2]==='auto'?'Auto Mode':'Manual Mode'}`;

  updateStatusPillAlerts(d);
  renderRecentQI();
}

function renderBin(n, d) {
  const b1 = n === 1;
  const map = {
    soilMoisture: { val: b1 ? d.soil1_percent : d.soil2_percent },
    temperature:  { val: b1 ? d.temp1 : d.temp2 },
    humidity:     { val: b1 ? d.hum1 : d.hum2 },
    gasLevels:    { val: b1 ? d.gas1_ppm : d.gas2_ppm }
  };

  for (const [k, s] of Object.entries(map)) {
    const v = s.val;
    let stText = 'Optimal';
    let stClass = 'optimal';

    if (v != null && typeof evaluateCondition === 'function') {
      const res = evaluateCondition(k, v);
      stText = res.status;
      if (res.statusClass === 'critical') stClass = 'danger';
      else if (res.statusClass === 'warning') stClass = 'warn';
      else stClass = 'optimal';
    }

    setText(`b${n}-${k}-val`, v != null ? fmt(v) : '--');
    const sEl = $(`b${n}-${k}-status`);
    if(sEl) sEl.textContent = stText;

    const idMap = { soilMoisture: 'soil', temperature: 'temp', humidity: 'hum', gasLevels: 'gas' };
    let cEl = $(`b${n}-${k}-card`) || $(`b${n}-${idMap[k]}-card`);
    if(cEl) cEl.className = 'sensor-card ' + stClass;

    const ring = $(`b${n}-${k}-ring`);
    if (ring && v != null) {
      const maxVal = k === 'gasLevels' ? 250 : 100;
      const pct = Math.min(1, Math.max(0, v / maxVal));
      ring.style.strokeDashoffset = 175.9 - (pct * 175.9);
    }
  }

  const now = new Date();
  const timeStr = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
  setText(`b${n}-updated`, 'Updated at ' + timeStr);

  const mb = $(`b${n}-mode-btn`);
  if(mb){
    const isAuto = S.mode[n] === 'auto';
    mb.innerHTML = `${isAuto ? 'Auto' : 'Manual'}`;
    mb.className = `mode-btn ${isAuto ? 'auto' : 'manual'}`;
  }
}

// ════════════════════════════════════
// MODAL MANAGER
// ════════════════════════════════════
const ModalManager = (() => {
  let _queue   = [];
  let _current = null;

  function _show(id) {
    const el = $(id);
    if (!el) return;
    _current = id;
    $('sys-modal-overlay').classList.add('show');
    el.classList.add('show');
  }

  function open(id) {
    if (_current) { _queue.push(id); return; }
    _show(id);
  }

  function close() {
    if (_current) { $(_current)?.classList.remove('show'); _current = null; }
    document.querySelectorAll('.sys-modal.show, .act-modal.show')
      .forEach(m => m.classList.remove('show'));

    if (_queue.length > 0) {
      setTimeout(() => _show(_queue.shift()), 120);
    } else {
      $('sys-modal-overlay').classList.remove('show');
    }
  }

  function closeAll() {
    _queue   = [];
    _current = null;
    $('sys-modal-overlay').classList.remove('show');
    document.querySelectorAll('.sys-modal, .act-modal')
      .forEach(m => m.classList.remove('show'));
  }

  function current() { return _current; }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && _current) close();
  });

  return { open, close, closeAll, current };
})();

function openModal(id)    { ModalManager.open(id);   }
function closeTopModal()  { ModalManager.close();    }
function closeAllModals() { ModalManager.closeAll(); }

// ── Load mode state from backend on login ────────────────────
async function loadMode() {
  try {
    const res = await API.getMode();
    if (res && res.bin_modes) {
      S.mode[1] = res.bin_modes.bin1 || 'auto';
      S.mode[2] = res.bin_modes.bin2 || 'auto';
      console.log(`✅ Mode loaded: Bin1=${S.mode[1]}, Bin2=${S.mode[2]}`);
    }
  } catch(e) {
    console.error('Failed to load mode:', e);
  }
}

// 1. Mode Confirmation Modal
function openModeModal(binNum) {
  const targetMode = S.mode[binNum] === 'auto' ? 'manual' : 'auto';

  $('mode-modal-title').textContent = targetMode === 'auto' ? 'Activate Auto Mode?' : 'Activate Manual Mode?';
  $('mode-modal-desc').textContent = targetMode === 'auto'
    ? 'Turning on auto-mode makes the system operate by itself.'
    : 'Turning on Manual Mode disables auto-mode, which also means risk for potential human errors.';

  const ill = $('mode-ill-img');
  if (ill) ill.src = targetMode === 'auto' ? '/img/photos/AutoMode.png' : '/img/photos/ManualMode.png';

  const btn = $('mode-confirm-btn');
  btn.onclick = async () => {
    // Optimistically update UI
    S.mode[binNum] = targetMode;

    const mb = $(`b${binNum}-mode-btn`);
    if(mb) {
      const isAuto = targetMode === 'auto';
      mb.innerHTML = `${isAuto ? 'Auto' : 'Manual'}`;
      mb.className = `mode-btn ${isAuto ? 'auto' : 'manual'}`;
    }

    const hmb = $(`home-b${binNum}-mode`);
    if(hmb) {
      hmb.innerHTML = `<span class="bin-dot"></span> ${targetMode === 'auto' ? 'Auto Mode' : 'Manual Mode'}`;
    }

    if(S.data) renderBin(binNum, S.data);

    if($('sensor-detail-modal') && $('sensor-detail-modal').classList.contains('show')) {
      openSensorModal(S.activeModalBin, S.activeModalSensor, $('sm-title').textContent, $('sm-icon').src);
    }

    closeAllModals();
    toast(`Bin ${binNum} switching to ${targetMode.toUpperCase()} mode...`, 'ok');

    // Sync to backend → MQTT → ESP32 → Slave
    try {
      await API.setMode(`bin${binNum}`, targetMode);
      toast(`Bin ${binNum} is now in ${targetMode.toUpperCase()} mode`, 'ok');
    } catch(e) {
      // Revert UI on failure
      S.mode[binNum] = targetMode === 'auto' ? 'manual' : 'auto';
      if(S.data) renderBin(binNum, S.data);
      toast(`Failed to set mode: ${e.message}`, 'err');
    }
  };

  openModal('mode-switch-modal');
}

// 2. Sensor Detail Modal
function openSensorModal(binNum, sensorType, title, iconPath) {
  S.activeModalBin = binNum;
  S.activeModalSensor = sensorType;

  $('sm-title').textContent = title;
  $('sm-icon').src = iconPath;

  if (CFG.OPT[sensorType] && CFG.OPT[sensorType].unit) {
    $('sm-unit').textContent = CFG.OPT[sensorType].unit;
  }

  const safeData = S.data || {};
  updateSensorModalData(binNum, sensorType, safeData);

  const manualArea = $('sm-manual-area');
  const actGrid = $('sm-actuator-grid');

  if (S.mode[binNum] === 'manual') {
    manualArea.style.display = 'block';
    populateManualActions(binNum, sensorType, actGrid, safeData);
  } else {
    manualArea.style.display = 'none';
  }

  openModal('sensor-detail-modal');
}

function updateSensorModalData(bin, sensor, d) {
  const b1 = bin === 1;
  const map = {
    soilMoisture: b1 ? d.soil1_percent : d.soil2_percent,
    temperature:  b1 ? d.temp1 : d.temp2,
    humidity:     b1 ? d.hum1 : d.hum2,
    gasLevels:    b1 ? d.gas1_ppm : d.gas2_ppm
  };

  const v = map[sensor];
  $('sm-val').textContent = v != null ? fmt(v) : '--';

  let conditionStr = 'Optimal', color = '#6aab7a', clipart = 'Normal.png';

  if (v != null && typeof evaluateCondition === 'function') {
    const res = evaluateCondition(sensor, v);
    clipart = res.wormImage;
    conditionStr = res.status;
    if (res.statusClass === 'critical') color = 'var(--danger)';
    else if (res.statusClass === 'warning') color = 'var(--warn)';
    else color = 'var(--green-accent)';
  }

  $('sm-status-text').textContent = conditionStr;
  const dot = $('sm-status-ind').querySelector('.dot');
  if(dot) dot.style.background = color;

  $('sm-worm-img').src = `/img/worm-conditions/${encodeURIComponent(clipart)}`;
}

function populateManualActions(bin, sensor, container, d) {
  const b1 = bin === 1;
  let actuators = [];

  if (sensor === 'temperature') actuators = [
    {id:`b${bin}-exh`, name:'Fan', icon:'/img/actuators/FanIcon.svg', state: b1 ? d.bin1_exhaust_fan_state : d.bin2_exhaust_fan_state, ep:`/bin${bin}/exhaust-fan`},
    {id:`b${bin}-int`, name:'Mist', icon:'/img/actuators/MistIcon.svg', state: b1 ? d.bin1_intake_fan_state : d.bin2_intake_fan_state, ep:`/bin${bin}/intake-fan`}
  ];
  else if (sensor === 'soilMoisture') actuators = [
    {id:`b${bin}-pmp`, name:'Mist', icon:'/img/actuators/MistIcon.svg', state: b1 ? d.bin1_pump_state : d.bin2_pump_state, ep:`/bin${bin}/pump`}
  ];
  else if (sensor === 'humidity') actuators = [
    {id:`b${bin}-exh`, name:'Fan', icon:'/img/actuators/FanIcon.svg', state: b1 ? d.bin1_exhaust_fan_state : d.bin2_exhaust_fan_state, ep:`/bin${bin}/exhaust-fan`},
    {id:`b${bin}-pmp`, name:'Mist', icon:'/img/actuators/MistIcon.svg', state: b1 ? d.bin1_pump_state : d.bin2_pump_state, ep:`/bin${bin}/pump`}
  ];
  else if (sensor === 'gasLevels') actuators = [
    {id:`b${bin}-exh`, name:'Fan', icon:'/img/actuators/FanIcon.svg', state: b1 ? d.bin1_exhaust_fan_state : d.bin2_exhaust_fan_state, ep:`/bin${bin}/exhaust-fan`}
  ];

  container.innerHTML = actuators.map(a => `
    <div class="sm-act-box">
      <div class="sm-act-left">
        <div class="sm-act-icon-bg">
          <img src="${a.icon}" alt="${a.name}">
        </div>
        <div class="sm-act-name">${a.name}</div>
      </div>
      <label class="tog">
        <input type="checkbox" id="mod-act-${a.id}" ${a.state ? 'checked' : ''}>
        <span class="tog-track"></span>
      </label>
    </div>
  `).join('');

  actuators.forEach(a => {
    const el = $(`mod-act-${a.id}`);
    if(!el) return;
    el.addEventListener('change', async () => {
      const on = el.checked;
      try {
        await API.cmd(a.ep, on ? 'on' : 'off');
        toast(`${a.name} turned ${on ? 'ON' : 'OFF'}`, 'ok');
        setTimeout(fetchAndRender, 1000);
      } catch(e) {
        el.checked = !on;
        toast('Failed to trigger command', 'err');
      }
    });
  });
}

// ── Battery SVG ──────────────────────────────────────────────
const BAT_FILL_W = 20;

function updateBatteryIcon(pct, charging) {
  const svg     = $('bat-svg-icon');
  const fillBar = $('bat-fill-bar');
  const bolt    = $('bat-bolt');
  if (!svg || !fillBar) return;

  const p = Math.min(100, Math.max(0, pct || 0));
  const fillW = (p / 100) * BAT_FILL_W;

  fillBar.setAttribute('width', fillW.toFixed(1));

  svg.classList.remove('bat-low','bat-medium','bat-good','bat-charging');
  if (charging) { svg.classList.add('bat-charging'); }
  else if (p <= 20) { svg.classList.add('bat-low'); }
  else if (p <= 50) { svg.classList.add('bat-medium'); }
  else { svg.classList.add('bat-good'); }

  fillBar.setAttribute('fill', 'currentColor');
  if (bolt) bolt.style.display = charging ? '' : 'none';
}

window.updateBatteryIcon = updateBatteryIcon;

// ── Battery Modal SVG ────────────────────────────────────────
const BAT_MODAL_MAX_W = 88;

function updateBatteryModalSVG(pct, charging, state) {
  const fill   = $('bat-modal-fill');
  const bolt   = $('bat-modal-bolt');
  const circle = $('bat-modal-circle');
  if (!fill || !bolt || !circle) return;

  const p = Math.min(100, Math.max(0, pct || 0));

  const circleColor = state === 'low'  ? '#c0392b'
                    : state === 'full' ? '#1a5c38'
                    : charging         ? '#22c55e'
                    :                    '#2E6B47';
  circle.setAttribute('fill', circleColor);

  if (charging) {
    fill.classList.add('charging');
    bolt.classList.add('charging');
    bolt.style.display = '';
  } else {
    fill.classList.remove('charging');
    bolt.classList.remove('charging');
    bolt.style.display = 'none';
    fill.setAttribute('width', ((p / 100) * BAT_MODAL_MAX_W).toFixed(1));
    fill.setAttribute('fill', state === 'low' ? '#ff6b6b' : 'white');
  }
}

window.updateBatteryModalSVG = updateBatteryModalSVG;

// ── Water Modal SVG ──────────────────────────────────────────
const WATER_DROP_TOP  = 22;
const WATER_DROP_BASE = 164;
const WATER_DROP_H    = WATER_DROP_BASE - WATER_DROP_TOP;

function updateWaterModalSVG(pct, state) {
  const fill      = $('water-modal-fill');
  const waveGroup = $('water-wave-group');
  const wave      = $('water-wave');
  const label     = $('water-modal-pct-text');
  const bg        = $('water-drop-bg');
  if (!fill) return;

  const p = Math.min(100, Math.max(0, pct || 0));
  const fillH = (p / 100) * WATER_DROP_H;
  const fillY = WATER_DROP_BASE - fillH;

  fill.setAttribute('y', fillY.toFixed(1));
  fill.setAttribute('height', fillH.toFixed(1));

  if (wave) { wave.setAttribute('cy', fillY.toFixed(1)); }
  if (waveGroup) waveGroup.style.display = p > 4 ? '' : 'none';

  const fillColor = state === 'low'  ? 'url(#water-grad-low)'
                  : state === 'full' ? 'url(#water-grad-full)'
                  :                    'url(#water-grad)';

  const svgDefs = document.querySelector('#water-modal-svg defs');
  if (svgDefs && !document.getElementById('water-grad-low')) {
    svgDefs.insertAdjacentHTML('beforeend', `
      <linearGradient id="water-grad-low" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fca5a5"/>
        <stop offset="100%" stop-color="#dc2626" stop-opacity="0.85"/>
      </linearGradient>
      <linearGradient id="water-grad-full" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6ee7b7"/>
        <stop offset="100%" stop-color="#059669" stop-opacity="0.85"/>
      </linearGradient>
    `);
  }
  fill.setAttribute('fill', fillColor);

  if (bg) {
    bg.setAttribute('fill', state === 'low'  ? '#fff0f0'
                          : state === 'full' ? '#f0fdf4'
                          :                    '#e8f4fd');
  }

  if (label) {
    label.textContent = p + '%';
    label.setAttribute('fill', fillY < 118 ? 'white' : '#1e3a5f');
  }
}

window.updateWaterModalSVG = updateWaterModalSVG;

// ── Temp Modal SVG ───────────────────────────────────────────
const THERM_TUBE_BASE = 151;
const THERM_TUBE_H    = 139;
const BULB_MIN_H      = 50;
const THERM_MIN = 15;
const THERM_MAX = 35;

function updateTempModalSVG(tempVal) {
  const tubeFill = $('therm-tube-fill');
  if (!tubeFill) return;

  const v = tempVal != null ? parseFloat(tempVal) : null;
  const pct = v != null
    ? Math.min(1, Math.max(0, (v - THERM_MIN) / (THERM_MAX - THERM_MIN)))
    : 0;

  const fillH = Math.max(BULB_MIN_H, pct * THERM_TUBE_H);
  const fillY = THERM_TUBE_BASE - fillH;

  tubeFill.setAttribute('height', '0');
  tubeFill.setAttribute('y', THERM_TUBE_BASE);
  tubeFill.getBoundingClientRect();
  tubeFill.setAttribute('height', fillH.toFixed(1));
  tubeFill.setAttribute('y', fillY.toFixed(1));

  let grad;
  if (v == null)    grad = 'therm-grad-normal';
  else if (v < 18)  grad = 'therm-grad-cold';
  else if (v <= 28) grad = 'therm-grad-normal';
  else if (v <= 32) grad = 'therm-grad-warm';
  else              grad = 'therm-grad-hot';

  tubeFill.setAttribute('fill', `url(#${grad})`);
}

window.updateTempModalSVG = updateTempModalSVG;

// ── Status Pills ─────────────────────────────────────────────
const StatusModal = {
  dismissed: { battery: false, water: false },
  BATTERY_LOW: 20, BATTERY_FULL: 95,
  WATER_LOW: 20, WATER_FULL: 90,
  _lastBatState: null, _lastWaterState: null
};

function getStatusPillState(type, d) {
  if (!d) return 'normal';
  if (type === 'battery') {
    const v = d.battery_percent || 0;
    if (v <= StatusModal.BATTERY_LOW)  return 'low';
    if (v >= StatusModal.BATTERY_FULL) return 'full';
    return 'normal';
  }
  if (type === 'water') {
    const v = d.water_level != null ? d.water_level : 50;
    if (v <= StatusModal.WATER_LOW)  return 'low';
    if (v >= StatusModal.WATER_FULL) return 'full';
    return 'normal';
  }
  return 'normal';
}

function updateStatusPillAlerts(d) {
  if (!d) return;

  const batState = getStatusPillState('battery', d);
  const batEl = $('spill-bat');
  if (batEl) { batEl.classList.toggle('spill-alert', batState === 'low'); }

  const waterState = getStatusPillState('water', d);
  const waterEl = $('spill-water');
  if (waterEl) { waterEl.classList.toggle('spill-alert', waterState === 'low'); }

  if (batState !== StatusModal._lastBatState) {
    StatusModal._lastBatState = batState;
    if ((batState === 'low' || batState === 'full') && !StatusModal.dismissed.battery) {
      openStatusModal('battery');
    }
  }
  if (waterState !== StatusModal._lastWaterState) {
    StatusModal._lastWaterState = waterState;
    if ((waterState === 'low' || waterState === 'full') && !StatusModal.dismissed.water) {
      openStatusModal('water');
    }
  }
}

function openStatusModal(type) {
  const d = S.data;

  if (type === 'battery') {
    const v     = d ? (d.battery_percent || 0) : 0;
    const state = getStatusPillState('battery', d);
    const charging = d ? (d.charging || false) : false;
    const titleEl = $('status-modal-bat-title');
    const descEl  = $('status-modal-bat-desc');
    const dontEl  = $('status-bat-dontshow');

    if (state === 'low') {
      if (titleEl) titleEl.textContent = 'Battery Low';
      if (descEl)  descEl.textContent  = `Battery is at ${v}%. Please charge your bin.`;
    } else if (state === 'full') {
      if (titleEl) titleEl.textContent = 'Battery Full';
      if (descEl)  descEl.textContent  = `Battery is at ${v}%. Kindly unplug the charger.`;
    } else {
      if (titleEl) titleEl.textContent = charging ? 'Charging…' : 'Battery Status';
      if (descEl)  descEl.textContent  = `Battery level is at ${v}%.`;
    }

    updateBatteryModalSVG(v, charging, state);
    if (dontEl) dontEl.style.display = (state === 'low' || state === 'full') ? '' : 'none';
    openModal('status-modal-battery');

  } else if (type === 'water') {
    const v     = d ? (d.water_level != null ? d.water_level : 0) : 0;
    const state = getStatusPillState('water', d);
    const titleEl = $('status-modal-water-title');
    const descEl  = $('status-modal-water-desc');
    const dontEl  = $('status-water-dontshow');

    if (state === 'low') {
      if (titleEl) titleEl.textContent = 'Water Tank Low';
      if (descEl)  descEl.textContent  = `Water is at ${v}%. Kindly refill your water tank.`;
    } else if (state === 'full') {
      if (titleEl) titleEl.textContent = 'Water Tank Full';
      if (descEl)  descEl.textContent  = `Water is at ${v}%. Tank is full.`;
    } else {
      if (titleEl) titleEl.textContent = 'Water Tank';
      if (descEl)  descEl.textContent  = `Water level is at ${v}%.`;
    }
    updateWaterModalSVG(v, state);
    if (dontEl) dontEl.style.display = (state === 'low' || state === 'full') ? '' : 'none';
    openModal('status-modal-water');

  } else if (type === 'temp') {
    const v = d ? d.ds18b20_temp : null;
    const titleEl = $('status-modal-temp-title');
    const descEl  = $('status-modal-temp-desc');
    if (titleEl) titleEl.textContent = 'Water Temperature';
    if (descEl)  descEl.textContent  = v != null ? `Current water temperature is ${parseFloat(v).toFixed(1)} °C.` : 'No temperature data yet.';
    updateTempModalSVG(v);
    openModal('status-modal-temp');
  }
}

function dismissStatusModal(type) {
  StatusModal.dismissed[type] = true;
  closeTopModal();
}

window.openStatusModal = openStatusModal;
window.StatusModal = StatusModal;

// ════════════════════════════════════
// DASHBOARD / CHARTS
// ════════════════════════════════════
function setupDash() {
  if($('go-qi')) $('go-qi').addEventListener('click', () => window.location.hash = '#/quick-insights');
  if($('go-bf')) $('go-bf').addEventListener('click', () => window.location.hash = '#/bin-fluctuation');
}

function renderQI() {
  const h = S.hist, bin = 'b' + S.qiBin, data = h[bin][S.qiSens] || [], lbs = h.labels;
  const NM = { soilMoisture:'Soil Moisture', temperature:'Temperature', humidity:'Humidity', gasLevels:'Gas Levels' };
  const ICONS = {
    soilMoisture: '/img/monitoring/Sensor Icons/Soil Moisture Icon.svg',
    temperature:  '/img/monitoring/Sensor Icons/Temperature Icon.svg',
    humidity:     '/img/monitoring/Sensor Icons/Humidity Icon.svg',
    gasLevels:    '/img/monitoring/Sensor Icons/Gas Icon.svg'
  };
  const R = CFG.OPT[S.qiSens];
  setText('qi-sensor-heading', NM[S.qiSens]);

  const iconEl = $('qi-sensor-icon');
  if(iconEl) iconEl.src = ICONS[S.qiSens];

  const now = new Date();
  const dateEl = $('qi-date-block');
  if(dateEl) dateEl.textContent = 'Date: ' + now.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) + '\nUpdated: ' + now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');

  if(data.length){
    const mn = Math.min(...data), mx = Math.max(...data), av = data.reduce((a,b)=>a+b,0) / data.length;
    const recent = data[data.length - 1];

    setText('qi-min', fmt(mn)); setText('qi-avg', fmt(av)); setText('qi-max', fmt(mx)); setText('qi-recent', fmt(recent));
    ['qi-min','qi-avg','qi-max','qi-recent'].forEach(id => { const u = $(id)?.nextElementSibling; if(u) u.textContent = ' ' + R.unit; });

    const res = evaluateCondition(S.qiSens, av);
    setText('qi-insight', res.status + ' conditions detected.');

    const dot = $('qi-ins-dot');
    if(dot) {
      dot.className = 'qi-ins-dot';
      if(res.cls === 's-ok' || res.status === 'Normal') dot.classList.add('ok');
      else if(res.cls === 's-hi') dot.classList.add('danger');
      else dot.classList.add('warn');
    }

    const actionBtn = $('qi-action-btn');
    const actionDot = $('qi-action-dot');
    const needsAction = res.status !== 'Normal' && res.status !== 'Optimal';
    if(actionBtn) {
      actionBtn.disabled = !needsAction;
      actionBtn.title = needsAction ? 'View recommended actions' : 'No actions needed';
    }
    if(actionDot) actionDot.classList.toggle('visible', needsAction);
  } else {
    ['qi-min','qi-avg','qi-max','qi-recent'].forEach(id => setText(id, '--'));
    setText('qi-insight', 'No data yet');
  }

  const tbody = $('qi-tbody');
  if(!tbody) return;
  if(!data.length){ tbody.innerHTML = '<tr><td class="qi-empty" colspan="3">Waiting for data...</td></tr>'; return; }
  const st = Math.max(0, data.length - 12);
  tbody.innerHTML = data.slice(st).map((v, i) => {
    const l = lbs[st+i] || '--';
    const s = v < R.critical_min ? 'Low' : v > R.critical_max ? 'High' : 'Normal';
    const c = s === 'Normal' ? 's-ok' : s === 'High' ? 's-hi' : 's-lo';
    return `<tr><td>${l}</td><td>${fmt(v)} ${R.unit}</td><td class="${c}">${s}</td></tr>`;
  }).join('');
}

function renderRecentQI() {
  const h = S.hist;
  if(!h) return;
  const sensors = [
    { key:'soilMoisture', unit:'%',   v1:'rqi-b1-sm-val',   st1:'rqi-b1-sm-st',   v2:'rqi-b2-sm-val',   st2:'rqi-b2-sm-st'   },
    { key:'temperature',  unit:'°C',  v1:'rqi-b1-temp-val', st1:'rqi-b1-temp-st', v2:'rqi-b2-temp-val', st2:'rqi-b2-temp-st' },
    { key:'humidity',     unit:'%',   v1:'rqi-b1-hum-val',  st1:'rqi-b1-hum-st',  v2:'rqi-b2-hum-val',  st2:'rqi-b2-hum-st'  },
    { key:'gasLevels',    unit:'ppm', v1:'rqi-b1-gas-val',  st1:'rqi-b1-gas-st',  v2:'rqi-b2-gas-val',  st2:'rqi-b2-gas-st'  }
  ];
  sensors.forEach(({ key, unit, v1, st1, v2, st2 }) => {
    const R = CFG.OPT[key];
    ['b1','b2'].forEach((bn, i) => {
      const valId = i === 0 ? v1 : v2, stId = i === 0 ? st1 : st2;
      const data = h[bn][key] || [];
      if(!data.length) return;
      const latest = data[data.length - 1];
      setText(valId, fmt(latest));
      const stEl = $(stId);
      if(!stEl) return;
      const s = latest < R.critical_min ? 'Low' : latest > R.critical_max ? 'High' : 'OK';
      const cls = s === 'OK' ? 'ok' : s === 'High' ? 'danger' : 'warn';
      stEl.textContent = s;
      stEl.className = 'rqi-pill-status ' + cls;
    });
  });
  const updEl = $('rqi-updated');
  if(updEl) {
    const now = new Date();
    updEl.textContent = 'Last updated: ' + now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
  }
}

function setupQI() {
  const dd = $('qi-bin-select');
  if(dd) dd.addEventListener('change', () => { S.qiBin = +dd.value; renderQI(); });
  document.querySelectorAll('[data-qi-sensor]').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('[data-qi-sensor]').forEach(x => x.classList.remove('active'));
      b.classList.add('active'); S.qiSens = b.dataset.qiSensor; renderQI();
    });
  });
}

function initBFChart() {
  const canvas = $('bf-chart'); if(!canvas) return;
  if(S.bfChart){ S.bfChart.destroy(); S.bfChart = null; }
  if(S.bfChartObserver){ S.bfChartObserver.disconnect(); S.bfChartObserver = null; }

  S.bfChart = new Chart(canvas, {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Reading', data: [], backgroundColor: 'rgba(245,197,24,.80)', borderColor: 'rgba(200,160,16,1)', borderWidth: 1, borderRadius: 4 }]},
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => fmt(ctx.raw) + ' ' + (CFG.OPT[S.bfSens]?.unit||'') }}},
      scales: {
        x: { ticks: { font: { size: 10 }, maxRotation: 0 }, grid: { color: 'rgba(0,0,0,.04)' }},
        y: { ticks: { font: { size: 10 }}, grid: { color: 'rgba(0,0,0,.04)' }}
      }
    }
  });

  const wrap = canvas.closest('.chart-scroll-wrap');
  if(wrap && window.ResizeObserver) {
    S.bfChartObserver = new ResizeObserver(() => { if(S.bfChart) resizeBFCanvas(); });
    S.bfChartObserver.observe(wrap);
  }

  updateBF();
}

function resizeBFCanvas() {
  const canvas = $('bf-chart'); if(!canvas || !S.bfChart) return;
  const wrap = canvas.closest('.chart-scroll-wrap');
  const inner = canvas.parentElement;
  const BAR_W = 52, MIN_BARS = 7;
  const totalBars = Math.max((S.bfChart.data.labels||[]).length, MIN_BARS);
  const w = totalBars * BAR_W;
  const h = wrap ? Math.max(wrap.clientHeight - 20, 120) : 200;
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
  canvas.width  = w;
  canvas.height = h;
  if(inner){ inner.style.width = w + 'px'; inner.style.height = h + 'px'; }
  S.bfChart.resize();
  S.bfChart.update('none');
}

function renderBF() {
  const NM = { soilMoisture:'Soil Moisture', temperature:'Temperature', humidity:'Humidity', gasLevels:'Gas Levels' };
  setText('bf-sensor-heading', NM[S.bfSens]);
  updateBF();
}

function updateBF() {
  const h = S.hist, bin = 'b' + S.bfBin, data = h[bin][S.bfSens] || [], lbs = h.labels;
  const R = CFG.OPT[S.bfSens];

  if(S.bfChart) {
    S.bfChart.data.labels = [...lbs];
    S.bfChart.data.datasets[0].data = [...data];
    resizeBFCanvas();
  }

  const av = data.length ? data.reduce((a,b)=>a+b,0) / data.length : 0;
  setText('bf-avg-val', fmt(av));
  const ue = $('bf-avg-unit'); if(ue) ue.textContent = ' ' + R.unit;

  const actionBtn = $('bf-action-btn');
  const actionDot = $('bf-action-dot');
  const wormEl = $('bf-worm-img');

  if (data.length) {
    const res = evaluateCondition(S.bfSens, av);
    setText('bf-insights-text', res.status + ' conditions detected on average.');
    if (wormEl) wormEl.src = `/img/worm-conditions/${encodeURIComponent(res.wormImage)}`;
    const needsAction = res.statusClass !== 'optimal';
    if (actionBtn) { actionBtn.disabled = !needsAction; actionBtn.title = needsAction ? 'View recommended actions' : 'No actions needed'; }
    if (actionDot) actionDot.classList.toggle('visible', needsAction);
  } else {
    setText('bf-insights-text', 'Collecting data...');
    if (actionBtn) { actionBtn.disabled = true; actionBtn.title = 'No data yet'; }
    if (actionDot) actionDot.classList.remove('visible');
  }
}

// ─────────────────────────────────────────────────────────────
// WORM INSIGHTS
// ─────────────────────────────────────────────────────────────
function getWormInsight(sensorType, value) {
  const R = CFG.OPT[sensorType];
  if (!R) return { severity: 'ok', title: 'No data', steps: [] };

  const v = +value;
  const fV = v.toFixed(1);
  let severity, title, steps = [];

  switch (sensorType) {
    case 'temperature':
      if (v < R.critical_min) { severity = 'critical'; title = `⚠️ CRITICAL — Temperature too low (${fV}°C)`; steps = ['Move worms to a warmer location immediately','Add insulation or a heating mat under the bin',`Keep temperature between ${R.optimal_min}–${R.optimal_max}°C`,'Monitor every hour until stable']; }
      else if (v < R.optimal_min) { severity = 'warning'; title = `⚠️ Temperature below optimal (${fV}°C)`; steps = ['Consider adding a gentle heat source nearby','Reduce ventilation to retain warmth',`Target range: ${R.optimal_min}–${R.optimal_max}°C`]; }
      else if (v > R.critical_max) { severity = 'critical'; title = `🔥 CRITICAL — Temperature too high (${fV}°C)`; steps = ['Move bin to a cooler location NOW','Add ventilation or point a fan at the bin','Remove any heat sources nearby','Never expose bin to direct sunlight',`Target range: ${R.optimal_min}–${R.optimal_max}°C`]; }
      else if (v > R.optimal_max) { severity = 'warning'; title = `⚠️ Temperature above optimal (${fV}°C)`; steps = ['Improve ventilation around the bin','Move to a cooler area or shade','Avoid direct heat sources',`Target range: ${R.optimal_min}–${R.optimal_max}°C`]; }
      else { severity = 'ok'; title = `✅ Temperature is perfect (${fV}°C)`; steps = [`Optimal range ${R.optimal_min}–${R.optimal_max}°C maintained. Keep it up!`]; }
      break;
    case 'soilMoisture':
      if (v < R.critical_min) { severity = 'critical'; title = `⚠️ CRITICAL — Soil too dry (${fV}%)`; steps = ['Add water to the bedding immediately','Spray evenly — avoid pooling in one spot','Check and repair any drainage issues',`Target range: ${R.optimal_min}–${R.optimal_max}%`]; }
      else if (v < R.optimal_min) { severity = 'warning'; title = `⚠️ Soil moisture low (${fV}%)`; steps = ['Gradually add moisture using a spray bottle','Distribute water evenly across the bedding',`Target range: ${R.optimal_min}–${R.optimal_max}%`]; }
      else if (v > R.critical_max) { severity = 'critical'; title = `💧 CRITICAL — Soil too wet (${fV}%)`; steps = ['Stop all watering immediately','Add dry bedding material (shredded cardboard or paper)','Improve drainage — check for blockages','Turn bedding to increase airflow',`Target range: ${R.optimal_min}–${R.optimal_max}%`]; }
      else if (v > R.optimal_max) { severity = 'warning'; title = `⚠️ Soil moisture high (${fV}%)`; steps = ['Reduce watering frequency','Mix in dry bedding to absorb excess moisture','Improve ventilation',`Target range: ${R.optimal_min}–${R.optimal_max}%`]; }
      else { severity = 'ok'; title = `✅ Soil moisture is perfect (${fV}%)`; steps = [`Ideal bedding consistency ${R.optimal_min}–${R.optimal_max}% maintained. Worms are happy!`]; }
      break;
    case 'humidity':
      if (v < R.critical_min) { severity = 'critical'; title = `⚠️ CRITICAL — Humidity too low (${fV}%)`; steps = ['Mist the bin surface regularly','Cover the bin to retain moisture','Check ventilation — may be too aggressive',`Target range: ${R.optimal_min}–${R.optimal_max}%`]; }
      else if (v < R.optimal_min) { severity = 'warning'; title = `⚠️ Humidity below optimal (${fV}%)`; steps = ['Increase misting frequency','Reduce ventilation slightly',`Target range: ${R.optimal_min}–${R.optimal_max}%`]; }
      else if (v > R.critical_max) { severity = 'critical'; title = `💧 CRITICAL — Humidity too high (${fV}%)`; steps = ['Increase ventilation immediately','Add dry bedding material','Check for pooling water inside the bin','Reduce misting until stable',`Target range: ${R.optimal_min}–${R.optimal_max}%`]; }
      else if (v > R.optimal_max) { severity = 'warning'; title = `⚠️ Humidity above optimal (${fV}%)`; steps = ['Improve air circulation around and inside the bin','Reduce watering frequency',`Target range: ${R.optimal_min}–${R.optimal_max}%`]; }
      else { severity = 'ok'; title = `✅ Humidity is perfect (${fV}%)`; steps = [`Ideal air moisture ${R.optimal_min}–${R.optimal_max}% maintained. Conditions are excellent!`]; }
      break;
    case 'gasLevels':
      if (v > R.critical_max) { severity = 'critical'; title = `☠️ CRITICAL — Ammonia toxic (${fV} ppm)`; steps = ['Stop feeding the bin immediately','Turn the bedding to release trapped gases','Add carbon-rich material (shredded paper or cardboard)','Increase ventilation right away','Remove any rotting food from the bin',`Safe level: below ${R.optimal_max} ppm`]; }
      else if (v > R.optimal_max) { severity = 'warning'; title = `⚠️ Ammonia levels elevated (${fV} ppm)`; steps = ['Reduce protein-rich food in feedings','Add more carbon material to balance','Aerate by turning the bedding',`Safe level: below ${R.optimal_max} ppm`]; }
      else { severity = 'ok'; title = `✅ Gas levels are safe (${fV} ppm)`; steps = [`Ammonia well-controlled below ${R.optimal_max} ppm. Bin chemistry is balanced!`]; }
      break;
    default:
      severity = 'ok'; title = 'No insight available'; steps = [];
  }

  return { severity, title, steps };
}

function renderWormInsightInto(container, sensorType, value) {
  const { severity, title, steps } = getWormInsight(sensorType, value);
  const C = {
    critical: { bg: '#fff4f4', border: '#f5c6c6', dot: '#ef4444', badge: '#ef4444', label: 'CRITICAL' },
    warning:  { bg: '#fffbf0', border: '#f0dda0', dot: '#d97706', badge: '#d97706', label: 'WARNING'  },
    ok:       { bg: '#f2faf4', border: '#b5d9be', dot: '#3a6b35', badge: '#3a6b35', label: 'OPTIMAL'  }
  }[severity];

  const cleanTitle = title.replace(/^[⚠️🔥💧☠️✅]+\s*(CRITICAL[\s—–-]*)?(WARNING[\s—–-]*)?(URGENT[\s—–-]*)?/i, '').trim();

  container.innerHTML = `
    <div class="wi-card" style="background:${C.bg}; border-color:${C.border};">
      <div class="wi-status-strip">
        <span class="wi-badge" style="background:${C.badge};">
          <span class="wi-badge-dot"></span>${C.label}
        </span>
      </div>
      <p class="wi-headline">${cleanTitle}</p>
      ${steps.length > 1
        ? `<ul class="wi-steps">${steps.map(s =>
            `<li><span class="wi-dot" style="background:${C.dot};"></span><span>${s}</span></li>`
          ).join('')}</ul>`
        : `<p class="wi-single">${steps[0] || ''}</p>`
      }
    </div>
  `;
}

const MODAL_ICON_PATHS = {
  soilMoisture: '/img/monitoring/Sensor Icons/Soil Moisture Icon.svg',
  temperature:  '/img/monitoring/Sensor Icons/Temperature Icon.svg',
  humidity:     '/img/monitoring/Sensor Icons/Humidity Icon.svg',
  gasLevels:    '/img/monitoring/Sensor Icons/Gas Icon.svg'
};
const MODAL_NM = { soilMoisture:'Soil Moisture', temperature:'Temperature', humidity:'Humidity', gasLevels:'Gas Levels' };

function openBFActionsModal() {
  const sens = S.bfSens;
  const iconEl = $('bf-act-icon'), titleEl = $('bf-act-title');
  if(iconEl) iconEl.src = MODAL_ICON_PATHS[sens];
  if(titleEl) titleEl.textContent = MODAL_NM[sens];

  const grid = $('bf-actuator-grid');
  if(grid) {
    const h = S.hist, bin = 'b' + S.bfBin, data = h[bin][sens] || [];
    const av = data.length ? data.reduce((a,b)=>a+b,0)/data.length : null;
    if(av !== null) renderWormInsightInto(grid, sens, av);
    else grid.innerHTML = '<p class="wi-empty">No sensor data available yet.</p>';
  }
  openModal('bf-actions-modal');
}

function openQIActionsModal() {
  const sens = S.qiSens;
  const iconEl = $('qi-act-icon'), titleEl = $('qi-act-title');
  if(iconEl) iconEl.src = MODAL_ICON_PATHS[sens];
  if(titleEl) titleEl.textContent = MODAL_NM[sens];

  const grid = $('qi-actuator-grid');
  if(grid) {
    const h = S.hist, bin = 'b' + S.qiBin, data = h[bin][sens] || [];
    const av = data.length ? data.reduce((a,b)=>a+b,0)/data.length : null;
    if(av !== null) renderWormInsightInto(grid, sens, av);
    else grid.innerHTML = '<p class="wi-empty">No sensor data available yet.</p>';
  }
  openModal('qi-actions-modal');
}

function setupBF() {
  const dd = $('bf-bin-select');
  if(dd) dd.addEventListener('change', () => { S.bfBin = +dd.value; updateBF(); });
  document.querySelectorAll('[data-bf-sensor]').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('[data-bf-sensor]').forEach(x => x.classList.remove('active'));
      b.classList.add('active'); S.bfSens = b.dataset.bfSensor;
      setText('bf-sensor-heading', { soilMoisture:'Soil Moisture', temperature:'Temperature', humidity:'Humidity', gasLevels:'Gas Levels' }[S.bfSens]);
      const ue = $('bf-avg-unit'); if(ue) ue.textContent = ' ' + CFG.OPT[S.bfSens].unit;
      const bfSensorIcon = $('bf-sensor-icon');
      if(bfSensorIcon) {
        bfSensorIcon.src = MODAL_ICON_PATHS[S.bfSens];
      }
      updateBF();
    });
  });
}

function renderSettings(d) {
  const badge = $('dev-conn');
  if(badge){ badge.textContent = d.wifi_connected ? 'Connected' : 'Offline'; badge.className = 'dev-badge' + (d.wifi_connected ? ' online' : ''); }
  setText('dev-last-update', d.lastUpdate || '--');
  setText('dev-id', S.activeEspID ? `ESP32-S3 · ID: ${S.activeEspID}` : '--');

  if (S.user) {
    setText('acc-username', S.user.username || '--');
    setText('acc-email', S.user.email || '--');
    setText('acc-last-login', S.user.last_login
      ? new Date(S.user.last_login).toLocaleString()
      : '--');
  }

  if (S.bins) {
    renderClaimedBins(S.bins);
  }
}

// ════════════════════════════════════
// AUTH
// ════════════════════════════════════
const Auth = {
  loggedIn: false,
  username: ''
};

function authShow() {
  const ov = $('auth-overlay');
  if (ov) ov.classList.add('visible');
}

function authHide() {
  const ov = $('auth-overlay');
  if (ov) ov.classList.remove('visible');
}

function authTab(tab) {
  ['login','register','forgot','reset'].forEach(t => {
    const f = $('auth-form-' + t);
    if (f) f.style.display = t === tab ? '' : 'none';
  });
  document.querySelectorAll('.auth-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  const tabsEl = $('auth-tabs');
  if (tabsEl) tabsEl.style.display = (tab === 'forgot' || tab === 'reset') ? 'none' : '';
  authClearBanner();
}

function authBanner(msg, type='err') {
  const b = $('auth-banner');
  if (!b) return;
  b.textContent = msg;
  b.className = 'auth-banner auth-banner--' + type;
  b.style.display = '';
}

function authClearBanner() {
  const b = $('auth-banner');
  if (b) b.style.display = 'none';
}

function authTogglePw(inputId, btn) {
  const inp = $(inputId);
  if (!inp) return;
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  const eyeImg = btn.querySelector('.auth-eye-img');
  if (eyeImg) {
    eyeImg.src = show ? '/img/auth-icons/openEyePassIcon.png' : '/img/auth-icons/hiddenPassIcon.svg';
  } else {
    btn.textContent = show ? '🙈' : '👁';
  }
}

function authSetLoading(btnId, loading, label) {
  const btn = $(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait…' : label;
}

// ── LOGIN ────────────────────────────
async function authLogin() {
  const username = ($('login-username') || {}).value?.trim() || '';
  const password = ($('login-password') || {}).value || '';

  if (!username || !password) { authBanner('Username and password required.'); return; }

  authSetLoading('login-submit', true, 'Log In');
  authClearBanner();

  try {
    const r = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const d = await r.json();
    if (d.success && d.token) {
      Token.set(d.token);
      Auth.loggedIn = true;
      Auth.username = d.user?.username || username;
      authHide();
      setText('dev-loggedin-user', Auth.username);
      // Load devices then start polling
      await loadProfile();
      await loadDevices();
      await loadMode();
      startPolling();
      toast(`Welcome back, ${Auth.username} 👋`, 'ok');
    } else {
      authBanner(d.error || 'Invalid credentials.');
    }
  } catch(e) {
    authBanner('Could not reach server. Check your connection.');
  } finally {
    authSetLoading('login-submit', false, 'Log In');
  }
}

// ── REGISTER ─────────────────────────
async function authRegister() {
  const username = ($('reg-username') || {}).value?.trim() || '';
  const email    = ($('reg-email')    || {}).value?.trim() || '';
  const password = ($('reg-password') || {}).value || '';

  if (!username || !email || !password) { authBanner('All fields are required.'); return; }

  authSetLoading('register-submit', true, 'Create Account');
  authClearBanner();

  try {
    const r = await fetch(`${BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const d = await r.json();
    if (d.success) {
      // Auto-login after register
      if (d.token) {
        Token.set(d.token);
        Auth.loggedIn = true;
        Auth.username = d.user?.username || username;
        authHide();
        setText('dev-loggedin-user', Auth.username);
        await loadProfile();
        await loadDevices();
        startPolling();
        toast('Account created! Add a device to get started.', 'ok');
      } else {
        authBanner('Account created! Please log in.', 'ok');
        setTimeout(() => authTab('login'), 1500);
      }
    } else {
      authBanner(d.error || 'Registration failed.');
    }
  } catch(e) {
    authBanner('Could not reach server. Check your connection.');
  } finally {
    authSetLoading('register-submit', false, 'Create Account');
  }
}

// ── FORGOT PASSWORD ──────────────────
async function authForgot() {
  const email = ($('forgot-email') || {}).value?.trim() || '';
  if (!email) { authBanner('Email is required.'); return; }

  authSetLoading('forgot-submit', true, 'Send Reset Link');
  authClearBanner();

  try {
    const r = await fetch(`${BASE_URL}/api/password/reset-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const d = await r.json();
    if (d.success) {
      authBanner('Reset email sent! Check your inbox and enter the token below.', 'ok');
      setTimeout(() => authTab('reset'), 3000);
    } else {
      authBanner(d.error || 'Request failed.');
    }
  } catch(e) {
    authBanner('Could not reach server.');
  } finally {
    authSetLoading('forgot-submit', false, 'Send Reset Link');
  }
}

// ── RESET PASSWORD ───────────────────
async function authReset() {
  const token       = ($('reset-token')    || {}).value?.trim() || '';
  const newPassword = ($('reset-password') || {}).value || '';
  if (!token || !newPassword) { authBanner('Token and new password required.'); return; }

  authSetLoading('reset-submit', true, 'Reset Password');
  authClearBanner();

  try {
    const r = await fetch(`${BASE_URL}/api/password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword })
    });
    const d = await r.json();
    if (d.success) {
      authBanner('Password reset! Please log in with your new password.', 'ok');
      setTimeout(() => authTab('login'), 3000);
    } else {
      authBanner(d.error || 'Reset failed. Token may have expired.');
    }
  } catch(e) {
    authBanner('Could not reach server.');
  } finally {
    authSetLoading('reset-submit', false, 'Reset Password');
  }
}

// ── LOGOUT ───────────────────────────
function openLogoutModal() {
  openModal('logout-confirm-modal');
}

async function authLogout() {
  Token.clear();
  Auth.loggedIn = false;
  Auth.username = '';
  S.data = null;
  S.bins = [];
  S.activeEspID = null;
  S.user = null;
  closeAllModals();
  authTab('login');
  authShow();
  toast('Logged out', '');
}

// ── DEV BYPASS ───────────────────────
async function devBypassLogin() {
  Auth.loggedIn = true;
  Auth.username = 'dev';
  authHide();
  setText('dev-loggedin-user', 'dev (bypassed)');
  await loadDevices();
  await loadMode();
  startPolling();
  toast('⚡ Dev bypass — skipped login', 'ok');
}

// ════════════════════════════════════
// SETTINGS — Device Management
// ════════════════════════════════════

function renderClaimedBins(binsArray) {
  const container = document.getElementById('claimed-bins-list');
  if (!container) return;

  if (!binsArray || binsArray.length === 0) {
    container.innerHTML = '<div class="wm-placeholder">No bins claimed yet. Tap "+ Claim" to add one.</div>';
    updateGlobalBinDropdown([]);
    return;
  }

  container.innerHTML = binsArray.map(bin => {
    const safeName = (bin.name || 'Unnamed Bin').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `
    <div class="claimed-bin-card">
      <div class="bin-visual-header">
        <button class="bin-delete-x" onclick="confirmDeleteBin('${bin.bin_id}')">×</button>
        <img src="/img/claim-bin/ClaimBinIcon.svg" alt="Bin" class="bin-image">
      </div>
      <div class="bin-card-info">
        <div class="claimed-bin-name" onclick="openRenameBinModal('${bin.bin_id}', '${safeName}')">
          ${bin.name || 'Unnamed Bin'}
        </div>
        <div class="claimed-bin-id">${bin.bin_id}</div>
        <div class="bin-status-chip ${bin.status === 'online' ? 'online' : 'offline'}">
          ${bin.status === 'online' ? 'Connected' : 'Offline'}
        </div>
      </div>
    </div>`;
  }).join('');

  updateGlobalBinDropdown(binsArray);
}

function confirmDeleteBin(binId) {
  document.getElementById('confirm-modal-title').textContent = "Unclaim Bin";
  document.getElementById('confirm-modal-desc').textContent = `Are you sure you want to remove ${binId}? This cannot be undone.`;
  document.getElementById('rename-input-container').style.display = 'none';

  const confirmBtn = document.getElementById('confirm-modal-btn');
  confirmBtn.onclick = () => { handleUnclaimBin(binId); };

  openModal('confirm-action-modal');
}

function openRenameBinModal(binId, currentName) {
  document.getElementById('confirm-modal-title').textContent = "Rename Bin";
  document.getElementById('confirm-modal-desc').textContent = "Enter a new nickname for this bin:";

  const inputContainer = document.getElementById('rename-input-container');
  const inputField = document.getElementById('new-bin-nickname');
  inputContainer.style.display = 'block';
  inputField.value = currentName;

  const confirmBtn = document.getElementById('confirm-modal-btn');
  confirmBtn.onclick = () => {
    const newName = inputField.value.trim();
    if (!newName) return toast('Name cannot be empty', 'err');
    updateBinNickname(binId, newName);
  };

  openModal('confirm-action-modal');
}

async function updateBinNickname(binId, newName) {
  try {
    await API.renameDevice(binId, newName);
    const bin = S.bins.find(b => b.bin_id === binId);
    if (bin) bin.name = newName;
    renderClaimedBins(S.bins);
    updateGlobalBinDropdown(S.bins);
    closeTopModal();
    toast('Name updated', 'ok');
  } catch(e) {
    toast(e.message || 'Failed to rename bin', 'err');
  }
}

async function handleUnclaimBin(binId) {
  try {
    await API.unclaimDevice(binId);
    S.bins = S.bins.filter(b => b.bin_id !== binId);
    if (S.activeEspID === binId) {
      S.activeEspID = S.bins.length > 0 ? S.bins[0].bin_id : null;
    }
    renderClaimedBins(S.bins);
    updateGlobalBinDropdown(S.bins);
    closeTopModal();
    toast(`Bin ${binId} removed`, 'ok');
  } catch(e) {
    toast(e.message || 'Failed to unclaim bin', 'err');
  }
}

async function handleClaimBin() {
  const code = document.getElementById('claim-code-input')?.value?.trim();
  if (!code) return toast('Please enter a device ID (e.g. ESP-ABCD1234)', 'err');

  try {
    await API.claimDevice(code.toUpperCase());
    await loadDevices(); // Refresh device list
    closeTopModal();
    toast('Bin claimed successfully!', 'ok');
  } catch(e) {
    toast(e.message || 'Failed to claim bin', 'err');
  }
}

function updateGlobalBinDropdown(binsArray) {
  const select = document.getElementById('global-bin-select');
  if(!select) return;

  if (!binsArray || binsArray.length === 0) {
    select.innerHTML = '<option value="" disabled>No bins connected</option>';
    return;
  }

  select.innerHTML = binsArray.map(bin => {
    const displayName = bin.name ? `${bin.name} (${bin.bin_id})` : bin.bin_id;
    return `<option value="${bin.bin_id}">${displayName}</option>`;
  }).join('');

  const activeBinId = S.activeEspID || binsArray[0].bin_id;
  select.value = activeBinId;
}

function handleGlobalBinChange() {
  const select = document.getElementById('global-bin-select');
  const selectedId = select.value;
  if (!selectedId) return;

  S.activeEspID = selectedId;

  // Clear old history when switching bins
  S.hist = {
    labels:[],
    b1:{ temperature:[], soilMoisture:[], humidity:[], gasLevels:[] },
    b2:{ temperature:[], soilMoisture:[], humidity:[], gasLevels:[] }
  };

  fetchAndRender(); // Immediately fetch the selected device's data
  loadMode();       // Reload mode state for new device

  const bin = S.bins.find(b => b.bin_id === selectedId);
  const icon = bin?.status === 'offline' ? '🔴' : '🟢';
  toast(icon + ' ' + (bin?.name || selectedId), 'ok');
}

// ════════════════════════════════════
// SETTINGS — Profile Management
// ════════════════════════════════════
function openEditProfileModal() {
  const currentUsername = document.getElementById('acc-username').textContent;
  const currentEmail = document.getElementById('acc-email').textContent;

  document.getElementById('edit-username').value = currentUsername === 'Loading...' ? '' : currentUsername;
  document.getElementById('edit-email').value = currentEmail === '--' ? '' : currentEmail;

  openModal('edit-profile-modal');
}

async function handleUpdateProfile() {
  const newUsername = document.getElementById('edit-username').value.trim();
  const newEmail = document.getElementById('edit-email').value.trim();

  if (!newUsername || !newEmail) return toast('All fields are required', 'err');

  try {
    await API.updateProfile(newUsername, newEmail);
    if (S.user) { S.user.username = newUsername; S.user.email = newEmail; }
    Auth.username = newUsername;
    document.getElementById('acc-username').textContent = newUsername;
    document.getElementById('acc-email').textContent = newEmail;
    setText('dev-loggedin-user', newUsername);
    closeTopModal();
    toast('Profile updated successfully!', 'ok');
  } catch(e) {
    toast(e.message || 'Failed to update profile', 'err');
  }
}

function openChangePasswordModal() {
  document.getElementById('change-pw-current').value = '';
  document.getElementById('change-pw-new').value = '';
  document.getElementById('change-pw-repeat').value = '';
  openModal('change-password-modal');
}

async function handleChangePassword() {
  const current = document.getElementById('change-pw-current').value;
  const newPw = document.getElementById('change-pw-new').value;
  const repeat = document.getElementById('change-pw-repeat').value;

  if (!current || !newPw || !repeat) return toast('All fields are required', 'err');
  if (newPw.length < 6) return toast('Password must be at least 6 characters', 'err');
  if (newPw !== repeat) return toast('Passwords do not match', 'err');

  closeTopModal();
  document.getElementById('confirm-modal-title').textContent = "Confirm Change";
  document.getElementById('confirm-modal-desc').textContent = "Updating your password will require you to log back in.";
  document.getElementById('rename-input-container').style.display = 'none';

  const confirmBtn = document.getElementById('confirm-modal-btn');
  confirmBtn.onclick = async () => {
    try {
      await API.changePassword(current, newPw);
      toast('Password updated. Please log in again.', 'ok');
      setTimeout(() => authLogout(), 1500);
    } catch (e) {
      toast(e.message || 'Failed to update password', 'err');
    }
    closeTopModal();
  };

  openModal('confirm-action-modal');
}

// ════════════════════════════════════
// TOAST
// ════════════════════════════════════
function toast(msg, type='') {
  const c = $('toast-container'); if(!c) return;
  const t = document.createElement('div');
  t.className = 'toast' + (type ? ' ' + type : '');
  t.textContent = msg; c.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// ════════════════════════════════════
// INIT
// ════════════════════════════════════

// Show auth screen early to prevent dashboard flash
(function() {
  function showAuthEarly() {
    const ov = document.getElementById('auth-overlay');
    if (ov) ov.classList.add('visible');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showAuthEarly);
  } else {
    showAuthEarly();
  }
})();

document.addEventListener('DOMContentLoaded', async () => {
  Router.init();
  setupSidebar();
  setupDash();
  setupQI();
  setupBF();
  $('refresh-btn')?.addEventListener('click', fetchAndRender);

  // Enter key bindings
  ['login-password', 'login-username'].forEach(id => {
    $(id)?.addEventListener('keydown', e => { if (e.key === 'Enter') authLogin(); });
  });
  ['reg-username','reg-email','reg-password'].forEach(id => {
    $(id)?.addEventListener('keydown', e => { if (e.key === 'Enter') authRegister(); });
  });
  $('forgot-email')?.addEventListener('keydown', e => { if (e.key === 'Enter') authForgot(); });
  $('reset-password')?.addEventListener('keydown', e => { if (e.key === 'Enter') authReset(); });

  // ── Auto-login if token exists ──────────────────────────────
  const existingToken = Token.get();
  if (existingToken) {
    try {
      // Verify token is still valid by fetching profile
      const r = await fetch(`${BASE_URL}/api/user/profile`, {
        headers: { 'Authorization': 'Bearer ' + existingToken }
      });
      if (r.ok) {
        const profileData = await r.json();
        Auth.loggedIn = true;
        Auth.username = profileData.user?.username || profileData.username || '';
        S.user = profileData.user || profileData;
        setText('dev-loggedin-user', Auth.username);
        setText('acc-username', S.user.username || '--');
        setText('acc-email', S.user.email || '--');
        authHide();
        await loadDevices();
        await loadMode();
        startPolling();
      } else {
        // Token expired — clear it and show login
        Token.clear();
        authShow();
      }
    } catch(e) {
      Token.clear();
      authShow();
    }
  } else {
    authShow();
  }
});
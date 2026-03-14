/* ═══════════════════════════════════
   AVONIC  –  app.js  v5.0
   Optimized: Evaluator & Configs Bundled
   ═══════════════════════════════════ */
'use strict';

// ── Sensor Configs & Worm Conditions ──────────────────────────
const WORM_CONFIGS = {
  temperature: { optimal_min: 22, optimal_max: 28, critical_min: 15, critical_max: 35, unit: '°C' },
  soilMoisture: { optimal_min: 60, optimal_max: 80, critical_min: 40, critical_max: 90, unit: '%' },
  humidity: { optimal_min: 60, optimal_max: 80, critical_min: 40, critical_max: 90, unit: '%' },
  gasLevels: { optimal_min: 0, optimal_max: 100, critical_max: 200, unit: 'ppm' }
};

const CFG = {
  POLL: 5000,
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
  activeModalBin: 1,      // Added for Modals
  activeModalSensor: null // Added for Modals
};

// ── DOM helpers ─────────────────────
const $ = (id) => document.getElementById(id);
const setText = (id, v) => { const e = $(id); if(e) e.textContent = v; };
const fmt = (v) => v != null ? parseFloat(v).toFixed(1) : '--';

// ════════════════════════════════════
// 🎨 EVALUATE CONDITION LOGIC (From Legacy)
// ════════════════════════════════════
function evaluateCondition(sensorType, value) {
    // Safety check: if sensor type doesn't exist, return default
    if (!WORM_CONFIGS[sensorType]) {
        return { status: 'Unknown', statusClass: 'warning', wormImage: 'Normal.png' };
    }

    const ranges = WORM_CONFIGS[sensorType];
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
// API & POLLING
// ════════════════════════════════════
const API = {
  async get() { 
    const r = await fetch('/data', { cache: 'no-store' }); 
    if(!r.ok) throw new Error('HTTP ' + r.status); 
    return r.json(); 
  },
  async cmd(ep, val) { 
    // Fix: Sends as form-urlencoded so ESP32 server.hasArg("state") correctly receives it
    const r = await fetch(ep, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `state=${val}`
    }); 
    if(!r.ok) throw new Error('HTTP ' + r.status); 
    return r.json(); 
  }
};

async function fetchAndRender() {
  document.querySelectorAll('.refresh-btn, .refresh-spin').forEach(b => b.classList.add('spinning'));
  try {
    const d = await API.get();
    S.data = d;
    pushHist(d);
    renderPage(Router.cur(), d);
    
    // Refresh modal data if it is currently open
    if ($('sensor-detail-modal') && $('sensor-detail-modal').classList.contains('show')) {
      updateSensorModalData(S.activeModalBin, S.activeModalSensor, d);
      if (S.mode[S.activeModalBin] === 'manual') {
        populateManualActions(S.activeModalBin, S.activeModalSensor, $('sm-actuator-grid'), d);
      }
    }
  } catch(e) {
    // Fix #3: If the ESP32 returns 401 (session expired / rebooted), show login screen
    if (e.message && e.message.includes('401')) {
      Auth.loggedIn = false;
      authShow();
      toast('Session expired — please log in again', 'err');
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

  // Update dynamic battery SVG
  updateBatteryIcon(pct, d.charging || false);

  // Only show temperature if at least one sensor has reported
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
    let stClass = 'optimal'; // Defaults to green background
    
    // Sync UI with the legacy evaluator logic
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
    
    // Try the exact ID, then fallback to your specific HTML abbreviated IDs
    const idMap = { soilMoisture: 'soil', temperature: 'temp', humidity: 'hum', gasLevels: 'gas' };
    let cEl = $(`b${n}-${k}-card`) || $(`b${n}-${idMap[k]}-card`);

    // Apply the class, which triggers your CSS colors!
    if(cEl) cEl.className = 'sensor-card ' + stClass;

    // Update Progress Ring Arc
    const ring = $(`b${n}-${k}-ring`);
    if (ring && v != null) {
      const maxVal = k === 'gasLevels' ? 250 : 100;
      const pct = Math.min(1, Math.max(0, v / maxVal));
      ring.style.strokeDashoffset = 175.9 - (pct * 175.9);
    }
  }

  // Update last-updated timestamp on bin banner
  const now = new Date();
  const timeStr = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
  setText(`b${n}-updated`, 'Updated at ' + timeStr);

  // Update dynamic Mode button text and visual style on Bin page
  const mb = $(`b${n}-mode-btn`);
  if(mb){
    const isAuto = S.mode[n] === 'auto';
    mb.innerHTML = `${isAuto ? 'Auto' : 'Manual'}`;
    mb.className = `mode-btn ${isAuto ? 'auto' : 'manual'}`;
  }
}
 
// ════════════════════════════════════
// ════════════════════════════════════
// MODAL MANAGER  — prevents stacking,
// queues overlapping open() calls
// ════════════════════════════════════
const ModalManager = (() => {
  let _queue   = [];   // pending modal IDs
  let _current = null; // currently visible modal ID

  function _show(id) {
    const el = $(id);
    if (!el) return;
    _current = id;
    $('sys-modal-overlay').classList.add('show');
    el.classList.add('show');
  }

  // Open a modal. If one is already open, queue it.
  function open(id) {
    if (_current) { _queue.push(id); return; }
    _show(id);
  }

  // Close the currently visible modal, then show the next queued one.
  function close() {
    if (_current) { $(_current)?.classList.remove('show'); _current = null; }
    // Safety: clear any stray visible modals
    document.querySelectorAll('.sys-modal.show, .act-modal.show')
      .forEach(m => m.classList.remove('show'));

    if (_queue.length > 0) {
      setTimeout(() => _show(_queue.shift()), 120); // brief gap between modals
    } else {
      $('sys-modal-overlay').classList.remove('show');
    }
  }

  // Nuclear option — wipe queue and close everything immediately.
  function closeAll() {
    _queue   = [];
    _current = null;
    $('sys-modal-overlay').classList.remove('show');
    document.querySelectorAll('.sys-modal, .act-modal')
      .forEach(m => m.classList.remove('show'));
  }

  function current() { return _current; }

  // Esc key closes whichever modal is on top
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && _current) close();
  });

  return { open, close, closeAll, current };
})();

// ── Legacy aliases (all existing call-sites unchanged) ────────
function openModal(id)    { ModalManager.open(id);     }
function closeTopModal()  { ModalManager.close();      }
function closeAllModals() { ModalManager.closeAll();   }

// 1. Mode Confirmation Modal
function openModeModal(binNum) {
  const targetMode = S.mode[binNum] === 'auto' ? 'manual' : 'auto';
  
  $('mode-modal-title').textContent = targetMode === 'auto' ? 'Activate Auto Mode?' : 'Activate Manual Mode?';
  $('mode-modal-desc').textContent = targetMode === 'auto' 
    ? 'Turning on auto-mode makes the system operate by itself.' 
    : 'Turning on Manual Mode disables auto-mode, which also means risk for potential human errors.';
  
  const ill = $('mode-ill-img');
  if (ill) ill.src = targetMode === 'auto' ? '/data/img/photos/AutoMode.png' : '/data/img/photos/ManualMode.png';
  
  const btn = $('mode-confirm-btn');
  btn.onclick = () => {
    S.mode[binNum] = targetMode;

    // --- FORCE UI UPDATE IMMEDIATELY ---
    // Updates the button on the Bin page
    const mb = $(`b${binNum}-mode-btn`);
    if(mb) {
      const isAuto = targetMode === 'auto';
      mb.innerHTML = `${isAuto ? 'Auto' : 'Manual'}`;
      mb.className = `mode-btn ${isAuto ? 'auto' : 'manual'}`;
    }
    
    // Updates the sub-text on the Home page
    const hmb = $(`home-b${binNum}-mode`);
    if(hmb) {
      hmb.innerHTML = `<span class="bin-dot"></span> ${targetMode === 'auto' ? 'Auto Mode' : 'Manual Mode'}`;
    }
    // -----------------------------------

    if(S.data) renderBin(binNum, S.data); 
    
    // Re-render modal contents if it happens to be open in the background
    if($('sensor-detail-modal') && $('sensor-detail-modal').classList.contains('show')) {
      openSensorModal(S.activeModalBin, S.activeModalSensor, $('sm-title').textContent, $('sm-icon').src);
    }
    
    closeAllModals();
    toast(`Bin ${binNum} switched to ${targetMode.toUpperCase()} mode`, 'ok');
  };

  openModal('mode-switch-modal');
}

// 2. Sensor Modal (Clickable anytime, Manual only shows actuators)
function openSensorModal(binNum, sensorType, title, iconPath) {
  S.activeModalBin = binNum;
  S.activeModalSensor = sensorType;

  $('sm-title').textContent = title;
  $('sm-icon').src = iconPath;
  
  // Set unit from CFG
  if (CFG.OPT[sensorType] && CFG.OPT[sensorType].unit) {
    $('sm-unit').textContent = CFG.OPT[sensorType].unit;
  }

  const safeData = S.data || {};
  updateSensorModalData(binNum, sensorType, safeData);
  
  const manualArea = $('sm-manual-area');
  const actGrid = $('sm-actuator-grid');
  
  // Magic happens here: Actuators ONLY show if mode is manual
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
  
  // Encodes spaces safely (e.g., "Too Hot.png" -> "Too%20Hot.png"). 
  // No need to add .png since your legacy code already includes it!
  $('sm-worm-img').src = `/data/img/worm-conditions/${encodeURIComponent(clipart)}`;
}

function populateManualActions(bin, sensor, container, d) {
  const b1 = bin === 1;
  let actuators = [];
  
 if (sensor === 'temperature') actuators = [
    {id:`b${bin}-exh`, name:'Fan', icon:'/data/img/actuators/FanIcon.svg', state: b1 ? d.bin1_exhaust_fan_state : d.bin2_exhaust_fan_state, ep:`/api/bin${bin}/exhaust-fan`},
    {id:`b${bin}-int`, name:'Mist', icon:'/data/img/actuators/MistIcon.svg', state: b1 ? d.bin1_intake_fan_state : d.bin2_intake_fan_state, ep:`/api/bin${bin}/intake-fan`}
  ];
  else if (sensor === 'soilMoisture') actuators = [
    {id:`b${bin}-pmp`, name:'Mist', icon:'/data/img/actuators/MistIcon.svg', state: b1 ? d.bin1_pump_state : d.bin2_pump_state, ep:`/api/bin${bin}/pump`}
  ];
  else if (sensor === 'humidity') actuators = [
    {id:`b${bin}-exh`, name:'Fan', icon:'/data/img/actuators/FanIcon.svg', state: b1 ? d.bin1_exhaust_fan_state : d.bin2_exhaust_fan_state, ep:`/api/bin${bin}/exhaust-fan`},
    {id:`b${bin}-pmp`, name:'Mist', icon:'/data/img/actuators/MistIcon.svg', state: b1 ? d.bin1_pump_state : d.bin2_pump_state, ep:`/api/bin${bin}/pump`}
  ];
  else if (sensor === 'gasLevels') actuators = [
    {id:`b${bin}-exh`, name:'Fan', icon:'/data/img/actuators/FanIcon.svg', state: b1 ? d.bin1_exhaust_fan_state : d.bin2_exhaust_fan_state, ep:`/api/bin${bin}/exhaust-fan`}
  ];

 // Draw pill layout toggles
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

// ── Dynamic Battery SVG Icon ─────────────────────────────────
// BAT_FILL_W: inner fill area is 20px wide (x=2 to x=22, inside 23.5px shell)
const BAT_FILL_W = 20;

function updateBatteryIcon(pct, charging) {
  const svg     = $('bat-svg-icon');
  const fillBar = $('bat-fill-bar');
  const bolt    = $('bat-bolt');
  if (!svg || !fillBar) return;

  const p = Math.min(100, Math.max(0, pct || 0));
  const fillW = (p / 100) * BAT_FILL_W;

  fillBar.setAttribute('width', fillW.toFixed(1));

  // Color class
  svg.classList.remove('bat-low','bat-medium','bat-good','bat-charging');
  if (charging) {
    svg.classList.add('bat-charging');
  } else if (p <= 20) {
    svg.classList.add('bat-low');
  } else if (p <= 50) {
    svg.classList.add('bat-medium');
  } else {
    svg.classList.add('bat-good');
  }

  // Fill bar color matches svg icon color via CSS inheritance
  fillBar.setAttribute('fill', 'currentColor');

  // Bolt visibility
  if (bolt) bolt.style.display = charging ? '' : 'none';
}

// Expose for dummy injector
window.updateBatteryIcon = updateBatteryIcon;

// ── Battery Modal SVG Illustration ──────────────────────────
// MAX_FILL_W must match the clipPath rect width in index.html (82px)
const BAT_MODAL_MAX_W = 88;

function updateBatteryModalSVG(pct, charging, state) {
  const fill   = $('bat-modal-fill');
  const bolt   = $('bat-modal-bolt');
  const circle = $('bat-modal-circle');
  if (!fill || !bolt || !circle) return;

  const p = Math.min(100, Math.max(0, pct || 0));

  // Circle background color by state
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

// ── Water Modal SVG Illustration ─────────────────────────────
// Drop interior spans y=18 (tip) to y=164 (base) = 146px total height
const WATER_DROP_TOP  = 22;   // topmost y the fill can reach (leave tip empty)
const WATER_DROP_BASE = 164;  // base y of drop interior
const WATER_DROP_H    = WATER_DROP_BASE - WATER_DROP_TOP; // 142px

function updateWaterModalSVG(pct, state) {
  const fill      = $('water-modal-fill');
  const waveGroup = $('water-wave-group');
  const wave      = $('water-wave');
  const label     = $('water-modal-pct-text');
  const bg        = $('water-drop-bg');
  if (!fill) return;

  const p = Math.min(100, Math.max(0, pct || 0));

  // Fill height from bottom: p% of the interior height
  const fillH = (p / 100) * WATER_DROP_H;
  const fillY = WATER_DROP_BASE - fillH;

  // Animate fill rising smoothly
  fill.setAttribute('y', fillY.toFixed(1));
  fill.setAttribute('height', fillH.toFixed(1));

  // Wave sits on top surface of fill
  if (wave) {
    wave.setAttribute('cy', fillY.toFixed(1));
  }
  if (waveGroup) waveGroup.style.display = p > 4 ? '' : 'none';

  // Fill color by state
  const fillColor = state === 'low'  ? 'url(#water-grad-low)'
                  : state === 'full' ? 'url(#water-grad-full)'
                  :                    'url(#water-grad)';

  // Inject state-specific gradients if not present
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

  // Background tint
  if (bg) {
    bg.setAttribute('fill', state === 'low'  ? '#fff0f0'
                          : state === 'full' ? '#f0fdf4'
                          :                    '#e8f4fd');
  }

  // Percentage label — white when fill is behind it, dark when not
  if (label) {
    label.textContent = p + '%';
    // Label sits at y=128; fill starts covering it when fillY < 128
    label.setAttribute('fill', fillY < 118 ? 'white' : '#1e3a5f');
  }
}

window.updateWaterModalSVG = updateWaterModalSVG;

// ── Temp Modal SVG Thermometer ────────────────────────────────
// Unified path: top y=12, bulb bottom y=150 → total fill height = 138px
const THERM_TUBE_BASE = 151;
const THERM_TUBE_H    = 139;
// Bulb always filled — arc entry at y=113, bulb bottom y=150 → 38px min, use 50 for safety
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

  // Always fill at least the bulb (even when pct=0 / no data), so no empty-grey shows
  const fillH = Math.max(BULB_MIN_H, pct * THERM_TUBE_H);
  const fillY = THERM_TUBE_BASE - fillH;

  // Reset → reflow → animate rise
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



// Per-session dismissed flags (reset on page load; "Don't show again" persists via S)
const StatusModal = {
  dismissed: { battery: false, water: false },

  // Thresholds
  BATTERY_LOW:   20,
  BATTERY_FULL:  95,
  WATER_LOW:     20,
  WATER_FULL:    90,

  // Last known state (to detect transitions)
  _lastBatState:   null,
  _lastWaterState: null
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

  // ── Battery pill ──
  const batState = getStatusPillState('battery', d);
  const batEl = $('spill-bat');
  if (batEl) {
    batEl.classList.toggle('spill-alert', batState === 'low');
  }

  // ── Water pill ──
  const waterState = getStatusPillState('water', d);
  const waterEl = $('spill-water');
  if (waterEl) {
    waterEl.classList.toggle('spill-alert', waterState === 'low');
  }

  // ── Auto-show modals on state transition (only if not dismissed) ──
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

// "Don't show again" — dismissed for this session only
function dismissStatusModal(type) {
  StatusModal.dismissed[type] = true;
  closeTopModal();
}

// Expose for dummy injector
window.openStatusModal = openStatusModal;
window.StatusModal = StatusModal;


function setupDash() {
  if($('go-qi')) $('go-qi').addEventListener('click', () => window.location.hash = '#/quick-insights');
  if($('go-bf')) $('go-bf').addEventListener('click', () => window.location.hash = '#/bin-fluctuation');
}

function renderQI() {
  const h = S.hist, bin = 'b' + S.qiBin, data = h[bin][S.qiSens] || [], lbs = h.labels;
  const NM = { soilMoisture:'Soil Moisture', temperature:'Temperature', humidity:'Humidity', gasLevels:'Gas Levels' };
  const ICONS = {
    soilMoisture: '/data/img/monitoring/Sensor Icons/Soil Moisture Icon.svg',
    temperature:  '/data/img/monitoring/Sensor Icons/Temperature Icon.svg',
    humidity:     '/data/img/monitoring/Sensor Icons/Humidity Icon.svg',
    gasLevels:    '/data/img/monitoring/Sensor Icons/Gas Icon.svg'
  };
  const R = CFG.OPT[S.qiSens];
  setText('qi-sensor-heading', NM[S.qiSens]);

  // Update top-bar sensor icon
  const iconEl = $('qi-sensor-icon');
  if(iconEl) iconEl.src = ICONS[S.qiSens];

  const now = new Date();
  const dateEl = $('qi-date-block');
  if(dateEl) dateEl.textContent = 'Date: ' + now.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) + '\nUpdated: ' + now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');

  if(data.length){
    const mn = Math.min(...data), mx = Math.max(...data), av = data.reduce((a,b)=>a+b,0) / data.length;
    const recent = data[data.length - 1]; // <-- Get the most recent reading
    
    setText('qi-min', fmt(mn)); setText('qi-avg', fmt(av)); setText('qi-max', fmt(mx)); setText('qi-recent', fmt(recent));
    ['qi-min','qi-avg','qi-max','qi-recent'].forEach(id => { const u = $(id)?.nextElementSibling; if(u) u.textContent = ' ' + R.unit; });

    const res = evaluateCondition(S.qiSens, av);
    setText('qi-insight', res.status + ' conditions detected.');

    // Update insight dot color
    const dot = $('qi-ins-dot');
    if(dot) {
      dot.className = 'qi-ins-dot';
      if(res.cls === 's-ok' || res.status === 'Normal') dot.classList.add('ok');
      else if(res.cls === 's-hi') dot.classList.add('danger');
      else dot.classList.add('warn');
    }

    // Enable wrench button when action is needed
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

// Render the Recent Quick Insights card on home page
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

  // Observe wrap for height changes and resize canvas accordingly
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

  // 1. Only attempt to update the Chart if it successfully loaded
  if(S.bfChart) {
    S.bfChart.data.labels = [...lbs];
    S.bfChart.data.datasets[0].data = [...data];
    resizeBFCanvas(); // handles resize + update
  }

  // 2. 🚨 CONTINUES UPDATING THE UI EVEN IF CHART FAILS 🚨
  const av = data.length ? data.reduce((a,b)=>a+b,0) / data.length : 0;
  setText('bf-avg-val', fmt(av));
  const ue = $('bf-avg-unit'); if(ue) ue.textContent = ' ' + R.unit;

  const actionBtn = $('bf-action-btn');
  const actionDot = $('bf-action-dot');
  const wormEl = $('bf-worm-img');

  if (data.length) {
    const res = evaluateCondition(S.bfSens, av);
    setText('bf-insights-text', res.status + ' conditions detected on average.');
    if (wormEl) wormEl.src = `/data/img/worm-conditions/${encodeURIComponent(res.wormImage)}`;
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
// WORM INSIGHT RECOMMENDATIONS  (extracted from worm-evaluator)
// ─────────────────────────────────────────────────────────────
function getWormInsight(sensorType, value) {
  const R = CFG.OPT[sensorType];
  if (!R) return { severity: 'ok', title: 'No data', steps: [] };

  const v = +value;
  const fV = v.toFixed(1); // 🚨 Formats the value to 1 decimal place for the text!
  let severity, title, steps = [];

  switch (sensorType) {

    case 'temperature':
      if (v < R.critical_min) {
        severity = 'critical'; title = `⚠️ CRITICAL — Temperature too low (${fV}°C)`;
        steps = [
          'Move worms to a warmer location immediately',
          'Add insulation or a heating mat under the bin',
          `Keep temperature between ${R.optimal_min}–${R.optimal_max}°C`,
          'Monitor every hour until stable'
        ];
      } else if (v < R.optimal_min) {
        severity = 'warning'; title = `⚠️ Temperature below optimal (${fV}°C)`;
        steps = [
          'Consider adding a gentle heat source nearby',
          'Reduce ventilation to retain warmth',
          `Target range: ${R.optimal_min}–${R.optimal_max}°C`
        ];
      } else if (v > R.critical_max) {
        severity = 'critical'; title = `🔥 CRITICAL — Temperature too high (${fV}°C)`;
        steps = [
          'Move bin to a cooler location NOW',
          'Add ventilation or point a fan at the bin',
          'Remove any heat sources nearby',
          'Never expose bin to direct sunlight',
          `Target range: ${R.optimal_min}–${R.optimal_max}°C`
        ];
      } else if (v > R.optimal_max) {
        severity = 'warning'; title = `⚠️ Temperature above optimal (${fV}°C)`;
        steps = [
          'Improve ventilation around the bin',
          'Move to a cooler area or shade',
          'Avoid direct heat sources',
          `Target range: ${R.optimal_min}–${R.optimal_max}°C`
        ];
      } else {
        severity = 'ok'; title = `✅ Temperature is perfect (${fV}°C)`;
        steps = [`Optimal range ${R.optimal_min}–${R.optimal_max}°C maintained. Keep it up!`];
      }
      break;

    case 'soilMoisture':
      if (v < R.critical_min) {
        severity = 'critical'; title = `⚠️ CRITICAL — Soil too dry (${fV}%)`;
        steps = [
          'Add water to the bedding immediately',
          'Spray evenly — avoid pooling in one spot',
          'Check and repair any drainage issues',
          `Target range: ${R.optimal_min}–${R.optimal_max}%`
        ];
      } else if (v < R.optimal_min) {
        severity = 'warning'; title = `⚠️ Soil moisture low (${fV}%)`;
        steps = [
          'Gradually add moisture using a spray bottle',
          'Distribute water evenly across the bedding',
          `Target range: ${R.optimal_min}–${R.optimal_max}%`
        ];
      } else if (v > R.critical_max) {
        severity = 'critical'; title = `💧 CRITICAL — Soil too wet (${fV}%)`;
        steps = [
          'Stop all watering immediately',
          'Add dry bedding material (shredded cardboard or paper)',
          'Improve drainage — check for blockages',
          'Turn bedding to increase airflow',
          `Target range: ${R.optimal_min}–${R.optimal_max}%`
        ];
      } else if (v > R.optimal_max) {
        severity = 'warning'; title = `⚠️ Soil moisture high (${fV}%)`;
        steps = [
          'Reduce watering frequency',
          'Mix in dry bedding to absorb excess moisture',
          'Improve ventilation',
          `Target range: ${R.optimal_min}–${R.optimal_max}%`
        ];
      } else {
        severity = 'ok'; title = `✅ Soil moisture is perfect (${fV}%)`;
        steps = [`Ideal bedding consistency ${R.optimal_min}–${R.optimal_max}% maintained. Worms are happy!`];
      }
      break;

    case 'humidity':
      if (v < R.critical_min) {
        severity = 'critical'; title = `⚠️ CRITICAL — Humidity too low (${fV}%)`;
        steps = [
          'Mist the bin surface regularly',
          'Cover the bin to retain moisture',
          'Check ventilation — may be too aggressive',
          `Target range: ${R.optimal_min}–${R.optimal_max}%`
        ];
      } else if (v < R.optimal_min) {
        severity = 'warning'; title = `⚠️ Humidity below optimal (${fV}%)`;
        steps = [
          'Increase misting frequency',
          'Reduce ventilation slightly',
          `Target range: ${R.optimal_min}–${R.optimal_max}%`
        ];
      } else if (v > R.critical_max) {
        severity = 'critical'; title = `💧 CRITICAL — Humidity too high (${fV}%)`;
        steps = [
          'Increase ventilation immediately',
          'Add dry bedding material',
          'Check for pooling water inside the bin',
          'Reduce misting until stable',
          `Target range: ${R.optimal_min}–${R.optimal_max}%`
        ];
      } else if (v > R.optimal_max) {
        severity = 'warning'; title = `⚠️ Humidity above optimal (${fV}%)`;
        steps = [
          'Improve air circulation around and inside the bin',
          'Reduce watering frequency',
          `Target range: ${R.optimal_min}–${R.optimal_max}%`
        ];
      } else {
        severity = 'ok'; title = `✅ Humidity is perfect (${fV}%)`;
        steps = [`Ideal air moisture ${R.optimal_min}–${R.optimal_max}% maintained. Conditions are excellent!`];
      }
      break;

    case 'gasLevels':
      if (v > R.critical_max) {
        severity = 'critical'; title = `☠️ CRITICAL — Ammonia toxic (${fV} ppm)`;
        steps = [
          'Stop feeding the bin immediately',
          'Turn the bedding to release trapped gases',
          'Add carbon-rich material (shredded paper or cardboard)',
          'Increase ventilation right away',
          'Remove any rotting food from the bin',
          `Safe level: below ${R.optimal_max} ppm`
        ];
      } else if (v > R.optimal_max) {
        severity = 'warning'; title = `⚠️ Ammonia levels elevated (${fV} ppm)`;
        steps = [
          'Reduce protein-rich food in feedings',
          'Add more carbon material to balance',
          'Aerate by turning the bedding',
          `Safe level: below ${R.optimal_max} ppm`
        ];
      } else {
        severity = 'ok'; title = `✅ Gas levels are safe (${fV} ppm)`;
        steps = [`Ammonia well-controlled below ${R.optimal_max} ppm. Bin chemistry is balanced!`];
      }
      break;

    default:
      severity = 'ok'; title = 'No insight available'; steps = [];
  }

  return { severity, title, steps };
}

// Render worm insight card into a container element
function renderWormInsightInto(container, sensorType, value) {
  const { severity, title, steps } = getWormInsight(sensorType, value);

  const C = {
    critical: { bg: '#fff4f4', border: '#f5c6c6', dot: '#ef4444', badge: '#ef4444', label: 'CRITICAL' },
    warning:  { bg: '#fffbf0', border: '#f0dda0', dot: '#d97706', badge: '#d97706', label: 'WARNING'  },
    ok:       { bg: '#f2faf4', border: '#b5d9be', dot: '#3a6b35', badge: '#3a6b35', label: 'OPTIMAL'  }
  }[severity];

  // Strip the emoji prefix from title for cleaner display
  const cleanTitle = title.replace(/^[⚠️🔥💧☠️✅]+\s*(CRITICAL[:\s—–-]*)?(WARNING[:\s—–-]*)?(URGENT[:\s—–-]*)?/i, '').trim();

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

// ─────────────────────────────────────────────────────────────
// ACTIONS MODALS  (BF + QI — text recommendations)
// ─────────────────────────────────────────────────────────────
const MODAL_ICON_PATHS = {
  soilMoisture: '/data/img/monitoring/Sensor Icons/Soil Moisture Icon.svg',
  temperature:  '/data/img/monitoring/Sensor Icons/Temperature Icon.svg',
  humidity:     '/data/img/monitoring/Sensor Icons/Humidity Icon.svg',
  gasLevels:    '/data/img/monitoring/Sensor Icons/Gas Icon.svg'
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
        const iconPaths = {
          soilMoisture: '/data/img/monitoring/Sensor Icons/Soil Moisture Icon.svg',
          temperature:  '/data/img/monitoring/Sensor Icons/Temperature Icon.svg',
          humidity:     '/data/img/monitoring/Sensor Icons/Humidity Icon.svg',
          gasLevels:    '/data/img/monitoring/Sensor Icons/Gas Icon.svg'
        };
        bfSensorIcon.src = iconPaths[S.bfSens];
      }
      updateBF();
    });
  });
}

function renderSettings(d) {
  const badge = $('dev-conn');
  if(badge){ badge.textContent = d.wifi_connected ? 'Connected' : 'Offline'; badge.className = 'dev-badge' + (d.wifi_connected ? ' online' : ''); }
  setText('dev-last-update', d.lastUpdate || '--');
  // Refresh WiFi Manager status bar whenever settings page is rendered
  wmLoadStatus();
}

// ════════════════════════════════════
// AUTH
// ════════════════════════════════════
const Auth = {
  loggedIn: false,
  username: ''
};

// ── Show / hide auth overlay ─────────
function authShow() {
  const ov = $('auth-overlay');
  if (ov) ov.classList.add('visible');
}

function authHide() {
  const ov = $('auth-overlay');
  if (ov) ov.classList.remove('visible');
}

// ── Tab switching ────────────────────
function authTab(tab) {
  ['login','register','forgot','reset'].forEach(t => {
    const f = $('auth-form-' + t);
    if (f) f.style.display = t === tab ? '' : 'none';
  });
  // Only show tab buttons for login/register
  document.querySelectorAll('.auth-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  const tabsEl = $('auth-tabs');
  if (tabsEl) tabsEl.style.display = (tab === 'forgot' || tab === 'reset') ? 'none' : '';
  authClearBanner();
}

// ── Banner ───────────────────────────
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

// ── Password visibility toggle ───────
function authTogglePw(inputId, btn) {
  const inp = $(inputId);
  if (!inp) return;
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  const eyeImg = btn.querySelector('.auth-eye-img');
  if (eyeImg) {
    eyeImg.src = show
      ? '/data/img/auth-icons/openEyePassIcon.png'
      : '/data/img/auth-icons/hiddenPassIcon.svg';
  } else {
    btn.textContent = show ? '🙈' : '👁';
  }
}

// ── Set button loading state ─────────
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
    const r = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    });
    const d = await r.json();
    if (d.success) {
      Auth.loggedIn = true;
      Auth.username = d.username || username;
      authHide();
      setText('dev-loggedin-user', Auth.username);
      startPolling();
      toast(`Welcome back, ${Auth.username} 👋`, 'ok');
    } else {
      authBanner(d.error || 'Invalid credentials.');
    }
  } catch(e) {
    authBanner('Could not reach device. Are you on the AVONIC network?');
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
    const r = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    });
    const d = await r.json();
    if (d.success) {
      authBanner('Account created! Please log in.', 'ok');
      setTimeout(() => authTab('login'), 1500);
    } else {
      authBanner(d.error || 'Registration failed.');
    }
  } catch(e) {
    authBanner('Could not reach device. Are you on the AVONIC network?');
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
    const r = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const d = await r.json();
    if (d.success) {
      authBanner('Request sent! Note: this requires the device to be connected to the internet via MQTT. Enter your token below once received.', 'ok');
      setTimeout(() => authTab('reset'), 3000);
    } else {
      authBanner(d.error || 'Request failed.');
    }
  } catch(e) {
    authBanner('Could not reach device.');
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
    const r = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword })
    });
    const d = await r.json();
    if (d.success) {
      authBanner('Reset submitted! This requires an active internet connection on the device. If it works, log in with your new password.', 'ok');
      setTimeout(() => authTab('login'), 3500);
    } else {
      authBanner(d.error || 'Reset failed. Make sure the device is connected to the internet.');
    }
  } catch(e) {
    authBanner('Could not reach device.');
  } finally {
    authSetLoading('reset-submit', false, 'Reset Password');
  }
}

// ── LOGOUT ───────────────────────────
async function authLogout() {
  try {
    await fetch('/logout');
  } catch(e) {}
  Auth.loggedIn = false;
  Auth.username = '';
  authTab('login');
  authShow();
  toast('Logged out', '');
}

// ── DEV BYPASS ───────────────────────
function devBypassLogin() {
  Auth.loggedIn = true;
  Auth.username = 'dev';
  authHide();
  const el = $('dev-loggedin-user');
  if (el) el.textContent = 'dev (bypassed)';
  startPolling();
  toast('⚡ Dev bypass — skipped login', 'ok');
}

// ── Settings: Reset Registration ─────
async function settingsResetReg() {
  const pw = prompt('Enter your current password to reset registration:');
  if (!pw) return;
  try {
    const r = await fetch('/api/reset-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `password=${encodeURIComponent(pw)}`
    });
    const d = await r.json();
    if (d.success) {
      toast('Registration reset. Device restarting…', 'ok');
      setTimeout(() => { authLogout(); }, 3000);
    } else {
      toast(d.error || 'Reset failed', 'err');
    }
  } catch(e) { toast('Request failed', 'err'); }
}

// ── Settings: Factory Reset ──────────
async function settingsFactoryReset() {
  const confirmed = prompt('Type FACTORY RESET to confirm. This wipes everything.');
  if (confirmed !== 'FACTORY RESET') { toast('Cancelled', ''); return; }
  const pw = prompt('Enter your password:');
  if (!pw) return;
  try {
    const r = await fetch('/api/factory-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `password=${encodeURIComponent(pw)}&confirm=FACTORY%20RESET`
    });
    const d = await r.json();
    if (d.success) {
      toast('Factory reset complete. Device restarting…', 'ok');
      setTimeout(() => authLogout(), 3000);
    } else {
      toast(d.error || 'Factory reset failed', 'err');
    }
  } catch(e) { toast('Request failed', 'err'); }
}

// ── Fetch device ID on load ──────────
async function fetchDeviceID() {
  try {
    const r = await fetch('/api/device-id');
    if (!r.ok) return;
    const d = await r.json();
    setText('dev-id', `ESP32-S3 · ID: ${d.device_id || '--'}`);
  } catch(e) {}
}

// ════════════════════════════════════
// WIFI MANAGER
// ════════════════════════════════════
const WM = {
  selectedSSID: '',
  scanning: false
};

async function wmLoadStatus() {
  try {
    const r = await fetch('/api/wifi/status', { cache: 'no-store' });
    if (!r.ok) return;
    const d = await r.json();
    wmRenderStatus(d);
  } catch(e) {
    // Silent fail — device may be offline
  }
}

function wmRenderStatus(d) {
  const ssidEl = $('wm-current-ssid');
  const ipEl   = $('wm-current-ip');
  const actEl  = $('wm-status-actions');
  const iconEl = $('wm-signal-icon');

  if (d.connected) {
    if (ssidEl) ssidEl.textContent = d.ssid || '--';
    if (ipEl)   ipEl.textContent   = d.ip   || '--';
    if (iconEl) iconEl.style.color = 'var(--green-mid)';

    // Fix #5: also populate the settings device info rows
    setText('dev-wifi', d.ssid || '--');
    setText('dev-ip',   d.ip   || '--');

    if (actEl) {
      actEl.innerHTML = `
        <button class="wm-btn-disconnect" onclick="wmDisconnect()">Disconnect</button>
        <button class="wm-btn-forget" onclick="wmForget()">Forget</button>
      `;
    }
  } else {
    if (ssidEl) ssidEl.textContent = 'Not connected';
    if (ipEl)   ipEl.textContent   = '--';
    if (iconEl) iconEl.style.color = 'var(--text-muted)';
    setText('dev-wifi', 'Not connected');
    setText('dev-ip',   '--');
    if (actEl)  actEl.innerHTML    = '';
  }
}

function wmSignalBars(rssi) {
  // Returns 1–4 based on RSSI
  if (rssi >= -55) return 4;
  if (rssi >= -67) return 3;
  if (rssi >= -78) return 2;
  return 1;
}

async function wmScan() {
  if (WM.scanning) return;
  WM.scanning = true;

  const icon = $('wm-scan-icon');
  const list = $('wm-net-list');
  const ph   = $('wm-placeholder');

  if (icon) icon.classList.add('spinning');
  if (list) list.innerHTML = '<div class="wm-placeholder">Scanning...</div>';
  wmCloseForm();

  try {
    const r = await fetch('/api/wifi/scan', { cache: 'no-store' });
    if (!r.ok) throw new Error('Scan failed');
    const d = await r.json();

    // Also refresh status to know current SSID
    let status = { connected: false, ssid: '' };
    try {
      const sr = await fetch('/api/wifi/status', { cache: 'no-store' });
      if (sr.ok) status = await sr.json();
    } catch(e) {}

    wmRenderStatus(status);
    wmRenderNetworks(d.networks || [], status.ssid || '');
  } catch(e) {
    if (list) list.innerHTML = '<div class="wm-placeholder">Scan failed. Try again.</div>';
    toast('WiFi scan failed', 'err');
  } finally {
    WM.scanning = false;
    if (icon) icon.classList.remove('spinning');
  }
}

function wmRenderNetworks(networks, connectedSSID) {
  const list = $('wm-net-list');
  if (!list) return;

  if (!networks.length) {
    list.innerHTML = '<div class="wm-placeholder">No networks found.</div>';
    return;
  }

  // Sort: connected first, then by signal strength
  networks.sort((a, b) => {
    if (a.ssid === connectedSSID) return -1;
    if (b.ssid === connectedSSID) return 1;
    return b.rssi - a.rssi;
  });

  list.innerHTML = networks.map(n => {
    const isConnected = n.ssid === connectedSSID;
    const bars = wmSignalBars(n.rssi);
    const lock  = n.encryption !== 'open' ? '🔒' : '🔓';

    const barsHtml = [1,2,3,4].map(i =>
      `<span style="height:${i * 3 + 2}px" class="${i <= bars ? 'active' : ''}"></span>`
    ).join('');

    return `
      <div class="wm-net-item ${isConnected ? 'is-connected' : ''}"
           onclick="${isConnected ? '' : `wmSelectNetwork('${n.ssid.replace(/'/g, "\\'")}')`}">
        <div class="wm-net-left">
          <div class="wm-net-icon">${lock}</div>
          <div>
            <div class="wm-net-name">${n.ssid || '(Hidden)'}</div>
            <div class="wm-net-enc">${n.encryption} · ch${n.channel}</div>
          </div>
        </div>
        <div class="wm-net-right">
          <div class="wm-rssi-bars">${barsHtml}</div>
          ${isConnected ? '<span class="wm-connected-badge">Connected</span>' : ''}
        </div>
      </div>
    `;
  }).join('');
}

function wmSelectNetwork(ssid) {
  WM.selectedSSID = ssid;
  const form  = $('wm-connect-form');
  const label = $('wm-cf-ssid');
  const input = $('wm-pw-input');
  if (form)  form.style.display = 'block';
  if (label) label.textContent   = ssid;
  if (input) { input.value = ''; input.focus(); }
}

function wmCloseForm() {
  const form = $('wm-connect-form');
  if (form) form.style.display = 'none';
  WM.selectedSSID = '';
}

async function wmConnect() {
  const ssid  = WM.selectedSSID;
  const pw    = ($('wm-pw-input') || {}).value || '';
  const btn   = $('wm-connect-submit');

  if (!ssid) return;

  if (btn) { btn.disabled = true; btn.textContent = 'Connecting...'; }

  try {
    const r = await fetch('/api/wifi/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ssid, password: pw })
    });
    const d = await r.json();
    if (d.success) {
      toast(`Connecting to ${ssid}…`, 'ok');
      wmCloseForm();
      // Poll status after a delay to let the ESP32 connect
      setTimeout(() => wmLoadStatus(), 5000);
      setTimeout(() => wmLoadStatus(), 10000);
    } else {
      toast(d.error || 'Connection failed', 'err');
    }
  } catch(e) {
    toast('Connection request failed', 'err');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Connect'; }
  }
}

async function wmDisconnect() {
  try {
    const r = await fetch('/api/wifi/disconnect', { method: 'POST' });
    const d = await r.json();
    if (d.success) {
      toast('Disconnected from WiFi', 'ok');
      setTimeout(wmLoadStatus, 1000);
    } else {
      toast(d.error || 'Failed to disconnect', 'err');
    }
  } catch(e) {
    toast('Disconnect failed', 'err');
  }
}

async function wmForget() {
  const ssid = ($('wm-current-ssid') || {}).textContent || 'this network';
  const confirmed = confirm(`Forget "${ssid}"? The device will disconnect and you'll need to reconnect manually.`);
  if (!confirmed) return;

  // Forget = disconnect + erase credentials (same endpoint — ESP32 calls WiFi.disconnect(true, true))
  await wmDisconnect();
  toast(`Forgot ${ssid}`, '');
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

// Show auth screen immediately — don't wait for DOMContentLoaded
// This prevents any flash of the dashboard before login
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

document.addEventListener('DOMContentLoaded', () => {
  Router.init();
  setupSidebar();
  setupDash();
  setupQI();
  setupBF();
  $('refresh-btn')?.addEventListener('click', fetchAndRender);

  // Allow Enter key to submit login / register
  ['login-password', 'login-username'].forEach(id => {
    $(id)?.addEventListener('keydown', e => { if (e.key === 'Enter') authLogin(); });
  });
  ['reg-username','reg-email','reg-password'].forEach(id => {
    $(id)?.addEventListener('keydown', e => { if (e.key === 'Enter') authRegister(); });
  });
  $('forgot-email')?.addEventListener('keydown', e => { if (e.key === 'Enter') authForgot(); });
  $('reset-password')?.addEventListener('keydown', e => { if (e.key === 'Enter') authReset(); });

  fetchDeviceID();
});


// ── LOGOUT MODAL ─────────────────────
function openLogoutModal() {
  openModal('logout-confirm-modal');
}

// ── LOGOUT ───────────────────────────
async function authLogout() {
  try {
    await fetch('/logout');
  } catch(e) {}
  Auth.loggedIn = false;
  Auth.username = '';
  
  closeAllModals(); // <-- Added to hide the modal on success
  
  authTab('login');
  authShow();
  toast('Logged out', '');
}

function renderClaimedBins(binsArray) {
  const container = document.getElementById('claimed-bins-list');
  if(!container) return;

  container.innerHTML = binsArray.map(bin => `
    <div class="claimed-bin-card">
      <div class="bin-visual-header">
        <button class="bin-delete-x" onclick="confirmDeleteBin('${bin.bin_id}')">×</button>
        <img src="/data/img/claim-bin/ClaimBinIcon.svg" alt="Bin" class="bin-image">
      </div>

      <div class="bin-card-info">
        <div class="claimed-bin-name" onclick="openRenameBinModal('${bin.bin_id}', '${bin.name}')">
          ${bin.name || 'Unnamed Bin'}
        </div>
        <div class="claimed-bin-id">${bin.bin_id}</div>
        
        <div class="bin-status-chip ${bin.status === 'online' ? 'online' : 'offline'}">
          ${bin.status === 'online' ? 'Connected' : 'Offline'}
        </div>

        
      </div>
    </div>
  `).join('');
}
// Handler for claiming a new bin (Ref: Old settings.js)
async function handleClaimBin() {
  const code = document.getElementById('claim-code-input').value;
  if(!code) return toast('Please enter a claim code', 'err');
  
  try {
    const response = await fetch('/api/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim_code: code })
    });
    const result = await response.json();
    if(result.success) {
      toast('Bin successfully linked!', 'ok');
      closeTopModal();
      location.reload(); // Refresh to see new bin in list
    } else {
      toast(result.error || 'Claiming failed', 'err');
    }
  } catch(e) {
    toast('Server connection error', 'err');
  }
}

function makeEditable(el, binId) {
  const oldName = el.textContent.trim();
  const input = document.createElement('input');
  
  input.type = 'text';
  input.className = 'inline-edit-input';
  input.value = oldName;
  
  // Replace text with input
  el.replaceWith(input);
  input.focus();

  const save = async () => {
    const newName = input.value.trim();
    if (newName && newName !== oldName) {
      // Logic from old settings.js for updating nickname
      const success = await updateBinNickname(binId, newName);
      if (success) {
        toast('Nickname updated!', 'ok');
        location.reload(); 
      }
    }
    // Revert to div if no change or finished
    input.replaceWith(el);
    el.textContent = newName || oldName;
  };

  input.onblur = save;
  input.onkeydown = (e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') input.replaceWith(el); };
}


/**
 * Triggers the Delete/Unclaim Confirmation
 */
function confirmDeleteBin(binId) {
  const modal = document.getElementById('confirm-action-modal');
  document.getElementById('confirm-modal-title').textContent = "Unclaim Bin";
  document.getElementById('confirm-modal-desc').textContent = `Are you sure you want to remove ${binId}? This cannot be undone.`;
  document.getElementById('rename-input-container').style.display = 'none';
  
  const confirmBtn = document.getElementById('confirm-modal-btn');
  confirmBtn.onclick = async () => {
    // Ported from online settings.js
    const success = await handleUnclaimBin(binId); 
    if(success) {
      toast('Bin removed', 'ok');
      closeTopModal();
      location.reload(); 
    }
  };
  
  openModal('confirm-action-modal');
}

/**
 * Triggers the Rename Modal
 */
function openRenameBinModal(binId, currentName) {
  const modal = document.getElementById('confirm-action-modal');
  document.getElementById('confirm-modal-title').textContent = "Rename Bin";
  document.getElementById('confirm-modal-desc').textContent = "Enter a new nickname for this bin:";
  
  const inputContainer = document.getElementById('rename-input-container');
  const inputField = document.getElementById('new-bin-nickname');
  inputContainer.style.display = 'block';
  inputField.value = currentName;
  
  const confirmBtn = document.getElementById('confirm-modal-btn');
  confirmBtn.onclick = async () => {
    const newName = inputField.value.trim();
    if(!newName) return toast('Name cannot be empty', 'err');
    
    // API Call to update nickname
    const success = await updateBinNickname(binId, newName);
    if(success) {
      toast('Nickname updated!', 'ok');
      closeTopModal();
      location.reload();
    }
  };
  
  openModal('confirm-action-modal');
}


// --- Functional Dummy Logic for Renaming ---
async function updateBinNickname(binId, newName) {
  // Find the bin in our global state array
  const binIndex = S.bins.findIndex(b => b.bin_id === binId);
  
  if (binIndex !== -1) {
    S.bins[binIndex].name = newName; // Update the dummy data in memory
    renderClaimedBins(S.bins); // Re-render the UI immediately
    return true; 
  }
  return false;
}

// Updated Delete Handler
async function handleUnclaimBin(binId) {
  // 1. Update the local dummy data array
  S.bins = S.bins.filter(b => b.bin_id !== binId);
  
  // 2. Re-render the UI immediately (DON'T RELOAD)
  renderClaimedBins(S.bins);
  
  // 3. Close modal and toast
  closeTopModal();
  toast(`Bin ${binId} removed (Local)`, 'ok');
  
  // REMOVE location.reload() to stay on the current page!
}

// Updated Rename Handler
async function updateBinNickname(binId, newName) {
  const bin = S.bins.find(b => b.bin_id === binId);
  if (bin) {
    bin.name = newName;
    renderClaimedBins(S.bins);
    closeTopModal();
    toast('Name updated (Local)', 'ok');
  }
}

// --- Functional Dummy Logic for Claiming ---
async function handleClaimBin() {
  const code = document.getElementById('claim-code-input').value;
  if(!code) return toast('Please enter a code', 'err');

  const newBin = {
    bin_id: "AV-" + Math.floor(1000 + Math.random() * 9000), // Random ID
    name: "New Bin " + (S.bins.length + 1),
    status: "online"
  };

  S.bins.push(newBin); // Add to our dummy array
  renderClaimedBins(S.bins); // Re-render
  closeTopModal();
  toast('Bin claimed (Dummy Mode)', 'ok');
}


/**
 * Opens Edit Profile Modal and pre-fills current data
 */
function openEditProfileModal() {
  const currentUsername = document.getElementById('acc-username').textContent;
  const currentEmail = document.getElementById('acc-email').textContent;
  
  document.getElementById('edit-username').value = currentUsername === 'Loading...' ? '' : currentUsername;
  document.getElementById('edit-email').value = currentEmail === '--' ? '' : currentEmail;
  
  openModal('edit-profile-modal');
}

/**
 * Handles Profile Information Update
 */
async function handleUpdateProfile() {
  const newUsername = document.getElementById('edit-username').value.trim();
  const newEmail = document.getElementById('edit-email').value.trim();

  if (!newUsername || !newEmail) return toast('All fields are required', 'err');

  // Update Global State (S.data or S.auth)
  if (Auth) {
    Auth.username = newUsername;
    Auth.email = newEmail;
  }

  // Update UI Elements
  document.getElementById('acc-username').textContent = newUsername;
  document.getElementById('acc-email').textContent = newEmail;
  
  closeTopModal();
  toast('Profile updated successfully!', 'ok');
}

/**
 * Handles Password Change with repeat confirmation
 */
async function handleChangePassword() {
  const current = document.getElementById('change-pw-current').value;
  const newPw = document.getElementById('change-pw-new').value;
  const repeat = document.getElementById('change-pw-repeat').value;

  if (!current || !newPw || !repeat) return toast('Please fill in all fields', 'err');
  if (newPw.length < 6) return toast('New password must be at least 6 characters', 'err');
  if (newPw !== repeat) return toast('New passwords do not match', 'err');

  // Final Confirmation Step
  closeTopModal();
  const confirmModal = document.getElementById('confirm-action-modal');
  document.getElementById('confirm-modal-title').textContent = "Change Password?";
  document.getElementById('confirm-modal-desc').textContent = "This action is permanent and will sign you out for security.";
  
  const confirmBtn = document.getElementById('confirm-modal-btn');
  confirmBtn.onclick = () => {
    toast('Updating security credentials...', '');
    setTimeout(() => {
      authLogout(); // Force logout for security after password change
      toast('Password updated. Please log in again.', 'ok');
    }, 1500);
  };
  
  openModal('confirm-action-modal');
}

/**
 * Opens Change Password Modal and resets fields
 */
function openChangePasswordModal() {
  document.getElementById('change-pw-current').value = '';
  document.getElementById('change-pw-new').value = '';
  document.getElementById('change-pw-repeat').value = '';
  openModal('change-password-modal');
}

/**
 * Validates and submits password change
 */
async function handleChangePassword() {
  const current = document.getElementById('change-pw-current').value;
  const newPw = document.getElementById('change-pw-new').value;
  const repeat = document.getElementById('change-pw-repeat').value;

  // Validation
  if (!current || !newPw || !repeat) return toast('All fields are required', 'err');
  if (newPw.length < 6) return toast('Password must be at least 6 characters', 'err');
  if (newPw !== repeat) return toast('Passwords do not match', 'err');

  // Transition to confirmation modal
  closeTopModal();
  const confirmModal = document.getElementById('confirm-action-modal');
  document.getElementById('confirm-modal-title').textContent = "Confirm Change";
  document.getElementById('confirm-modal-desc').textContent = "Updating your password will require you to log back in.";
  
  const confirmBtn = document.getElementById('confirm-modal-btn');
  confirmBtn.onclick = async () => {
    toast('Updating security credentials...', '');
    try {
      // Logic for actual backend call would go here
      setTimeout(() => {
        authLogout(); // Force logout for security
        toast('Password updated. Please log in again.', 'ok');
      }, 1500);
    } catch (e) {
      toast('Failed to update password', 'err');
    }
  };
  
  openModal('confirm-action-modal');
}
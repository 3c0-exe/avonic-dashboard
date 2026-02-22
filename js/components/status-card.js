// ========================================
// 📊 SENSOR CARD MODAL — Standalone
// Uses evaluateWormCondition + DASHBOARD_WORM_CONDITIONS
// ========================================

const SENSOR_META = {
  'Soil Moisture': {
    key: 'soilMoisture',
    unit: '%',
    icon: 'img/icons/sensorIcons/SoilMoistureIcon.svg',
    showMist: true,
    showFan: false,
  },
  'Temperature': {
    key: 'temperature',
    unit: '°C',
    icon: 'img/icons/sensorIcons/TempIcon.svg',
    showMist: false,
    showFan: true,
  },
  'Humidity': {
    key: 'humidity',
    unit: '%',
    icon: 'img/icons/sensorIcons/HumidityIcon.svg',
    showMist: true,
    showFan: true,
  },
  'Gas Levels': {
    key: 'gasLevels',
    unit: 'ppm',
    icon: 'img/icons/sensorIcons/GasIcon.svg',
    showMist: false,
    showFan: true,
  }
};

const WORM_CLIPART = {
  'normal':   'img/worm-conditions/Normal.png',
  'too-dry':  'img/worm-conditions/Too Dry.png',
  'too-wet':  'img/worm-conditions/Too Wet.png',
  'too-hot':  'img/worm-conditions/Too Hot.png',
  'gas-high': 'img/worm-conditions/Gas Too High.png',
};

const CONDITION_LABEL = {
  'normal':           { label: 'Optimal',  cls: 'sm-dot-optimal' },
  'too-hot':          { label: 'Too Hot',  cls: 'sm-dot-danger'  },
  'too-cold':         { label: 'Too Cold', cls: 'sm-dot-warning' },
  'sub-optimal-hot':  { label: 'High',     cls: 'sm-dot-warning' },
  'sub-optimal-cold': { label: 'Low',      cls: 'sm-dot-warning' },
  'too-dry':          { label: 'Too Dry',  cls: 'sm-dot-warning' },
  'too-wet':          { label: 'Too Wet',  cls: 'sm-dot-danger'  },
  'sub-optimal-dry':  { label: 'Low',      cls: 'sm-dot-warning' },
  'sub-optimal-wet':  { label: 'High',     cls: 'sm-dot-warning' },
  'gas-elevated':     { label: 'Elevated', cls: 'sm-dot-warning' },
  'gas-too-high':     { label: 'Danger',   cls: 'sm-dot-danger'  },
};

function injectSensorModalStyles() {
  if (document.getElementById('sensor-modal-styles')) return;
  const style = document.createElement('style');
  style.id = 'sensor-modal-styles';
  style.textContent = `
    #sensor-modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
      z-index: 99999;
      animation: smFadeIn 0.2s ease;
    }
    @keyframes smFadeIn { from { opacity:0 } to { opacity:1 } }

    .sm-box {
      background: #fff;
      border-radius: 28px;
      padding: 22px;
      width: 92%;
      max-width: 380px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.18);
      animation: smSlideUp 0.25s ease;
      font-family: 'Quicksand', sans-serif;
    }
    @keyframes smSlideUp {
      from { transform: translateY(24px); opacity:0 }
      to   { transform: translateY(0); opacity:1 }
    }

    /* ---- Header ---- */
    .sm-header {
      display: flex; align-items: center; justify-content: space-between;
    }
    .sm-header-left {
      display: flex; align-items: center; gap: 10px;
    }
    .sm-header-icon { width: 24px; height: 24px; object-fit: contain; }
    .sm-title { font-size: 20px; font-weight: 700; color: #111; }
    .sm-refresh {
      background: none; border: none; cursor: pointer;
      font-size: 20px; color: #bbb; padding: 0;
      transition: transform 0.4s ease; line-height: 1;
    }
    .sm-refresh:hover { color: #888; }

    /* ---- Reading box ---- */
    .sm-reading {
      background: #f2f2f2;
      border-radius: 18px;
      padding: 14px;
    }
    .sm-reading-label {
      font-size: 13px; color: #999; font-weight: 600;
      margin-bottom: 10px; padding-left: 2px;
    }
    .sm-reading-inner {
      background: #fff;
      border-radius: 14px;
      padding: 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 120px;
    }
    .sm-value-col { display: flex; flex-direction: column; gap: 10px; }
    .sm-value-row { display: flex; align-items: baseline; gap: 4px; }
    .sm-big-value { font-size: 52px; font-weight: 700; line-height: 1; color: #111; }
    .sm-unit { font-size: 22px; font-weight: 500; color: #444; }
    .sm-status-badge {
      display: inline-flex; align-items: center; gap: 7px;
      font-size: 14px; font-weight: 600; color: #555;
    }
    .sm-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .sm-dot-optimal { background: #f0b429; }
    .sm-dot-warning  { background: #ff9800; }
    .sm-dot-danger   { background: #f44336; }
    .sm-dot-neutral  { background: #aaa; }
    .sm-worm {
      width: 110px; height: 110px;
      object-fit: contain; flex-shrink: 0;
    }

    /* ---- Manual Actions ---- */
    .sm-manual-title {
      font-size: 16px; font-weight: 700; color: #111;
      margin-bottom: -4px;
    }
    .sm-manual-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .sm-manual-card {
      background: #ebebeb;
      border-radius: 20px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 110px;
      aspect-ratio: 1 / 1;
    }
    .sm-manual-card-label {
      display: flex; align-items: center; gap: 8px;
      font-size: 15px; font-weight: 600; color: #111;
    }
    .sm-manual-card-label img {
      width: 20px; height: 20px; object-fit: contain;
    }

    /* ---- Toggle ---- */
    .sm-toggle {
      width: 52px; height: 30px;
      background: #c0c0c0; border-radius: 15px;
      cursor: pointer; position: relative;
      transition: background 0.25s;
    }
    .sm-toggle::after {
      content: ''; position: absolute;
      top: 4px; left: 4px;
      width: 22px; height: 22px;
      background: #fff; border-radius: 50%;
      box-shadow: 0 1px 4px rgba(0,0,0,0.25);
      transition: transform 0.25s;
    }
    .sm-toggle.active { background: var(--auto-mode-clr, #347900); }
    .sm-toggle.active::after { transform: translateX(22px); }

    /* ---- Cancel button ---- */
    .sm-cancel-btn {
      width: 100%; padding: 16px;
      background: #3a3a3a; color: #fff;
      border: none; border-radius: 50px;
      font-size: 16px; font-weight: 700;
      cursor: pointer; font-family: 'Quicksand', sans-serif;
      transition: background 0.2s;
    }
    .sm-cancel-btn:hover { background: #555; }
  `;
  document.head.appendChild(style);
}

function openSensorModal(card) {
  if (document.getElementById('sensor-modal-overlay')) return;
  injectSensorModalStyles();

  const label = card.querySelector('.sensor-label')?.textContent?.trim() || '';
  const valueEl = card.querySelector('.sensor-value');
  const rawText = valueEl ? valueEl.childNodes[0]?.textContent?.trim() : '--';
  const rawValue = parseFloat(rawText);
  const meta = SENSOR_META[label];
  if (!meta) return;

  const evaluated = (typeof evaluateWormCondition === 'function' && !isNaN(rawValue))
    ? evaluateWormCondition(meta.key, rawValue)
    : { condition: 'normal', clipart: 'normal' };

  const wormSrc = WORM_CLIPART[evaluated.clipart] || WORM_CLIPART['normal'];
  const statusInfo = CONDITION_LABEL[evaluated.condition] || { label: 'Optimal', cls: 'sm-dot-optimal' };
  const isManual = (typeof isManualMode !== 'undefined') ? isManualMode : false;
  const displayValue = isNaN(rawValue) ? '--' : rawValue;

  const manualHTML = isManual ? `
    <div class="sm-manual-title">Manual Actions</div>
    <div class="sm-manual-grid">
      ${meta.showMist ? `
      <div class="sm-manual-card">
        <div class="sm-manual-card-label">
          <img src="img/icons/water.svg" alt="Mist" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'💧',style:'font-size:18px'}))">
          <span>Mist</span>
        </div>
        <div class="sm-toggle" id="sm-mist-toggle"></div>
      </div>` : ''}
      ${meta.showFan ? `
      <div class="sm-manual-card">
        <div class="sm-manual-card-label">
          <img src="img/icons/fan.svg" alt="Fan" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'🌀',style:'font-size:18px'}))">
          <span>Fan</span>
        </div>
        <div class="sm-toggle" id="sm-fan-toggle"></div>
      </div>` : ''}
    </div>
  ` : '';

  const overlay = document.createElement('div');
  overlay.id = 'sensor-modal-overlay';
  overlay.innerHTML = `
    <div class="sm-box">
      <div class="sm-header">
        <div class="sm-header-left">
          <img class="sm-header-icon" src="${meta.icon}" alt="${label}"
            onerror="this.style.display='none'">
          <span class="sm-title">${label}</span>
        </div>
        <button class="sm-refresh" id="sm-refresh-btn" title="Refresh">↻</button>
      </div>

      <div class="sm-reading">
        <div class="sm-reading-label">Current Reading</div>
        <div class="sm-reading-inner">
          <div class="sm-value-col">
            <div class="sm-value-row">
              <span class="sm-big-value" id="sm-val">${displayValue}</span>
              <span class="sm-unit">${meta.unit}</span>
            </div>
            <div class="sm-status-badge">
              <div class="sm-dot ${statusInfo.cls}" id="sm-dot"></div>
              <span id="sm-status">${statusInfo.label}</span>
            </div>
          </div>
          <img class="sm-worm" id="sm-worm"
            src="${wormSrc}" alt="Worm"
            onerror="this.style.display='none'">
        </div>
      </div>

      ${manualHTML}

      <button class="sm-cancel-btn" id="sm-cancel-btn">Cancel</button>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.getElementById('sm-cancel-btn').addEventListener('click', close);

  document.getElementById('sm-refresh-btn').addEventListener('click', function () {
    this.dataset.rot = (parseInt(this.dataset.rot || 0) + 360);
    this.style.transform = `rotate(${this.dataset.rot}deg)`;

    const liveText = valueEl ? valueEl.childNodes[0]?.textContent?.trim() : '--';
    const liveVal = parseFloat(liveText);
    const newEval = (typeof evaluateWormCondition === 'function' && !isNaN(liveVal))
      ? evaluateWormCondition(meta.key, liveVal)
      : { condition: 'normal', clipart: 'normal' };

    const newStatus = CONDITION_LABEL[newEval.condition] || { label: 'Optimal', cls: 'sm-dot-optimal' };
    const newWorm = WORM_CLIPART[newEval.clipart] || WORM_CLIPART['normal'];

    document.getElementById('sm-val').textContent = isNaN(liveVal) ? '--' : liveVal;
    document.getElementById('sm-status').textContent = newStatus.label;
    document.getElementById('sm-dot').className = `sm-dot ${newStatus.cls}`;
    const wormEl = document.getElementById('sm-worm');
    if (wormEl) { wormEl.src = newWorm; wormEl.style.display = 'block'; }
  });

  ['sm-mist-toggle', 'sm-fan-toggle'].forEach(id => {
    const toggle = document.getElementById(id);
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      const type = id === 'sm-mist-toggle' ? 'pump' : 'fan';
      const isOn = toggle.classList.contains('active');
      if (typeof controlDeviceFromModal === 'function') {
        const binId = card.closest('[data-bin-id]')?.dataset?.binId;
        controlDeviceFromModal(binId, type, isOn);
      }
    });
  });
}

// Event delegation — works for all bins dynamically
document.addEventListener('click', (e) => {
  const card = e.target.closest('.sensor-card');
  if (!card) return;
  openSensorModal(card);
});

console.log('✅ Sensor Card Modal loaded');
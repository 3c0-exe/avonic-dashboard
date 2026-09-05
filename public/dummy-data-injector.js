/* ════════════════════════════════════════════
   dummy-data-injector.js — AVONIC Simulation Deck
   Zero-Backend Interactive Telemetry Engine
   
   HOTKEYS (Hold Shift):
   Shift + S : Optimal / Stable Scenario
   Shift + U : Heat Alert Scenario (High Temp)
   Shift + L : Live Dynamic Drift
   Shift + D : Instant Demo Login Bypass
   Shift + H : Toggle Simulation Deck UI (Hide/Show)
   Shift + R : Reset Telemetry
   ════════════════════════════════════════════ */

(function () {
  'use strict';

  let currentMode = 'stable';
  let audioEnabled = true;
  let isDeckMinimized = false;
  let isDeckHidden = false;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
  }

  function playBeep(frequency, duration) {
    if (!audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch(e) {}
  }

  // ── Scenario Switcher ──────────────────────────────────────────
  window.setSimMode = function (mode) {
    currentMode = mode;
    if (window.AvonicSimulator) {
      window.AvonicSimulator.setScenario(mode);
    }

    // Sound cues
    if (mode === 'stable') playBeep(600, 0.15);
    else if (mode === 'heat' || mode === 'unstable') playBeep(260, 0.25);
    else if (mode === 'dry') playBeep(320, 0.2);
    else if (mode === 'gas') playBeep(200, 0.3);
    else if (mode === 'critical_system') playBeep(180, 0.35);
    else if (mode === 'live') playBeep(450, 0.15);

    // Refresh history
    if (typeof fetchHistory === 'function' && typeof S !== 'undefined' && S.activeEspID) {
      fetchHistory(S.activeEspID);
    }

    // Immediate render
    if (typeof fetchAndRender === 'function') {
      fetchAndRender();
    }

    // Update Deck UI buttons
    updateDeckUI();

    // Friendly Toast
    const titles = {
      stable: '🌿 Optimal Conditions (24.5°C, 72% Moisture)',
      heat: '🔥 Heat Wave Alert (36°C — Cooling Fans Auto-On)',
      dry: '💧 Drought Alert (35% Moisture — Mist Pump Active)',
      gas: '⚠️ Biogas Spike Alert (215 ppm — Exhaust Active)',
      critical_system: '⚡ Critical Alert: Low Battery (12%) & Water (8%)',
      live: '🎲 Live Telemetry Drift Active'
    };
    if (typeof toast === 'function' && titles[mode]) {
      toast(titles[mode], mode === 'stable' || mode === 'live' ? 'ok' : 'warn');
    }
  };

  // ── Hotkeys ───────────────────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.shiftKey) {
      switch (e.key.toLowerCase()) {
        case 's':
          window.setSimMode('stable');
          break;
        case 'u':
          window.setSimMode('heat');
          break;
        case 'l':
          window.setSimMode('live');
          break;
        case 'd':
          playBeep(800, 0.1);
          if (typeof demoInstantLogin === 'function') demoInstantLogin();
          else if (typeof devBypassLogin === 'function') devBypassLogin();
          break;
        case 'h':
          toggleDeckVisibility();
          break;
        case 'r':
          playBeep(150, 0.3);
          window.setSimMode('stable');
          if (typeof toast === 'function') toast('Telemetry reset to defaults', 'ok');
          break;
      }
    }
  });

  // ── Render Floating Simulation Deck ───────────────────────────
  function mountSimulationDeck() {
    if (document.getElementById('avonic-sim-deck')) return;

    const deck = document.createElement('div');
    deck.id = 'avonic-sim-deck';
    deck.innerHTML = `
      <div class="sim-deck-card" id="sim-deck-card">
        <div class="sim-deck-header">
          <div class="sim-deck-title-wrap">
            <span class="sim-live-pulse"></span>
            <span class="sim-deck-title">AVONIC Demo Deck</span>
          </div>
          <button class="sim-deck-min-btn" id="sim-deck-min-btn" title="Minimize Deck">_</button>
        </div>

        <div class="sim-scenario-grid">
          <button class="sim-scenario-btn active" data-sim="stable">
            <span>🌿</span> Optimal
          </button>
          <button class="sim-scenario-btn" data-sim="heat">
            <span>🔥</span> Heat Alert
          </button>
          <button class="sim-scenario-btn" data-sim="dry">
            <span>💧</span> Drought
          </button>
          <button class="sim-scenario-btn" data-sim="gas">
            <span>⚠️</span> Gas Spike
          </button>
          <button class="sim-scenario-btn" data-sim="critical_system">
            <span>⚡</span> Low Power
          </button>
          <button class="sim-scenario-btn" data-sim="live">
            <span>🎲</span> Live Drift
          </button>
        </div>

        <div class="sim-deck-footer">
          <button class="sim-deck-pulse-btn" id="sim-pulse-btn">⚡ Pulse Data</button>
          <button class="sim-deck-pulse-btn" id="sim-sound-btn">🔊 Audio: ON</button>
          <span style="opacity: 0.6; font-size: 10px;">Shift+H: Hide</span>
        </div>
      </div>

      <div class="sim-deck-badge" id="sim-deck-badge" style="display: none;">
        <span>🧪</span>
        <span id="sim-badge-label">Demo: Optimal</span>
      </div>
    `;

    document.body.appendChild(deck);

    // Event bindings
    deck.querySelectorAll('.sim-scenario-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const scenario = btn.dataset.sim;
        window.setSimMode(scenario);
      });
    });

    const minBtn = document.getElementById('sim-deck-min-btn');
    if (minBtn) minBtn.addEventListener('click', toggleDeckMinimize);

    const badge = document.getElementById('sim-deck-badge');
    if (badge) badge.addEventListener('click', toggleDeckMinimize);

    const pulseBtn = document.getElementById('sim-pulse-btn');
    if (pulseBtn) pulseBtn.addEventListener('click', () => {
      playBeep(520, 0.1);
      if (typeof fetchAndRender === 'function') fetchAndRender();
      if (typeof toast === 'function') toast('Telemetry burst generated ⚡', 'ok');
    });

    const soundBtn = document.getElementById('sim-sound-btn');
    if (soundBtn) soundBtn.addEventListener('click', () => {
      audioEnabled = !audioEnabled;
      soundBtn.textContent = audioEnabled ? '🔊 Audio: ON' : '🔇 Audio: OFF';
    });
  }

  function toggleDeckMinimize() {
    isDeckMinimized = !isDeckMinimized;
    const card = document.getElementById('sim-deck-card');
    const badge = document.getElementById('sim-deck-badge');
    if (card && badge) {
      card.style.display = isDeckMinimized ? 'none' : 'block';
      badge.style.display = isDeckMinimized ? 'flex' : 'none';
    }
  }

  function toggleDeckVisibility() {
    isDeckHidden = !isDeckHidden;
    const deck = document.getElementById('avonic-sim-deck');
    if (deck) {
      deck.style.display = isDeckHidden ? 'none' : 'block';
    }
  }

  function updateDeckUI() {
    const deck = document.getElementById('avonic-sim-deck');
    if (!deck) return;

    deck.querySelectorAll('.sim-scenario-btn').forEach(btn => {
      if (btn.dataset.sim === currentMode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const badgeLabel = document.getElementById('sim-badge-label');
    if (badgeLabel) {
      const labelMap = {
        stable: 'Demo: Optimal 🌿',
        heat: 'Demo: Heat 36°C 🔥',
        dry: 'Demo: Dry 35% 💧',
        gas: 'Demo: Gas Spike ⚠️',
        critical_system: 'Demo: Low Power ⚡',
        live: 'Demo: Drift 🎲'
      };
      badgeLabel.textContent = labelMap[currentMode] || 'Demo Active';
    }
  }

  // ── Auto Mount on DOM ready ──────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      mountSimulationDeck();
      updateDeckUI();
    });
  } else {
    mountSimulationDeck();
    updateDeckUI();
  }
})();
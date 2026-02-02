// ========================================
// 🎨 MODAL SYSTEM - STYLES & LOGIC
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
// 🛠️ UPDATED OPEN MODAL (The Fix for Double Backgrounds)
// ========================================
function openModal({ title, defaultContent, helpContent, syncValues = {}, card, cleanMode = false }) {
  const modal = document.createElement("div");
  modal.classList.add("status_modal");

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

// ========================================
// 🔧 MANUAL MODE UTILITIES
// ========================================

// helper: show small transient popup at x,y
function showManualPopup(x, y, text = "Manual mode is off") {
  const popup = document.createElement("div");
  popup.className = "manual-popup";
  popup.textContent = text;
  document.body.appendChild(popup);

  const left = Math.min(Math.max(x, 16), window.innerWidth - 16);
  const top = Math.max(y - 36, 8);

  popup.style.left = left + "px";
  popup.style.top = top + "px";

  setTimeout(() => popup.classList.add("fade"), 30);
  setTimeout(() => { if (popup && popup.parentNode) popup.parentNode.removeChild(popup); }, 1800);
}

// convenience: show popup anchored to the center/top of the control card
function showManualPopupAtControl(control, text = "Manual mode is off") {
  const rect = control.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height * 0.15;
  showManualPopup(x, y, text);
}

// Apply manual mode to container
function applyManualModeTo(container) {
    if (container.querySelector(".mode-switcher-modal")) return;
  const control = container.querySelector(".manualControl");
  if (!control) return;

  // visual class + opacity
  control.classList.toggle("disabled", !isManualMode);
  control.style.opacity = isManualMode ? "1" : "0.5";

  // disable interactive children
  control.querySelectorAll("input, select, button, textarea").forEach(el => {
    el.disabled = !isManualMode;
  });

  // attach long-press handler once
  if (!control.dataset.popupInit) {
    control.dataset.popupInit = "1";

    let holdTimer = null;
    const HOLD_MS = 600;

    const startHold = (evt) => {
      if (isManualMode) return;
      if (typeof evt.button !== "undefined" && evt.button !== 0) return;

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

    control.addEventListener("pointerdown", startHold);
    control.addEventListener("pointerup", cancelHold);
    control.addEventListener("pointercancel", cancelHold);
    control.addEventListener("pointerleave", cancelHold);
    control.addEventListener("mousedown", startHold);
    control.addEventListener("mouseup", cancelHold);
    control.addEventListener("mouseleave", cancelHold);
    control.addEventListener("touchstart", startHold, { passive: true });
    control.addEventListener("touchend", cancelHold);
    control.addEventListener("touchcancel", cancelHold);

    control.addEventListener("click", (e) => {
      if (!isManualMode) {
        e.stopPropagation();
        e.preventDefault();
      }
    });
  }
}

console.log('✅ Modal system loaded');
// ========================================
// 🔄 MODE SWITCHER COMPONENT
// ========================================

let isManualMode = JSON.parse(localStorage.getItem("isManualMode")) || false;

// ---- Sync a .mode-select button's text + color ----
function syncModeBtn(btn) {
  if (!btn) return;
  // Safely find the text node (ignore SVG child)
  let textNode = Array.from(btn.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
  if (textNode) textNode.textContent = isManualMode ? 'Manual ' : 'Auto ';
  btn.style.backgroundColor = isManualMode
    ? 'var(--manual-mode-clr)' : 'var(--auto-mode-clr)';
  btn.style.color = '#fff';
}

// ---- Sync all .mode-select buttons on the page ----
function syncAllModeBtns() {
  document.querySelectorAll('.mode-select').forEach(syncModeBtn);
}

// ---- Sync web component buttons (mode-switcher custom element) ----
function updateManualButton(btn) {
  if (!btn) return;
  btn.textContent = isManualMode ? "Mode: Manual" : "Mode: Auto";
  btn.style.backgroundColor = isManualMode
    ? "var(--manual-mode-clr, #c5b507)"
    : "var(--auto-mode-clr, #347900)";
  btn.setAttribute("aria-pressed", isManualMode ? "true" : "false");
}

// ---- Confirmation Modal ----
function confirmModeSwitch(manualBtn, helpContent = "") {
  // Prevent duplicate modals
  if (document.getElementById('mode-switch-modal')) return;

  const targetMode = isManualMode ? "Auto" : "Manual";

  const config = {
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
  }[targetMode];

  // Inject styles once
  if (!document.getElementById('mode-modal-styles')) {
    const style = document.createElement('style');
    style.id = 'mode-modal-styles';
    style.textContent = `
      #mode-switch-modal {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.45);
        display: flex; align-items: center; justify-content: center;
        z-index: 99999;
        animation: modeFadeIn 0.2s ease;
      }
      @keyframes modeFadeIn {
        from { opacity: 0; } to { opacity: 1; }
      }
      .mode-modal-box {
        background: #fff;
        border-radius: 20px;
        padding: 32px 28px;
        max-width: 340px;
        width: 90%;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 14px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.2);
        animation: modeSlideUp 0.25s ease;
      }
      @keyframes modeSlideUp {
        from { transform: translateY(30px); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }
      .mode-modal-img {
        width: 100%; max-height: 200px; object-fit: contain;
      }
      .mode-modal-title {
        font-size: 20px; font-weight: 700; margin: 0;
        font-family: 'Quicksand', sans-serif;
      }
      .mode-modal-desc {
        font-size: 14px; color: #555; margin: 0; line-height: 1.6;
        font-family: 'Quicksand', sans-serif;
      }
      .mode-modal-btn {
        width: 100%; padding: 14px;
        background: #ebebeb; border: none;
        border-radius: 50px; font-size: 15px;
        font-weight: 600; cursor: pointer;
        font-family: 'Quicksand', sans-serif;
        transition: background 0.2s;
      }
      .mode-modal-btn:hover { background: #ddd; }
      .mode-modal-btn.confirm:hover { background: #d4edda; }
    `;
    document.head.appendChild(style);
  }

  const overlay = document.createElement('div');
  overlay.id = 'mode-switch-modal';
  overlay.innerHTML = `
    <div class="mode-modal-box">
      <img class="mode-modal-img" src="${config.img}" alt="${targetMode} Mode"
        onerror="this.style.display='none'">
      <h2 class="mode-modal-title">${config.title}</h2>
      <p class="mode-modal-desc">${config.desc}</p>
      <button class="mode-modal-btn confirm" id="mode-confirm-btn">${config.btnText}</button>
      <button class="mode-modal-btn" id="mode-cancel-btn">Cancel</button>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  // Confirm
  document.getElementById('mode-confirm-btn').addEventListener('click', () => {
    isManualMode = !isManualMode;
    localStorage.setItem("isManualMode", JSON.stringify(isManualMode));

    // Sync all button types
    syncAllModeBtns();
    document.querySelectorAll('mode-switcher .btn.control.manual').forEach(updateManualButton);

    if (typeof applyManualModeTo === "function") {
      document.querySelectorAll(".status_modal").forEach(applyManualModeTo);
    }

    overlay.remove();
  });

  // Cancel
  document.getElementById('mode-cancel-btn').addEventListener('click', () => {
    overlay.remove();
  });
}

// ---- Web Component ----
class ModeSwitcher extends HTMLElement {
  connectedCallback() {
    if (this.querySelector('.btn.control.manual')) return;

    const btn = document.createElement("div");
    btn.className = "btn control manual";
    btn.setAttribute("role", "button");
    btn.style.cssText = `
      cursor: pointer; display: flex; align-items: center;
      justify-content: center; padding: 10px 20px;
      border-radius: 30px; color: #FFF; font-weight: bold;
    `;

    this.appendChild(btn);
    this.button = btn;
    updateManualButton(this.button);

    this.button.addEventListener("click", () => {
      confirmModeSwitch(this.button);
    });
  }
}
customElements.define("mode-switcher", ModeSwitcher);

// ---- Event delegation: catches ALL .mode-select buttons dynamically ----
// Works for any number of bins, even ones added after page load
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.mode-select');
  if (!btn) return;
  confirmModeSwitch(btn);
});

// ---- MutationObserver: sync buttons whenever new bin content is injected ----
const modeObserver = new MutationObserver(syncAllModeBtns);
modeObserver.observe(document.body, { childList: true, subtree: true });

// ---- Initial sync on load ----
document.addEventListener('DOMContentLoaded', syncAllModeBtns);

console.log('✅ Mode Switcher loaded');
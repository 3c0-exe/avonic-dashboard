// ========================================
// 🔄 MODE SWITCHER COMPONENT
// ========================================

let isManualMode = JSON.parse(localStorage.getItem("isManualMode")) || false;

// 1. helper: update button label + color
function updateManualButton(btn) {
  if (!btn) return;
  
  // Update text
  btn.textContent = isManualMode ? "Mode: Manual" : "Mode: Auto";
  
  // Update styling
  btn.style.backgroundColor = isManualMode
    ? "var(--manual-mode-clr, #FF5E5E)"
    : "var(--auto-mode-clr, #4da6ff)";
    
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
    btn.style.cursor = "pointer"; 
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.padding = "10px 20px";
    btn.style.borderRadius = "30px";
    btn.style.color = "#FFF";
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
    title: "Confirmation",
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
    helpContent: "" 
  });

  // Critical: This class triggers the CSS to hide the header and bg
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

      modal.remove();
      console.log(`Switched to ${isManualMode ? 'Manual' : 'Auto'} Mode`);
    });
  }

  // Cancel Button Logic
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
        modal.remove();
    });
  }
}

console.log('✅ Mode Switcher component loaded');
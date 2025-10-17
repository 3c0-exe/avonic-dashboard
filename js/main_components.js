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
                <img class="mode-confirmation-dummy bin-card" src="img/more dummies/Placeholder icon.png" alt="">
                <a class="btn bin" href="${navigateTo}">Select bin</a>
            </div>
        `;
    }
}

customElements.define("bin-card", Bincard)


class Statuscard extends HTMLElement {
  connectedCallback() {
    const dataType = this.getAttribute("dataType");
    const maxValue = this.getAttribute("maxValue");
    const dataUnit = this.getAttribute("dataUnit");
    const dataLabel = this.getAttribute("dataLabel");
    const subDataLabel = this.getAttribute("subDataLabel");
    const icon = this.getAttribute("icon");
    const isClickable = this.getAttribute("isClickable") === "true"; // normalize boolean
    const showWaterPressure = this.getAttribute("showWaterPressure") === "true";
    const showFanRPM = this.getAttribute("showFanRPM") === "true";

    // ✅ Grab template content if present
    const helpTemplate = this.querySelector("template.help");
    const helpContent = helpTemplate ? helpTemplate.innerHTML : "";


    this.innerHTML = `
      <div class="card_stats ${isClickable ? "clickable" : ""}" 
           data-max="${maxValue || 100}" 
           data-unit="${dataUnit}" 
           data-type="${dataType}">
        
        <div class="status_label">${dataLabel}</div>
        <div class="sub_status_label">${subDataLabel}</div>
        
        <div class="percentage">
          <span class="card_value">0</span>
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
            <div class="circle-icon">
              <img src="${icon}" alt="">
            </div>
          </div>
        </div>

        <!--
        <div class="refresh_btn">
          <img src="img/icons/refresh_icon.svg" alt="">
        </div> -->

      </div>

      
      <p class="status-message"></p>
    `;
    let manualControls = "";
    if (showWaterPressure) {
  manualControls += `
   <div class="manual waterPressure">
                <p class="actuatorName">Water Pressure</p>
                <div class="slideContainer">
                  <input class="slider" type="range" min="0" max="100" value="0" step="10">
                </div>
                <div class="labels">
                  <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
                </div>
      </div>
  `;
}

if (showFanRPM) {
  manualControls += `
    
              <div class="manual fanRPM">
                <p class="actuatorName">Fan RPM</p>
                <div class="slideContainer">
                  <input class="slider" type="range" min="0" max="100" value="0" step="10">
                </div>
                <div class="labels">
                  <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
                </div>
             </div>
  `;
}
    // ✅ Only this one block handles modal clicks
    if (isClickable) {
  const cardElement = this.querySelector(".card_stats"); // capture this card
  cardElement.addEventListener("click", () => {
    openModal({
      title: this.getAttribute("dataLabel"),
      defaultContent:`
     <div class="reading-modal-wrapper"> 
          <div class="refresh_btn modal" id="refreshBtn">
                  <img src="img/icons/refresh_icon.svg" alt="">
                </div>

                <div class="modalWrapper">
                  <div class="readings">
                    <img class="card-worm-icon" src="img/more dummies/Placeholder icon.png" alt="">
                    <div class="reading-text">
                        <div class="modalSubTitle">Current Reading</div>
                        <div class="readingValue">
                        <span class="card_value_v2"></span>
                        <span class="card_unit_v2"></span>
                        </div>
                        <div class="sensorStatus">Optimal</div>
                    </div>
                    
                  </div>

                  <div class="manualControl">
                    <div class="tertiaryCardName">Manual</div>
                    
                ${showWaterPressure ? `
                  <div class="manualModule">
                    <div class="tertiaryCardName sub">Water Pressure</div>
                    <div class="slideContainer">
                      <input class="slider" type="range" min="0" max="100" value="0" step="10">
                    </div>
                    <div class="labels">
                      <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
                    </div>
                  </div>
         
                  
                ` : ""}

                ${showFanRPM ? `
                  <div class="manualModule">
                    <div class="tertiaryCardName sub">Fan RPM</div>
                    <div class="slideContainer">
                      <input class="slider" type="range" min="0" max="100" value="0" step="10">
                    </div>
                    <div class="labels">
                      <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
                    </div>
                  </div>
              
           
          ` : ""}
            
               </div>

              
`,
      helpContent,

      syncValues: {
        valueElem: this.querySelector(".card_value"),
        unitElem: this.querySelector(".card_unit"),
      },
      card: cardElement // ✅ pass card reference
    });
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



// --------- Manual mode: clean single implementation (replace your old duplicated DOMContentLoaded block) ---------

class ModeSwitcher extends HTMLElement {
  connectedCallback() {
    // 1. Grab and cache the help template
    const helpTemplate = this.querySelector("template.help");
    this._helpContent = helpTemplate ? helpTemplate.innerHTML.trim() : "";

    // 2. Clear only the template (so it won’t render visibly)
    if (helpTemplate) helpTemplate.remove();

    // 3. Add button element without nuking the shadow
    const btn = document.createElement("div");
    btn.className = "btn control manual";
    btn.setAttribute("role", "button");
    this.appendChild(btn);

    this.button = btn;
    updateManualButton(this.button);

    // 4. Always pass cached help
    this.button.addEventListener("click", () => {
      confirmModeSwitch(this.button, this._helpContent);
    });
  }
}
customElements.define("mode-switcher", ModeSwitcher);




let isManualMode = JSON.parse(localStorage.getItem("isManualMode")) || false;

// helper: update button label + color
function updateManualButton(btn) {
  if (!btn) return;
  btn.textContent = isManualMode ? "Mode: Manual" : "Mode: Auto";
  btn.style.backgroundColor = isManualMode
    ? "var(--manual-mode-clr)"
    : "var(--auto-mode-clr)";
  btn.setAttribute("aria-pressed", isManualMode ? "true" : "false");
}

// 🔹 use openModal for confirmation
function confirmModeSwitch(manualBtn, helpContent = "") {
  const msg = isManualMode
    ? "Switch to Auto Mode? <br> Manual controls will be disabled."
    : "Switch to Manual Mode? <br> Controls will be enabled.";

  // ✅ Add a special marker class to this modal
  const modal = openModal({
    title: "Confirmation",
    defaultContent: `
      <div class="card_body mode-switcher-modal">

      <img class="mode-confirmation-dummy" src="img/more dummies/Placeholder icon.png" alt="">

        <div class="mode-confirmation-msg" style="font-size:1.2rem;">
          ${msg}
        </div>
        <div class="manualControl" >
          <div class="btn modalConfirm">Confirm</div>
          <div class="btn modalCancel">Cancel</div>
        </div>
      </div>
    `,
    helpContent: helpContent ||"<p>No help available for this control.</p>"
  });

  
  // 🔹 Attach button logic after modal is created
  const confirmBtn = modal.querySelector(".modalConfirm");
  const cancelBtn  = modal.querySelector(".modalCancel");

  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      // toggle mode
      isManualMode = !isManualMode;
      localStorage.setItem("isManualMode", JSON.stringify(isManualMode));

      // update the main button
      updateManualButton(manualBtn);

      // apply state to all modals (color coding, etc.)
      document.querySelectorAll(".status_modal").forEach(applyManualModeTo);

      // close the modal
      modal.remove();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => modal.remove());
  }
}


document.addEventListener("DOMContentLoaded", () => {
  // ✅ Initialize ALL mode switcher buttons, not just the first one
  const manualBtns = document.querySelectorAll(".btn.control.manual");
  
  manualBtns.forEach(manualBtn => {
    if (!manualBtn) return;

    // restore saved state
    updateManualButton(manualBtn);

    // open confirmation modal on click
    manualBtn.addEventListener("click", () => confirmModeSwitch(manualBtn));
  });
  
  console.log(`✅ Initialized ${manualBtns.length} mode switcher buttons`);
});





//if card is clickable (reusable modal)
function openModal({ title, defaultContent, helpContent,syncValues = {}, card}) {
  const modal = document.createElement("div");
  modal.classList.add("status_modal");

  // Full modal HTML (your original one)
  modal.innerHTML = `
    <div class="modal">
      <div class="modalHeader">
        <div class="sensorName">
          <h1>${title}</h1>
        </div>
        <div class="close_btn">
          <img src="img/icons/navIcons/closeIcon.svg" alt="">
        </div>
      </div>

      <div class="modalCard">
        <!-- Default Content -->
        <div class="modalContent defaultContent active">
          ${defaultContent}
            </div>
          </div>

          <div class="QmarkIcon modal">
            <img src="img/icons/navIcons/QmarkIcon.svg" alt="">
          </div>
        </div>

        <!-- Help Content -->
        <div class="modalContent helpContent">
          <div class="helpHeader">
             
              <img class="back_btn" src="img/icons/navIcons/backIcon.svg" alt="">
            
            <h2>Help Guide</h2>
          </div>
             
          <div class="helpBody" name="helpContent">
          
              ${helpContent}
          
          </div>
        </div>
      </div>
  
  `;

  document.body.appendChild(modal);
  applyManualModeTo(modal);


  // 🔹 Close button
  modal.querySelector(".close_btn").addEventListener("click", () => modal.remove());

  // 🔹 Refresh button

 const modalRefreshBtn = modal.querySelector("#refreshBtn");
  if (modalRefreshBtn && card) {
    modalRefreshBtn.addEventListener("click", () => {
      console.log("🔄 Modal refresh clicked for:", title);
     const valueElem = card.querySelector(".card_value");
  const unitElem = card.querySelector(".card_unit");
  if (valueElem) valueElem.textContent = '--';
  if (unitElem) unitElem.textContent = '';
});
  }
    


  // 🔹 Help toggle
  const qmarkBtn = modal.querySelector(".QmarkIcon");
  const backBtn = modal.querySelector(".back_btn");

 // inside openModal
  const defaultContentDiv = modal.querySelector(".defaultContent");
  const helpContentDiv = modal.querySelector(".helpContent");

  qmarkBtn.addEventListener("click", () => {
    defaultContentDiv.classList.remove("active");
    helpContentDiv.classList.add("active");
  });

  backBtn.addEventListener("click", () => {
    helpContentDiv.classList.remove("active");
    defaultContentDiv.classList.add("active");
  });


  // 🔹 Sync values
  if (syncValues.valueElem && syncValues.unitElem) {
  const currentValue = parseFloat(syncValues.valueElem.textContent) || 0;
  const currentUnit = syncValues.unitElem.textContent || "";

  modal.querySelector(".card_value_v2").textContent = currentValue;
  modal.querySelector(".card_unit_v2").textContent = currentUnit;

  // 🔥 Force full sync (colors + status + bg)
  if (card) {
    setCardValue(card, currentValue);
  }
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


 

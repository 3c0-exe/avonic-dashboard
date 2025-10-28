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


 

// ====== ADD TO main_components.js ======

// Function to load and render dashboard dynamically
async function loadDashboard() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    router.navigateTo('/');
    return;
  }

  try {
    // Fetch user's devices
    const response = await fetch('https://avonic-backend-production.up.railway.app/api/devices', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch devices');

    const data = await response.json();
    const devices = data.devices || [];

    // Get the container where we'll render devices
    const quickInsightsContainer = document.querySelector('.quick_insights_card_container');
    const binFluctuationsSection = document.querySelector('.bin-fluctuations');

    if (!quickInsightsContainer || !binFluctuationsSection) return;

    // Clear existing content
    quickInsightsContainer.innerHTML = '';
    binFluctuationsSection.innerHTML = '';

    // ====== CLAIM DEVICE HANDLER ======
async function handleClaimSubmit(event) {
  event.preventDefault();
  console.log('🎯 Claim form submitted!'); // Debug log
  
  const espID = document.getElementById('espID').value.trim();
  const alertBox = document.getElementById('claimAlertBox');
  const claimBtn = document.getElementById('claimBtn');
  const loadingSpinner = document.getElementById('claimLoadingSpinner');
  const deviceInfo = document.getElementById('claimDeviceInfo');

  // Validate ESP-ID format
  if (!espID.startsWith('AVONIC-') || espID.length < 17) {
    showClaimAlert('Please enter a valid ESP-ID (format: AVONIC-XXXXXXXXXXXX)', 'error');
    return;
  }

  // Hide previous alerts
  alertBox.style.display = 'none';
  deviceInfo.style.display = 'none';

  // Show loading
  claimBtn.disabled = true;
  loadingSpinner.style.display = 'block';

  try {
    const token = localStorage.getItem('avonic_token');
    const API_BASE = "https://avonic-main-hub-production.up.railway.app";
    
    const response = await fetch(`${API_BASE}/api/devices/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ espID })
    });

    const data = await response.json();
    loadingSpinner.style.display = 'none';

    if (response.ok) {
      // Show success
      document.getElementById('claimedESPID').textContent = data.device.espID;
      document.getElementById('claimedNickname').textContent = data.device.nickname || 'My Compost Bin';
      deviceInfo.style.display = 'block';

      console.log('✅ Device claimed:', data.device);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.navigateTo('/dashboard');
      }, 2000);

    } else {
      showClaimAlert(data.error || 'Failed to claim device', 'error');
      claimBtn.disabled = false;
    }

  } catch (error) {
    console.error('❌ Claim error:', error);
    loadingSpinner.style.display = 'none';
    showClaimAlert('Network error. Please check your connection.', 'error');
    claimBtn.disabled = false;
  }
}

function showClaimAlert(message, type) {
  const alertBox = document.getElementById('claimAlertBox');
  if (alertBox) {
    alertBox.textContent = message;
    alertBox.className = `alert ${type}`;
    alertBox.style.display = 'block';
  }
}

// ====== ATTACH EVENT LISTENER USING DELEGATION ======
// This works because document.body is always present
document.body.addEventListener('submit', function(e) {
  if (e.target.id === 'claimForm') {
    console.log('📋 Claim form detected via delegation');
    handleClaimSubmit(e);
  }
});

console.log('✅ Claim device functionality loaded');

    // Handle empty state
    if (devices.length === 0) {
      quickInsightsContainer.innerHTML = `
        <div class="empty-state">
          <h3>No Devices Claimed</h3>
          <p>Claim your first device to start monitoring your compost bins!</p>
          <button onclick="router.navigateTo('/claim-device')" class="btn-primary">
            ➕ Claim Device
          </button>
        </div>
      `;
      binFluctuationsSection.style.display = 'none';
      return;
    }

    // Render Quick Insights for all devices
    devices.forEach(device => {
      const espID = device.espID;
      const nickname = device.nickname || 'Unclaimed Device';

      // Create two bin cards per device
      quickInsightsContainer.innerHTML += `
        <qinsights-bin
          ic_name="${nickname} - Bin 1"
          ic_status="Stable"
          ic_moremsg=""
          is_clickable="true"
          data-device-id="${espID}"
          data-bin="1">
        </qinsights-bin>

        <qinsights-bin
          ic_name="${nickname} - Bin 2"
          ic_status="Stable"
          ic_moremsg=""
          is_clickable="true"
          data-device-id="${espID}"
          data-bin="2">
        </qinsights-bin>
      `;
    });

    // Render Bin Fluctuations section for the first device (default view)
    if (devices.length > 0) {
      renderBinFluctuations(devices[0], devices);
    }

  } catch (error) {
    console.error('❌ Dashboard load error:', error);
    showNotification('Failed to load devices', 'error');
  }
}

// Render the bin fluctuations section for a specific device
function renderBinFluctuations(device, allDevices) {
  const binFluctuationsSection = document.querySelector('.bin-fluctuations');
  const espID = device.espID;
  const nickname = device.nickname || 'Unclaimed Device';

  binFluctuationsSection.innerHTML = `
    <div class="bin-fluctuations-nav">
      <div class="device-selection">
        <label for="device-select">Device:</label>
        <select id="device-select" class="device-selector">
          ${allDevices.map(d => `
            <option value="${d.espID}" ${d.espID === espID ? 'selected' : ''}>
              ${d.nickname || d.espID}
            </option>
          `).join('')}
        </select>
      </div>

      <div class="bin-selection">
        <img class="arrow left" src="img/indicators/Arrow.svg" alt="">
        <div class="bin" id="current-bin">Bin 1</div>
        <img class="arrow right" src="img/indicators/Arrow.svg" alt="">
      </div>

      <div class="bf-content">
        <div class="title">Bin Fluctuation</div>
        <div class="fluctuationDisplayDate">
          <p>July 12, 2025 - July 21, 2025</p>
        </div>
      </div>

      <div class="select-date">
        <img src="img/calendarIcon.svg" alt="" class="calendar-icon">
        <p class="selection">Select Date</p>
      </div>
    </div>

    <section-sensor-fluctuation
      sensor_name="Soil Moisture"
      sensor_unit="%"
      sensor_icon="SoilMoistureIcon"
      data-device-id="${espID}"
      data-bin="1">
    </section-sensor-fluctuation>
    <hr>
    
    <section-sensor-fluctuation
      sensor_name="Temperature"
      sensor_unit="°C"
      sensor_icon="TempIcon"
      data-device-id="${espID}"
      data-bin="1">
    </section-sensor-fluctuation>
    <hr>
    
    <section-sensor-fluctuation
      sensor_name="Humidity"
      sensor_unit="%"
      sensor_icon="HumidityIcon"
      data-device-id="${espID}"
      data-bin="1">
    </section-sensor-fluctuation>
    <hr>
    
    <section-sensor-fluctuation
      sensor_name="Gas Levels"
      sensor_unit="ppm"
      sensor_icon="GasIcon"
      data-device-id="${espID}"
      data-bin="1">
    </section-sensor-fluctuation>
    <hr>
    
    <section-sensor-fluctuation
      sensor_name="DS18B20 Temp"
      sensor_unit="°C"
      sensor_icon="TempIcon"
      data-device-id="${espID}"
      data-bin="1">
    </section-sensor-fluctuation>
  `;

  // Add event listener for device selector
  const deviceSelect = document.getElementById('device-select');
  if (deviceSelect) {
    deviceSelect.addEventListener('change', (e) => {
      const selectedDevice = allDevices.find(d => d.espID === e.target.value);
      if (selectedDevice) {
        renderBinFluctuations(selectedDevice, allDevices);
      }
    });
  }

  // Add bin switching logic
  let currentBin = 1;
  const binDisplay = document.getElementById('current-bin');
  const leftArrow = binFluctuationsSection.querySelector('.arrow.left');
  const rightArrow = binFluctuationsSection.querySelector('.arrow.right');

  leftArrow.addEventListener('click', () => {
    if (currentBin > 1) {
      currentBin--;
      binDisplay.textContent = `Bin ${currentBin}`;
      updateSensorBin(currentBin);
    }
  });

  rightArrow.addEventListener('click', () => {
    if (currentBin < 2) {
      currentBin++;
      binDisplay.textContent = `Bin ${currentBin}`;
      updateSensorBin(currentBin);
    }
  });
}

// Update all sensor sections to show data for the selected bin
function updateSensorBin(binNumber) {
  const sensorSections = document.querySelectorAll('section-sensor-fluctuation');
  sensorSections.forEach(section => {
    section.setAttribute('data-bin', binNumber);
    // Trigger data reload here if needed
  });
}

// ====== ROUTER SETUP ======
// Add this to your router initialization or where routes are defined

// Listen for route changes
window.addEventListener('hashchange', () => {
  const hash = window.location.hash;
  if (hash === '#/dashboard' || hash === '') {
    setTimeout(() => loadDashboard(), 100);
  }
});

// Initial load
if (window.location.hash === '#/dashboard' || window.location.hash === '') {
  setTimeout(() => loadDashboard(), 100);
}


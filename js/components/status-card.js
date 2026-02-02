// ========================================
// 📊 STATUS CARD COMPONENT (with Modal Integration)
// ========================================

class Statuscard extends HTMLElement {
  connectedCallback() {
    // Get Attributes
    const dataType = this.getAttribute("dataType");
    const dataUnit = this.getAttribute("dataUnit");
    const dataLabel = this.getAttribute("dataLabel");
    const subDataLabel = this.getAttribute("subDataLabel");
    const icon = this.getAttribute("icon");
    const isClickable = this.getAttribute("isClickable") === "true";
    const showWaterPressure = this.getAttribute("showWaterPressure") === "true";
    const showFanRPM = this.getAttribute("showFanRPM") === "true";
    const binId = this.getAttribute("data-bin-id");

    // Render Dashboard Mini-Card
    this.innerHTML = `
      <div class="card_stats ${isClickable ? "clickable" : ""}" 
           data-max="100" 
           data-unit="${dataUnit}" 
           data-type="${dataType}"
           data-bin-id="${binId}">
        
        <div class="status_label">${dataLabel}</div>
        <div class="sub_status_label">${subDataLabel}</div>
        
        <div class="percentage">
          <span class="card_value">--</span>
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
            <div class="circle-icon"><img src="${icon}" alt=""></div>
          </div>
        </div>
      </div>
    `;

    // Click Handler
    if (isClickable) {
      const cardElement = this.querySelector(".card_stats");
      cardElement.addEventListener("click", () => {
        
        // 1. Get Values
        let currentVal = parseFloat(cardElement.querySelector(".card_value").innerText);
        if (isNaN(currentVal)) currentVal = 0;
        
        // 2. Determine Sensor Key
        let sensorKey = 'temperature'; 
        if (dataLabel.includes('Moisture')) sensorKey = 'soilMoisture';
        else if (dataLabel.includes('Humidity')) sensorKey = 'humidity';
        else if (dataLabel.includes('Gas')) sensorKey = 'gasLevels';

        // 3. Evaluate Status
        const evaluation = evaluateCondition(sensorKey, currentVal);
        
        // 4. Check Global Manual Mode State
        const isManual = (typeof isManualMode !== 'undefined') ? isManualMode : false;

        // 5. Build Manual Controls (ONLY IF MANUAL MODE IS ON)
        let manualHTML = '';
        
        if (isManual && (showWaterPressure || showFanRPM)) {
            manualHTML = `
            <div class="custom-manual-box">
                <span class="manual-title">Manual Actions</span>
                ${showWaterPressure ? `
                <div class="manual-row">
                    <div class="manual-item-left">
                        <img src="img/icons/water.svg" alt="Water" style="width: 24px; height: 24px;">
                        <span>Water Pump</span>
                    </div>
                    <div class="custom-toggle" onclick="this.classList.toggle('active'); controlDeviceFromModal(${binId}, 'pump', this.classList.contains('active'))"></div>
                </div>` : ''}
                
                ${showFanRPM ? `
                <div class="manual-row">
                    <div class="manual-item-left">
                        <img src="img/icons/fan.svg" alt="Fan" style="width: 24px; height: 24px;">
                        <span>Fan RPM</span>
                    </div>
                    <div class="custom-toggle" onclick="this.classList.toggle('active'); controlDeviceFromModal(${binId}, 'fan', this.classList.contains('active'))"></div>
                </div>` : ''}
            </div>`;
        }

        // 6. Open Modal
        const modal = openModal({
          cleanMode: true, 
          title: "", 
          defaultContent: `
            <div class="custom-modal-wrapper">
                <div class="custom-card-inner">
                    <div class="custom-header-row">
                        <h1 class="custom-header-title">${dataLabel}</h1>
                        <div class="custom-close-btn modalCancel">
                             <img src="img/cliparts/closeIcon.svg" style="width:14px;" onerror="this.src='img/icons/navIcons/closeIcon.svg'">
                        </div>
                    </div>

                    <div class="custom-reading-box">
                        <div class="reading-top-row">
                            <span class="reading-label">Current Reading</span>
                            <img src="img/cliparts/refresh_icon.svg" class="custom-refresh-btn" id="modalRefreshBtn" style="width:20px;" onerror="this.src='img/icons/refresh_icon.svg'">
                        </div>

                        <div class="data-display-row">
                            <div class="data-left-col">
                                <div class="big-value-text">
                                    <span id="modalVal">${currentVal}</span>
                                    <span class="unit-text">${dataUnit}</span>
                                </div>
                                <div class="status-badge">
                                    <div id="modalDot" class="status-dot ${evaluation.statusClass}"></div>
                                    <span id="modalStatus">${evaluation.status}</span>
                                </div>
                            </div>
                            <img id="modalWorm" class="worm-img-display" 
                                 src="img/worm-conditions/${evaluation.wormImage}" 
                                 alt="Worm Status"
                                 onerror="this.style.display='none'">
                        </div>
                    </div>

                    ${manualHTML}
                </div>
            </div>
          `,
          syncValues: {
            valueElem: this.querySelector(".card_value"),
            unitElem: this.querySelector(".card_unit"),
          },
          card: cardElement,
          binId: binId
        });

        // 7. Attach Events
        const closeBtn = modal.querySelector('.modalCancel');
        if(closeBtn) closeBtn.addEventListener('click', () => modal.remove());

        // Refresh Simulation
        const refreshBtn = modal.querySelector('#modalRefreshBtn');
        if(refreshBtn) {
            let rot = 0;
            refreshBtn.addEventListener('click', () => {
                rot += 360;
                refreshBtn.style.transform = `rotate(${rot}deg)`;

                // Generate Random Value
                const config = SENSOR_CONFIGS[sensorKey] || { minValue: 0, maxValue: 100 };
                const min = config.minValue - 5; 
                const max = config.maxValue + 5;
                const randomValue = (Math.random() * (max - min) + min).toFixed(1);
                const newVal = parseFloat(randomValue);

                // Re-Evaluate
                const newEval = evaluateCondition(sensorKey, newVal);

                // Update DOM
                const valEl = modal.querySelector('#modalVal');
                const statusEl = modal.querySelector('#modalStatus');
                const dotEl = modal.querySelector('#modalDot');
                const wormEl = modal.querySelector('#modalWorm');

                if(valEl) valEl.textContent = newVal;
                if(statusEl) statusEl.textContent = newEval.status;
                if(dotEl) dotEl.className = `status-dot ${newEval.statusClass}`;
                if(wormEl) {
                    wormEl.src = `img/worm-conditions/${newEval.wormImage}`;
                    wormEl.style.display = 'block';
                }

                console.log(`🔄 Simulated ${sensorKey}: ${newVal}${dataUnit} -> ${newEval.status}`);
            });
        }
      });
    }
  }
}

customElements.define("status-card", Statuscard);

console.log('✅ Status Card component loaded');
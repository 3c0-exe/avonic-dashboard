document.addEventListener("DOMContentLoaded", () => {
  const scrollBackWidget = document.querySelector(".scroll-back-widget");
  if (!scrollBackWidget) return;

  // Try to pick one of the scrollable containers if it exists
  const scrollContainer = 
    document.querySelector(".content.help") || 
    document.querySelector(".content.dashboard");

  // If no special container, fall back to window
  const target =
    scrollContainer && scrollContainer.scrollHeight > scrollContainer.clientHeight
      ? scrollContainer
      : window;

  // listen to scroll
  target.addEventListener("scroll", () => {
    const scrollPos = target === window ? window.scrollY : target.scrollTop;
    if (scrollPos > 300) {
      scrollBackWidget.classList.add("show");
      scrollBackWidget.classList.remove("hide");
    } else {
      scrollBackWidget.classList.add("hide");
      scrollBackWidget.classList.remove("show");
    }
  });

  // smooth scroll back
  scrollBackWidget.addEventListener("click", () => {
    if (target === window) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      target.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
});






document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("page-header");
  const sections = document.querySelectorAll(".section");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains("get-to-know")) {
          header.style.color = "white";
        } else if (entry.target.classList.contains("user-manual")) {
          header.style.color = "black";
        } else if (entry.target.classList.contains("troubleshoot")) {
          header.style.color = "white";
        }
        console.log("Changed header color for section:", entry.target.className);
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(section => observer.observe(section));
});

// ===== 1. BACK BUTTON (goes to home) =====
document.addEventListener('click', (e) => {
    if (e.target.closest('.back_btn')) {
        window.location.hash = '#/';
    }
});

// ===== 2. DASHBOARD BIN SWITCHER (LEFT/RIGHT ARROWS) =====
let currentDashboardBin = 1;

document.addEventListener('click', async (e) => {
    const arrow = e.target.closest('.arrow');
    if (!arrow) return;
    
    const binDisplay = document.querySelector('.bin-selection .bin');
    if (!binDisplay) return;
    
    if (arrow.classList.contains('left')) {
        currentDashboardBin = currentDashboardBin > 1 ? currentDashboardBin - 1 : 2;
    } else if (arrow.classList.contains('right')) {
        currentDashboardBin = currentDashboardBin < 2 ? currentDashboardBin + 1 : 1;
    }
    
    binDisplay.textContent = `Bin ${currentDashboardBin}`;
    console.log('📊 Switched to Bin', currentDashboardBin);
    
    // ✅ UPDATE: Reload charts with new bin data
    await reloadChartsForBin(currentDashboardBin);
});

// ✅ NEW FUNCTION: Reload all charts for specific bin
async function reloadChartsForBin(binNumber) {
    console.log(`🔄 Reloading charts for Bin ${binNumber}...`);
    
    // Get the device ID from first chart section
    const firstSection = document.querySelector('section-sensor-fluctuation');
    if (!firstSection) {
        console.warn('⚠️ No chart sections found');
        return;
    }
    
    const deviceId = firstSection.getAttribute('data-device-id');
    if (!deviceId) {
        console.warn('⚠️ No device ID found');
        return;
    }
    
    // Find all chart sections and update them
    const chartSections = document.querySelectorAll('section-sensor-fluctuation');
    
    for (const section of chartSections) {
        const sensorName = section.getAttribute('sensor_name');
        const canvas = section.querySelector('canvas');
        
        if (canvas && sensorName) {
            // Update the bin attribute
            section.setAttribute('data-bin', binNumber);
            
            // Reload the chart if updateChart function exists
            if (typeof updateChart === 'function') {
                await updateChart(canvas, deviceId, binNumber, sensorName);
            }
        }
    }
    
    console.log(`✅ Charts reloaded for Bin ${binNumber}`);
}

// ✅ EXPORT: Make current bin accessible globally
window.getCurrentDashboardBin = () => currentDashboardBin;

// ===== 3. CALENDAR DATE PICKER (Select Date button) =====
document.addEventListener('click', (e) => {
    if (e.target.closest('.select-date')) {
        console.log('📅 Opening date picker...');
        
        const modal = document.createElement('div');
        modal.classList.add('status_modal');
        modal.innerHTML = `
            <div class="modal">
                <div class="modalHeader">
                    <div class="sensorName">
                        <h1>Select Date Range</h1>
                    </div>
                    <div class="close_btn">
                        <img src="/img/icons/navIcons/closeIcon.svg" alt="">
                    </div>
                </div>
                <div class="modalCard">
                    <div class="date-picker-content" style="padding: 20px;">
                        <label style="font-weight: 600;">Start Date:</label>
                        <input type="date" id="startDate" value="2025-07-12" 
                               style="width: 100%; padding: 10px; margin: 10px 0; border: 2px solid #000; border-radius: 8px;">
                        
                        <label style="font-weight: 600; margin-top: 15px; display: block;">End Date:</label>
                        <input type="date" id="endDate" value="2025-07-21"
                               style="width: 100%; padding: 10px; margin: 10px 0; border: 2px solid #000; border-radius: 8px;">
                        
                        <div style="display: flex; gap: 10px; margin-top: 20px;">
                            <div class="btn modalConfirm">Apply</div>
                            <div class="btn modalCancel">Cancel</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close button
        modal.querySelector('.close_btn').addEventListener('click', () => modal.remove());
        
        // Cancel button
        const cancelBtn = modal.querySelector('.modalCancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => modal.remove());
        }
        
        // Apply button
        modal.querySelector('.modalConfirm').addEventListener('click', () => {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            
            if (startDate && endDate) {
                const start = new Date(startDate).toLocaleDateString('en-US', { 
                    month: 'long', day: 'numeric', year: 'numeric' 
                });
                const end = new Date(endDate).toLocaleDateString('en-US', { 
                    month: 'long', day: 'numeric', year: 'numeric' 
                });
                
                const displayElem = document.querySelector('.fluctuationDisplayDate p');
                if (displayElem) {
                    displayElem.textContent = `${start} - ${end}`;
                }
                
                console.log(`📅 Date range: ${startDate} to ${endDate}`);
            }
            
            modal.remove();
        });
    }
});

// ===== 4. HELP PAGE "GET STARTED" BUTTONS =====
document.addEventListener('click', (e) => {
    const clickedBtn = e.target.closest('.section .btn');
    if (!clickedBtn) return;
    
    const section = clickedBtn.closest('.section');
    if (!section) return;
    
    let title = 'Help Guide';
    let content = '<p>Content coming soon...</p>';
    
    if (section.classList.contains('get-to-know')) {
        title = 'Get to Know AVONIC';
        content = `
            <div style="padding: 20px; line-height: 1.6;">
                <h2 style="margin-bottom: 15px;">About AVONIC Vermicompost System</h2>
                <p>AVONIC is an automated vermicomposting system designed to optimize the composting process using IoT technology.</p>
                
                <h3 style="margin-top: 20px; margin-bottom: 10px;">Key Features:</h3>
                <ul style="margin-left: 20px;">
                    <li><strong>Dual Bin System:</strong> Two independent composting chambers</li>
                    <li><strong>Real-time Monitoring:</strong> Track temperature, humidity, soil moisture, and gas levels</li>
                    <li><strong>Automated Control:</strong> Smart fan and pump management</li>
                    <li><strong>Remote Access:</strong> Monitor and control from anywhere</li>
                </ul>
                
                <h3 style="margin-top: 20px; margin-bottom: 10px;">How It Works:</h3>
                <p>Sensors continuously monitor environmental conditions inside each bin. The system automatically adjusts water levels and ventilation to maintain optimal composting conditions for earthworms.</p>
            </div>
        `;
    } else if (section.classList.contains('user-manual')) {
        title = 'User Manual';
        content = `
            <div style="padding: 20px; line-height: 1.6;">
                <h2 style="margin-bottom: 15px;">How to Use AVONIC</h2>
                
                <h3 style="margin-top: 20px; margin-bottom: 10px;">Getting Started:</h3>
                <ol style="margin-left: 20px;">
                    <li><strong>Home Page:</strong> View overall system status and select a bin to monitor</li>
                    <li><strong>Bin Monitoring:</strong> See real-time sensor readings and control modes</li>
                    <li><strong>Dashboard:</strong> Analyze historical data and trends</li>
                </ol>
                
                <h3 style="margin-top: 20px; margin-bottom: 10px;">Switching Modes:</h3>
                <p><strong>Auto Mode:</strong> System controls fans and pumps automatically</p>
                <p><strong>Manual Mode:</strong> You control water pressure and fan speed using sliders</p>
                
                <h3 style="margin-top: 20px; margin-bottom: 10px;">Reading the Sensors:</h3>
                <ul style="margin-left: 20px;">
                    <li><strong>Soil Moisture:</strong> Optimal range 60-80%</li>
                    <li><strong>Temperature:</strong> Best at 20-25°C</li>
                    <li><strong>Humidity:</strong> Keep between 70-90%</li>
                    <li><strong>Gas Levels:</strong> Monitor for proper ventilation</li>
                </ul>
            </div>
        `;
    } else if (section.classList.contains('troubleshoot')) {
        title = 'Troubleshooting';
        content = `
            <div style="padding: 20px; line-height: 1.6;">
                <h2 style="margin-bottom: 15px;">Common Issues & Solutions</h2>
                
                <h3 style="margin-top: 20px; margin-bottom: 10px;">Sensors showing "--"</h3>
                <p><strong>Problem:</strong> No data from sensors</p>
                <p><strong>Solutions:</strong></p>
                <ul style="margin-left: 20px;">
                    <li>Check if ESP32 is connected to power</li>
                    <li>Verify WiFi connection</li>
                    <li>Click the refresh button</li>
                    <li>Check sensor wiring</li>
                </ul>
                
                <h3 style="margin-top: 20px; margin-bottom: 10px;">Temperature Too High</h3>
                <p><strong>Problem:</strong> Bin temperature exceeds 30°C</p>
                <p><strong>Solutions:</strong></p>
                <ul style="margin-left: 20px;">
                    <li>Switch to Manual Mode and increase fan speed</li>
                    <li>Add water to cool down the compost</li>
                    <li>Reduce organic matter input</li>
                </ul>
                
                <h3 style="margin-top: 20px; margin-bottom: 10px;">Low Moisture</h3>
                <p><strong>Problem:</strong> Soil moisture below 50%</p>
                <p><strong>Solutions:</strong></p>
                <ul style="margin-left: 20px;">
                    <li>Activate water pump (Auto mode does this automatically)</li>
                    <li>Check water tank level on Home page</li>
                    <li>Manually add water if tank is empty</li>
                </ul>
            </div>
        `;
    }
    
    // Create modal using openModal function from main_components.js
    if (typeof openModal === 'function') {
        openModal({
            title: title,
            defaultContent: content,
            helpContent: '', // No nested help for help modals
            syncValues: {},
            card: null
        });
    }
});

console.log('✅ other_widgets.js loaded with all handlers');
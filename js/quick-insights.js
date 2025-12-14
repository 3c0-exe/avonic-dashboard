// ========================================
// QUICK INSIGHTS MODULE
// Save as: js/quick-insights.js
// Link in app.html BEFORE dashboard-module.js
// ========================================

(function() {
    'use strict';

    // ========================================
    // 📊 SENSOR CONFIGURATIONS
    // ========================================

    const QI_SENSOR_CONFIGS = {
        temperature: {
            unit: '°C',
            label: 'Temperature',
            icon: 'img/icons/sensorIcons/TempIcon.svg'
        },
        soilMoisture: {
            unit: '%',
            label: 'Soil Moisture',
            icon: 'img/icons/sensorIcons/SoilMoistureIcon.svg'
        },
        humidity: {
            unit: '%',
            label: 'Humidity',
            icon: 'img/icons/sensorIcons/HumidityIcon.svg'
        },
        gasLevels: {
            unit: 'ppm',
            label: 'Gas Levels',
            icon: 'img/icons/sensorIcons/GasIcon.svg'
        }
    };

    // ========================================
    // 🗄️ DUMMY DATA (Fallback only)
    // ========================================
    
    const DUMMY_READINGS = {
        '1': { // Bin 1
            temperature: [
                { time: '10:00 AM', value: 31.2, status: 'Normal', timestamp: new Date() },
                { time: '10:10 AM', value: 35.8, status: 'High', timestamp: new Date() },
                { time: '10:20 AM', value: 28.5, status: 'Normal', timestamp: new Date() },
                { time: '10:30 AM', value: 32.1, status: 'Normal', timestamp: new Date() },
                { time: '10:40 AM', value: 29.7, status: 'Normal', timestamp: new Date() },
                { time: '10:50 AM', value: 33.4, status: 'Normal', timestamp: new Date() },
                { time: '11:00 AM', value: 36.2, status: 'High', timestamp: new Date() },
                { time: '11:10 AM', value: 31.8, status: 'Normal', timestamp: new Date() }
            ],
            soilMoisture: [
                { time: '10:00 AM', value: 75, status: 'Normal', timestamp: new Date() },
                { time: '10:10 AM', value: 82, status: 'High', timestamp: new Date() },
                { time: '10:20 AM', value: 68, status: 'Normal', timestamp: new Date() },
                { time: '10:30 AM', value: 71, status: 'Normal', timestamp: new Date() },
                { time: '10:40 AM', value: 79, status: 'Normal', timestamp: new Date() },
                { time: '10:50 AM', value: 65, status: 'Normal', timestamp: new Date() },
                { time: '11:00 AM', value: 88, status: 'High', timestamp: new Date() },
                { time: '11:10 AM', value: 73, status: 'Normal', timestamp: new Date() }
            ],
            humidity: [
                { time: '10:00 AM', value: 72, status: 'Normal', timestamp: new Date() },
                { time: '10:10 AM', value: 85, status: 'High', timestamp: new Date() },
                { time: '10:20 AM', value: 68, status: 'Normal', timestamp: new Date() },
                { time: '10:30 AM', value: 74, status: 'Normal', timestamp: new Date() },
                { time: '10:40 AM', value: 70, status: 'Normal', timestamp: new Date() },
                { time: '10:50 AM', value: 77, status: 'Normal', timestamp: new Date() },
                { time: '11:00 AM', value: 89, status: 'High', timestamp: new Date() },
                { time: '11:10 AM', value: 71, status: 'Normal', timestamp: new Date() }
            ],
            gasLevels: [
                { time: '10:00 AM', value: 45, status: 'Normal', timestamp: new Date() },
                { time: '10:10 AM', value: 120, status: 'High', timestamp: new Date() },
                { time: '10:20 AM', value: 38, status: 'Normal', timestamp: new Date() },
                { time: '10:30 AM', value: 52, status: 'Normal', timestamp: new Date() },
                { time: '10:40 AM', value: 47, status: 'Normal', timestamp: new Date() },
                { time: '10:50 AM', value: 61, status: 'Normal', timestamp: new Date() },
                { time: '11:00 AM', value: 135, status: 'High', timestamp: new Date() },
                { time: '11:10 AM', value: 49, status: 'Normal', timestamp: new Date() }
            ]
        },
        '2': { // Bin 2
            temperature: [
                { time: '10:00 AM', value: 28.5, status: 'Normal', timestamp: new Date() },
                { time: '10:10 AM', value: 32.1, status: 'Normal', timestamp: new Date() },
                { time: '10:20 AM', value: 29.8, status: 'Normal', timestamp: new Date() },
                { time: '10:30 AM', value: 31.4, status: 'Normal', timestamp: new Date() },
                { time: '10:40 AM', value: 27.9, status: 'Normal', timestamp: new Date() },
                { time: '10:50 AM', value: 30.2, status: 'Normal', timestamp: new Date() },
                { time: '11:00 AM', value: 33.7, status: 'Normal', timestamp: new Date() },
                { time: '11:10 AM', value: 29.1, status: 'Normal', timestamp: new Date() }
            ],
            soilMoisture: [
                { time: '10:00 AM', value: 70, status: 'Normal', timestamp: new Date() },
                { time: '10:10 AM', value: 76, status: 'Normal', timestamp: new Date() },
                { time: '10:20 AM', value: 68, status: 'Normal', timestamp: new Date() },
                { time: '10:30 AM', value: 72, status: 'Normal', timestamp: new Date() },
                { time: '10:40 AM', value: 74, status: 'Normal', timestamp: new Date() },
                { time: '10:50 AM', value: 69, status: 'Normal', timestamp: new Date() },
                { time: '11:00 AM', value: 77, status: 'Normal', timestamp: new Date() },
                { time: '11:10 AM', value: 71, status: 'Normal', timestamp: new Date() }
            ],
            humidity: [
                { time: '10:00 AM', value: 68, status: 'Normal', timestamp: new Date() },
                { time: '10:10 AM', value: 73, status: 'Normal', timestamp: new Date() },
                { time: '10:20 AM', value: 66, status: 'Normal', timestamp: new Date() },
                { time: '10:30 AM', value: 71, status: 'Normal', timestamp: new Date() },
                { time: '10:40 AM', value: 69, status: 'Normal', timestamp: new Date() },
                { time: '10:50 AM', value: 74, status: 'Normal', timestamp: new Date() },
                { time: '11:00 AM', value: 72, status: 'Normal', timestamp: new Date() },
                { time: '11:10 AM', value: 70, status: 'Normal', timestamp: new Date() }
            ],
            gasLevels: [
                { time: '10:00 AM', value: 42, status: 'Normal', timestamp: new Date() },
                { time: '10:10 AM', value: 55, status: 'Normal', timestamp: new Date() },
                { time: '10:20 AM', value: 38, status: 'Normal', timestamp: new Date() },
                { time: '10:30 AM', value: 47, status: 'Normal', timestamp: new Date() },
                { time: '10:40 AM', value: 51, status: 'Normal', timestamp: new Date() },
                { time: '10:50 AM', value: 44, status: 'Normal', timestamp: new Date() },
                { time: '11:00 AM', value: 59, status: 'Normal', timestamp: new Date() },
                { time: '11:10 AM', value: 46, status: 'Normal', timestamp: new Date() }
            ]
        }
    };

    // ========================================
    // 🎯 STATE MANAGEMENT
    // ========================================

    let currentBin = '1';
    let currentSensor = 'soilMoisture';

    // ========================================
    // 📅 UPDATE DATE/TIME DISPLAY
    // ========================================

    function updateDateTime() {
        const now = new Date();
        const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        const dateStr = now.toLocaleDateString('en-US', dateOptions);
        
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const timeStr = `${displayHours}:${minutes.toString().padStart(2, '0')}${ampm}`;
        
        const dateEl = document.getElementById('qi-current-date');
        const timeEl = document.getElementById('qi-last-updated');
        
        if (dateEl) dateEl.textContent = dateStr;
        if (timeEl) timeEl.textContent = timeStr;
    }

    // ========================================
    // 📊 FETCH AND UPDATE DATA FROM API
    // ========================================

// ========================================
    // 📊 FETCH AND UPDATE DATA FROM API
    // ========================================

    async function updateFluctuationsWithRealData() {
        const tableBody = document.getElementById('qi-table-body');
        const minEl = document.getElementById('qi-min-value');
        const avgEl = document.getElementById('qi-avg-value');
        const maxEl = document.getElementById('qi-max-value');
        const insightEl = document.getElementById('qi-insight-text');
        
        const config = QI_SENSOR_CONFIGS[currentSensor];
        
        // Show loading state initially
        if(tableBody) tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px;">⏳ Loading...</td></tr>';
        if(insightEl) insightEl.textContent = 'Fetching latest data...';

        try {
            const token = localStorage.getItem('avonic_token');
            if (!token) throw new Error("Not logged in");

            // 1. ✅ FIX: Get the real ID from URL or Storage
            const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
            let espID = urlParams.get('espID');

            if (!espID) {
                espID = localStorage.getItem('selected_espID');
            }

            // 🛑 KILL SWITCH: If the old placeholder is stuck in storage, clear it.
            if (espID === 'AVONIC-X12XXXXXXXXX') {
                console.warn('⚠️ Placeholder ID detected. Clearing...');
                espID = null;
                localStorage.removeItem('selected_espID');
            }

            // 2. If no ID found, fetch list from API
            if (!espID) {
                const devRes = await fetch('https://avonic-main-hub-production.up.railway.app/api/devices/claimed', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const devData = await devRes.json();
                
                if (devData.devices && devData.devices.length > 0) {
                    espID = devData.devices[0].espID;
                    localStorage.setItem('selected_espID', espID);
                } else {
                    throw new Error("No devices found");
                }
            }

            // 3. Fetch Real Data
            const response = await fetch(
                `https://avonic-main-hub-production.up.railway.app/api/devices/${espID}/valid-readings?limit=50`, 
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            
            const result = await response.json();
            const readings = result.readings || [];

            console.log(`📊 Fetched ${readings.length} VALID readings for ${espID}`);
            
            // ⚠️ TRIGGER FALLBACK if no data exists
            if (readings.length === 0) {
                throw new Error("No valid sensor readings found.");
            }

            // --- REAL DATA RENDERING ---
            let dbKey = '';
            switch(currentSensor) {
                case 'temperature':  dbKey = 'temp'; break;
                case 'soilMoisture': dbKey = 'soil'; break;
                case 'humidity':     dbKey = 'humidity'; break;
                case 'gasLevels':    dbKey = 'gas'; break;
                default:             dbKey = 'soil';
            }

            const validValues = [];
            const rowsHTML = readings.map(reading => {
                const binData = currentBin === '1' ? reading.bin1 : reading.bin2;
                if (!binData || binData[dbKey] === undefined || binData[dbKey] === null) return null;

                const val = parseFloat(binData[dbKey]);
                if (isNaN(val)) return null;
                
                validValues.push(val);

                const date = new Date(reading.timestamp);
                const now = new Date();
                const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
                const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                const dateStr = daysDiff > 1 ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

                let status = 'Normal';
                let statusClass = '';
                
                // (Status Logic remains the same as your original)
                if (currentSensor === 'temperature') {
                    if (val < 15 || val > 35) { status = 'Critical'; statusClass = 'status-high'; } 
                    else if (val < 20 || val > 30) { status = 'Warning'; statusClass = 'status-low'; }
                } else if (currentSensor === 'soilMoisture') {
                    if (val < 40) { status = 'Dry'; statusClass = 'status-low'; } 
                    else if (val > 80) { status = 'Wet'; statusClass = 'status-high'; }
                } else if (currentSensor === 'humidity') {
                    if (val < 30) { status = 'Low'; statusClass = 'status-low'; } 
                    else if (val > 80) { status = 'High'; statusClass = 'status-high'; }
                } else if (currentSensor === 'gasLevels') {
                    if (val > 200) { status = 'Critical'; statusClass = 'status-high'; } 
                    else if (val > 100) { status = 'High'; statusClass = 'status-high'; }
                }

                return `<tr class="${statusClass}"><td>${dateStr ? `${dateStr} ` : ''}${timeStr}</td><td>${val.toFixed(1)}${config.unit}</td><td>${status}</td></tr>`;
            }).filter(row => row !== null).join('');

            if (validValues.length === 0) throw new Error(`No ${config.label} data found for Bin ${currentBin}`);

            if(tableBody) tableBody.innerHTML = rowsHTML;

            const min = Math.min(...validValues).toFixed(1);
            const max = Math.max(...validValues).toFixed(1);
            const avg = (validValues.reduce((a, b) => a + b, 0) / validValues.length).toFixed(1);

            if(minEl) minEl.textContent = min;
            if(maxEl) maxEl.textContent = max;
            if(avgEl) avgEl.textContent = avg;
            
            document.getElementById('qi-min-unit').textContent = config.unit;
            document.getElementById('qi-avg-unit').textContent = config.unit;
            document.getElementById('qi-max-unit').textContent = config.unit;

            if(insightEl) {
                insightEl.textContent = generateRealInsight(validValues, currentSensor) + ' ✅ Recent Data';
                insightEl.style.color = '#4CAF50';
            }

        } catch (error) {
            // ========================================
            // 📦 FALLBACK: DEMO MODE (Keeps UI Intact)
            // ========================================
            console.error("❌ Fetch Error:", error.message);
            console.log('📦 Using demo data as fallback to keep UI intact...');
            
            const dummyReadings = DUMMY_READINGS[currentBin][currentSensor];
            const validValues = dummyReadings.map(r => r.value);
            
            const rowsHTML = dummyReadings.map(reading => {
               // ✅ Preserving your original styling logic here
               let statusClass = '';
               if (reading.status === 'High' || reading.status === 'Critical') {
                   statusClass = 'status-high';
               } else if (reading.status === 'Low' || reading.status === 'Dry') {
                   statusClass = 'status-low';
               }
               
               return `
                   <tr class="${statusClass}">
                       <td>${reading.time}</td>
                       <td>${reading.value}${config.unit}</td>
                       <td>${reading.status}</td>
                   </tr>
               `;
            }).join('');
            
            if(tableBody) tableBody.innerHTML = rowsHTML;
            
            const min = Math.min(...validValues).toFixed(1);
            const max = Math.max(...validValues).toFixed(1);
            const avg = (validValues.reduce((a, b) => a + b, 0) / validValues.length).toFixed(1);
            
            if(minEl) minEl.textContent = min;
            if(maxEl) maxEl.textContent = max;
            if(avgEl) avgEl.textContent = avg;
            
            document.getElementById('qi-min-unit').textContent = config.unit;
            document.getElementById('qi-avg-unit').textContent = config.unit;
            document.getElementById('qi-max-unit').textContent = config.unit;
            
            if(insightEl) {
                insightEl.textContent = '📊 Demo Data (No live readings yet)';
                insightEl.style.color = '#FF9800';
            }
        }
    }
    // ========================================
    // 💡 GENERATE INSIGHTS
    // ========================================

    function generateRealInsight(values, type) {
        if(!values.length) return "No data available.";
        
        const avgVal = values.reduce((a, b) => a + b, 0) / values.length;
        
        if (type === 'soilMoisture') {
            if (avgVal < 50) return "Soil moisture is low. Consider watering.";
            if (avgVal > 80) return "Soil moisture is high. Good hydration.";
            return "Soil moisture is optimal for composting.";
        }
        
        if (type === 'temperature') {
            if (avgVal > 30) return "Temperature is elevated. Check ventilation.";
            if (avgVal < 20) return "Temperature is low. Composting may be slow.";
            return "Temperature is in the optimal range.";
        }
        
        if (type === 'humidity') {
            if (avgVal < 50) return "Humidity is low. Consider adding moisture.";
            if (avgVal > 80) return "Humidity is high. Monitor for excess moisture.";
            return "Humidity levels are stable.";
        }
        
        if (type === 'gasLevels') {
            if (avgVal > 100) return "Gas levels elevated. Check ventilation.";
            return "Gas levels are normal.";
        }
        
        return "Readings appear stable.";
    }

    // ========================================
    // 🔄 UPDATE ALL DATA
    // ========================================

    function updateAllData() {
        updateDateTime();
        updateFluctuationsWithRealData();
        console.log(`✅ Quick Insights updated for Bin ${currentBin}, Sensor: ${currentSensor}`);
    }

    // ========================================
    // 🎨 HANDLE SENSOR TAB CLICKS
    // ========================================

    function handleSensorTabClick(event) {
        const clickedTab = event.currentTarget;
        const sensor = clickedTab.dataset.sensor;
        
        if (!sensor) return;
        
        // Remove active class from all tabs
        document.querySelectorAll('.qi-sensor-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Add active class to clicked tab
        clickedTab.classList.add('active');
        
        // Update current sensor
        currentSensor = sensor;
        
        // Update all data
        updateAllData();
    }

    // ========================================
    // 🔄 HANDLE BIN SELECTOR CHANGE
    // ========================================

    function handleBinChange(event) {
        const selectedBin = event.target.value;
        currentBin = selectedBin;
        
        console.log(`🔄 Bin changed to: ${currentBin}`);
        
        // Update all data
        updateAllData();
    }

    // ========================================
    // 🔧 TAB SWITCHER (Quick Insights ↔ Bin Fluctuations)
    // ========================================

    function handleTabSwitch(event) {
        const clickedBtn = event.currentTarget;
        const targetTab = clickedBtn.dataset.tab;
        
        // Remove active class from all buttons
        document.querySelectorAll('.dashboard-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        clickedBtn.classList.add('active');
        
        // Show/hide content
        const quickInsights = document.getElementById('quickInsightsContent');
        const binFluctuations = document.getElementById('binFluctuationsContent');
        
        if (targetTab === 'quick-insights') {
            if (quickInsights) {
                quickInsights.classList.add('active');
                quickInsights.style.display = '';
            }
            if (binFluctuations) {
                binFluctuations.classList.remove('active');
                binFluctuations.style.display = 'none';
            }
        } else {
            if (quickInsights) {
                quickInsights.classList.remove('active');
                quickInsights.style.display = 'none';
            }
            if (binFluctuations) {
                binFluctuations.classList.add('active');
                binFluctuations.style.display = '';
            }
        }

        // Show/hide bin fluctuations nav bar
        const nav = document.getElementById('binFluctuationsNav');
        if (nav) {
            if (targetTab === 'bin-fluctuations') {
                nav.classList.add('active');
                nav.style.display = 'grid';
            } else {
                nav.classList.remove('active');
                nav.style.display = 'none';
            }
        }
        
        console.log(`✅ Switched to: ${targetTab}`);
    }

    // ========================================
    // 🚀 INITIALIZE
    // ========================================

    function initializeQuickInsights() {
        console.log('🎨 Quick Insights Module: Initializing...');
        
        // Set up tab switcher
        document.querySelectorAll('.dashboard-tab-btn').forEach(btn => {
            btn.addEventListener('click', handleTabSwitch);
        });
        
        // Set up sensor tabs
        document.querySelectorAll('.qi-sensor-tab').forEach(tab => {
            tab.addEventListener('click', handleSensorTabClick);
        });
        
        // Set up bin selector
        const binDropdown = document.getElementById('qi-bin-dropdown');
        if (binDropdown) {
            binDropdown.addEventListener('change', handleBinChange);
        }
        
        // Initial data load
        updateAllData();
        
        // Auto-refresh every 10 seconds
        setInterval(updateDateTime, 10000);
        
        console.log('✅ Quick Insights Module initialized successfully!');
    }

    // ========================================
    // 🎬 AUTO-INITIALIZE
    // ========================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeQuickInsights);
    } else {
        initializeQuickInsights();
    }

    // ========================================
    // 🌍 EXPOSE FUNCTIONS FOR EXTERNAL USE
    // ========================================

    window.QuickInsights = {
        updateAllData,
        getCurrentBin: () => currentBin,
        getCurrentSensor: () => currentSensor,
        setBin: (binId) => {
            currentBin = binId;
            updateAllData();
        },
        setSensor: (sensorType) => {
            currentSensor = sensorType;
            updateAllData();
        }
    };

})();

console.log('✅ quick-insights.js loaded');
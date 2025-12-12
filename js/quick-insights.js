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
    // 🗄️ DUMMY DATA (MongoDB-ready structure)
    // ========================================

    // TODO: MongoDB Integration
    // Collection: sensor_readings
    // Schema: {
    //   binId: String,              // '1' or '2'
    //   sensorType: String,         // 'temperature', 'soilMoisture', 'humidity', 'gasLevels'
    //   value: Number,              // Sensor reading
    //   status: String,             // 'Normal', 'High', 'Low', 'Critical'
    //   timestamp: Date             // ISO 8601 format
    // }
    // 
    // Query Example:
    // db.sensor_readings
    //   .find({ binId: selectedBin, sensorType: selectedSensor })
    //   .sort({ timestamp: -1 })
    //   .limit(20)  // Last 20 readings
    //
    // Replace DUMMY_READINGS with your MongoDB query result

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
    // 📊 CALCULATE MIN/AVE/MAX
    // ========================================

    function calculateStats(readings) {
        if (!readings || readings.length === 0) {
            return { min: 0, avg: 0, max: 0 };
        }
        
        const values = readings.map(r => r.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        
        return {
            min: min.toFixed(1),
            avg: avg.toFixed(1),
            max: max.toFixed(1)
        };
    }

    // ========================================
    // 📝 GENERATE INSIGHT TEXT
    // ========================================

    function generateInsight(readings, sensorType) {
        if (!readings || readings.length === 0) {
            return 'No data available for this sensor.';
        }
        
        const highCount = readings.filter(r => r.status === 'High' || r.status === 'Critical').length;
        const lowCount = readings.filter(r => r.status === 'Low').length;
        
        if (highCount > 0) {
            return `Spikes above safe range occurred ${highCount} time${highCount > 1 ? 's' : ''} today`;
        }
        
        if (lowCount > 0) {
            return `Values below optimal range occurred ${lowCount} time${lowCount > 1 ? 's' : ''} today`;
        }
        
        return 'All readings are within normal range today. Great job!';
    }

    // ========================================
    // 🔄 UPDATE STATISTICS DISPLAY
    // ========================================

    function updateStatistics() {
        // TODO: MongoDB Integration
        // Replace this with:
        // const readings = await fetchReadingsFromMongoDB(currentBin, currentSensor);
        
        const readings = DUMMY_READINGS[currentBin][currentSensor];
        const stats = calculateStats(readings);
        const config = QI_SENSOR_CONFIGS[currentSensor];
        
        // Update Min
        document.getElementById('qi-min-value').textContent = stats.min;
        document.getElementById('qi-min-unit').textContent = config.unit;
        
        // Update Average
        document.getElementById('qi-avg-value').textContent = stats.avg;
        document.getElementById('qi-avg-unit').textContent = config.unit;
        
        // Update Max
        document.getElementById('qi-max-value').textContent = stats.max;
        document.getElementById('qi-max-unit').textContent = config.unit;
        
        // Update Insight
        const insight = generateInsight(readings, currentSensor);
        document.getElementById('qi-insight-text').textContent = insight;
    }

    // ========================================
    // 📋 UPDATE DATA TABLE
    // ========================================

    function updateTable() {
        // TODO: MongoDB Integration
        // Replace this with:
        // const readings = await fetchReadingsFromMongoDB(currentBin, currentSensor);
        
        const readings = DUMMY_READINGS[currentBin][currentSensor];
        const config = QI_SENSOR_CONFIGS[currentSensor];
        const tbody = document.getElementById('qi-table-body');
        
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        readings.forEach(reading => {
            const row = document.createElement('tr');
            
            // Determine row class based on status
            if (reading.status === 'High' || reading.status === 'Critical') {
                row.classList.add('status-high');
            } else if (reading.status === 'Low') {
                row.classList.add('status-low');
            }
            
            row.innerHTML = `
                <td>${reading.time}</td>
                <td>${reading.value}${config.unit}</td>
                <td>${reading.status}</td>
            `;
            
            tbody.appendChild(row);
        });
    }

    // ========================================
    // 🔄 UPDATE ALL DATA
    // ========================================

    function updateAllData() {
        updateDateTime();
        updateStatistics();
        updateTable();
        
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
    // 🔀 TAB SWITCHER (Quick Insights ↔ Bin Fluctuations)
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
                quickInsights.style.display = 'block';
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
                binFluctuations.style.display = 'block';
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

// ========================================
// 📝 MONGODB INTEGRATION INSTRUCTIONS
// ========================================
/*

## HOW TO CONNECT TO MONGODB

1. **Install MongoDB Driver** (if not already):
   npm install mongodb

2. **Backend API Endpoint** (Node.js example):

   ```javascript
   // server.js or api/readings.js
   
   const { MongoClient } = require('mongodb');
   
   app.get('/api/readings', async (req, res) => {
       const { binId, sensorType, limit = 20 } = req.query;
       
       const client = new MongoClient(process.env.MONGODB_URI);
       
       try {
           await client.connect();
           const db = client.db('avonic');
           const readings = await db.collection('sensor_readings')
               .find({ 
                   binId: binId,
                   sensorType: sensorType 
               })
               .sort({ timestamp: -1 })
               .limit(parseInt(limit))
               .toArray();
           
           res.json(readings);
       } finally {
           await client.close();
       }
   });
   ```

3. **Replace Dummy Data in quick-insights.js**:

   Find this line:
   ```javascript
   const readings = DUMMY_READINGS[currentBin][currentSensor];
   ```
   
   Replace with:
   ```javascript
   const readings = await fetchReadingsFromMongoDB(currentBin, currentSensor);
   ```

4. **Add Fetch Function**:

   ```javascript
   async function fetchReadingsFromMongoDB(binId, sensorType) {
       try {
           const response = await fetch(
               `/api/readings?binId=${binId}&sensorType=${sensorType}&limit=20`
           );
           const data = await response.json();
           return data;
       } catch (error) {
           console.error('Error fetching readings:', error);
           return [];
       }
   }
   ```

5. **Make Functions Async**:
   - Change `function updateStatistics()` to `async function updateStatistics()`
   - Change `function updateTable()` to `async function updateTable()`
   - Change `function updateAllData()` to `async function updateAllData()`

6. **Test with Real Data**:
   - Check browser console for API calls
   - Verify data structure matches expected format
   - Adjust table rendering if needed

*/
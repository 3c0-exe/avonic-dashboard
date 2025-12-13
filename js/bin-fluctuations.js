// ========================================
// BIN FLUCTUATIONS MODULE WITH CHARTS
// Save as: js/bin-fluctuations.js
// Link in app.html AFTER quick-insights.js
// ========================================

(function() {
    'use strict';

    // ========================================
    // 📊 SENSOR CONFIGURATIONS
    // ========================================
    const SENSOR_CONFIGS = {
        temperature: {
            unit: '°C',
            label: 'Temperature',
            icon: 'img/icons/sensorIcons/TempIcon.svg',
            color: 'rgba(255, 99, 132, 1)',
            bgColor: 'rgba(255, 99, 132, 0.2)'
        },
        soilMoisture: {
            unit: '%',
            label: 'Soil Moisture',
            icon: 'img/icons/sensorIcons/SoilMoistureIcon.svg',
            color: 'rgba(54, 162, 235, 1)',
            bgColor: 'rgba(54, 162, 235, 0.2)'
        },
        humidity: {
            unit: '%',
            label: 'Humidity',
            icon: 'img/icons/sensorIcons/HumidityIcon.svg',
            color: 'rgba(75, 192, 192, 1)',
            bgColor: 'rgba(75, 192, 192, 0.2)'
        },
        gasLevels: {
            unit: 'ppm',
            label: 'Gas Levels',
            icon: 'img/icons/sensorIcons/GasIcon.svg',
            color: 'rgba(255, 206, 86, 1)',
            bgColor: 'rgba(255, 206, 86, 0.2)'
        }
    };

    // ========================================
    // 🎯 STATE MANAGEMENT
    // ========================================
    let currentBinIndex = 0;
    const bins = ['Bin 1', 'Bin 2'];
    const chartInstances = {}; // Store chart instances
    
    // Date range state
    let startDate = null;
    let endDate = null;
    let isDateRangeActive = false;

    // ========================================
    // 🔄 NAVIGATION INITIALIZATION
    // ========================================
    function initBinFluctuationsNav() {
        const nav = document.getElementById('binFluctuationsNav');
        const binDisplay = document.querySelector('.bf-nav-bin-display');
        const leftArrow = document.querySelector('.bf-nav-arrow-left');
        const rightArrow = document.querySelector('.bf-nav-arrow-right');
        const calendarBtn = document.querySelector('.bf-nav-calendar-btn');

        if (!nav) {
            console.warn('⚠️ Bin Fluctuations Nav element not found');
            return;
        }

        // Show/hide nav based on active tab
        const tabButtons = document.querySelectorAll('.dashboard-tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');
                if (targetTab === 'bin-fluctuations') {
                    nav.classList.add('active');
                    nav.style.display = 'grid';
                    
                    // Load data when tab becomes active
                    updateBinFluctuationsData(currentBinIndex + 1);
                } else {
                    nav.classList.remove('active');
                    nav.style.display = 'none';
                }
            });
        });

        // Bin selector arrows
        if (leftArrow) {
            leftArrow.addEventListener('click', function() {
                currentBinIndex = (currentBinIndex - 1 + bins.length) % bins.length;
                if (binDisplay) binDisplay.textContent = bins[currentBinIndex];
                
                // Load new bin data
                updateBinFluctuationsData(currentBinIndex + 1);
                
                console.log(`✅ Switched to ${bins[currentBinIndex]}`);
            });
        }

        if (rightArrow) {
            rightArrow.addEventListener('click', function() {
                currentBinIndex = (currentBinIndex + 1) % bins.length;
                if (binDisplay) binDisplay.textContent = bins[currentBinIndex];
                
                // Load new bin data
                updateBinFluctuationsData(currentBinIndex + 1);
                
                console.log(`✅ Switched to ${bins[currentBinIndex]}`);
            });
        }

        // Calendar button (placeholder)
        if (calendarBtn) {
            calendarBtn.addEventListener('click', function() {
                console.log('📅 Calendar button clicked');
                showDateRangePicker();
            });
        }

        console.log('✅ Bin Fluctuations Nav initialized');
    }

    // ========================================
    // 📊 FETCH AND UPDATE BIN FLUCTUATIONS DATA
    // ========================================
    async function updateBinFluctuationsData(binId) {
        console.log(`🔄 Loading Bin Fluctuations data for Bin ${binId}`);
        
        // ✅ DESTROY ALL EXISTING CHARTS BEFORE LOADING NEW DATA
        destroyAllCharts();
        
        // Show loading state for all sensors
        showLoadingState();
        
        try {
            const token = localStorage.getItem('avonic_token');
            if (!token) {
                throw new Error("Not logged in");
            }

            // Get Device ID
            let espID = localStorage.getItem('selected_espID');
            
            if (!espID) {
                const devRes = await fetch('https://avonic-main-hub-production.up.railway.app/api/devices/claimed', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (!devRes.ok) {
                    throw new Error('Failed to fetch devices');
                }
                
                const devData = await devRes.json();
                
                if (devData.devices && devData.devices.length > 0) {
                    espID = devData.devices[0].espID;
                    localStorage.setItem('selected_espID', espID);
                } else {
                    throw new Error("No devices found");
                }
            }

            // Fetch valid readings from API
            let url = `https://avonic-main-hub-production.up.railway.app/api/devices/${espID}/valid-readings?limit=100`;
            
            // Add date range parameters if active
            if (isDateRangeActive && startDate && endDate) {
                url += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
                console.log(`📅 Filtering data: ${formatDate(startDate)} to ${formatDate(endDate)}`);
            }
            
            const response = await fetch(url, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const result = await response.json();
            let readings = result.readings || [];

            // Client-side date filtering if API doesn't support it
            if (isDateRangeActive && startDate && endDate) {
                readings = readings.filter(reading => {
                    const readingDate = new Date(reading.timestamp);
                    return readingDate >= startDate && readingDate <= endDate;
                });
                console.log(`📅 Filtered to ${readings.length} readings in date range`);
            }

            console.log(`✅ Fetched ${readings.length} valid readings for Bin ${binId}`);

            if (readings.length === 0) {
                throw new Error("No valid sensor readings found for this date range");
            }

            // Update all sensor sections with charts
            updateSensorSection('temperature', binId, readings);
            updateSensorSection('soilMoisture', binId, readings);
            updateSensorSection('humidity', binId, readings);
            updateSensorSection('gasLevels', binId, readings);
            
            console.log(`✅ Bin Fluctuations updated for Bin ${binId}`);
            
        } catch (error) {
            console.error('❌ Bin Fluctuations Error:', error.message);
            showErrorState(error.message);
        }
    }

    // ========================================
    // 📈 UPDATE INDIVIDUAL SENSOR SECTION
    // ========================================
    function updateSensorSection(sensorType, binId, readings) {
        // Map sensor type to database key
        const dbKeyMap = {
            'temperature': 'temp',
            'soilMoisture': 'soil',
            'humidity': 'humidity',
            'gasLevels': 'gas'
        };
        
        const dbKey = dbKeyMap[sensorType];
        if (!dbKey) {
            console.warn(`⚠️ Unknown sensor type: ${sensorType}`);
            return;
        }

        const config = SENSOR_CONFIGS[sensorType];
        
        // Extract values for this sensor from the selected bin
        const dataPoints = [];
        
        readings.forEach(reading => {
            const binData = binId === 1 ? reading.bin1 : reading.bin2;
            
            if (binData && binData[dbKey] !== undefined && binData[dbKey] !== null) {
                const val = parseFloat(binData[dbKey]);
                if (!isNaN(val)) {
                    dataPoints.push({
                        value: val,
                        timestamp: new Date(reading.timestamp)
                    });
                }
            }
        });

        console.log(`📊 ${config.label}: ${dataPoints.length} readings found`);

        if (dataPoints.length === 0) {
            console.warn(`⚠️ No ${config.label} data for Bin ${binId}`);
            updateSensorUI(sensorType, null, config);
            return;
        }

        // Sort by timestamp (oldest to newest for chart)
        dataPoints.sort((a, b) => a.timestamp - b.timestamp);

        // Take the most recent 20 points for the chart
        const chartData = dataPoints.slice(-20);
        const allValues = dataPoints.map(d => d.value);

        // Calculate statistics
        const stats = {
            min: Math.min(...allValues).toFixed(1),
            max: Math.max(...allValues).toFixed(1),
            avg: (allValues.reduce((a, b) => a + b, 0) / allValues.length).toFixed(1),
            latest: allValues[allValues.length - 1].toFixed(1),
            count: allValues.length
        };

        // Update the UI and chart
        updateSensorUI(sensorType, stats, config);
        updateChart(sensorType, chartData, config);
        updateInsightsText(sensorType, stats, config);
    }

    // ========================================
    // 📊 UPDATE CHART WITH REAL DATA
    // ========================================
    function updateChart(sensorType, dataPoints, config) {
        const sensorSection = document.querySelector(`.dashboard-section[data-sensor="${sensorType}"]`);
        if (!sensorSection) {
            console.warn(`⚠️ Could not find section for ${sensorType}`);
            return;
        }

        const canvas = sensorSection.querySelector('.dashboard-chart-canvas');
        if (!canvas) {
            console.warn(`⚠️ Could not find canvas for ${sensorType}`);
            return;
        }

        // ✅ DESTROY ALL EXISTING CHARTS ON THIS CANVAS
        Chart.getChart(canvas)?.destroy();
        
        // Also destroy our stored instance
        if (chartInstances[sensorType]) {
            chartInstances[sensorType].destroy();
            delete chartInstances[sensorType];
        }

        const ctx = canvas.getContext('2d');

        // Prepare chart data
        const labels = dataPoints.map(point => {
            const date = point.timestamp;
            return date.toLocaleString('en-US', { 
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        });

        const values = dataPoints.map(point => point.value);

        // Create new chart
        chartInstances[sensorType] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: config.label,
                    data: values,
                    backgroundColor: config.bgColor,
                    borderColor: config.color,
                    borderWidth: 2,
                    borderRadius: 8,
                    maxBarThickness: 50
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y.toFixed(1)}${config.unit}`;
                            }
                        }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        color: '#333',
                        font: {
                            weight: 'bold',
                            size: 11
                        },
                        formatter: function(value) {
                            return value.toFixed(0) + config.unit;
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            font: {
                                size: 10
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + config.unit;
                            }
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });

        console.log(`📈 Chart updated for ${config.label} with ${dataPoints.length} points`);
    }

    // ========================================
    // 🎨 UPDATE SENSOR UI ELEMENTS
    // ========================================
    function updateSensorUI(sensorType, stats, config) {
        const sensorSection = document.querySelector(`.dashboard-section[data-sensor="${sensorType}"]`);
        
        if (!sensorSection) {
            console.warn(`⚠️ Could not find dashboard section for ${sensorType}`);
            return;
        }

        // If no data, show placeholder
        if (!stats) {
            const avgValueEl = sensorSection.querySelector('.dashboard-average-value');
            if (avgValueEl) {
                avgValueEl.textContent = '--';
            }
            return;
        }

        // Update average value
        const avgValueEl = sensorSection.querySelector('.dashboard-average-value');
        const avgUnitEl = sensorSection.querySelector('.dashboard-average-unit');
        
        if (avgValueEl) {
            avgValueEl.textContent = stats.avg;
        }
        if (avgUnitEl) {
            avgUnitEl.textContent = config.unit;
        }

        console.log(`✅ Updated ${config.label}: Avg=${stats.avg}${config.unit}, Min=${stats.min}, Max=${stats.max}`);
    }

    // ========================================
    // 💡 UPDATE INSIGHTS TEXT
    // ========================================
    function updateInsightsText(sensorType, stats, config) {
        const sensorSection = document.querySelector(`.dashboard-section[data-sensor="${sensorType}"]`);
        if (!sensorSection) return;

        const insightsEl = sensorSection.querySelector('.dashboard-insights-content');
        if (!insightsEl) return;

        const avgVal = parseFloat(stats.avg);
        let insightText = '';

        // Generate insights based on sensor type
        switch(sensorType) {
            case 'temperature':
                if (avgVal < 15) {
                    insightText = '❄️ Temperature is very low. Composting activity may be minimal.';
                } else if (avgVal < 20) {
                    insightText = '🌡️ Temperature is below optimal. Consider adding more materials.';
                } else if (avgVal <= 30) {
                    insightText = '✅ Temperature is in the optimal range for composting.';
                } else if (avgVal <= 35) {
                    insightText = '⚠️ Temperature is elevated. Monitor closely.';
                } else {
                    insightText = '🔥 Temperature is too high! Improve ventilation immediately.';
                }
                break;

            case 'soilMoisture':
                if (avgVal < 40) {
                    insightText = '💧 Soil is too dry. Add water to maintain moisture.';
                } else if (avgVal <= 60) {
                    insightText = '✅ Soil moisture is optimal for vermicomposting.';
                } else if (avgVal <= 80) {
                    insightText = '⚠️ Soil moisture is high. Monitor drainage.';
                } else {
                    insightText = '💦 Soil is oversaturated! Reduce watering and improve drainage.';
                }
                break;

            case 'humidity':
                if (avgVal < 30) {
                    insightText = '🏜️ Humidity is very low. Consider adding moisture.';
                } else if (avgVal <= 60) {
                    insightText = '✅ Humidity levels are ideal for composting.';
                } else if (avgVal <= 80) {
                    insightText = '⚠️ Humidity is elevated. Ensure proper ventilation.';
                } else {
                    insightText = '💨 Humidity is too high! Increase airflow.';
                }
                break;

            case 'gasLevels':
                if (avgVal < 50) {
                    insightText = '✅ Gas levels are normal. Composting is healthy.';
                } else if (avgVal <= 100) {
                    insightText = '⚠️ Gas levels are elevated. Check for anaerobic conditions.';
                } else if (avgVal <= 200) {
                    insightText = '🚨 Gas levels are high! Improve ventilation.';
                } else {
                    insightText = '☠️ Gas levels are critical! Immediate action required.';
                }
                break;

            default:
                insightText = 'Monitoring sensor data...';
        }

        insightsEl.textContent = insightText;
    }

    // ========================================
    // ⏳ SHOW LOADING STATE
    // ========================================
    function showLoadingState() {
        const allSections = document.querySelectorAll('.dashboard-section[data-sensor]');
        allSections.forEach(section => {
            const avgValueEl = section.querySelector('.dashboard-average-value');
            const insightsEl = section.querySelector('.dashboard-insights-content');
            
            if (avgValueEl) {
                avgValueEl.textContent = '--';
            }
            if (insightsEl) {
                insightsEl.textContent = '⏳ Loading data...';
            }
        });
    }

    // ========================================
    // 🗑️ DESTROY ALL CHARTS
    // ========================================
    function destroyAllCharts() {
        // Destroy all stored chart instances
        Object.keys(chartInstances).forEach(key => {
            if (chartInstances[key]) {
                chartInstances[key].destroy();
                delete chartInstances[key];
            }
        });

        // Also destroy any orphaned charts on canvas elements
        const allCanvases = document.querySelectorAll('.dashboard-chart-canvas');
        allCanvases.forEach(canvas => {
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
            }
        });

        console.log('🗑️ All charts destroyed');
    }

    // ========================================
    // ❌ SHOW ERROR STATE
    // ========================================
    function showErrorState(errorMessage) {
        const allSections = document.querySelectorAll('.dashboard-section[data-sensor]');
        allSections.forEach(section => {
            const insightsEl = section.querySelector('.dashboard-insights-content');
            if (insightsEl) {
                insightsEl.textContent = `⚠️ ${errorMessage}`;
                insightsEl.style.color = '#D32F2F';
            }
        });
    }

    // ========================================
    // 🚀 INITIALIZE
    // ========================================
    function initialize() {
        console.log('🎨 Bin Fluctuations Module: Initializing...');
        initBinFluctuationsNav();
        createDateRangePickerModal();
        exposePublicAPI(); // ✅ Call this after all functions are defined
    }

    // ========================================
    // 🌍 EXPOSE PUBLIC API
    // ========================================
    function exposePublicAPI() {
        window.BinFluctuationsNav = {
            setCurrentBin: function(index) {
                if (index < 0 || index >= bins.length) {
                    console.warn(`Invalid bin index: ${index}`);
                    return;
                }
                currentBinIndex = index;
                const binDisplay = document.querySelector('.bf-nav-bin-display');
                if (binDisplay) binDisplay.textContent = bins[index];
                
                // Load data when bin changes
                updateBinFluctuationsData(index + 1);
            },
            getCurrentBin: function() {
                return currentBinIndex + 1;
            },
            refresh: function() {
                updateBinFluctuationsData(currentBinIndex + 1);
            },
            // Date picker functions
            showDatePicker: showDateRangePicker,
            closeDatePicker: closeDatePicker,
            applyDateRange: applyDateRange,
            setQuickDate: setQuickDate
        };
        
        console.log('✅ BinFluctuationsNav API exposed');
    }

    // ========================================
    // 📅 CREATE DATE RANGE PICKER MODAL
    // ========================================
    function createDateRangePickerModal() {
        // Check if modal already exists
        if (document.getElementById('date-range-modal')) return;

        const modalHTML = `
            <div id="date-range-modal" class="date-modal-overlay" style="display: none;">
                <div class="date-modal-container">
                    <div class="date-modal-header">
                        <h2>Select Date Range</h2>
                        <button class="date-modal-close" onclick="window.BinFluctuationsNav.closeDatePicker()">×</button>
                    </div>
                    
                    <div class="date-modal-body">
                        <div class="date-input-group">
                            <label>Start Date</label>
                            <input type="date" id="start-date-input" class="date-input">
                        </div>
                        
                        <div class="date-input-group">
                            <label>End Date</label>
                            <input type="date" id="end-date-input" class="date-input">
                        </div>

                        <div class="date-quick-options">
                            <h3>Quick Select</h3>
                            <div class="date-quick-buttons">
                                <button class="date-quick-btn" onclick="window.BinFluctuationsNav.setQuickDate('today')">Today</button>
                                <button class="date-quick-btn" onclick="window.BinFluctuationsNav.setQuickDate('week')">Last 7 Days</button>
                                <button class="date-quick-btn" onclick="window.BinFluctuationsNav.setQuickDate('month')">Last 30 Days</button>
                                <button class="date-quick-btn" onclick="window.BinFluctuationsNav.setQuickDate('all')">All Time</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="date-modal-footer">
                        <button class="date-btn date-btn-secondary" onclick="window.BinFluctuationsNav.closeDatePicker()">Cancel</button>
                        <button class="date-btn date-btn-primary" onclick="window.BinFluctuationsNav.applyDateRange()">Apply</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add CSS styles
        const style = document.createElement('style');
        style.textContent = `
            .date-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(4px);
            }

            .date-modal-container {
                background: white;
                border-radius: 16px;
                width: 90%;
                max-width: 500px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: modalSlideIn 0.3s ease-out;
            }

            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .date-modal-header {
                padding: 24px;
                border-bottom: 1px solid #e0e0e0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .date-modal-header h2 {
                margin: 0;
                font-size: 22px;
                color: #333;
            }

            .date-modal-close {
                background: none;
                border: none;
                font-size: 32px;
                color: #999;
                cursor: pointer;
                line-height: 1;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s;
            }

            .date-modal-close:hover {
                background: #f5f5f5;
                color: #333;
            }

            .date-modal-body {
                padding: 24px;
            }

            .date-input-group {
                margin-bottom: 20px;
            }

            .date-input-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #555;
                font-size: 14px;
            }

            .date-input {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                font-size: 16px;
                transition: all 0.2s;
                box-sizing: border-box;
            }

            .date-input:focus {
                outline: none;
                border-color: #4CAF50;
                box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
            }

            .date-quick-options {
                margin-top: 24px;
                padding-top: 24px;
                border-top: 1px solid #e0e0e0;
            }

            .date-quick-options h3 {
                margin: 0 0 12px 0;
                font-size: 14px;
                color: #555;
                font-weight: 600;
            }

            .date-quick-buttons {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
            }

            .date-quick-btn {
                padding: 10px 16px;
                background: #f5f5f5;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                color: #555;
                transition: all 0.2s;
            }

            .date-quick-btn:hover {
                background: #4CAF50;
                border-color: #4CAF50;
                color: white;
                transform: translateY(-1px);
            }

            .date-modal-footer {
                padding: 20px 24px;
                border-top: 1px solid #e0e0e0;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }

            .date-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .date-btn-secondary {
                background: #f5f5f5;
                color: #555;
            }

            .date-btn-secondary:hover {
                background: #e0e0e0;
            }

            .date-btn-primary {
                background: #4CAF50;
                color: white;
            }

            .date-btn-primary:hover {
                background: #45a049;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
            }
        `;
        document.head.appendChild(style);

        console.log('📅 Date range picker modal created');
    }

    // ========================================
    // 📅 SHOW DATE RANGE PICKER
    // ========================================
    function showDateRangePicker() {
        const modal = document.getElementById('date-range-modal');
        if (!modal) return;

        // Set current values if any
        const startInput = document.getElementById('start-date-input');
        const endInput = document.getElementById('end-date-input');

        if (startDate) {
            startInput.value = startDate.toISOString().split('T')[0];
        }
        if (endDate) {
            endInput.value = endDate.toISOString().split('T')[0];
        }

        modal.style.display = 'flex';
    }

    // ========================================
    // 📅 CLOSE DATE PICKER
    // ========================================
    function closeDatePicker() {
        const modal = document.getElementById('date-range-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // ========================================
    // 📅 SET QUICK DATE RANGE
    // ========================================
    function setQuickDate(range) {
        const endInput = document.getElementById('end-date-input');
        const startInput = document.getElementById('start-date-input');
        
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        let start = new Date();

        switch(range) {
            case 'today':
                start.setHours(0, 0, 0, 0);
                break;
            case 'week':
                start.setDate(today.getDate() - 7);
                start.setHours(0, 0, 0, 0);
                break;
            case 'month':
                start.setDate(today.getDate() - 30);
                start.setHours(0, 0, 0, 0);
                break;
            case 'all':
                start = null;
                startInput.value = '';
                endInput.value = '';
                return;
        }

        if (start) {
            startInput.value = start.toISOString().split('T')[0];
        }
        endInput.value = today.toISOString().split('T')[0];
    }

    // ========================================
    // 📅 APPLY DATE RANGE
    // ========================================
    function applyDateRange() {
        const startInput = document.getElementById('start-date-input');
        const endInput = document.getElementById('end-date-input');

        if (!startInput.value || !endInput.value) {
            // Reset to all time
            startDate = null;
            endDate = null;
            isDateRangeActive = false;
            updateDateRangeDisplay('All Time');
        } else {
            startDate = new Date(startInput.value);
            startDate.setHours(0, 0, 0, 0);
            
            endDate = new Date(endInput.value);
            endDate.setHours(23, 59, 59, 999);

            if (startDate > endDate) {
                alert('Start date must be before end date');
                return;
            }

            isDateRangeActive = true;
            updateDateRangeDisplay(`${formatDate(startDate)} - ${formatDate(endDate)}`);
        }

        closeDatePicker();
        updateBinFluctuationsData(currentBinIndex + 1);
    }

    // ========================================
    // 📅 UPDATE DATE RANGE DISPLAY
    // ========================================
    function updateDateRangeDisplay(text) {
        const dateDisplay = document.getElementById('bf-nav-date-text');
        if (dateDisplay) {
            dateDisplay.textContent = text;
        }
    }

    // ========================================
    // 📅 FORMAT DATE
    // ========================================
    function formatDate(date) {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();

console.log('✅ bin-fluctuations.js loaded');
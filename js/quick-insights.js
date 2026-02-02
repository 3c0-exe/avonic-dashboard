// ========================================
// QUICK INSIGHTS MODULE - MAIN ENTRY POINT
// js/quick-insights.js
// ========================================

(function() {
    'use strict';

    // ========================================
    // 🎯 STATE MANAGEMENT
    // ========================================

    let currentBin = '1';
    let currentSensor = 'soilMoisture';

    // ========================================
    // 📊 MAIN UPDATE FUNCTION
    // ========================================

    async function updateFluctuationsWithRealData() {
        const tableBody = document.getElementById('qi-table-body');
        const insightEl = document.getElementById('qi-insight-text');
        const config = window.QI_SENSOR_CONFIGS[currentSensor];
        
        // Show loading state
        window.QI_TableRenderer.showLoadingState();

        try {
            const token = localStorage.getItem('avonic_token');
            
            // 1. Validate ESP ID
            const espID = await window.QI_EspValidator.getEspIDWithURLOverride();

            // 2. Fetch real data
            const result = await window.QI_DataFetcher.fetchSensorReadings(espID, token);
            
            if (!result.success) {
                throw new Error(result.error);
            }

            // 3. Extract values for current bin and sensor
            const { validValues, processedReadings } = window.QI_DataFetcher.extractSensorValues(
                result.readings,
                currentBin,
                currentSensor,
                config.dbKey
            );

            if (validValues.length === 0) {
                throw new Error(`No ${config.label} data found for Bin ${currentBin}`);
            }

            // 4. Render table with real data
            const rowsHTML = window.QI_TableRenderer.renderRealDataTable(
                processedReadings,
                currentSensor,
                config
            );
            
            if (tableBody) tableBody.innerHTML = rowsHTML;

            // 5. Calculate and display statistics
            const stats = window.QI_StatsCalculator.calculateStats(validValues);
            window.QI_TableRenderer.updateStatisticsDisplay(stats, config.unit);

            // 6. Generate and display insight
            const insight = window.QI_InsightGenerator.generateRealInsight(validValues, currentSensor);
            window.QI_InsightGenerator.updateInsightDisplay(insightEl, insight, true);

        } catch (error) {
            // FALLBACK TO DEMO DATA
            console.error("❌ Fetch Error:", error.message);
            console.log('📦 Using demo data as fallback to keep UI intact...');
            
            const dummyReadings = window.QI_DUMMY_READINGS[currentBin][currentSensor];
            const validValues = dummyReadings.map(r => r.value);
            
            // Render dummy data table
            const rowsHTML = window.QI_TableRenderer.renderDummyDataTable(dummyReadings, config);
            if (tableBody) tableBody.innerHTML = rowsHTML;
            
            // Calculate and display statistics
            const stats = window.QI_StatsCalculator.calculateStats(validValues);
            window.QI_TableRenderer.updateStatisticsDisplay(stats, config.unit);
            
            // Show demo data message
            window.QI_InsightGenerator.updateInsightDisplay(insightEl, '', false);
        }
    }

    // ========================================
    // 🔄 UPDATE ALL DATA
    // ========================================

    function updateAllData() {
        window.QI_TableRenderer.updateDateTime();
        updateFluctuationsWithRealData();
        console.log(`✅ Quick Insights updated for Bin ${currentBin}, Sensor: ${currentSensor}`);
    }

    // ========================================
    // 🚀 INITIALIZE
    // ========================================

    function initializeQuickInsights() {
        console.log('🎨 Quick Insights Module: Initializing...');
        
        // Setup event listeners with callbacks
        window.QI_TabHandler.setupEventListeners({
            onSensorChange: (sensor) => {
                currentSensor = sensor;
                updateAllData();
            },
            onBinChange: (bin) => {
                currentBin = bin;
                updateAllData();
            }
        });
        
        // Initial data load
        updateAllData();
        
        // Auto-refresh date/time every 10 seconds
        setInterval(window.QI_TableRenderer.updateDateTime, 10000);
        
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
    // 🌍 EXPOSE API FOR EXTERNAL USE
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
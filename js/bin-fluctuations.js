// ========================================
// BIN FLUCTUATIONS MODULE - MAIN ENTRY POINT
// js/bin-fluctuations.js
// ========================================

(function() {
    'use strict';

    // ========================================
    // 📊 UPDATE SENSOR SECTION
    // ========================================
    function updateSensorSection(sensorType, binId, readings) {
        const config = window.BF_SENSOR_CONFIGS[sensorType];
        
        if (!config) {
            console.warn(`⚠️ Unknown sensor type: ${sensorType}`);
            return;
        }

        // Extract data points for this sensor
        const dataPoints = window.BF_DataFetcher.extractSensorData(
            readings,
            binId,
            sensorType,
            config.dbKey
        );

        console.log(`📊 ${config.label}: ${dataPoints.length} readings found`);

        if (dataPoints.length === 0) {
            console.warn(`⚠️ No ${config.label} data for Bin ${binId}`);
            window.BF_UIUpdater.updateSensorUI(sensorType, null, config);
            return;
        }

        // Calculate statistics
        const stats = window.BF_DataFetcher.calculateStatistics(dataPoints);

        // Update UI and chart
        window.BF_UIUpdater.updateSensorUI(sensorType, stats, config);
        window.BF_ChartManager.updateChart(sensorType, dataPoints, config);
        
        // Generate and display insights
        const insight = window.BF_InsightsGenerator.generateInsightMessage(sensorType, stats);
        window.BF_UIUpdater.updateInsightsText(sensorType, insight);
    }

    // ========================================
    // 🔄 UPDATE BIN FLUCTUATIONS DATA
    // ========================================
    async function updateBinFluctuationsData(binId) {
        console.log(`🔄 Loading Bin Fluctuations data for Bin ${binId}`);
        
        // Destroy all existing charts
        window.BF_ChartManager.destroyAllCharts();
        
        // Show loading state
        window.BF_UIUpdater.showLoadingState();
        
        // Fetch data
        const result = await window.BF_DataFetcher.fetchBinFluctuationsData(binId);
        
        if (!result.success) {
            window.BF_UIUpdater.showErrorState(result.error);
            return;
        }

        // Update all sensor sections
        updateSensorSection('temperature', binId, result.readings);
        updateSensorSection('soilMoisture', binId, result.readings);
        updateSensorSection('humidity', binId, result.readings);
        updateSensorSection('gasLevels', binId, result.readings);
        
        console.log(`✅ Bin Fluctuations updated for Bin ${binId}`);
    }

    // ========================================
    // 🚀 INITIALIZE
    // ========================================
    function initialize() {
        console.log('🎨 Bin Fluctuations Module: Initializing...');
        
        // Initialize navigation with callbacks
        window.BF_NavController.initBinFluctuationsNav(
            // Callback when bin changes
            (binId) => {
                updateBinFluctuationsData(binId);
            },
            // Callback when calendar button clicked
            () => {
                window.BF_DatePicker.showDateRangePicker();
            }
        );
        
        // Create date picker modal
        window.BF_DatePicker.createDateRangePickerModal();
        
        // Expose public API
        exposePublicAPI();
        
        console.log('✅ Bin Fluctuations Module initialized successfully!');
    }

    // ========================================
    // 🌍 EXPOSE PUBLIC API
    // ========================================
    function exposePublicAPI() {
        window.BinFluctuationsNav = {
            setCurrentBin: function(index) {
                const success = window.BF_State.setBinIndex(index);
                if (!success) {
                    console.warn(`Invalid bin index: ${index}`);
                    return;
                }
                
                const binDisplay = document.querySelector('.bf-nav-bin-display');
                if (binDisplay) {
                    binDisplay.textContent = window.BF_State.getCurrentBinName();
                }
                
                updateBinFluctuationsData(window.BF_State.getCurrentBinId());
            },
            
            getCurrentBin: function() {
                return window.BF_State.getCurrentBinId();
            },
            
            refresh: function() {
                updateBinFluctuationsData(window.BF_State.getCurrentBinId());
            },
            
            // Date picker functions
            showDatePicker: () => window.BF_DatePicker.showDateRangePicker(),
            closeDatePicker: () => window.BF_DatePicker.closeDatePicker(),
            setQuickDate: (range) => window.BF_DatePicker.setQuickDate(range),
            applyDateRange: () => {
                window.BF_DatePicker.applyDateRange(() => {
                    updateBinFluctuationsData(window.BF_State.getCurrentBinId());
                });
            }
        };
        
        console.log('✅ BinFluctuationsNav API exposed');
    }

    // ========================================
    // 🎬 AUTO-INITIALIZE
    // ========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();

console.log('✅ bin-fluctuations.js loaded');
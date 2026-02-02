// js/data_integration.js - AVONIC Data Integration Entry Point
// This file orchestrates all data services and exports them globally

/**
 * 🎯 MODULAR DATA INTEGRATION SYSTEM
 * 
 * This file imports and coordinates:
 * - API Client (auth, fetch wrapper)
 * - Sensor Service (data fetching, caching, UI updates)
 * - Device Service (device management)
 * - Chart Service (historical data)
 * - Chart Renderer (Chart.js visualization)
 * - Auto-refresh (polling system)
 * - Data Stats (calculations)
 * - Sensor Units (configuration)
 * 
 * All services are now modular and maintainable!
 */

console.log('🚀 Initializing AVONIC Data Integration System...');

// ====== Global Exports for Legacy Compatibility ======

// Export sensor service functions
window.fetchLatestSensorData = fetchLatestSensorData;

// Export chart functions
window.updateChart = updateChart;
window.initializeDashboardCharts = initializeDashboardCharts;

// Export device functions
window.fetchClaimedDevices = fetchClaimedDevices;
window.getFirstDevice = getFirstDevice;
window.getCurrentDeviceFromURL = getCurrentDeviceFromURL;

// Export refresh control
window.startAutoRefresh = startAutoRefresh;
window.stopAutoRefresh = stopAutoRefresh;

// Export utility functions
window.calculateStats = calculateStats;
window.groupByDate = groupByDate;
window.getSensorUnit = getSensorUnit;
window.getSensorPath = getSensorPath;

console.log('✅ Data integration system ready');
console.log('📦 Available services:');
console.log('  - API Client (auth, fetch)');
console.log('  - Sensor Service (fetch, cache, update)');
console.log('  - Device Service (device management)');
console.log('  - Chart Service (historical data)');
console.log('  - Chart Renderer (visualization)');
console.log('  - Auto-refresh (5s polling)');
console.log('  - Data Stats (calculations)');
console.log('  - Sensor Units (config)');
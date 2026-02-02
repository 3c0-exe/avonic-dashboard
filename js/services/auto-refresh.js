// services/auto-refresh.js - Auto-refresh Polling System

let refreshInterval = null;
let isInitialized = false;

/**
 * Start automatic sensor data refresh
 * Polls sensor data every 5 seconds
 */
function startAutoRefresh() {
  if (refreshInterval) {
    console.log('⚠️ Auto-refresh already running');
    return;
  }
  
  // Refresh sensor data every 5 seconds
  refreshInterval = setInterval(() => {
    fetchLatestSensorData();
  }, 5000);
  
  console.log('🔄 Auto-refresh started (5s interval)');
}

/**
 * Stop automatic sensor data refresh
 */
function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log('⏸️ Auto-refresh stopped');
  }
}

/**
 * Initialize data integration system
 * Starts initial data fetch and auto-refresh
 */
function initializeDataIntegration() {
  if (isInitialized) {
    console.log('⚠️ Data integration already initialized');
    return;
  }
  
  isInitialized = true;
  console.log('🚀 Initializing data integration...');
  
  // Initial load with slight delay to let page settle
  setTimeout(() => {
    fetchLatestSensorData(true); // Force refresh on init
    startAutoRefresh();
    
    // Load dashboard charts if on dashboard page
    if (window.location.hash === '#/dashboard') {
      setTimeout(initializeDashboardCharts, 500);
    }
  }, 100);
}

/**
 * Setup event listeners for manual refresh and navigation
 */
function setupEventListeners() {
  // Manual refresh button clicks
  document.addEventListener('click', (e) => {
    if (e.target.closest('.refresh-sensors') || e.target.closest('.insightsRefresh')) {
      fetchLatestSensorData(true); // Force refresh
      
      const timeElem = document.querySelector('.time-updated');
      if (timeElem) {
        timeElem.textContent = 'Refreshing...';
        timeElem.style.opacity = '1';
      }
    }
  });

  // Reload charts when navigating to dashboard
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#/dashboard') {
      setTimeout(initializeDashboardCharts, 500);
    }
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeDataIntegration();
    setupEventListeners();
  });
} else {
  initializeDataIntegration();
  setupEventListeners();
}

console.log('✅ Auto-refresh system loaded');
// js/dashboard-module.js - Dashboard Module Entry Point

/**
 * 📊 MODULAR DASHBOARD MODULE
 * 
 * This module orchestrates all dashboard components:
 * - Sensor configurations
 * - Worm condition evaluator
 * - Chart creation and rendering
 * - Insights and action management
 * - Modal controller
 * - Data fetching (real + dummy)
 * 
 * All components are now modular and maintainable!
 */

(function() {
    'use strict';

    console.log('🎨 Dashboard Module: Initializing...');

    /**
     * Initialize all dashboard sections with charts
     */
    function initializeDashboard() {
        const sensorSections = document.querySelectorAll('.dashboard-section[data-sensor]');
        console.log('📊 Found', sensorSections.length, 'sensor sections');
        
        sensorSections.forEach((section, index) => {
            const sensorType = section.dataset.sensor;
            console.log(`📈 Initializing chart ${index + 1}/${sensorSections.length}: ${sensorType}`);
            createDashboardChart(section, sensorType);
        });
        
        // Setup modal listeners
        setupDashboardModalListeners();
        
        console.log('✅ Dashboard Module initialized successfully!');
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDashboard);
    } else {
        initializeDashboard();
    }

})();

console.log('✅ dashboard-module.js loaded');
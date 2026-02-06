/* ========================================
   DASHBOARD CARD SELECTION - NAVIGATION LOGIC
   Version 2 - Fixed initialization & visibility control
   ======================================== */

(function() {
    'use strict';

    console.log('🎯 Dashboard Navigation Script Loading...');

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDashboardNavigation);
    } else {
        initDashboardNavigation();
    }

    function initDashboardNavigation() {
        console.log('🎯 Initializing Dashboard Card Selection Navigation');

        // Get elements
        const cardSelection = document.getElementById('dashboardCardSelection');
        const quickInsightsCard = document.querySelector('.dashboard-selection-card.quick-insights-card');
        const binFluctuationsCard = document.querySelector('.dashboard-selection-card.bin-fluctuations-card');
        
        const quickInsightsContent = document.getElementById('quickInsightsContent');
        const binFluctuationsContent = document.getElementById('binFluctuationsContent');
        
        const backBtnQI = document.getElementById('backToDashboardFromQI');
        const backBtnBF = document.getElementById('backToDashboardFromBF');

        // Check if all elements exist
        if (!cardSelection) {
            console.warn('⚠️ Dashboard card selection not found');
            return;
        }

        if (!quickInsightsCard || !binFluctuationsCard) {
            console.warn('⚠️ Dashboard cards not found');
            return;
        }

        console.log('✅ All dashboard elements found');

        // ========================================
        // INITIAL STATE - FORCE CARD SELECTION VISIBLE
        // ========================================
        
        function setInitialState() {
            console.log('🔄 Setting initial state - Card Selection visible');
            
            // Show card selection
            if (cardSelection) {
                cardSelection.style.display = 'flex';
                cardSelection.classList.remove('hidden');
            }
            
            // Hide Quick Insights
            if (quickInsightsContent) {
                quickInsightsContent.style.display = 'none';
                quickInsightsContent.classList.remove('active');
            }
            
            // Hide Bin Fluctuations
            if (binFluctuationsContent) {
                binFluctuationsContent.style.display = 'none';
                binFluctuationsContent.classList.remove('active');
                
                // Also hide the bin fluctuations nav
                const bfNav = document.getElementById('binFluctuationsNav');
                if (bfNav) {
                    bfNav.style.display = 'none';
                    bfNav.classList.remove('active');
                }
            }
            
            console.log('✅ Initial state set');
        }

        // ========================================
        // CARD CLICK HANDLERS
        // ========================================

        // Quick Insights Card Click
        if (quickInsightsCard) {
            quickInsightsCard.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('📊 Opening Quick Insights');
                showPage('quick-insights');
            });
        }

        // Bin Fluctuations Card Click
        if (binFluctuationsCard) {
            binFluctuationsCard.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('📈 Opening Bin Fluctuations');
                showPage('bin-fluctuations');
            });
        }

        // ========================================
        // BACK BUTTON HANDLERS
        // ========================================

        if (backBtnQI) {
            backBtnQI.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('⬅️ Back to Dashboard from Quick Insights');
                showPage('card-selection');
            });
        }

        if (backBtnBF) {
            backBtnBF.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('⬅️ Back to Dashboard from Bin Fluctuations');
                showPage('card-selection');
            });
        }

        // ========================================
        // PAGE DISPLAY LOGIC
        // ========================================

        function showPage(page) {
            console.log(`📄 Showing page: ${page}`);
            
            // STEP 1: Hide everything first
            if (cardSelection) {
                cardSelection.style.display = 'none';
                cardSelection.classList.add('hidden');
            }
            
            if (quickInsightsContent) {
                quickInsightsContent.style.display = 'none';
                quickInsightsContent.classList.remove('active');
            }
            
            if (binFluctuationsContent) {
                binFluctuationsContent.style.display = 'none';
                binFluctuationsContent.classList.remove('active');
                
                const bfNav = document.getElementById('binFluctuationsNav');
                if (bfNav) {
                    bfNav.style.display = 'none';
                    bfNav.classList.remove('active');
                }
            }

            // STEP 2: Show selected section
            switch(page) {
                case 'card-selection':
                    if (cardSelection) {
                        cardSelection.style.display = 'flex';
                        cardSelection.classList.remove('hidden');
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    console.log('✅ Card Selection displayed');
                    break;

                case 'quick-insights':
                    if (quickInsightsContent) {
                        quickInsightsContent.style.display = 'flex';
                        quickInsightsContent.classList.add('active');
                    }
                    
                    // Load Quick Insights data if function exists
                    if (typeof loadQuickInsightsData === 'function') {
                        console.log('📊 Loading Quick Insights data...');
                        setTimeout(() => loadQuickInsightsData(), 100);
                    }
                    
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    console.log('✅ Quick Insights displayed');
                    break;

                case 'bin-fluctuations':
                    if (binFluctuationsContent) {
                        binFluctuationsContent.style.display = 'block';
                        binFluctuationsContent.classList.add('active');
                        
                        // Show the bin fluctuations nav
                        const bfNav = document.getElementById('binFluctuationsNav');
                        if (bfNav) {
                            bfNav.style.display = 'grid';
                            bfNav.classList.add('active');
                        }
                    }
                    
                    // Load Bin Fluctuations data if function exists
                    if (typeof loadDashboard === 'function') {
                        console.log('📈 Loading Bin Fluctuations data...');
                        setTimeout(() => loadDashboard(), 100);
                    }
                    
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    console.log('✅ Bin Fluctuations displayed');
                    break;
                    
                default:
                    console.warn(`⚠️ Unknown page: ${page}`);
                    showPage('card-selection');
            }
        }

        // ========================================
        // INITIALIZE
        // ========================================

        // Set initial state immediately
        setInitialState();
        
        // Also set initial state after a short delay (safety check)
        setTimeout(setInitialState, 100);

        console.log('✅ Dashboard Card Selection Navigation initialized');
        
        // Expose showPage function globally for debugging
        window.dashboardShowPage = showPage;
    }

})();

console.log('✅ Dashboard Navigation Script Loaded');
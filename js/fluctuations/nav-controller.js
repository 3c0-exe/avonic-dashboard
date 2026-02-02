// ========================================
// BIN FLUCTUATIONS - NAVIGATION CONTROLLER
// js/fluctuations/nav-controller.js
// ========================================

/**
 * Initialize navigation controls
 * @param {Function} onBinChange - Callback when bin changes
 * @param {Function} onCalendarClick - Callback when calendar button clicked
 */
function initBinFluctuationsNav(onBinChange, onCalendarClick) {
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
                
                // Trigger callback with current bin
                if (onBinChange) {
                    onBinChange(window.BF_State.getCurrentBinId());
                }
            } else {
                nav.classList.remove('active');
                nav.style.display = 'none';
            }
        });
    });

    // Left arrow - previous bin
    if (leftArrow) {
        leftArrow.addEventListener('click', function() {
            const newBinName = window.BF_State.previousBin();
            if (binDisplay) binDisplay.textContent = newBinName;
            
            console.log(`✅ Switched to ${newBinName}`);
            
            if (onBinChange) {
                onBinChange(window.BF_State.getCurrentBinId());
            }
        });
    }

    // Right arrow - next bin
    if (rightArrow) {
        rightArrow.addEventListener('click', function() {
            const newBinName = window.BF_State.nextBin();
            if (binDisplay) binDisplay.textContent = newBinName;
            
            console.log(`✅ Switched to ${newBinName}`);
            
            if (onBinChange) {
                onBinChange(window.BF_State.getCurrentBinId());
            }
        });
    }

    // Calendar button
    if (calendarBtn) {
        calendarBtn.addEventListener('click', function() {
            console.log('📅 Calendar button clicked');
            if (onCalendarClick) {
                onCalendarClick();
            }
        });
    }

    console.log('✅ Bin Fluctuations Nav initialized');
}

/**
 * Update the date range display in the nav bar
 * @param {string} text - Text to display
 */
function updateDateRangeDisplay(text) {
    const dateDisplay = document.getElementById('bf-nav-date-text');
    if (dateDisplay) {
        dateDisplay.textContent = text;
    }
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDateForDisplay(date) {
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.BF_NavController = {
        initBinFluctuationsNav,
        updateDateRangeDisplay,
        formatDateForDisplay
    };
}

console.log('✅ Bin Fluctuations navigation controller loaded');
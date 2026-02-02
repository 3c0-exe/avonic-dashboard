// ========================================
// BIN FLUCTUATIONS - DATE PICKER
// js/fluctuations/date-picker.js
// ========================================

/**
 * Create date range picker modal
 */
function createDateRangePickerModal() {
    // Check if modal already exists
    if (document.getElementById('date-range-modal')) {
        console.log('📅 Date range picker already exists');
        return;
    }

    const modalHTML = `
        <div id="date-range-modal" class="date-modal-overlay" style="display: none;">
            <div class="date-modal-container">
                <div class="date-modal-header">
                    <h2>Select Date Range</h2>
                    <button class="date-modal-close" onclick="window.BF_DatePicker.closeDatePicker()">×</button>
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
                            <button class="date-quick-btn" onclick="window.BF_DatePicker.setQuickDate('today')">Today</button>
                            <button class="date-quick-btn" onclick="window.BF_DatePicker.setQuickDate('week')">Last 7 Days</button>
                            <button class="date-quick-btn" onclick="window.BF_DatePicker.setQuickDate('month')">Last 30 Days</button>
                            <button class="date-quick-btn" onclick="window.BF_DatePicker.setQuickDate('all')">All Time</button>
                        </div>
                    </div>
                </div>
                
                <div class="date-modal-footer">
                    <button class="date-btn date-btn-secondary" onclick="window.BF_DatePicker.closeDatePicker()">Cancel</button>
                    <button class="date-btn date-btn-primary" onclick="window.BF_DatePicker.applyDateRange()">Apply</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    addDatePickerStyles();

    console.log('📅 Date range picker modal created');
}

/**
 * Add CSS styles for date picker
 */
function addDatePickerStyles() {
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
}

/**
 * Show date range picker modal
 */
function showDateRangePicker() {
    const modal = document.getElementById('date-range-modal');
    if (!modal) return;

    // Set current values if any
    const startInput = document.getElementById('start-date-input');
    const endInput = document.getElementById('end-date-input');

    if (window.BF_State.startDate) {
        startInput.value = window.BF_State.startDate.toISOString().split('T')[0];
    }
    if (window.BF_State.endDate) {
        endInput.value = window.BF_State.endDate.toISOString().split('T')[0];
    }

    modal.style.display = 'flex';
}

/**
 * Close date picker modal
 */
function closeDatePicker() {
    const modal = document.getElementById('date-range-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Set quick date range
 * @param {string} range - Range type (today, week, month, all)
 */
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

/**
 * Apply date range and trigger data refresh
 * @param {Function} onApplyCallback - Callback to refresh data
 */
function applyDateRange(onApplyCallback) {
    const startInput = document.getElementById('start-date-input');
    const endInput = document.getElementById('end-date-input');

    if (!startInput.value || !endInput.value) {
        // Reset to all time
        window.BF_State.clearDateRange();
        window.BF_NavController.updateDateRangeDisplay('All Time');
    } else {
        const success = window.BF_State.setDateRange(startInput.value, endInput.value);
        
        if (!success) {
            alert('Invalid date range');
            return;
        }

        if (window.BF_State.startDate > window.BF_State.endDate) {
            alert('Start date must be before end date');
            return;
        }

        const displayText = `${window.BF_NavController.formatDateForDisplay(window.BF_State.startDate)} - ${window.BF_NavController.formatDateForDisplay(window.BF_State.endDate)}`;
        window.BF_NavController.updateDateRangeDisplay(displayText);
    }

    closeDatePicker();
    
    // Trigger callback to refresh data
    if (onApplyCallback) {
        onApplyCallback();
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.BF_DatePicker = {
        createDateRangePickerModal,
        showDateRangePicker,
        closeDatePicker,
        setQuickDate,
        applyDateRange
    };
}

console.log('✅ Bin Fluctuations date picker loaded');
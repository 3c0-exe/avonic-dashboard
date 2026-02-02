// ========================================
// BIN FLUCTUATIONS - STATE MANAGER
// js/fluctuations/state-manager.js
// ========================================

const BF_State = {
    // Bin state
    currentBinIndex: 0,
    bins: ['Bin 1', 'Bin 2'],
    
    // Date range state
    startDate: null,
    endDate: null,
    isDateRangeActive: false,
    
    // Chart instances storage
    chartInstances: {},
    
    // Getters
    getCurrentBinId() {
        return this.currentBinIndex + 1;
    },
    
    getCurrentBinName() {
        return this.bins[this.currentBinIndex];
    },
    
    // Setters
    setBinIndex(index) {
        if (index >= 0 && index < this.bins.length) {
            this.currentBinIndex = index;
            return true;
        }
        return false;
    },
    
    nextBin() {
        this.currentBinIndex = (this.currentBinIndex + 1) % this.bins.length;
        return this.getCurrentBinName();
    },
    
    previousBin() {
        this.currentBinIndex = (this.currentBinIndex - 1 + this.bins.length) % this.bins.length;
        return this.getCurrentBinName();
    },
    
    // Date range methods
    setDateRange(start, end) {
        if (start && end) {
            this.startDate = new Date(start);
            this.startDate.setHours(0, 0, 0, 0);
            
            this.endDate = new Date(end);
            this.endDate.setHours(23, 59, 59, 999);
            
            this.isDateRangeActive = true;
            return true;
        }
        return false;
    },
    
    clearDateRange() {
        this.startDate = null;
        this.endDate = null;
        this.isDateRangeActive = false;
    },
    
    getDateRangeParams() {
        if (!this.isDateRangeActive || !this.startDate || !this.endDate) {
            return null;
        }
        return {
            startDate: this.startDate.toISOString(),
            endDate: this.endDate.toISOString()
        };
    },
    
    // Chart management
    storeChart(sensorType, chartInstance) {
        this.chartInstances[sensorType] = chartInstance;
    },
    
    getChart(sensorType) {
        return this.chartInstances[sensorType] || null;
    },
    
    destroyChart(sensorType) {
        if (this.chartInstances[sensorType]) {
            this.chartInstances[sensorType].destroy();
            delete this.chartInstances[sensorType];
        }
    },
    
    destroyAllCharts() {
        Object.keys(this.chartInstances).forEach(key => {
            if (this.chartInstances[key]) {
                this.chartInstances[key].destroy();
                delete this.chartInstances[key];
            }
        });
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.BF_State = BF_State;
}

console.log('✅ Bin Fluctuations state manager loaded');
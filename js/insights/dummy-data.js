// ========================================
// QUICK INSIGHTS - DUMMY DATA (Fallback)
// js/insights/dummy-data.js
// ========================================

const QI_DUMMY_READINGS = {
    '1': { // Bin 1
        temperature: [
            { time: '10:00 AM', value: 31.2, status: 'Normal', timestamp: new Date() },
            { time: '10:10 AM', value: 35.8, status: 'High', timestamp: new Date() },
            { time: '10:20 AM', value: 28.5, status: 'Normal', timestamp: new Date() },
            { time: '10:30 AM', value: 32.1, status: 'Normal', timestamp: new Date() },
            { time: '10:40 AM', value: 29.7, status: 'Normal', timestamp: new Date() },
            { time: '10:50 AM', value: 33.4, status: 'Normal', timestamp: new Date() },
            { time: '11:00 AM', value: 36.2, status: 'High', timestamp: new Date() },
            { time: '11:10 AM', value: 31.8, status: 'Normal', timestamp: new Date() }
        ],
        soilMoisture: [
            { time: '10:00 AM', value: 75, status: 'Normal', timestamp: new Date() },
            { time: '10:10 AM', value: 82, status: 'High', timestamp: new Date() },
            { time: '10:20 AM', value: 68, status: 'Normal', timestamp: new Date() },
            { time: '10:30 AM', value: 71, status: 'Normal', timestamp: new Date() },
            { time: '10:40 AM', value: 79, status: 'Normal', timestamp: new Date() },
            { time: '10:50 AM', value: 65, status: 'Normal', timestamp: new Date() },
            { time: '11:00 AM', value: 88, status: 'High', timestamp: new Date() },
            { time: '11:10 AM', value: 73, status: 'Normal', timestamp: new Date() }
        ],
        humidity: [
            { time: '10:00 AM', value: 72, status: 'Normal', timestamp: new Date() },
            { time: '10:10 AM', value: 85, status: 'High', timestamp: new Date() },
            { time: '10:20 AM', value: 68, status: 'Normal', timestamp: new Date() },
            { time: '10:30 AM', value: 74, status: 'Normal', timestamp: new Date() },
            { time: '10:40 AM', value: 70, status: 'Normal', timestamp: new Date() },
            { time: '10:50 AM', value: 77, status: 'Normal', timestamp: new Date() },
            { time: '11:00 AM', value: 89, status: 'High', timestamp: new Date() },
            { time: '11:10 AM', value: 71, status: 'Normal', timestamp: new Date() }
        ],
        gasLevels: [
            { time: '10:00 AM', value: 45, status: 'Normal', timestamp: new Date() },
            { time: '10:10 AM', value: 120, status: 'High', timestamp: new Date() },
            { time: '10:20 AM', value: 38, status: 'Normal', timestamp: new Date() },
            { time: '10:30 AM', value: 52, status: 'Normal', timestamp: new Date() },
            { time: '10:40 AM', value: 47, status: 'Normal', timestamp: new Date() },
            { time: '10:50 AM', value: 61, status: 'Normal', timestamp: new Date() },
            { time: '11:00 AM', value: 135, status: 'High', timestamp: new Date() },
            { time: '11:10 AM', value: 49, status: 'Normal', timestamp: new Date() }
        ]
    },
    '2': { // Bin 2
        temperature: [
            { time: '10:00 AM', value: 28.5, status: 'Normal', timestamp: new Date() },
            { time: '10:10 AM', value: 32.1, status: 'Normal', timestamp: new Date() },
            { time: '10:20 AM', value: 29.8, status: 'Normal', timestamp: new Date() },
            { time: '10:30 AM', value: 31.4, status: 'Normal', timestamp: new Date() },
            { time: '10:40 AM', value: 27.9, status: 'Normal', timestamp: new Date() },
            { time: '10:50 AM', value: 30.2, status: 'Normal', timestamp: new Date() },
            { time: '11:00 AM', value: 33.7, status: 'Normal', timestamp: new Date() },
            { time: '11:10 AM', value: 29.1, status: 'Normal', timestamp: new Date() }
        ],
        soilMoisture: [
            { time: '10:00 AM', value: 70, status: 'Normal', timestamp: new Date() },
            { time: '10:10 AM', value: 76, status: 'Normal', timestamp: new Date() },
            { time: '10:20 AM', value: 68, status: 'Normal', timestamp: new Date() },
            { time: '10:30 AM', value: 72, status: 'Normal', timestamp: new Date() },
            { time: '10:40 AM', value: 74, status: 'Normal', timestamp: new Date() },
            { time: '10:50 AM', value: 69, status: 'Normal', timestamp: new Date() },
            { time: '11:00 AM', value: 77, status: 'Normal', timestamp: new Date() },
            { time: '11:10 AM', value: 71, status: 'Normal', timestamp: new Date() }
        ],
        humidity: [
            { time: '10:00 AM', value: 68, status: 'Normal', timestamp: new Date() },
            { time: '10:10 AM', value: 73, status: 'Normal', timestamp: new Date() },
            { time: '10:20 AM', value: 66, status: 'Normal', timestamp: new Date() },
            { time: '10:30 AM', value: 71, status: 'Normal', timestamp: new Date() },
            { time: '10:40 AM', value: 69, status: 'Normal', timestamp: new Date() },
            { time: '10:50 AM', value: 74, status: 'Normal', timestamp: new Date() },
            { time: '11:00 AM', value: 72, status: 'Normal', timestamp: new Date() },
            { time: '11:10 AM', value: 70, status: 'Normal', timestamp: new Date() }
        ],
        gasLevels: [
            { time: '10:00 AM', value: 42, status: 'Normal', timestamp: new Date() },
            { time: '10:10 AM', value: 55, status: 'Normal', timestamp: new Date() },
            { time: '10:20 AM', value: 38, status: 'Normal', timestamp: new Date() },
            { time: '10:30 AM', value: 47, status: 'Normal', timestamp: new Date() },
            { time: '10:40 AM', value: 51, status: 'Normal', timestamp: new Date() },
            { time: '10:50 AM', value: 44, status: 'Normal', timestamp: new Date() },
            { time: '11:00 AM', value: 59, status: 'Normal', timestamp: new Date() },
            { time: '11:10 AM', value: 46, status: 'Normal', timestamp: new Date() }
        ]
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.QI_DUMMY_READINGS = QI_DUMMY_READINGS;
}

console.log('✅ Quick Insights dummy data loaded');
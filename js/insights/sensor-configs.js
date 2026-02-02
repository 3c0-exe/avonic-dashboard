// ========================================
// QUICK INSIGHTS - SENSOR CONFIGURATIONS
// js/insights/sensor-configs.js
// ========================================

const QI_SENSOR_CONFIGS = {
    temperature: {
        unit: '°C',
        label: 'Temperature',
        icon: 'img/icons/sensorIcons/TempIcon.svg',
        dbKey: 'temp'
    },
    soilMoisture: {
        unit: '%',
        label: 'Soil Moisture',
        icon: 'img/icons/sensorIcons/SoilMoistureIcon.svg',
        dbKey: 'soil'
    },
    humidity: {
        unit: '%',
        label: 'Humidity',
        icon: 'img/icons/sensorIcons/HumidityIcon.svg',
        dbKey: 'humidity'
    },
    gasLevels: {
        unit: 'ppm',
        label: 'Gas Levels',
        icon: 'img/icons/sensorIcons/GasIcon.svg',
        dbKey: 'gas'
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.QI_SENSOR_CONFIGS = QI_SENSOR_CONFIGS;
}

console.log('✅ Quick Insights sensor configurations loaded');
// ========================================
// BIN FLUCTUATIONS - SENSOR CONFIGURATIONS
// js/fluctuations/sensor-configs.js
// ========================================

const BF_SENSOR_CONFIGS = {
    temperature: {
        unit: '°C',
        label: 'Temperature',
        icon: 'img/icons/sensorIcons/TempIcon.svg',
        color: 'rgba(255, 99, 132, 1)',
        bgColor: 'rgba(255, 99, 132, 0.2)',
        dbKey: 'temp'
    },
    soilMoisture: {
        unit: '%',
        label: 'Soil Moisture',
        icon: 'img/icons/sensorIcons/SoilMoistureIcon.svg',
        color: 'rgba(54, 162, 235, 1)',
        bgColor: 'rgba(54, 162, 235, 0.2)',
        dbKey: 'soil'
    },
    humidity: {
        unit: '%',
        label: 'Humidity',
        icon: 'img/icons/sensorIcons/HumidityIcon.svg',
        color: 'rgba(75, 192, 192, 1)',
        bgColor: 'rgba(75, 192, 192, 0.2)',
        dbKey: 'humidity'
    },
    gasLevels: {
        unit: 'ppm',
        label: 'Gas Levels',
        icon: 'img/icons/sensorIcons/GasIcon.svg',
        color: 'rgba(255, 206, 86, 1)',
        bgColor: 'rgba(255, 206, 86, 0.2)',
        dbKey: 'gas'
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.BF_SENSOR_CONFIGS = BF_SENSOR_CONFIGS;
}

console.log('✅ Bin Fluctuations sensor configurations loaded');
// dashboard/sensor-configs.js - Sensor Configurations

/**
 * Sensor configuration for dashboard charts
 * Defines min/max values, units, and chart settings
 */
const DASHBOARD_SENSOR_CONFIGS = {
    temperature: {
        unit: '°C',
        minValue: 15,
        maxValue: 35,
        chartMaxValue: 40,
        useDummyData: false
    },
    soilMoisture: {
        unit: '%',
        minValue: 70,
        maxValue: 95,
        chartMaxValue: 100,
        useDummyData: false
    },
    humidity: {
        unit: '%',
        minValue: 70,
        maxValue: 95,
        chartMaxValue: 100,
        useDummyData: false
    },
    gasLevels: {
        unit: 'ppm',
        minValue: 0,
        maxValue: 200,
        chartMaxValue: 250,
        useDummyData: false
    }
};

/**
 * African Nightcrawler optimal environmental ranges
 * Used for condition evaluation and insights
 */
const DASHBOARD_WORM_CONDITIONS = {
    temperature: {
        optimal_min: 22,
        optimal_max: 28,
        critical_min: 15,
        critical_max: 35,
        unit: '°C'
    },
    soilMoisture: {
        optimal_min: 60,
        optimal_max: 80,
        critical_min: 40,
        critical_max: 90,
        unit: '%'
    },
    humidity: {
        optimal_min: 60,
        optimal_max: 80,
        critical_min: 40,
        critical_max: 90,
        unit: '%'
    },
    gasLevels: {
        optimal_min: 0,
        optimal_max: 100,
        critical_max: 200,
        unit: 'ppm'
    }
};

console.log('✅ Dashboard sensor configurations loaded');
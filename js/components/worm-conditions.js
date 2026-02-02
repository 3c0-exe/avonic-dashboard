// ========================================
// 🪱 WORM CONDITIONS & SENSOR CONFIGURATION
// ========================================

// Used for generating realistic random data limits
const SENSOR_CONFIGS = {
    temperature: { title: 'Temperature', unit: '°C', minValue: 15, maxValue: 40 },
    soilMoisture: { title: 'Soil Moisture', unit: '%', minValue: 30, maxValue: 100 },
    humidity: { title: 'Humidity', unit: '%', minValue: 30, maxValue: 100 },
    gasLevels: { title: 'Gas Levels', unit: 'ppm', minValue: 0, maxValue: 250 }
};

// 🪱 AFRICAN NIGHTCRAWLER RANGES (Exact Match)
const WORM_CONDITIONS = {
    temperature: {
        optimal_min: 22, optimal_max: 28,
        critical_min: 15, critical_max: 35
    },
    soilMoisture: {
        optimal_min: 60, optimal_max: 80,
        critical_min: 40, critical_max: 90
    },
    humidity: {
        optimal_min: 60, optimal_max: 80,
        critical_min: 40, critical_max: 90
    },
    gasLevels: {
        optimal_min: 0, optimal_max: 100,
        critical_max: 200
    }
};

// ========================================
// 🎨 EVALUATE CONDITION LOGIC
// ========================================
function evaluateCondition(sensorType, value) {
    // Safety check: if sensor type doesn't exist, return default
    if (!WORM_CONDITIONS[sensorType]) {
        return { status: 'Unknown', statusClass: 'warning', wormImage: 'Normal.png' };
    }

    const ranges = WORM_CONDITIONS[sensorType];
    let status = 'Optimal';
    let statusClass = 'optimal'; // optimal (green), warning (orange), critical (red)
    let wormImage = 'Normal.png';

    switch(sensorType) {
        // --- TEMPERATURE ---
        case 'temperature':
            if (value < ranges.critical_min) {
                status = 'Critically Cold';
                statusClass = 'critical';
                wormImage = 'Too Dry.png'; // Using provided mapping for cold
            } else if (value < ranges.optimal_min) {
                status = 'Too Cold';
                statusClass = 'warning';
                wormImage = 'Too Dry.png';
            } else if (value > ranges.critical_max) {
                status = 'Critically Hot';
                statusClass = 'critical';
                wormImage = 'Too Hot.png';
            } else if (value > ranges.optimal_max) {
                status = 'Too Hot';
                statusClass = 'warning';
                wormImage = 'Too Hot.png';
            }
            break;

        // --- SOIL MOISTURE & HUMIDITY ---
        case 'soilMoisture':
        case 'humidity':
            if (value < ranges.critical_min) {
                status = 'Critically Dry';
                statusClass = 'critical';
                wormImage = 'Too Dry.png';
            } else if (value < ranges.optimal_min) {
                status = 'Dry';
                statusClass = 'warning';
                wormImage = 'Too Dry.png';
            } else if (value > ranges.critical_max) {
                status = 'Critically Wet';
                statusClass = 'critical';
                wormImage = 'Too Wet.png';
            } else if (value > ranges.optimal_max) {
                status = 'Wet';
                statusClass = 'warning';
                wormImage = 'Too Wet.png';
            }
            break;

        // --- GAS LEVELS ---
        case 'gasLevels':
            if (value > ranges.critical_max) {
                status = 'Toxic Gas';
                statusClass = 'critical';
                wormImage = 'Gas Too High.png';
            } else if (value > ranges.optimal_max) {
                status = 'High Gas';
                statusClass = 'warning';
                wormImage = 'Gas Too High.png';
            }
            break;
    }

    // Default return (Optimal) if no conditions met
    return { status, statusClass, wormImage };
}

console.log('✅ Worm conditions evaluator loaded');
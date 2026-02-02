// dashboard/worm-evaluator.js - Worm Condition Evaluator

/**
 * Evaluate worm living conditions based on sensor readings
 * @param {string} sensorType - Type of sensor (temperature, soilMoisture, humidity, gasLevels)
 * @param {number} averageValue - Average sensor reading
 * @returns {Object} { condition, clipart, insight }
 */
function evaluateWormCondition(sensorType, averageValue) {
    const ranges = DASHBOARD_WORM_CONDITIONS[sensorType];
    
    if (!ranges) return { condition: 'normal', clipart: 'normal', insight: 'No data available.' };
    
    let condition = 'normal';
    let clipart = 'normal';
    let insight = '';
    
    switch(sensorType) {
        case 'temperature':
            if (averageValue < ranges.critical_min) {
                condition = 'too-cold';
                clipart = 'too-dry';
                insight = `⚠️ CRITICAL: Temperature is dangerously low at ${averageValue}°C. African Nightcrawlers become inactive below ${ranges.critical_min}°C and may die from cold stress.\n\n🔧 Actions:\n• Move worms to warmer location immediately\n• Add insulation or heating mat\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}°C`;
            } else if (averageValue < ranges.optimal_min) {
                condition = 'sub-optimal-cold';
                clipart = 'too-dry';
                insight = `⚠️ Temperature is below optimal at ${averageValue}°C. Worms are less active and reproduction slows down.\n\n🔧 Actions:\n• Consider adding heat source\n• Monitor for further drops\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}°C`;
            } else if (averageValue > ranges.critical_max) {
                condition = 'too-hot';
                clipart = 'too-hot';
                insight = `🔥 CRITICAL: Temperature is dangerously high at ${averageValue}°C! African Nightcrawlers will die above ${ranges.critical_max}°C.\n\n🔧 URGENT Actions:\n• Move bin to cooler location NOW\n• Add ventilation or fans\n• Never expose to direct sunlight\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}°C`;
            } else if (averageValue > ranges.optimal_max) {
                condition = 'sub-optimal-hot';
                clipart = 'too-hot';
                insight = `⚠️ Temperature is above optimal at ${averageValue}°C. Worms are stressed and may try to escape.\n\n🔧 Actions:\n• Improve ventilation\n• Move to cooler area\n• Avoid direct heat sources\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}°C`;
            } else {
                condition = 'normal';
                clipart = 'normal';
                insight = `✅ Temperature is perfect at ${averageValue}°C! Worms are thriving in optimal conditions (${ranges.optimal_min}-${ranges.optimal_max}°C). Keep up the great work!`;
            }
            break;
            
        case 'soilMoisture':
            if (averageValue < ranges.critical_min) {
                condition = 'too-dry';
                clipart = 'too-dry';
                insight = `⚠️ CRITICAL: Soil is too dry at ${averageValue}%. Worms will die from dehydration below ${ranges.critical_min}%.\n\n🔧 URGENT Actions:\n• Add water immediately\n• Spray bedding evenly\n• Check drainage system\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}%`;
            } else if (averageValue < ranges.optimal_min) {
                condition = 'sub-optimal-dry';
                clipart = 'too-dry';
                insight = `⚠️ Soil moisture is low at ${averageValue}%. Worms may become stressed and less active.\n\n🔧 Actions:\n• Add moisture gradually\n• Use spray bottle for even distribution\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}%`;
            } else if (averageValue > ranges.critical_max) {
                condition = 'too-wet';
                clipart = 'too-wet';
                insight = `💧 CRITICAL: Soil is too wet at ${averageValue}%! Risk of drowning and anaerobic conditions above ${ranges.critical_max}%.\n\n🔧 URGENT Actions:\n• Stop adding water\n• Add dry bedding material\n• Improve drainage and aeration\n• Turn bedding to increase airflow\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}%`;
            } else if (averageValue > ranges.optimal_max) {
                condition = 'sub-optimal-wet';
                clipart = 'too-wet';
                insight = `⚠️ Soil moisture is high at ${averageValue}%. Risk of anaerobic conditions developing.\n\n🔧 Actions:\n• Reduce watering frequency\n• Add dry bedding\n• Improve ventilation\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}%`;
            } else {
                condition = 'normal';
                clipart = 'normal';
                insight = `✅ Soil moisture is perfect at ${averageValue}%! Bedding has ideal consistency (${ranges.optimal_min}-${ranges.optimal_max}%). Worms are happy!`;
            }
            break;
            
        case 'humidity':
            if (averageValue < ranges.critical_min) {
                condition = 'too-dry';
                clipart = 'too-dry';
                insight = `⚠️ CRITICAL: Humidity is too low at ${averageValue}%. Worms' skin will dry out below ${ranges.critical_min}%.\n\n🔧 URGENT Actions:\n• Mist the bin regularly\n• Cover bin to retain moisture\n• Check ventilation (may be too much)\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}%`;
            } else if (averageValue < ranges.optimal_min) {
                condition = 'sub-optimal-dry';
                clipart = 'too-dry';
                insight = `⚠️ Humidity is low at ${averageValue}%. Worms may experience mild stress.\n\n🔧 Actions:\n• Increase misting frequency\n• Reduce ventilation slightly\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}%`;
            } else if (averageValue > ranges.critical_max) {
                condition = 'too-wet';
                clipart = 'too-wet';
                insight = `💧 CRITICAL: Humidity is too high at ${averageValue}%! Risk of mold and pest problems above ${ranges.critical_max}%.\n\n🔧 URGENT Actions:\n• Increase ventilation immediately\n• Add dry bedding\n• Check for water pooling\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}%`;
            } else if (averageValue > ranges.optimal_max) {
                condition = 'sub-optimal-wet';
                clipart = 'too-wet';
                insight = `⚠️ Humidity is high at ${averageValue}%. Monitor for mold development.\n\n🔧 Actions:\n• Improve air circulation\n• Reduce watering\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}%`;
            } else {
                condition = 'normal';
                clipart = 'normal';
                insight = `✅ Humidity is perfect at ${averageValue}%! Air moisture is ideal (${ranges.optimal_min}-${ranges.optimal_max}%). Conditions are excellent!`;
            }
            break;
            
        case 'gasLevels':
            if (averageValue > ranges.critical_max) {
                condition = 'gas-too-high';
                clipart = 'gas-high';
                insight = `☠️ CRITICAL: Ammonia levels are toxic at ${averageValue} ppm! Levels above ${ranges.critical_max} ppm will kill worms.\n\n🔧 URGENT Actions:\n• Stop feeding immediately\n• Turn bedding to release gases\n• Add carbon-rich material (shredded paper/cardboard)\n• Increase ventilation\n• Remove any rotting food\n• Safe range: Below ${ranges.optimal_max} ppm`;
            } else if (averageValue > ranges.optimal_max) {
                condition = 'gas-elevated';
                clipart = 'gas-high';
                insight = `⚠️ Ammonia levels are elevated at ${averageValue} ppm. Worms are experiencing stress.\n\n🔧 Actions:\n• Reduce protein-rich food\n• Add more carbon material\n• Improve aeration by turning bedding\n• Safe range: Below ${ranges.optimal_max} ppm`;
            } else {
                condition = 'normal';
                clipart = 'normal';
                insight = `✅ Gas levels are safe at ${averageValue} ppm! Ammonia is well-controlled (below ${ranges.optimal_max} ppm). Bin chemistry is balanced!`;
            }
            break;
    }
    
    return { condition, clipart, insight };
}

/**
 * Update worm clipart image based on condition
 * @param {HTMLElement} section - Dashboard section element
 * @param {string} clipartCondition - Condition name (normal, too-hot, too-dry, too-wet, gas-high)
 */
function updateWormClipart(section, clipartCondition) {
    const wormList = section.querySelector('.dashboard-worm-clipart ul');
    
    if (!wormList) {
        console.error('❌ Worm clipart container not found in section!');
        return;
    }
    
    // Hide all cliparts
    const allCliparts = wormList.querySelectorAll('li');
    allCliparts.forEach(li => {
        li.style.display = 'none';
    });
    
    // Show the target clipart
    const targetClipart = wormList.querySelector(`[data-condition="${clipartCondition}"]`);
    
    if (targetClipart) {
        targetClipart.style.display = 'block';
        console.log('✅ Worm clipart updated:', clipartCondition);
    } else {
        console.error('❌ Clipart not found:', clipartCondition);
    }
}

console.log('✅ Worm condition evaluator loaded');
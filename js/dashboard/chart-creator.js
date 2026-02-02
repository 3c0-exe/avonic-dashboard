// dashboard/chart-creator.js - Dashboard Chart Creator

/**
 * Update average value display and evaluate worm condition
 * @param {HTMLElement} section - Dashboard section element
 * @param {Array<number>} values - Array of sensor values
 * @param {string} sensorType - Sensor type
 * @returns {string} Rounded average value
 */
function updateDashboardAverage(section, values, sensorType) {
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const roundedAverage = average.toFixed(1);
    
    const avgValueElement = section.querySelector('.dashboard-average-value');
    const avgUnitElement = section.querySelector('.dashboard-average-unit');
    
    if (avgValueElement) {
        avgValueElement.textContent = roundedAverage;
    }
    
    const config = DASHBOARD_SENSOR_CONFIGS[sensorType];
    if (avgUnitElement) {
        avgUnitElement.textContent = config.unit;
    }
    
    // Evaluate worm condition
    const evaluation = evaluateWormCondition(sensorType, parseFloat(roundedAverage));
    
    updateWormClipart(section, evaluation.clipart);
    updateInsights(section, evaluation.insight);
    
    return roundedAverage;
}

/**
 * Create Chart.js chart for dashboard section
 * @param {HTMLElement} section - Dashboard section element
 * @param {string} sensorType - Sensor type
 * @returns {Promise<Chart|null>} Chart instance or null
 */
async function createDashboardChart(section, sensorType) {
    const canvas = section.querySelector('.dashboard-chart-canvas');
    if (!canvas) {
        console.error('❌ Canvas not found in section');
        return null;
    }
    
    const config = DASHBOARD_SENSOR_CONFIGS[sensorType];

    let chartData = null;

    // Try to fetch real data if not using dummy data
    if (!config.useDummyData) {
        chartData = await fetchRealSensorData(sensorType);
    }

    // Fallback to dummy data if fetch failed or useDummyData is true
    if (!chartData) {
        chartData = generateDummyData(config);
    }
    
    // Update average and condition
    updateDashboardAverage(section, chartData.values, sensorType);

    const data = {
        labels: chartData.labels,
        datasets: [{
            data: chartData.values,
            backgroundColor: '#f4c542',
            borderColor: '#333',
            borderWidth: 2,
            borderRadius: 8,
            barThickness: 32
        }]
    };

    const chartConfig = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 30
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: config.chartMaxValue,
                    display: false,
                    grid: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: true,
                        borderColor: '#333',
                        borderWidth: 2
                    },
                    ticks: {
                        color: '#333',
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            categoryPercentage: 1.0,
            barPercentage: 0.7
        },
        plugins: [{
            id: 'customDataLabels',
            afterDatasetsDraw: function(chart) {
                const ctx = chart.ctx;
                chart.data.datasets.forEach((dataset, i) => {
                    const meta = chart.getDatasetMeta(i);
                    meta.data.forEach((bar, index) => {
                        const data = dataset.data[index];
                        ctx.fillStyle = '#333';
                        ctx.font = 'bold 14px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';
                        ctx.fillText(data + config.unit, bar.x, bar.y - 8);
                    });
                });
            }
        }]
    };

    return new Chart(canvas, chartConfig);
}

console.log('✅ Dashboard chart creator loaded');
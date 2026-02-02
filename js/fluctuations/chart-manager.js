// ========================================
// BIN FLUCTUATIONS - CHART MANAGER
// js/fluctuations/chart-manager.js
// ========================================

/**
 * Update chart with real data
 * @param {string} sensorType - Sensor type
 * @param {Array} dataPoints - Array of {value, timestamp}
 * @param {Object} config - Sensor configuration
 */
function updateChart(sensorType, dataPoints, config) {
    const sensorSection = document.querySelector(`.dashboard-section[data-sensor="${sensorType}"]`);
    if (!sensorSection) {
        console.warn(`⚠️ Could not find section for ${sensorType}`);
        return;
    }

    const canvas = sensorSection.querySelector('.dashboard-chart-canvas');
    if (!canvas) {
        console.warn(`⚠️ Could not find canvas for ${sensorType}`);
        return;
    }

    // Destroy existing chart
    destroyChartOnCanvas(canvas, sensorType);

    const ctx = canvas.getContext('2d');

    // Take the most recent 20 points for display
    const chartData = dataPoints.slice(-20);

    // Prepare chart data
    const labels = chartData.map(point => {
        const date = point.timestamp;
        return date.toLocaleString('en-US', { 
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    });

    const values = chartData.map(point => point.value);

    // Create new chart
    const chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: config.label,
                data: values,
                backgroundColor: config.bgColor,
                borderColor: config.color,
                borderWidth: 2,
                borderRadius: 8,
                maxBarThickness: 50
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y.toFixed(1)}${config.unit}`;
                        }
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    color: '#333',
                    font: {
                        weight: 'bold',
                        size: 11
                    },
                    formatter: function(value) {
                        return value.toFixed(0) + config.unit;
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        font: {
                            size: 10
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + config.unit;
                        }
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });

    // Store chart instance
    window.BF_State.storeChart(sensorType, chartInstance);

    console.log(`📈 Chart updated for ${config.label} with ${chartData.length} points`);
}

/**
 * Destroy chart on a specific canvas
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} sensorType - Sensor type
 */
function destroyChartOnCanvas(canvas, sensorType) {
    // Destroy Chart.js instance on canvas
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }
    
    // Also destroy our stored instance
    window.BF_State.destroyChart(sensorType);
}

/**
 * Destroy all charts
 */
function destroyAllCharts() {
    // Destroy all stored chart instances
    window.BF_State.destroyAllCharts();

    // Also destroy any orphaned charts on canvas elements
    const allCanvases = document.querySelectorAll('.dashboard-chart-canvas');
    allCanvases.forEach(canvas => {
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }
    });

    console.log('🗑️ All charts destroyed');
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.BF_ChartManager = {
        updateChart,
        destroyChartOnCanvas,
        destroyAllCharts
    };
}

console.log('✅ Bin Fluctuations chart manager loaded');
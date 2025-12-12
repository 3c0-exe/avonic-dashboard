// ========================================
// DASHBOARD MODULE - FULLY NAMESPACED JS
// Save as: js/dashboard-module.js
// Link in app.html: <script src="js/dashboard-module.js"></script>
// ========================================

// Wrap everything in an IIFE to avoid global namespace pollution
(function() {
    'use strict';

    // ========================================
    // 📊 SENSOR CONFIGURATIONS
    // ========================================

    const DASHBOARD_SENSOR_CONFIGS = {
        temperature: {
            unit: '°C',
            minValue: 15,
            maxValue: 35,
            chartMaxValue: 40,
            useDummyData: true
        },
        soilMoisture: {
            unit: '%',
            minValue: 70,
            maxValue: 95,
            chartMaxValue: 100,
            useDummyData: true
        },
        humidity: {
            unit: '%',
            minValue: 70,
            maxValue: 95,
            chartMaxValue: 100,
            useDummyData: true
        },
        gasLevels: {
            unit: 'ppm',
            minValue: 0,
            maxValue: 200,
            chartMaxValue: 250,
            useDummyData: true
        }
    };

    // ========================================
    // 🐛 AFRICAN NIGHTCRAWLER OPTIMAL RANGES
    // ========================================

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

    // ========================================
    // 🎨 WORM CONDITION EVALUATOR
    // ========================================

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

    // ========================================
    // 🖼️ UPDATE WORM CLIPART FOR SPECIFIC SECTION
    // ========================================

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

    // ========================================
    // 📝 UPDATE INSIGHTS FOR SPECIFIC SECTION
    // ========================================

    function updateInsights(section, insightText) {
        const mainMessage = insightText.split(/🔧 Actions:|🔧 URGENT Actions:/)[0].trim();
        
        const insightContent = section.querySelector('.dashboard-insights-content');
        if (insightContent) {
            insightContent.textContent = mainMessage;
        }
        
        // Extract and store actions
        const actions = extractActions(insightText);
        section.dataset.currentActions = JSON.stringify(actions);
        updateActionButton(section, actions);
    }

    // ========================================
    // 🔴 UPDATE ACTION BUTTON FOR SPECIFIC SECTION
    // ========================================

    function updateActionButton(section, actions) {
        const actionIcon = section.querySelector('.dashboard-action-icon');
        const actionBadge = section.querySelector('.dashboard-action-badge');
        
        if (!actionIcon) return;
        
        const hasActions = actions && actions.length > 0;
        
        if (hasActions) {
            actionIcon.style.opacity = '1';
            actionIcon.style.cursor = 'pointer';
            actionIcon.style.pointerEvents = 'auto';
            
            if (actionBadge) {
                actionBadge.style.display = 'block';
            }
        } else {
            actionIcon.style.opacity = '0.3';
            actionIcon.style.cursor = 'not-allowed';
            actionIcon.style.pointerEvents = 'none';
            
            if (actionBadge) {
                actionBadge.style.display = 'none';
            }
        }
    }

    // ========================================
    // 🔧 EXTRACT ACTIONS FROM INSIGHT TEXT
    // ========================================

    function extractActions(insightText) {
        const actionsPart = insightText.split(/🔧 Actions:|🔧 URGENT Actions:/)[1];
        
        if (!actionsPart) return [];

        const actions = actionsPart
            .split('•')
            .map(action => action.trim())
            .filter(action => action.length > 0 && !action.toLowerCase().startsWith('optimal'));

        return actions.map(text => ({
            text: text,
            icon: 'img/icons/action-icon.svg'
        }));
    }

    // ========================================
    // 📊 UPDATE AVERAGE FOR SPECIFIC SECTION
    // ========================================

    function updateAverage(section, values, sensorType) {
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

    // ========================================
    // 🎲 GENERATE DUMMY DATA
    // ========================================

    function generateDummyData(config) {
        const labels = [];
        const values = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            labels.push(`${month}/${day}`);
            
            const randomValue = Math.floor(Math.random() * (config.maxValue - config.minValue + 1)) + config.minValue;
            values.push(randomValue);
        }
        
        return { labels, values };
    }

    // ========================================
    // 📊 CREATE CHART FOR SPECIFIC SECTION
    // ========================================

    function createChart(section, sensorType) {
        const canvas = section.querySelector('.dashboard-chart-canvas');
        if (!canvas) {
            console.error('❌ Canvas not found in section');
            return null;
        }
        
        const config = DASHBOARD_SENSOR_CONFIGS[sensorType];
        const chartData = config.useDummyData ? generateDummyData(config) : {
            labels: ['7/11', '7/12', '7/13', '7/14', '7/15', '7/16', '7/17'],
            values: [25, 26, 24, 27, 28, 26, 25]
        };
        
        // Update average and condition
        updateAverage(section, chartData.values, sensorType);

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

    // ========================================
    // 🎯 MODAL FUNCTIONS
    // ========================================

    function openModal(section) {
        const actionsJSON = section.dataset.currentActions;
        if (!actionsJSON) {
            console.log('No actions available');
            return;
        }
        
        const actions = JSON.parse(actionsJSON);
        
        if (!actions || actions.length === 0) {
            console.log('No actions available');
            return;
        }
        
        const modal = document.querySelector('.dashboard-modal-overlay');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            populateActions(actions);
        }
    }

    function closeModal() {
        const modal = document.querySelector('.dashboard-modal-overlay');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function populateActions(actionsArray) {
        const actionsList = document.querySelector('.dashboard-actions-list');
        if (!actionsList) return;
        
        actionsList.innerHTML = '';

        actionsArray.forEach((action, index) => {
            const actionItem = document.createElement('div');
            actionItem.className = 'dashboard-action-item';
            actionItem.style.opacity = '0';
            actionItem.style.transform = 'translateY(10px)';
            
            actionItem.innerHTML = `
                <div class="dashboard-action-item-icon">
                    <img src="${action.icon}" alt="Action icon" onerror="this.style.display='none'">
                </div>
                <div class="dashboard-action-item-content">
                    <p class="dashboard-action-item-text">${action.text}</p>
                </div>
            `;
            
            actionsList.appendChild(actionItem);
            
            setTimeout(() => {
                actionItem.style.transition = 'all 0.3s ease';
                actionItem.style.opacity = '1';
                actionItem.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    // ========================================
    // 🚀 INITIALIZE ALL SECTIONS
    // ========================================

    function initializeDashboard() {
        console.log('🎨 Dashboard Module: Initializing...');
        
        const sensorSections = document.querySelectorAll('.dashboard-section[data-sensor]');
        console.log('📊 Found', sensorSections.length, 'sensor sections');
        
        sensorSections.forEach((section, index) => {
            const sensorType = section.dataset.sensor;
            console.log(`📈 Initializing chart ${index + 1}/${sensorSections.length}: ${sensorType}`);
            createChart(section, sensorType);
        });
        
        // Set up action icon click handlers
        document.querySelectorAll('.dashboard-action-icon').forEach(icon => {
            icon.addEventListener('click', function(e) {
                const section = e.target.closest('.dashboard-section');
                if (section) {
                    openModal(section);
                }
            });
        });
        
        // Set up modal close handlers
        const modalOverlay = document.querySelector('.dashboard-modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModal();
                }
            });
        }
        
        const closeButton = document.querySelector('.dashboard-modal-close');
        if (closeButton) {
            closeButton.addEventListener('click', closeModal);
        }
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
        
        console.log('✅ Dashboard Module initialized successfully!');
    }

    // ========================================
    // 🎬 AUTO-INITIALIZE
    // ========================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDashboard);
    } else {
        initializeDashboard();
    }

})();

console.log('✅ dashboard-module.js loaded');
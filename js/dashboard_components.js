// dashboard_components.js - COMPLETE VERSION WITH COMPONENTS

// ========================================
// 🧩 MISSING COMPONENT DEFINITIONS (Added from Secondary)
// ========================================

// ✅ Quick Insights Bin Card Component
class BinQInsightscard extends HTMLElement {
  
    connectedCallback() {
        const ic_name = this.getAttribute("ic_name");
        const ic_status = this.getAttribute("ic_status");
        const ic_moremsg = this.getAttribute("ic_moremsg");
        const isClickable = this.getAttribute("is_clickable") === "true";
        
        this.innerHTML = `
            <div class="insightCard">
                <div class="icName">${ic_name}</div>
                <div class="icStatus">${ic_status}</div>
                <div class="icMoreMsg"><p>${ic_moremsg}</p></div>
            </div>
        `;
        
        if (isClickable) {
            const cardElement = this.querySelector(".insightCard");
            
            cardElement.addEventListener("click", () => {
                openModal({
                    title: ic_name,
                    defaultContent: `
                        <div class="quick-insight-modal">
                            <h1 class="qi-title">Quick Insights</h1>
                            <div class="bin-details">
                                <p>Bin: 1 <br>
                                Date: Aug 26,2025 <br>
                                Last Update: 10:30PM</p>
                            </div>

                            <div class="todays-summary">
                                <div class="wrapper-flex qi">
                                    <div class="wrapper-column ">
                                        <div class="qi-sensor-selection">
                                            <ul class="tab-container">
                                                <li class="tab">Soil Moisture</li>
                                                <li class="tab">Temp</li>
                                                <li class="tab">Humidity</li>
                                                <li class="tab">Gas Levels</li>
                                                <li class="tab">pH Level</li>
                                            </ul>
                                        </div>

                                        <div class="qi-cards-container">
                                            <div class="qi-card">
                                                <h5 class="metrics">Min</h5>
                                                <div class="value">
                                                    <div class="card_value">10</div>
                                                    <div class="qi-card_unit">%</div>
                                                </div>
                                            </div>
                                            <div class="qi-card">
                                                <h5 class="metrics">Average</h5>
                                                <div class="value">
                                                    <div class="card_value">10</div>
                                                    <div class="qi-card_unit">%</div>
                                                </div>
                                            </div>
                                            <div class="qi-card">
                                                <h5 class="metrics">Max</h5>
                                                <div class="value">
                                                    <div class="card_value">10</div>
                                                    <div class="qi-card_unit">%</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="">
                                        <div class="insights">
                                            <h3 class="insight-title">Insights</h3>
                                            <p class="insight-content"> lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="readings-history-table">
                                    <table class="qi-table">
                                        <tr>
                                            <th>Time</th>
                                            <th>Reading</th>
                                            <th>Status</th>
                                        </tr>
                                        <tr>
                                            <td data-cell="Time">10:00PM</td>
                                            <td data-cell="Reading">30%</td>
                                            <td data-cell="Status">Stable</td>
                                        </tr>
                                        <tr>
                                            <td data-cell="Time">10:00PM</td>
                                            <td data-cell="Reading">30%</td>
                                            <td data-cell="Status">Stable</td>
                                        </tr>
                                        <tr>
                                            <td data-cell="Time">10:00PM</td>
                                            <td data-cell="Reading">30%</td>
                                            <td data-cell="Status">Stable</td>
                                        </tr>
                                        <tr>
                                            <td data-cell="Time">10:00PM</td>
                                            <td data-cell="Reading">30%</td>
                                            <td data-cell="Status">Stable</td>
                                        </tr>
                                        <tr>
                                            <td data-cell="Time">10:00PM</td>
                                            <td data-cell="Reading">30%</td>
                                            <td data-cell="Status">Stable</td>
                                        </tr>
                                        <tr>
                                            <td data-cell="Time">10:00PM</td>
                                            <td data-cell="Reading">30%</td>
                                            <td data-cell="Status">Stable</td>
                                        </tr>
                                        <tr>
                                            <td data-cell="Time">10:00PM</td>
                                            <td data-cell="Reading">30%</td>
                                            <td data-cell="Status">Stable</td>
                                        </tr>
                                        <tr>
                                            <td data-cell="Time">10:00PM</td>
                                            <td data-cell="Reading">30%</td>
                                            <td data-cell="Status">Stable</td>
                                        </tr>
                                        <tr>
                                            <td data-cell="Time">10:00PM</td>
                                            <td data-cell="Reading">30%</td>
                                            <td data-cell="Status">Stable</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </div>
                    `,
                    helpContent: `
                        <p>This section gives more insight about <b>${ic_name}</b>.</p>
                        <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</p>
                    `,
                    syncValues: {},
                    card: cardElement
                });
            });
        }
    }
}

customElements.define("qinsights-bin", BinQInsightscard);


// ✅ Sensor Fluctuation Section Component
class sensorFluctuationSection extends HTMLElement {
    connectedCallback() {
        const sensor_name = this.getAttribute("sensor_name");
        const sensor_unit = this.getAttribute("sensor_unit");
        const sensor_icon = this.getAttribute("sensor_icon");

        // Unique canvas ID per component
        const chartId = `chart-${sensor_name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).slice(2,7)}`;

        this.innerHTML = `
            <section class="bf-section">
                <div class="bf-sensor-container">
                    <div class="bf-sensor">
                        <img src="img/icons/sensorIcons/${sensor_icon}.svg" alt="">
                        <h1>${sensor_name}</h1>
                    </div>
                </div>

                <div class="bf-wrapper">
                    <div class="range-wrapper">
                        <div class="bf-subheader">Summary</div>
                        <div class="bf-summary-ranges">
                            <div class="bf-summary">
                                <div class="bf-summary-label">Min</div>
                                <div class="bf-summary-value">
                                    <div class="bf-card_value" id="${chartId}-min">--</div>
                                    <div class="bf-card_unit">${sensor_unit}</div>
                                </div>
                            </div>

                            <div class="bf-summary">
                                <div class="bf-summary-label">Ave</div>
                                <div class="bf-summary-value">
                                    <div class="bf-card_value" id="${chartId}-ave">--</div>
                                    <div class="bf-card_unit">${sensor_unit}</div>
                                </div>
                            </div>

                            <div class="bf-summary">
                                <div class="bf-summary-label">Max</div>
                                <div class="bf-summary-value">
                                    <div class="bf-card_value" id="${chartId}-max">--</div>
                                    <div class="bf-card_unit">${sensor_unit}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="chart-container">
                        <div class="chart">
                            <canvas id="${chartId}"></canvas>
                        </div>
                    </div>
                </div>
            </section> 
        `;

        // Store metadata for later use
        this.chartId = chartId;
        this.sensorName = sensor_name;
        this.sensorUnit = sensor_unit;
    }
}

customElements.define("section-sensor-fluctuation", sensorFluctuationSection);


// ========================================
// 📊 SENSOR CONFIGURATIONS
// ========================================

const SENSOR_CONFIGS = {
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

const WORM_CONDITIONS = {
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
    const ranges = WORM_CONDITIONS[sensorType];
    
    if (!ranges) return { condition: 'normal', clipart: 'Normal.png', insight: 'No data available.' };
    
    let condition = 'normal';
    let clipart = 'Normal.png';
    let insight = '';
    
    switch(sensorType) {
        case 'temperature':
            if (averageValue < ranges.critical_min) {
                condition = 'too-cold';
                clipart = 'Too Dry.png';
                insight = `⚠️ CRITICAL: Temperature is dangerously low at ${averageValue}°C. African Nightcrawlers become inactive below ${ranges.critical_min}°C and may die from cold stress.\n\n🔧 Actions:\n• Move worms to warmer location immediately\n• Add insulation or heating mat\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}°C`;
            } else if (averageValue < ranges.optimal_min) {
                condition = 'sub-optimal-cold';
                clipart = 'Too Dry.png';
                insight = `⚠️ Temperature is below optimal at ${averageValue}°C. Worms are less active and reproduction slows down.\n\n🔧 Actions:\n• Consider adding heat source\n• Monitor for further drops\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}°C`;
            } else if (averageValue > ranges.critical_max) {
                condition = 'too-hot';
                clipart = 'Too Hot.png';
                insight = `🔥 CRITICAL: Temperature is dangerously high at ${averageValue}°C! African Nightcrawlers will die above ${ranges.critical_max}°C.\n\n🔧 URGENT Actions:\n• Move bin to cooler location NOW\n• Add ventilation or fans\n• Never expose to direct sunlight\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}°C`;
            } else if (averageValue > ranges.optimal_max) {
                condition = 'sub-optimal-hot';
                clipart = 'Too Hot.png';
                insight = `⚠️ Temperature is above optimal at ${averageValue}°C. Worms are stressed and may try to escape.\n\n🔧 Actions:\n• Improve ventilation\n• Move to cooler area\n• Avoid direct heat sources\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}°C`;
            } else {
                condition = 'normal';
                clipart = 'Normal.png';
                insight = `✅ Temperature is perfect at ${averageValue}°C! Worms are thriving in optimal conditions (${ranges.optimal_min}-${ranges.optimal_max}°C). Keep up the great work!`;
            }
            break;
            
        case 'soilMoisture':
            if (averageValue < ranges.critical_min) {
                condition = 'too-dry';
                clipart = 'Too Dry.png';
                insight = `⚠️ CRITICAL: Soil is too dry at ${averageValue}%. Worms will die from dehydration below ${ranges.critical_min}%.\n\n🔧 URGENT Actions:\n• Add water immediately\n• Spray bedding evenly\n• Check drainage system\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}%`;
            } else if (averageValue < ranges.optimal_min) {
                condition = 'sub-optimal-dry';
                clipart = 'Too Dry.png';
                insight = `⚠️ Soil moisture is low at ${averageValue}%. Worms may become stressed and less active.\n\n🔧 Actions:\n• Add moisture gradually\n• Use spray bottle for even distribution\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}%`;
            } else if (averageValue > ranges.critical_max) {
                condition = 'too-wet';
                clipart = 'Too Wet.png';
                insight = `💧 CRITICAL: Soil is too wet at ${averageValue}%! Risk of drowning and anaerobic conditions above ${ranges.critical_max}%.\n\n🔧 URGENT Actions:\n• Stop adding water\n• Add dry bedding material\n• Improve drainage and aeration\n• Turn bedding to increase airflow\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}%`;
            } else if (averageValue > ranges.optimal_max) {
                condition = 'sub-optimal-wet';
                clipart = 'Too Wet.png';
                insight = `⚠️ Soil moisture is high at ${averageValue}%. Risk of anaerobic conditions developing.\n\n🔧 Actions:\n• Reduce watering frequency\n• Add dry bedding\n• Improve ventilation\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}%`;
            } else {
                condition = 'normal';
                clipart = 'Normal.png';
                insight = `✅ Soil moisture is perfect at ${averageValue}%! Bedding has ideal consistency (${ranges.optimal_min}-${ranges.optimal_max}%). Worms are happy!`;
            }
            break;
            
        case 'humidity':
            if (averageValue < ranges.critical_min) {
                condition = 'too-dry';
                clipart = 'Too Dry.png';
                insight = `⚠️ CRITICAL: Humidity is too low at ${averageValue}%. Worms' skin will dry out below ${ranges.critical_min}%.\n\n🔧 URGENT Actions:\n• Mist the bin regularly\n• Cover bin to retain moisture\n• Check ventilation (may be too much)\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}%`;
            } else if (averageValue < ranges.optimal_min) {
                condition = 'sub-optimal-dry';
                clipart = 'Too Dry.png';
                insight = `⚠️ Humidity is low at ${averageValue}%. Worms may experience mild stress.\n\n🔧 Actions:\n• Increase misting frequency\n• Reduce ventilation slightly\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}%`;
            } else if (averageValue > ranges.critical_max) {
                condition = 'too-wet';
                clipart = 'Too Wet.png';
                insight = `💧 CRITICAL: Humidity is too high at ${averageValue}%! Risk of mold and pest problems above ${ranges.critical_max}%.\n\n🔧 URGENT Actions:\n• Increase ventilation immediately\n• Add dry bedding\n• Check for water pooling\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}%`;
            } else if (averageValue > ranges.optimal_max) {
                condition = 'sub-optimal-wet';
                clipart = 'Too Wet.png';
                insight = `⚠️ Humidity is high at ${averageValue}%. Monitor for mold development.\n\n🔧 Actions:\n• Improve air circulation\n• Reduce watering\n• Optimal range: ${ranges.optimal_min}-${ranges.optimal_max}%`;
            } else {
                condition = 'normal';
                clipart = 'Normal.png';
                insight = `✅ Humidity is perfect at ${averageValue}%! Air moisture is ideal (${ranges.optimal_min}-${ranges.optimal_max}%). Conditions are excellent!`;
            }
            break;
            
        case 'gasLevels':
            if (averageValue > ranges.critical_max) {
                condition = 'gas-too-high';
                clipart = 'Gas Too High.png';
                insight = `☠️ CRITICAL: Ammonia levels are toxic at ${averageValue} ppm! Levels above ${ranges.critical_max} ppm will kill worms.\n\n🔧 URGENT Actions:\n• Stop feeding immediately\n• Turn bedding to release gases\n• Add carbon-rich material (shredded paper/cardboard)\n• Increase ventilation\n• Remove any rotting food\n• Safe range: Below ${ranges.optimal_max} ppm`;
            } else if (averageValue > ranges.optimal_max) {
                condition = 'gas-elevated';
                clipart = 'Gas Too High.png';
                insight = `⚠️ Ammonia levels are elevated at ${averageValue} ppm. Worms are experiencing stress.\n\n🔧 Actions:\n• Reduce protein-rich food\n• Add more carbon material\n• Improve aeration by turning bedding\n• Safe range: Below ${ranges.optimal_max} ppm`;
            } else {
                condition = 'normal';
                clipart = 'Normal.png';
                insight = `✅ Gas levels are safe at ${averageValue} ppm! Ammonia is well-controlled (below ${ranges.optimal_max} ppm). Bin chemistry is balanced!`;
            }
            break;
    }
    
    return { condition, clipart, insight };
}

// ========================================
// 🖼️ UPDATE WORM CLIPART FOR SPECIFIC SECTION
// ========================================

function updateWormClipartForSection(section, clipartFilename) {
    const wormList = section.querySelector('.worm-condition-clipart ul');
    
    if (!wormList) {
        console.error('❌ ERROR: Worm clipart container not found in section!');
        return;
    }
    
    const allCliparts = wormList.querySelectorAll('li');
    allCliparts.forEach(li => {
        li.classList.remove('active');
        li.style.display = 'none';
    });
    
    const clipartMap = {
        'Normal.png': 'worm-normal',
        'Too Wet.png': 'worm-too-wet',
        'Too Hot.png': 'worm-too-hot',
        'Too Dry.png': 'worm-too-dry',
        'Gas Too High.png': 'worm-gas-too-high'
    };
    
    const targetId = clipartMap[clipartFilename];
    
    if (!targetId) {
        console.error('❌ ERROR: No ID mapping found for:', clipartFilename);
        return;
    }
    
    const targetClipart = section.querySelector(`#${targetId}`);
    
    if (targetClipart) {
        targetClipart.classList.add('active');
        targetClipart.style.display = 'block';
    } else {
        console.error('❌ ERROR: Element with ID not found in section:', targetId);
    }
}

// ========================================
// 📝 UPDATE INSIGHTS FOR SPECIFIC SECTION
// ========================================

function updateInsightsForSection(section, insightText, sensorType) {
    const mainMessage = insightText.split(/🔧 Actions:|🔧 URGENT Actions:/)[0].trim();
    
    const insightContent = section.querySelector('.insights .content');
    if (insightContent) {
        insightContent.textContent = mainMessage;
    }
    
    const actions = extractActionsFromInsight(insightText);
    section.dataset.currentActions = JSON.stringify(actions);
    updateActionButtonForSection(section, actions);
}

// ========================================
// 🔴 UPDATE ACTION BUTTON FOR SPECIFIC SECTION
// ========================================

function updateActionButtonForSection(section, actions) {
    const actionIcon = section.querySelector('.fix-icon');
    const actionBadge = section.querySelector('.action-badge');
    
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
// 🎯 OPEN MODAL FOR SPECIFIC SECTION
// ========================================

function openActionsModal(event) {
    const section = event.target.closest('.bin-fluctuations');
    if (!section) return;
    
    const actionsJSON = section.dataset.currentActions;
    if (!actionsJSON) {
        console.log('No actions available for this section');
        return;
    }
    
    const actions = JSON.parse(actionsJSON);
    
    if (!actions || actions.length === 0) {
        console.log('No actions available');
        return;
    }
    
    const modal = document.getElementById('actionsModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        populateActions(actions);
    }
}

function closeActionsModal() {
    const modal = document.getElementById('actionsModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ========================================
// 📝 POPULATE ACTIONS IN MODAL
// ========================================

function populateActions(actionsArray) {
    const actionsList = document.getElementById('actionsList');
    if (!actionsList) return;
    
    actionsList.innerHTML = '';

    actionsArray.forEach((action, index) => {
        const actionItem = document.createElement('div');
        actionItem.className = 'action-item';
        actionItem.style.opacity = '0';
        actionItem.style.transform = 'translateY(10px)';
        
        actionItem.innerHTML = `
            <div class="action-icon">
                <img src="${action.icon || 'img/icons/action-placeholder.svg'}" alt="Action icon" onerror="this.style.display='none'">
            </div>
            <div class="action-content">
                <p class="action-text">${action.text}</p>
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
// 🔧 EXTRACT ACTIONS FROM INSIGHT TEXT
// ========================================

function extractActionsFromInsight(insightText) {
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

function updateAverageForSection(section, values, sensorType) {
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const roundedAverage = average.toFixed(1);
    
    const avgValueElement = section.querySelector('.ave-value .value');
    const avgUnitElement = section.querySelector('.ave-value .unit');
    
    if (avgValueElement) {
        avgValueElement.textContent = roundedAverage;
    }
    
    const config = SENSOR_CONFIGS[sensorType];
    if (avgUnitElement) {
        avgUnitElement.textContent = config.unit;
    }
    
    const evaluation = evaluateWormCondition(sensorType, parseFloat(roundedAverage));
    
    updateWormClipartForSection(section, evaluation.clipart);
    updateInsightsForSection(section, evaluation.insight, sensorType);
    
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

function createChartForSection(section, canvasId, sensorType) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    
    const config = SENSOR_CONFIGS[sensorType];
    const chartData = config.useDummyData ? generateDummyData(config) : {
        labels: ['7/11', '7/12', '7/13', '7/14', '7/15', '7/16', '7/17'],
        values: [25, 26, 24, 27, 28, 26, 25]
    };
    
    updateAverageForSection(section, chartData.values, sensorType);

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

    return new Chart(ctx, chartConfig);
}

// ========================================
// 🚀 INITIALIZE ALL SECTIONS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    const sensorSections = document.querySelectorAll('.bin-fluctuations[data-sensor]');
    
    sensorSections.forEach((section, index) => {
        const sensorType = section.dataset.sensor;
        const canvas = section.querySelector('canvas');
        
        if (canvas) {
            canvas.id = `chart-${sensorType}`;
            createChartForSection(section, canvas.id, sensorType);
        }
    });
    
    const modal = document.getElementById('actionsModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeActionsModal();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeActionsModal();
        }
    });
});

console.log('✅ Dashboard Components Loaded Successfully!');
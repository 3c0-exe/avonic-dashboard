// components/chart-renderer.js - Chart.js Rendering

/**
 * Update chart with real sensor data
 * @param {HTMLCanvasElement} chartElement - Canvas element to render chart
 * @param {string} espID - Device ESP ID
 * @param {number} binNumber - Bin number (1 or 2)
 * @param {string} sensorName - Sensor name (e.g., 'Soil Moisture', 'Temperature')
 */
async function updateChart(chartElement, espID, binNumber, sensorName) {
  const readings = await fetchChartData(espID, binNumber, 7);
  
  if (!readings || readings.length === 0) {
    console.warn(`⚠️ No data for ${sensorName} chart`);
    return;
  }

  // Get sensor path using utility function
  const sensorPath = getSensorPath(binNumber, sensorName);
  if (!sensorPath) {
    console.warn(`⚠️ Unknown sensor: ${sensorName}`);
    return;
  }

  // Group data by date
  const dailyData = groupByDate(readings, sensorPath);
  
  // Sort dates chronologically
  const sortedDates = Object.keys(dailyData).sort((a, b) => {
    return new Date(a) - new Date(b);
  });

  // Format labels as MM/DD
  const labels = sortedDates.map(date => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });
  
  const values = sortedDates.map(date => dailyData[date]);

  // Calculate statistics
  const stats = calculateStats(values);
  
  // Update stat displays
  const chartId = chartElement.id;
  const minElem = document.getElementById(`${chartId}-min`);
  const aveElem = document.getElementById(`${chartId}-ave`);
  const maxElem = document.getElementById(`${chartId}-max`);
  
  if (minElem) minElem.textContent = stats.min.toFixed(1);
  if (aveElem) aveElem.textContent = stats.avg;
  if (maxElem) maxElem.textContent = stats.max.toFixed(1);

  // Destroy existing chart instance
  if (chartElement._chartInstance) {
    chartElement._chartInstance.destroy();
  }

  // Get sensor unit
  const unit = getSensorUnit(sensorName);
  
  // Create new chart
  const ctx = chartElement.getContext('2d');
  
  chartElement._chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: `Daily Average`,
        data: values,
        backgroundColor: '#F8B84E',
        borderColor: '#00000080',
        borderWidth: 1.2,
        borderRadius: 8,
        barThickness: 35,
      }]
    },
    options: {
      plugins: {
        datalabels: {
          anchor: 'end',
          align: 'end',
          color: 'black',
          font: { size: 12, weight: 'bold' },
          formatter: (value) => value != null ? `${value.toFixed(1)}${unit}` : ''
        },
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          ticks: { 
            font: { size: 10, weight: 'bold', family: 'Arial' }, 
            color: 'black' 
          }
        },
        y: {
          min: 0,
          max: Math.max(...values) * 1.2,
          ticks: { display: false },
          grid: { display: false, drawBorder: false }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    },
    elements: {
      bar: {
        borderSkipped: false
      }
    },
    plugins: [ChartDataLabels]
  });
  
  console.log(`✅ Chart updated: ${sensorName} (${values.length} days)`);
}

console.log('✅ Chart renderer loaded');
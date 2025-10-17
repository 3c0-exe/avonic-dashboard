// dashboardPage

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
                                <!-- <h3>Today's Summary</h3>-->

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
                                                        <div class="card_value">
                                                            10
                                                        </div>
                                                        <div class="qi-card_unit">
                                                            %
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="qi-card">
                                                    <h5 class="metrics">Average</h5>
                                                    <div class="value">
                                                        <div class="card_value">
                                                            10
                                                        </div>
                                                        <div class="qi-card_unit">
                                                            %
                                                        </div>
                                                </div>
                                                </div>
                                            <div class="qi-card">
                                                <h5 class="metrics">Max</h5>
                                                <div class="value">
                                                    <div class="card_value">
                                                        10
                                                    </div>
                                                    <div class="qi-card_unit">
                                                        %
                                                    </div>
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
                                            <!-- <caption>Today's Readings || Temperature</caption> -->

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
                                
          `,
          helpContent: `
            <p>This section gives more insight about <b>${ic_name}</b>.</p>
            <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</p>
          `,
          syncValues: {}, // not needed here unless you want live syncing
          card: cardElement
        });
      });
    }

    }


    
}

customElements.define("qinsights-bin", BinQInsightscard)


class sensorFluctuationSection extends HTMLElement {
  connectedCallback() {
    const sensor_name = this.getAttribute("sensor_name");
    const sensor_unit = this.getAttribute("sensor_unit");
    const sensor_icon = this.getAttribute("sensor_icon");

    // unique canvas ID per component
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

    // Example dataset (later: pass dynamically)
    const data = [12, 19, 3, 5, 2, 3, 5];

    // compute stats
    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    const aveVal = (data.reduce((a, b) => a + b, 0) / data.length).toFixed(1);

    // update summary values
    this.querySelector(`#${chartId}-min`).textContent = minVal;
    this.querySelector(`#${chartId}-ave`).textContent = aveVal;
    this.querySelector(`#${chartId}-max`).textContent = maxVal;

    // render Chart
    const ctx = this.querySelector(`#${chartId}`);
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['7/11','7/12','7/13','7/14','7/15','7/16','7/17'],
        datasets: [{
          label: `average per day`,
          data: data,
          backgroundColor: '#F8B84E',
          borderColor: '#00000080', // subtle border
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
            formatter: (value) => `${value} ${sensor_unit}`
          }
        },
        scales: {
          x: {
            ticks: { font: { size: 10, weight: 'bold', family: 'Arial' }, color: 'black' }
          },
          y: {
            min: 0, max: 20,
            ticks: { display: false },
            grid: { display: false, drawBorder: false }
          }
        },
        responsive: true,
        maintainAspectRatio: false
      },
       elements: {
      bar: {
        borderSkipped: false // ensures rounded corners on all sides
      }
    },
      plugins: [ChartDataLabels]
    });
  }
}

customElements.define("section-sensor-fluctuation", sensorFluctuationSection);
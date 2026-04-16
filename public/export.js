/* ════════════════════════════════════════════
   EXPORT MANAGER (export.js)
   Native Data Spans & Dynamic Bar Charts
   ════════════════════════════════════════════ */
const ExportManager = (() => {
  let currentContext = 'Dashboard';
  let previewPages = [];
  let currentPreviewPage = 0;

  function init() {
    document.querySelectorAll('.ex-sens-cb, #ex-insight-cb').forEach(el => {
      if(el) el.addEventListener('change', () => {
        currentPreviewPage = 0; 
        updatePreview();
      });
    });

    const prevBtn = document.getElementById('ex-prev-page');
    const nextBtn = document.getElementById('ex-next-page');
    if (prevBtn) prevBtn.addEventListener('click', () => { if (currentPreviewPage > 0) { currentPreviewPage--; renderCurrentPage(); }});
    if (nextBtn) nextBtn.addEventListener('click', () => { if (currentPreviewPage < previewPages.length - 1) { currentPreviewPage++; renderCurrentPage(); }});
  }

  function openExport(contextName) {
    currentContext = contextName;
    currentPreviewPage = 0;

    // Reset mobile pagination to Page 1
    const inner = document.getElementById('export-modal-inner');
    if (inner) inner.classList.remove('show-mobile-preview');

    updatePreview(); 
    if (typeof openModal === 'function') openModal('export-modal');
  }

  function toggleMobilePreview(show) {
    const inner = document.getElementById('export-modal-inner');
    if (inner) {
      if (show) inner.classList.add('show-mobile-preview');
      else inner.classList.remove('show-mobile-preview');
    }
  }

  function getReportDateString() {
    if (currentContext === 'Bin Fluctuation') {
      // Intelligently grab the exact boundaries of the currently plotted data
      if (typeof S !== 'undefined' && S.hist && S.hist.labels && S.hist.labels.length > 0) {
        const start = S.hist.labels[0];
        const end = S.hist.labels[S.hist.labels.length - 1];
        return start === end ? `Span: ${start}` : `Span: ${start} to ${end}`;
      }
      return `Span: Current Selection`;
    }
    return `Generated: ${new Date().toLocaleDateString()}`;
  }

  // ─── DATA EXTRACTION ROUTER ───────────────────────────────────

  function getActiveData(binNum, sensorKey) {
    if (currentContext === 'Bin Fluctuation') {
      return extractFluctuationData(binNum, sensorKey);
    }
    return extractQuickInsightsData(binNum, sensorKey);
  }

  function extractQuickInsightsData(binNum, sensorKey) {
    const binKey = 'b' + binNum;
    const labels = S.hist?.labels || [];
    const values = S.hist?.[binKey]?.[sensorKey] || [];
    
    const limits = (typeof CFG !== 'undefined' && CFG.OPT) ? CFG.OPT[sensorKey] : null;
    const unit = limits ? limits.unit : '';
    const names = { soilMoisture: 'Soil Moisture', temperature: 'Temperature', humidity: 'Humidity', gasLevels: 'Gas Levels' };
    const sensorName = names[sensorKey] || sensorKey;

    const icons = {
      soilMoisture: '/img/monitoring/Sensor%20Icons/Moisture%20Icon.svg',
      temperature: '/img/monitoring/Sensor%20Icons/Temperature%20Icon.svg',
      humidity: '/img/monitoring/Sensor%20Icons/Humidity%20Icon.svg',
      gasLevels: '/img/monitoring/Sensor%20Icons/Gas%20Icon.svg'
    };
    const iconPath = icons[sensorKey] || '';

    const valid = values.filter(v => v != null);
    const min = valid.length ? Math.min(...valid) : 0;
    const max = valid.length ? Math.max(...valid) : 0;
    const avg = valid.length ? valid.reduce((a,b) => a + b, 0) / valid.length : 0;
    const recent = valid.length ? valid[valid.length - 1] : 0;

    let actionData = { title: '', steps: [], severity: 'ok' };
    if (typeof getWormInsight === 'function') {
      actionData = getWormInsight(sensorKey, avg);
    }

    return { sensorName, sensorKey, unit, iconPath, stats: { min, max, avg, recent }, labels, values, limits, actionData, isBarChart: false };
  }

  function extractFluctuationData(binNum, sensorKey) {
    const baseData = extractQuickInsightsData(binNum, sensorKey);
    baseData.isBarChart = true;
    
    const absoluteMax = baseData.stats.max > 0 ? baseData.stats.max : 1; 
    baseData.barWidths = baseData.values.map(v => {
      if (v == null) return 0;
      let pct = (v / absoluteMax) * 100;
      return pct > 100 ? 100 : pct;
    });

    return baseData;
  }

  // ─── LIVE PREVIEW ENGINE ──────────────────────────────────────
  
  function updatePreview() {
    if (typeof S === 'undefined' || !S.hist) return;

    const selectedCheckboxes = document.querySelectorAll('.ex-sens-cb:checked');
    const includeInsight = document.getElementById('ex-insight-cb')?.checked;
    const binNum = S.qiBin || 1;
    
    previewPages = [];

    if (selectedCheckboxes.length === 0) {
      previewPages.push(`<div style="display:flex; height:100%; align-items:center; justify-content:center; color:#aaa; font-size: 12px; font-weight: 600;">Please select at least one sensor.</div>`);
    } else {
      const dateString = getReportDateString();
      const ROWS_FIRST_PAGE = currentContext === 'Bin Fluctuation' ? 6 : 8;   
      const ROWS_OTHER_PAGES = currentContext === 'Bin Fluctuation' ? 14 : 18; 
      
      selectedCheckboxes.forEach((cb, sIndex) => {
        const data = getActiveData(binNum, cb.value);
        const totalRows = data.labels.length;
        let startIndex = 0;
        let isFirstPage = true;

        do {
           let chunkLimit = isFirstPage ? ROWS_FIRST_PAGE : ROWS_OTHER_PAGES;
           if (totalRows === 0) chunkLimit = 1; 

           let limitRows = data.labels.slice(startIndex, startIndex + chunkLimit);
           let limitVals = data.values.slice(startIndex, startIndex + chunkLimit);
           let limitBars = data.isBarChart ? data.barWidths.slice(startIndex, startIndex + chunkLimit) : [];

           let pageHtml = '';

           if (isFirstPage) {
              if (sIndex === 0) {
                pageHtml += `
                  <div class="ex-prev-header" style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1.5px solid #111; padding-bottom: 8px; margin-bottom: 16px;">
                    <div style="text-align: left; line-height: 1.2;">
                      <strong style="font-size: 11px; color: #111;">AVONIC SYSTEM</strong><br>
                      <span style="font-size: 9px; color: #666;">${dateString}</span>
                    </div>
                    <h1 style="margin: 0; padding: 0; border: none; text-align: right; font-size: 15px; color: #111;">${currentContext} - Bin ${binNum} Export</h1>
                  </div>`;
              }
              
              pageHtml += `
                <h2 class="ex-prev-sensor-h2">
                  <img src="${data.iconPath}" width="14" height="14"> ${data.sensorName}
                </h2>`;

              if (includeInsight && data.actionData && data.actionData.title) {
                const color = getSeverityColor(data.actionData.severity);
                const stepsHtml = data.actionData.steps.slice(0, 2).map(s => `<li>${s}</li>`).join('');
                pageHtml += `
                  <div class="ex-prev-insight" style="border-left: 3px solid ${color};">
                    <strong style="color:#111;">${data.actionData.title}</strong>
                    <ul style="margin: 4px 0 0 16px; padding: 0;">${stepsHtml}</ul>
                  </div>`;
              }

              pageHtml += `
                <div class="ex-prev-stats">
                  <div class="ex-prev-stat-box">Min<span>${data.stats.min.toFixed(1)}${data.unit}</span></div>
                  <div class="ex-prev-stat-box">Avg<span>${data.stats.avg.toFixed(1)}${data.unit}</span></div>
                  <div class="ex-prev-stat-box">Max<span>${data.stats.max.toFixed(1)}${data.unit}</span></div>
                </div>`;
           } else {
              pageHtml += `
                <div class="ex-prev-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 12px;">
                  <span style="font-size: 9px; color: #666;">AVONIC SYSTEM | ${dateString}</span>
                  <strong style="font-size: 10px; color: #666; text-align: right;">${currentContext} - Bin ${binNum} Export</strong>
                </div>
                <h2 class="ex-prev-sensor-h2" style="color: #666;">
                  <img src="${data.iconPath}" width="12" height="12" style="opacity: 0.5;"> 
                  ${data.sensorName} (Continued)
                </h2>`;
           }

           if (data.isBarChart) {
             pageHtml += `<table class="ex-prev-table"><tr><th style="width: 20%; text-align: left;">Time Span</th><th style="width: 20%;">Average</th><th style="width: 60%; text-align: left;">Trend</th></tr>`;
           } else {
             pageHtml += `<table class="ex-prev-table"><tr><th>Time</th><th>Reading</th><th>Status</th></tr>`;
           }
           
           if (limitRows.length === 0) {
              pageHtml += `<tr><td colspan="3" style="color:#aaa;">No data available</td></tr>`;
           } else {
             for (let i = 0; i < limitRows.length; i++) {
               let val = limitVals[i];
               if (val == null) continue;
               
               if (data.isBarChart) {
                 const barColor = getBarColor(val, data.limits);
                 pageHtml += `
                   <tr>
                     <td style="text-align: left;">${limitRows[i]}</td>
                     <td><strong>${val}</strong><span style="font-size:6px; color:#666; margin-left:2px;">${data.unit}</span></td>
                     <td style="text-align: left; vertical-align: middle;">
                       <div style="width: 100%; background: #eee; height: 8px; border-radius: 4px; overflow: hidden;">
                         <div style="width: ${limitBars[i]}%; background: ${barColor}; height: 100%;"></div>
                       </div>
                     </td>
                   </tr>`;
               } else {
                 let status = getStatusText(val, data.limits);
                 pageHtml += `<tr><td>${limitRows[i]}</td><td>${val} ${data.unit}</td><td>${status}</td></tr>`;
               }
             }
           }
           pageHtml += `</table>`;

           previewPages.push(pageHtml);
           startIndex += chunkLimit;
           isFirstPage = false;

        } while (startIndex < totalRows);
      });
    }
    renderCurrentPage();
  }

  function renderCurrentPage() {
    const canvas = document.getElementById('ex-a4-canvas');
    const pagWrap = document.getElementById('ex-pagination');
    const ind = document.getElementById('ex-page-indicator');
    const pBtn = document.getElementById('ex-prev-page');
    const nBtn = document.getElementById('ex-next-page');

    if (!canvas) return;

    if (previewPages.length <= 1) {
      if (pagWrap) pagWrap.style.display = 'none';
    } else {
      if (pagWrap) pagWrap.style.display = 'flex';
      if (ind) ind.textContent = `Page ${currentPreviewPage + 1} of ${previewPages.length}`;
      if (pBtn) pBtn.disabled = currentPreviewPage === 0;
      if (nBtn) nBtn.disabled = currentPreviewPage === previewPages.length - 1;
    }

    canvas.innerHTML = previewPages[currentPreviewPage] || '';
  }

  // ─── MAIN EXPORT ENGINE ───────────────────────────────────────

  function processExport(format) {
    if (typeof S === 'undefined' || !S.hist || !S.hist.labels || S.hist.labels.length === 0) {
      if (typeof toast === 'function') toast('No data available to export.', 'err');
      return;
    }

    const selectedCheckboxes = document.querySelectorAll('.ex-sens-cb:checked');
    const includeInsight = document.getElementById('ex-insight-cb').checked;
    
    if (selectedCheckboxes.length === 0) {
      if (typeof toast === 'function') toast('Please select at least one sensor.', 'err');
      return;
    }

    if (typeof toast === 'function') toast(`Generating ${format}...`, 'ok');

    const binNum = S.qiBin || 1;
    let reportData = {
      title: `${currentContext} - Bin ${binNum}`,
      dateStr: getReportDateString(),
      includeInsight: includeInsight,
      sensors: []
    };

    selectedCheckboxes.forEach(cb => {
      reportData.sensors.push(getActiveData(binNum, cb.value));
    });

    if (format === 'CSV') generateCSV(reportData);
    else if (format === 'DOCS') generateDOCS(reportData);
    else if (format === 'PDF') generatePDF(reportData);
    
    setTimeout(() => { if (typeof closeTopModal === 'function') closeTopModal(); }, 800);
  }

  // ─── HELPERS ──────────────────────────────────────────────────

  function getSeverityColor(severity) {
    if (severity === 'critical') return '#ef4444'; 
    if (severity === 'warning') return '#d97706';  
    return '#3a6b35'; 
  }

  function getStatusText(val, limits) {
    if (!limits) return 'Normal';
    if (val <= limits.critical_min) return 'Low';
    if (val >= limits.critical_max) return 'High';
    return 'Normal';
  }

  function getBarColor(val, limits) {
    if (!limits) return '#3a6b35';
    if (val <= limits.critical_min || val >= limits.critical_max) return '#ef4444';
    if (val <= limits.optimal_min || val >= limits.optimal_max) return '#f59e0b';  
    return '#6aab7a'; 
  }

  // ─── FILE GENERATORS ──────────────────────────────────────────

  function generateCSV(report) {
    let csv = `Report,${report.title} Export\nDetails,"${report.dateStr}"\n\n`;
    
    report.sensors.forEach(data => {
      csv += `--- ${data.sensorName.toUpperCase()} ---\n`;
      if (report.includeInsight && data.actionData.title) {
        csv += `System Evaluation,"${data.actionData.title}"\n`;
        csv += `Recommended Actions,"${data.actionData.steps.join('; ')}"\n`;
      }
      csv += `Min,${data.stats.min.toFixed(1)}\nMax,${data.stats.max.toFixed(1)}\nAverage,${data.stats.avg.toFixed(1)}\n\n`;
      
      csv += data.isBarChart ? "Time Span,Reading,Status\n" : "Time,Reading,Status\n";
      for (let i = 0; i < data.labels.length; i++) {
        let val = data.values[i];
        if (val == null) continue;
        let status = getStatusText(val, data.limits);
        csv += `"${data.labels[i]}",${val},${status}\n`;
      }
      csv += `\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(URL.createObjectURL(blob), `AVONIC_${report.title.replace(/\s+/g, '_')}_Export.csv`);
  }

  function generateDOCS(report) {
    let html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${report.title} Export</title>
        <style>
          @page WordSection1 { size: 595.3pt 841.9pt; margin: 56.7pt; }
          div.WordSection1 { page: WordSection1; }
          body { font-family: 'Quicksand', sans-serif; }
          th, td { text-align: center; }
        </style>
      </head>
      <body>
      <div class="WordSection1">
        <table style="width: 100%; border-bottom: 2px solid #111; margin-bottom: 25px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align: left; vertical-align: bottom; padding-bottom: 10px;">
              <strong style="font-size: 14px; color: #111;">AVONIC SYSTEM</strong><br>
              <span style="font-size: 12px; color: #666;">${report.dateStr}</span>
            </td>
            <td style="text-align: right; vertical-align: bottom; padding-bottom: 10px;">
              <h1 style="margin: 0; font-size: 24px; color: #111;">${report.title} Export</h1>
            </td>
          </tr>
        </table>`;

    report.sensors.forEach(data => {
      html += `<h3>
                 <img src="${window.location.origin}${data.iconPath}" width="20" height="20" style="vertical-align: middle; margin-right: 8px;"> 
                 ${data.sensorName}
               </h3>`;
      
      if (report.includeInsight && data.actionData.title) {
        const color = getSeverityColor(data.actionData.severity);
        const stepsHtml = data.actionData.steps.map(s => `<li>${s}</li>`).join('');
        html += `<div style="background:#f9f9f9; padding:12px; border-left:4px solid ${color}; text-align: left; margin-bottom: 15px;">
                   <strong style="color: #111; font-size: 14px;">${data.actionData.title}</strong>
                   <ul style="margin-top: 6px; margin-bottom: 0; padding-left: 20px; font-size: 13px;">${stepsHtml}</ul>
                 </div>`;
      }
      
      html += `<ul><li style="text-align: left;"><strong>Min:</strong> ${data.stats.min.toFixed(1)} ${data.unit}</li><li style="text-align: left;"><strong>Average:</strong> ${data.stats.avg.toFixed(1)} ${data.unit}</li><li style="text-align: left;"><strong>Max:</strong> ${data.stats.max.toFixed(1)} ${data.unit}</li></ul>`;
      
      if (data.isBarChart) {
        html += `<table border="1" cellpadding=\"8\" cellspacing=\"0\" style=\"border-collapse: collapse; width: 100%;\">
            <tr style=\"background-color: #e2e2e2;\">
              <th style=\"text-align: left; width: 25%;\">Time Span</th>
              <th style=\"text-align: center; width: 20%;\">Average</th>
              <th style=\"text-align: left; width: 55%;\">Trend Graph</th>
            </tr>`;
      } else {
        html += `<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; text-align: center;">
            <tr style="background-color: #e2e2e2;">
              <th style="text-align: center;">Time</th><th style="text-align: center;">Reading</th><th style="text-align: center;">Status</th>
            </tr>`;
      }
          
      for (let i = 0; i < data.labels.length; i++) {
        let val = data.values[i];
        if (val == null) continue;

        if (data.isBarChart) {
           const barColor = getBarColor(val, data.limits);
           html += `<tr>
              <td style="text-align: left;">${data.labels[i]}</td>
              <td style="text-align: center;"><strong>${val}</strong> ${data.unit}</td>
              <td style="text-align: left; vertical-align: middle;">
                <div style="width: 100%; background: #eee; height: 16px;">
                  <div style="width: ${data.barWidths[i]}%; background: ${barColor}; height: 16px;"></div>
                </div>
              </td>
            </tr>`;
        } else {
           let status = getStatusText(val, data.limits);
           html += `<tr>
              <td style="text-align: center;">${data.labels[i]}</td>
              <td style="text-align: center;">${val} ${data.unit}</td>
              <td style="text-align: center;">${status}</td>
            </tr>`;
        }
      }
      html += `</table><br><br>`;
    });

    html += `</div></body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    triggerDownload(URL.createObjectURL(blob), `AVONIC_${report.title.replace(/\s+/g, '_')}_Export.doc`);
  }

  function generatePDF(report) {
    let html = `<html><head><title>${report.title} Export</title>
      <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700;800&display=swap" rel="stylesheet">
      <style>
        @page { size: A4 portrait; margin: 15mm; }
        body { font-family: 'Quicksand', sans-serif; padding: 0; color: #111; background: #fff; 
          -webkit-print-color-adjust: exact !important; 
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        .pdf-header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 25px; }
        .pdf-header-left { text-align: left; line-height: 1.4; }
        .pdf-header h1 { margin: 0; font-size: 26px; text-align: right; }
        
        h2 { color: #2e4f39; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
        .action-box { background: #f9f9f9; padding: 12px; margin-bottom: 20px; text-align: left; border-radius: 4px; }
        .action-title { font-weight: 700; font-size: 14px; margin-bottom: 6px; }
        .action-list { margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.4; }
        
        .stats { display: flex; gap: 15px; margin-bottom: 20px; }
        .stat-box { border: 1px solid #ccc; padding: 10px 15px; border-radius: 6px; flex: 1; text-align: center; }
        .stat-val { font-size: 20px; font-weight: bold; display: block; margin-top: 5px; color: #111;}
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 0; text-align: center; }
        th, td { border-bottom: 1px solid #ccc; padding: 8px; text-align: center; font-size: 13px; }
        th { background: #eee !important; }
        
        .bar-bg { width: 100%; background: #eee !important; height: 12px; border-radius: 6px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 6px; }
        
        .page-break { page-break-after: always; margin-bottom: 20px; }
      </style></head><body>`;

    const isFluctuation = currentContext === 'Bin Fluctuation';
    const ROWS_FIRST_PAGE = isFluctuation ? 18 : 22; 
    const ROWS_OTHER_PAGES = isFluctuation ? 32 : 38; 

    report.sensors.forEach((data, sIndex) => {
      const totalRows = data.labels.length;
      let startIndex = 0;
      let isFirstPage = true;

      do {
        let chunkLimit = isFirstPage ? ROWS_FIRST_PAGE : ROWS_OTHER_PAGES;
        if (totalRows === 0) chunkLimit = 1; 

        let limitRows = data.labels.slice(startIndex, startIndex + chunkLimit);
        let limitVals = data.values.slice(startIndex, startIndex + chunkLimit);
        let limitBars = data.isBarChart ? data.barWidths.slice(startIndex, startIndex + chunkLimit) : [];

        if (isFirstPage) {
          if (sIndex === 0) {
             html += `
               <div class="pdf-header">
                 <div class="pdf-header-left">
                   <strong style="font-size: 15px;">AVONIC SYSTEM</strong><br>
                   <span style="font-size: 12px; color: #666;">${report.dateStr}</span>
                 </div>
                 <h1>${report.title} Export</h1>
               </div>`;
          }
          
          html += `<h2><img src="${window.location.origin}${data.iconPath}" width="26" height="26"> ${data.sensorName}</h2>`;
                     
          if (report.includeInsight && data.actionData.title) {
            const color = getSeverityColor(data.actionData.severity);
            const stepsHtml = data.actionData.steps.map(s => `<li>${s}</li>`).join('');
            html += `<div class="action-box" style="border-left: 4px solid ${color} !important;">
                       <div class="action-title">${data.actionData.title}</div>
                       <ul class="action-list">${stepsHtml}</ul>
                     </div>`;
          }
          
          html += `<div class="stats">
              <div class="stat-box">Min<span class="stat-val">${data.stats.min.toFixed(1)} ${data.unit}</span></div>
              <div class="stat-box">Average<span class="stat-val">${data.stats.avg.toFixed(1)} ${data.unit}</span></div>
              <div class="stat-box">Max<span class="stat-val">${data.stats.max.toFixed(1)} ${data.unit}</span></div>
            </div>`;
        } else {
          html += `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 16px; font-size: 11px; color: #666;">
              <span>AVONIC SYSTEM | ${report.dateStr}</span>
              <strong style="text-align: right;">${report.title} Export (Continued)</strong>
            </div>
            <h2 style="color: #666;"><img src="${window.location.origin}${data.iconPath}" width="20" height="20" style="opacity: 0.5;"> ${data.sensorName} (Continued)</h2>`;
        }

        if (data.isBarChart) {
          html += `<table><tr><th style="width: 20%; text-align: left;">Time Span</th><th style="width: 20%;">Average</th><th style="width: 60%; text-align: left;">Trend</th></tr>`;
        } else {
          html += `<table><tr><th>Time</th><th>Reading</th><th>Status</th></tr>`;
        }

        if (limitRows.length === 0) {
           html += `<tr><td colspan="3" style="color:#aaa;">No data available</td></tr>`;
        } else {
          for (let i = 0; i < limitRows.length; i++) {
            let val = limitVals[i];
            if (val == null) continue;
            
            if (data.isBarChart) {
              const barColor = getBarColor(val, data.limits);
              html += `<tr>
                <td style="text-align: left;">${limitRows[i]}</td>
                <td><strong>${val}</strong><span style="font-size:10px; color:#666; margin-left:2px;">${data.unit}</span></td>
                <td style="text-align: left; vertical-align: middle;">
                  <div class="bar-bg">
                    <div class="bar-fill" style="width: ${limitBars[i]}%; background: ${barColor} !important;"></div>
                  </div>
                </td>
              </tr>`;
            } else {
              let status = getStatusText(val, data.limits);
              html += `<tr><td>${limitRows[i]}</td><td>${val} ${data.unit}</td><td>${status}</td></tr>`;
            }
          }
        }
        html += `</table>`;

        startIndex += chunkLimit;
        isFirstPage = false;

        if (startIndex < totalRows || sIndex < report.sensors.length - 1) {
            html += `<div class="page-break"></div>`;
        }

      } while (startIndex < totalRows);
    });

    html += `</body></html>`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow || iframe.contentDocument;
    if (doc.document) doc.document.write(html);
    else doc.write(html);
    
    if (doc.document) doc.document.close();
    else doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 400);
  }

  function triggerDownload(url, filename) {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return { init, openExport, processExport, toggleMobilePreview };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ExportManager.init);
} else {
  ExportManager.init();
}
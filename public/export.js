/* ════════════════════════════════════════════
   EXPORT MANAGER (export.js)
   Multi-sensor with Preset System Actions & Live Preview
   ════════════════════════════════════════════ */
const ExportManager = (() => {
  let currentContext = 'Dashboard';
  let previewPages = [];
  let currentPreviewPage = 0;

  function init() {
    // Listeners for Live Preview Updating
    document.querySelectorAll('.ex-sens-cb, #ex-insight-cb').forEach(el => {
      el.addEventListener('change', () => {
        currentPreviewPage = 0; // Reset to page 1 if they change settings
        updatePreview();
      });
    });

    // Pagination Click Listeners
    const prevBtn = document.getElementById('ex-prev-page');
    const nextBtn = document.getElementById('ex-next-page');
    if (prevBtn) prevBtn.addEventListener('click', () => { if (currentPreviewPage > 0) { currentPreviewPage--; renderCurrentPage(); }});
    if (nextBtn) nextBtn.addEventListener('click', () => { if (currentPreviewPage < previewPages.length - 1) { currentPreviewPage++; renderCurrentPage(); }});
  }

  function openExport(contextName) {
    currentContext = contextName;
    currentPreviewPage = 0;
    updatePreview(); // Generate initial preview
    if (typeof openModal === 'function') openModal('export-modal');
  }

  // ─── LIVE PREVIEW ENGINE ──────────────────────────────────────
  
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
      const date = new Date().toLocaleDateString();
      
      // Define how many rows safely fit on the mini A4 canvas
      const ROWS_FIRST_PAGE = 8;   // Less rows because it has the header & stats
      const ROWS_OTHER_PAGES = 18; // More rows because it's just raw table data
      
      selectedCheckboxes.forEach(cb => {
        const data = extractSensorData(binNum, cb.value);
        const totalRows = data.labels.length;
        
        let startIndex = 0;
        let isFirstPage = true;

        // Loop to create as many pages as needed for this specific sensor
        do {
           let chunkLimit = isFirstPage ? ROWS_FIRST_PAGE : ROWS_OTHER_PAGES;
           
           // If there is no data at all, ensure at least one empty page renders
           if (totalRows === 0) chunkLimit = 1; 

           let limitRows = data.labels.slice(startIndex, startIndex + chunkLimit);
           let limitVals = data.values.slice(startIndex, startIndex + chunkLimit);

           let pageHtml = '';

           if (isFirstPage) {
              // ── Full Header for the First Page ──
              pageHtml += `
                <div class="ex-prev-header">
                  <h1>${currentContext} - Bin ${binNum}</h1>
                  <div class="ex-prev-meta">Generated: ${date}</div>
                </div>
                <h2 class="ex-prev-sensor-h2">
                  <img src="${data.iconPath}" width="14" height="14"> ${data.sensorName}
                </h2>`;

              if (includeInsight && data.actionData && data.actionData.title) {
                const color = getSeverityColor(data.actionData.severity);
                // Preview only shows top 2 steps to save canvas space
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
              // ── Minimal Header for Continuation Pages ──
              pageHtml += `
                <div class="ex-prev-header" style="margin-bottom: 12px;">
                  <div class="ex-prev-meta" style="margin-bottom: 4px;">${currentContext} - Bin ${binNum} | ${date}</div>
                </div>
                <h2 class="ex-prev-sensor-h2" style="color: #666;">
                  <img src="${data.iconPath}" width="12" height="12" style="opacity: 0.5;"> 
                  ${data.sensorName} (Continued)
                </h2>`;
           }

           // ── Build the Table Chunk ──
           pageHtml += `<table class="ex-prev-table"><tr><th>Time</th><th>Reading</th><th>Status</th></tr>`;
           
           if (limitRows.length === 0) {
              pageHtml += `<tr><td colspan="3" style="color:#aaa;">No data available</td></tr>`;
           } else {
             for (let i = 0; i < limitRows.length; i++) {
               let val = limitVals[i];
               if (val == null) continue;
               let status = 'Normal';
               if (data.limits) {
                  if (val <= data.limits.critical_min) status = 'Low';
                  else if (val >= data.limits.critical_max) status = 'High';
               }
               pageHtml += `<tr><td>${limitRows[i]}</td><td>${val} ${data.unit}</td><td>${status}</td></tr>`;
             }
           }
           pageHtml += `</table>`;

           // Push this completed chunk to the pagination array
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
      date: new Date().toLocaleString(),
      includeInsight: includeInsight,
      sensors: []
    };

    selectedCheckboxes.forEach(cb => {
      reportData.sensors.push(extractSensorData(binNum, cb.value));
    });

    if (format === 'CSV') generateCSV(reportData);
    else if (format === 'DOCS') generateDOCS(reportData);
    else if (format === 'PDF') generatePDF(reportData);
    
    setTimeout(() => { if (typeof closeTopModal === 'function') closeTopModal(); }, 800);
  }

  function extractSensorData(binNum, sensorKey) {
    const binKey = 'b' + binNum;
    const labels = S.hist.labels || [];
    const values = S.hist[binKey]?.[sensorKey] || [];
    
    const limits = (typeof CFG !== 'undefined' && CFG.OPT) ? CFG.OPT[sensorKey] : null;
    const unit = limits ? limits.unit : '';
    const names = { soilMoisture: 'Soil Moisture', temperature: 'Temperature', humidity: 'Humidity', gasLevels: 'Gas Levels' };
    const sensorName = names[sensorKey] || sensorKey;

    const icons = {
      soilMoisture: '/img/monitoring/Sensor%20Icons/Soil%20Moisture%20Icon.svg',
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

    return { sensorName, sensorKey, unit, iconPath, stats: { min, max, avg, recent }, labels, values, limits, actionData };
  }

  function getSeverityColor(severity) {
    if (severity === 'critical') return '#ef4444'; 
    if (severity === 'warning') return '#d97706';  
    return '#3a6b35'; 
  }

  // ─── FILE GENERATORS ──────────────────────────────────────────

  function generateCSV(report) {
    let csv = `Report,${report.title}\nDate,"${report.date}"\n\n`;
    
    report.sensors.forEach(data => {
      csv += `--- ${data.sensorName.toUpperCase()} ---\n`;
      if (report.includeInsight && data.actionData.title) {
        csv += `System Evaluation,"${data.actionData.title}"\n`;
        csv += `Recommended Actions,"${data.actionData.steps.join('; ')}"\n`;
      }
      csv += `Min,${data.stats.min.toFixed(1)}\nMax,${data.stats.max.toFixed(1)}\nAverage,${data.stats.avg.toFixed(1)}\nRecent,${data.stats.recent.toFixed(1)}\n\n`;
      
      csv += "Time,Reading,Status\n";
      for (let i = 0; i < data.labels.length; i++) {
        let val = data.values[i];
        if (val == null) continue;
        let status = 'Normal';
        if (data.limits) {
           if (val <= data.limits.critical_min) status = 'Low';
           else if (val >= data.limits.critical_max) status = 'High';
        }
        csv += `"${data.labels[i]}",${val},${status}\n`;
      }
      csv += `\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(URL.createObjectURL(blob), `AVONIC_${report.title.replace(/\s+/g, '_')}.csv`);
  }

  function generateDOCS(report) {
    let html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${report.title}</title>
        <style>
          @page WordSection1 { size: 595.3pt 841.9pt; margin: 56.7pt; }
          div.WordSection1 { page: WordSection1; }
          body { font-family: 'Quicksand', sans-serif; }
          th, td { text-align: center; }
        </style>
      </head>
      <body>
      <div class="WordSection1">
        <h2>AVONIC: ${report.title}</h2><p><strong>Generated:</strong> ${report.date}</p><hr>`;

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
      
      html += `<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; text-align: center;">
          <tr style="background-color: #e2e2e2;">
            <th style="text-align: center;">Time</th>
            <th style="text-align: center;">Reading</th>
            <th style="text-align: center;">Status</th>
          </tr>`;
          
      for (let i = 0; i < data.labels.length; i++) {
        let val = data.values[i];
        if (val == null) continue;
        let status = 'Normal';
        if (data.limits) {
           if (val <= data.limits.critical_min) status = 'Low';
           else if (val >= data.limits.critical_max) status = 'High';
        }
        html += `<tr>
            <td style="text-align: center;">${data.labels[i]}</td>
            <td style="text-align: center;">${val} ${data.unit}</td>
            <td style="text-align: center;">${status}</td>
          </tr>`;
      }
      html += `</table><br><br>`;
    });

    html += `</div></body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    triggerDownload(URL.createObjectURL(blob), `AVONIC_${report.title.replace(/\s+/g, '_')}.doc`);
  }

function generatePDF(report) {
    let html = `<html><head><title>${report.title} Export</title>
      <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700;800&display=swap" rel="stylesheet">
      <style>
        @page { size: A4 portrait; margin: 15mm; }
        body { font-family: 'Quicksand', sans-serif; padding: 0; color: #111; background: #fff; }
        h1 { border-bottom: 2px solid #111; padding-bottom: 10px; margin-bottom: 5px;}
        .meta { font-size: 14px; color: #666; margin-bottom: 30px; }
        .sensor-block { margin-bottom: 50px; page-break-inside: auto; }
        h2 { color: #2e4f39; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
        
        .action-box { background: #f9f9f9; padding: 12px; margin-bottom: 20px; text-align: left; border-radius: 4px; page-break-inside: avoid;}
        .action-title { font-weight: 700; font-size: 14px; margin-bottom: 6px; }
        .action-list { margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.4; }
        
        .stats { display: flex; gap: 15px; margin-bottom: 20px; page-break-inside: avoid; }
        .stat-box { border: 1px solid #ccc; padding: 10px 15px; border-radius: 6px; flex: 1; text-align: center; }
        .stat-val { font-size: 20px; font-weight: bold; display: block; margin-top: 5px; color: #111;}
        
        /* ── PDF Pagination Rules ── */
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; text-align: center; page-break-inside: auto; }
        tr { page-break-inside: avoid; page-break-after: auto; }
        thead { display: table-header-group; } /* Forces header to repeat on new pages */
        tfoot { display: table-footer-group; }
        th, td { border-bottom: 1px solid #ccc; padding: 8px; text-align: center; font-size: 13px; }
        th { background: #eee; }
      </style></head><body>
      <h1>${report.title}</h1><div class="meta">Generated: ${report.date}</div>`;

    report.sensors.forEach(data => {
      html += `<div class="sensor-block">
                 <h2>
                   <img src="${window.location.origin}${data.iconPath}" width="26" height="26">
                   ${data.sensorName}
                 </h2>`;
                 
      if (report.includeInsight && data.actionData.title) {
        const color = getSeverityColor(data.actionData.severity);
        const stepsHtml = data.actionData.steps.map(s => `<li>${s}</li>`).join('');
        html += `<div class="action-box" style="border-left: 4px solid ${color};">
                   <div class="action-title">${data.actionData.title}</div>
                   <ul class="action-list">${stepsHtml}</ul>
                 </div>`;
      }
      
      html += `<div class="stats">
          <div class="stat-box">Min<span class="stat-val">${data.stats.min.toFixed(1)} ${data.unit}</span></div>
          <div class="stat-box">Average<span class="stat-val">${data.stats.avg.toFixed(1)} ${data.unit}</span></div>
          <div class="stat-box">Max<span class="stat-val">${data.stats.max.toFixed(1)} ${data.unit}</span></div>
        </div>
        
        <table>
          <thead>
            <tr><th>Time</th><th>Reading</th><th>Status</th></tr>
          </thead>
          <tbody>`;

      for (let i = 0; i < data.labels.length; i++) {
        let val = data.values[i];
        if (val == null) continue;
        let status = 'Normal';
        if (data.limits) {
           if (val <= data.limits.critical_min) status = 'Low';
           else if (val >= data.limits.critical_max) status = 'High';
        }
        html += `<tr><td>${data.labels[i]}</td><td>${val} ${data.unit}</td><td>${status}</td></tr>`;
      }
      html += `</tbody></table></div>`;
    });

    html += `</body></html>`;

    // ── THE FIX: Invisible Iframe Printer ──
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    // Write the HTML securely into the iframe
    const doc = iframe.contentWindow || iframe.contentDocument;
    if (doc.document) doc.document.write(html);
    else doc.write(html);
    
    if (doc.document) doc.document.close();
    else doc.close();

    // Trigger print once the font has a split second to load
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      
      // Clean up the iframe from the DOM after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
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

  return { init, openExport, processExport };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ExportManager.init);
} else {
  ExportManager.init();
}
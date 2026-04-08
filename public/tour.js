/* ═══════════════════════════════════
   AVONIC  –  tour.js
   Phase 4 — Interactive UI Tour
   ═══════════════════════════════════ */
'use strict';

window.avonicStartTour = function () {
  if (typeof window.driver === 'undefined') return;
  const authOverlay = document.getElementById('auth-overlay');
  if (authOverlay && authOverlay.classList.contains('visible')) return;

  const NAV = 600;
  // FINAL: Total count is exactly 20
  const SUB = (n) => `<span style="opacity:.45;font-size:11px;font-weight:400">${n} / 20</span>`;

  function tourCleanup() {
    try { localStorage.removeItem('avonic_tour_ready'); } catch (e) {}
  }

  // ── Segment 6: Settings (steps 18–20) ────────────────────────
  function startSettingsTour() {
    const d6 = window.driver.js.driver({
      popoverClass: 'av-tour-popover', showProgress: false,
      nextBtnText: window.t('tour-btn-next'), prevBtnText: window.t('tour-btn-back'), doneBtnText: window.t('tour-btn-done'),
      allowClose: true, smoothScroll: true,
      onCloseClick() { tourCleanup(); d6.destroy(); },
      onNextClick() {
        if (d6.isLastStep()) {
          tourCleanup(); d6.destroy();
          window.location.hash = '#/home';
          setTimeout(() => toast(window.t('tour-toast-done'), 'ok'), NAV);
        } else { d6.moveNext(); }
      },
      steps: [
        { element: '#page-settings .settings-card', popover: { title: `${window.t('tour-s18-title')} ${SUB(18)}`, description: window.t('tour-s18-desc'), side: 'bottom', align: 'start' } },
        { element: '#claimed-bins-list', popover: { title: `${window.t('tour-s19-title')} ${SUB(19)}`, description: window.t('tour-s19-desc'), side: 'top', align: 'center' } },
        // Step 20: Uses unique key tour-replay-title to avoid dependency
        { element: '#settings-replay-tour', popover: { title: `${window.t('tour-replay-title')} ${SUB(20)}`, description: window.t('tour-replay-desc'), side: 'top', align: 'center' } },
      ]
    });
    d6.drive();
  }

  // ── Segment 5: Bin Fluctuation (steps 15–17) ──────────────────
  function startBFTour() {
    const d5 = window.driver.js.driver({
      popoverClass: 'av-tour-popover', showProgress: false,
      nextBtnText: window.t('tour-btn-next'), prevBtnText: window.t('tour-btn-back'), doneBtnText: window.t('tour-btn-next'),
      allowClose: true, smoothScroll: true,
      onCloseClick() { tourCleanup(); d5.destroy(); },
      onNextClick() {
        if (d5.isLastStep()) { d5.destroy(); window.location.hash = '#/settings'; setTimeout(startSettingsTour, NAV); }
        else { d5.moveNext(); }
      },
      steps: [
        { element: '#page-bin-fluctuation .bf-sidebar', popover: { title: `${window.t('tour-s15-title')} ${SUB(15)}`, description: window.t('tour-s15-desc'), side: 'right', align: 'start' } },
        { element: '#page-bin-fluctuation .bf-mid',     popover: { title: `${window.t('tour-s16-title')} ${SUB(16)}`, description: window.t('tour-s16-desc'), side: 'top', align: 'center' } },
        { element: '#page-bin-fluctuation .chart-scroll-wrap', popover: { title: `${window.t('tour-s17-title')} ${SUB(17)}`, description: window.t('tour-s17-desc'), side: 'top', align: 'center' } },
      ]
    });
    d5.drive();
  }

  // ── Segment 4b: Dashboard — Bin Fluctuation card (step 14) ────
  function startDashBFTour() {
    const d3b = window.driver.js.driver({
      popoverClass: 'av-tour-popover', showProgress: false,
      nextBtnText: window.t('tour-btn-next'), prevBtnText: window.t('tour-btn-back'), doneBtnText: window.t('tour-btn-next'),
      allowClose: true, smoothScroll: true,
      onCloseClick() { tourCleanup(); d3b.destroy(); },
      onNextClick() {
        if (d3b.getActiveIndex() === 0) { d3b.destroy(); window.location.hash = '#/bin-fluctuation'; setTimeout(startBFTour, NAV); }
        else { d3b.moveNext(); }
      },
      steps: [
        { element: '#go-bf', popover: { title: `${window.t('tour-s14-title')} ${SUB(14)}`, description: window.t('tour-s14-desc'), side: 'left', align: 'center' } },
        { element: '#go-bf', popover: { title: '', description: '' } },
      ]
    });
    d3b.drive();
  }

  // ── Segment 4: Quick Insights (steps 10–13) ───────────────────
  function startQITour() {
    const d4 = window.driver.js.driver({
      popoverClass: 'av-tour-popover', showProgress: false,
      nextBtnText: window.t('tour-btn-next'), prevBtnText: window.t('tour-btn-back'), doneBtnText: window.t('tour-btn-next'),
      allowClose: true, smoothScroll: true,
      onCloseClick() { tourCleanup(); d4.destroy(); },
      onNextClick() {
        if (d4.getActiveIndex() === 3) { d4.destroy(); window.location.hash = '#/dashboard'; setTimeout(startDashBFTour, NAV); }
        else { d4.moveNext(); }
      },
      steps: [
        { element: '#page-quick-insights .qi-sidebar',        popover: { title: `${window.t('tour-s10-title')} ${SUB(10)}`, description: window.t('tour-s10-desc'), side: 'right', align: 'start' } },
        { element: '#page-quick-insights .qi-stats-row',      popover: { title: `${window.t('tour-s11-title')} ${SUB(11)}`, description: window.t('tour-s11-desc'), side: 'top', align: 'center' } },
        { element: '#page-quick-insights .qi-tbl-wrap',       popover: { title: `${window.t('tour-s12-title')} ${SUB(12)}`, description: window.t('tour-s12-desc'), side: 'top', align: 'center' } },
        { element: '#page-quick-insights .qi-insight-bottom', popover: { title: `${window.t('tour-s13-title')} ${SUB(13)}`, description: window.t('tour-s13-desc'), side: 'top', align: 'center' } },
        { element: '#page-quick-insights .qi-insight-bottom', popover: { title: '', description: '' } },
      ]
    });
    d4.drive();
  }

  // ── Segment 3a: Dashboard — Quick Insights card (step 9) ──────
  function startDashTour() {
    const d3 = window.driver.js.driver({
      popoverClass: 'av-tour-popover', showProgress: false,
      nextBtnText: window.t('tour-btn-next'), prevBtnText: window.t('tour-btn-back'), doneBtnText: window.t('tour-btn-next'),
      allowClose: true, smoothScroll: true,
      onCloseClick() { tourCleanup(); d3.destroy(); },
      onNextClick() {
        if (d3.getActiveIndex() === 0) { d3.destroy(); window.location.hash = '#/quick-insights'; setTimeout(startQITour, NAV); }
        else { d3.moveNext(); }
      },
      steps: [
        { element: '#go-qi', popover: { title: `${window.t('tour-s9-title')} ${SUB(9)}`, description: window.t('tour-s9-desc'), side: 'left', align: 'center' } },
        { element: '#go-qi', popover: { title: '', description: '' } },
      ]
    });
    d3.drive();
  }

  function startBinTour() {
    function startModeTour() {
      const dm = window.driver.js.driver({
        popoverClass: 'av-tour-popover', showProgress: false,
        nextBtnText: window.t('tour-btn-next'), prevBtnText: window.t('tour-btn-back'), doneBtnText: window.t('tour-btn-next'),
        allowClose: true, smoothScroll: true,
        onCloseClick() { tourCleanup(); dm.destroy(); },
        onNextClick() {
          if (dm.getActiveIndex() === 0) { dm.destroy(); window.location.hash = '#/dashboard'; setTimeout(startDashTour, NAV); }
          else { dm.moveNext(); }
        },
        steps: [
          { element: '#page-bin1 .mode-selector-wrap', popover: { title: `${window.t('tour-s8-title')} ${SUB(8)}`, description: window.t('tour-s8-desc'), side: 'bottom', align: 'end' } },
          { element: '#page-bin1 .mode-selector-wrap', popover: { title: '', description: '' } },
        ]
      });
      dm.drive();
    }

    const d2 = window.driver.js.driver({
      popoverClass: 'av-tour-popover', showProgress: false,
      nextBtnText: window.t('tour-btn-next'), prevBtnText: window.t('tour-btn-back'), doneBtnText: window.t('tour-btn-next'),
      allowClose: true, smoothScroll: true,
      onCloseClick() { tourCleanup(); d2.destroy(); },
      onNextClick() {
        const idx = d2.getActiveIndex();
        if (idx === 0) { // Step 5: Soil Card (Redundant grid step removed)
          d2.destroy();
          window.avonicTourSensorPreview('auto', 
            () => window.avonicTourSensorPreview('manual', () => { closeAllModals(); setTimeout(startModeTour, 80); }, () => window.avonicTourSensorPreview('auto')), 
            () => { d2.drive(); d2.moveTo(0); }
          );
        }
      },
      steps: [
        { element: '#b1-soil-card', popover: { title: `${window.t('tour-s5-title')} ${SUB(5)}`, description: window.t('tour-s5-desc'), side: 'bottom', align: 'start' } },
        { element: '#b1-soil-card', popover: { title: '', description: '' } },
      ]
    });
    d2.drive();
  }

  // ── Segment 1: Home (steps 1–4) ───────────────────────────────
  window.location.hash = '#/home';
  const d1 = window.driver.js.driver({
    popoverClass: 'av-tour-popover', showProgress: false,
    nextBtnText: window.t('tour-btn-next'), prevBtnText: window.t('tour-btn-back'), doneBtnText: window.t('tour-btn-next'),
    allowClose: true, smoothScroll: true,
    onCloseClick() { tourCleanup(); d1.destroy(); },
    onNextClick() {
      if (d1.getActiveIndex() === 3) { d1.destroy(); window.location.hash = '#/bin1'; setTimeout(startBinTour, NAV); } 
      else { d1.moveNext(); }
    },
    steps: [
      { element: '.status-pills', popover: { title: `${window.t('tour-s1-title')} ${SUB(1)}`, description: window.t('tour-s1-desc'), side: 'bottom', align: 'end' } },
      { 
        element: '#lang-btn-desktop', // Corrected Step 2 target
        popover: { title: `${window.t('tour-lang-title')} ${SUB(2)}`, description: window.t('tour-lang-desc'), side: 'bottom', align: 'end' },
        onHighlightStarted: (el) => { if(el){ el.style.backgroundColor='#fff'; el.style.color='#17211a'; el.style.borderRadius='50px'; el.style.padding='4px 12px'; const svg=el.querySelector('svg'); if(svg) svg.style.stroke='#17211a'; } },
        onDeselected: (el) => { if(el){ el.style.cssText=''; const svg=el.querySelector('svg'); if(svg) svg.style.stroke=''; } }
      },
      { 
        element: '.tb-bin-selector', 
        popover: { title: `${window.t('tour-s2-title')} ${SUB(3)}`, description: window.t('tour-s2-desc'), side: 'bottom', align: 'end' },
        onHighlightStarted: (el) => { if(el){ el.style.backgroundColor='#fff'; el.style.borderRadius='50px'; el.style.padding='4px 12px'; const sel=el.querySelector('select'); if(sel) sel.style.color='#17211a'; } },
        onDeselected: (el) => { if(el){ el.style.cssText=''; } }
      },
      { element: '.bins-grid', popover: { title: `${window.t('tour-s3-title')} ${SUB(4)}`, description: window.t('tour-s3-desc'), side: 'top', align: 'center' } },
      { element: '.bins-grid', popover: { title: '', description: '' } },
    ]
  });
  setTimeout(() => d1.drive(), NAV);
};

function maybeStartTour() {
  try {
    const armed = localStorage.getItem('avonic_tour_ready') === 'true';
    const hasDevice = S.bins && S.bins.length > 0;
    const modal = document.getElementById('av-modal-overlay');
    if (armed && hasDevice && (!modal || modal.style.display === 'none')) {
      setTimeout(window.avonicStartTour, 800);
    }
  } catch (e) {}
}
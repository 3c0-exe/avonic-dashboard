/* ═══════════════════════════════════
   AVONIC  –  tour.js
   Phase 4 — Interactive UI Tour
   Depends on: driver.js, app.js (toast, $, ModalManager, S)
   Load order in app.html: app.js → tour.js → lang.js → welcome-modal.js
   ═══════════════════════════════════ */
'use strict';

// ════════════════════════════════════
// PHASE 4 — Interactive UI Tour
// ════════════════════════════════════

/**
 * avonicStartTour()
 * Exposed on window so welcome-modal.js (Phase 2) can call it too.
 * Guards: auth screen visible → abort. Driver not loaded → abort.
 *
 * Navigation strategy: steps that live inside hidden page sections
 * use onNextClick to route first, wait 420ms for the Router to
 * activate the section, then call driverObj.moveNext() manually.
 */
window.avonicStartTour = function () {
  if (typeof window.driver === 'undefined') {
    console.warn('AVONIC Tour: driver.js not loaded yet.');
    return;
  }
  const authOverlay = document.getElementById('auth-overlay');
  if (authOverlay && authOverlay.classList.contains('visible')) return;

  const NAV = 600;
  const SUB = (n) => `<span style="opacity:.45;font-size:11px;font-weight:400">${n} / 21</span>`;

  function tourCleanup() {
    try { localStorage.removeItem('avonic_tour_ready'); } catch (e) {}
  }

  // ── Segment 6: Settings (steps 18–21) ────────────────────────
  function startSettingsTour() {
    const d6 = window.driver.js.driver({
      popoverClass: 'av-tour-popover', showProgress: false,
      nextBtnText: 'Next →', prevBtnText: '← Back', doneBtnText: '✓ Done!',
      allowClose: true, smoothScroll: true,
      onCloseClick() { tourCleanup(); d6.destroy(); },
      onNextClick() {
        if (d6.isLastStep()) {
          tourCleanup();
          d6.destroy();
          // Navigate back to Home and fire the congrats toast once the page lands
          window.location.hash = '#/home';
          setTimeout(function () {
            toast('🎉 Tour complete! You\'re all set — happy composting!', 'ok');
          }, NAV);
        } else {
          d6.moveNext();
        }
      },
      steps: [
        {
          element: '#page-settings .settings-card',
          popover: {
            title: `👤 Account Profile ${SUB(18)}`,
            description: 'Update your display name and email anytime. Use Change Password below if you ever need to rotate your credentials.',
            side: 'bottom', align: 'start'
          }
        },
        {
          element: '#claimed-bins-list',
          popover: {
            title: `🪣 Claimed Bins ${SUB(19)}`,
            description: 'All your linked AVONIC devices appear here. Tap + Claim to add a new one using its 6-digit code, or remove a device you no longer use.',
            side: 'top', align: 'center'
          }
        },
        {
          element: '#app-language-select',
          popover: {
            title: `🌐 Language ${SUB(20)}`,
            description: 'Switch between English and Tagalog at any time — the whole app re-renders in your chosen language instantly.',
            side: 'top', align: 'center'
          }
        },
        {
          element: '#settings-replay-tour',
          popover: {
            title: `▶ Replay Anytime ${SUB(21)}`,
            description: 'Finished the tour but want a refresher? This button right here reruns the full walkthrough whenever you need it.',
            side: 'top', align: 'center'
          }
        },
      ]
    });
    d6.drive();
  }

  // ── Segment 5: Bin Fluctuation (steps 15–17) ──────────────────
  function startBFTour() {
    const d5 = window.driver.js.driver({
      popoverClass: 'av-tour-popover', showProgress: false,
      nextBtnText: 'Next →', prevBtnText: '← Back', doneBtnText: 'Next →',
      allowClose: true, smoothScroll: true,
      onCloseClick() { tourCleanup(); d5.destroy(); },
      onNextClick() {
        if (d5.isLastStep()) {
          d5.destroy();
          window.location.hash = '#/settings';
          setTimeout(startSettingsTour, NAV);
        } else {
          d5.moveNext();
        }
      },
      steps: [
        { element: '#page-bin-fluctuation .bf-sidebar', popover: { title: `🗂️ Controls ${SUB(15)}`, description: 'Choose a bin, pick a sensor, and set a date range to filter the chart. All controls live here in the sidebar.', side: 'right', align: 'start' } },
        { element: '#page-bin-fluctuation .bf-mid',     popover: { title: `📉 Average & Insights ${SUB(16)}`, description: 'The period average and worm-health illustration update with your date range. The wrench opens recommended actions when conditions are off.', side: 'top', align: 'center' } },
        { element: '#page-bin-fluctuation .chart-scroll-wrap', popover: { title: `📊 Trend Chart ${SUB(17)}`, description: 'Daily averages plotted over your chosen range. Scroll horizontally to pan across longer periods and spot seasonal patterns.', side: 'top', align: 'center' } },
      ]
    });
    d5.drive();
  }

  // ── Segment 4b: Dashboard — Bin Fluctuation card (step 14) ────
  function startDashBFTour() {
    const d3b = window.driver.js.driver({
      popoverClass: 'av-tour-popover', showProgress: false,
      nextBtnText: 'Next →', prevBtnText: '← Back', doneBtnText: 'Next →',
      allowClose: true, smoothScroll: true,
      onCloseClick() { tourCleanup(); d3b.destroy(); },
      onNextClick() {
        if (d3b.getActiveIndex() === 0) {
          d3b.destroy();
          window.location.hash = '#/bin-fluctuation';
          setTimeout(startBFTour, NAV);
        } else {
          d3b.moveNext();
        }
      },
      steps: [
        { element: '#go-bf', popover: { title: `📈 Bin Fluctuation ${SUB(14)}`, description: 'Track daily averages across a custom date range and visualise long-term trends with an interactive chart. Tap to open.', side: 'left', align: 'center' } },
        // DUMMY — keeps #go-bf at idx 0 as non-last so onNextClick fires
        { element: '#go-bf', popover: { title: '', description: '' } },
      ]
    });
    d3b.drive();
  }

  // ── Segment 4: Quick Insights (steps 10–13) ───────────────────
  // Last step → back to #/dashboard to introduce the BF card.
  function startQITour() {
    const d4 = window.driver.js.driver({
      popoverClass: 'av-tour-popover', showProgress: false,
      nextBtnText: 'Next →', prevBtnText: '← Back', doneBtnText: 'Next →',
      allowClose: true, smoothScroll: true,
      onCloseClick() { tourCleanup(); d4.destroy(); },
      onNextClick() {
        if (d4.getActiveIndex() === 3) {
          d4.destroy();
          window.location.hash = '#/dashboard';
          setTimeout(startDashBFTour, NAV);
        } else {
          d4.moveNext();
        }
      },
      steps: [
        { element: '#page-quick-insights .qi-sidebar',        popover: { title: `🔍 Sensor Selector ${SUB(10)}`,    description: 'Pick the bin and sensor you want to inspect. Switching sensors instantly refreshes all stats and the readings table.', side: 'right', align: 'start' } },
        { element: '#page-quick-insights .qi-stats-row',      popover: { title: `📈 At-a-Glance Stats ${SUB(11)}`,  description: 'Min, Average, Max, and the most recent reading — all pulled from the last 48 hourly snapshots for the selected sensor.', side: 'top', align: 'center' } },
        { element: '#page-quick-insights .qi-tbl-wrap',       popover: { title: `🗒️ Readings History ${SUB(12)}`,   description: 'Every recorded snapshot listed by time, with the exact reading and its condition status. Scroll down to see older entries.', side: 'top', align: 'center' } },
        { element: '#page-quick-insights .qi-insight-bottom', popover: { title: `💡 Insights & Actions ${SUB(13)}`, description: 'AVONIC reads the current conditions and writes a plain-language insight here. Tap the wrench to see recommended actions you can take right now.', side: 'top', align: 'center' } },
        // DUMMY — keeps .qi-insight-bottom at idx 3 as non-last so onNextClick fires
        { element: '#page-quick-insights .qi-insight-bottom', popover: { title: '', description: '' } },
      ]
    });
    d4.drive();
  }

  // ── Segment 3a: Dashboard — Quick Insights card (step 9) ──────
  function startDashTour() {
    const d3 = window.driver.js.driver({
      popoverClass: 'av-tour-popover', showProgress: false,
      nextBtnText: 'Next →', prevBtnText: '← Back', doneBtnText: 'Next →',
      allowClose: true, smoothScroll: true,
      onCloseClick() { tourCleanup(); d3.destroy(); },
      onNextClick() {
        if (d3.getActiveIndex() === 0) {
          d3.destroy();
          window.location.hash = '#/quick-insights';
          setTimeout(startQITour, NAV);
        } else {
          d3.moveNext();
        }
      },
      steps: [
        { element: '#go-qi', popover: { title: `📊 Quick Insights ${SUB(9)}`, description: 'Snapshot view of a sensor\'s hourly readings — min, avg, max, and an AI-written insight. Tap to open.', side: 'left', align: 'center' } },
        // DUMMY — keeps #go-qi at idx 0 as non-last so onNextClick fires
        { element: '#go-qi', popover: { title: '', description: '' } },
      ]
    });
    d3.drive();
  }

  function startBinTour() {

    // ── Segment 2c: Mode-selector (step 8) ────────────────────────
    // Created fresh from inside the Manual modal's onNext so we never
    // need to call d2.moveNext() across a modal boundary (which was
    // causing the tour to silently terminate).
    function startModeTour() {
      const dm = window.driver.js.driver({
        popoverClass: 'av-tour-popover', showProgress: false,
        nextBtnText: 'Next →', prevBtnText: '← Back', doneBtnText: 'Next →',
        allowClose: true, smoothScroll: true,
        onCloseClick() { tourCleanup(); dm.destroy(); },
        onNextClick() {
          if (dm.getActiveIndex() === 0) {
            dm.destroy();
            window.location.hash = '#/dashboard';
            setTimeout(startDashTour, NAV);
          } else {
            dm.moveNext();
          }
        },
        steps: [
          {
            element: '#page-bin1 .mode-selector-wrap',
            popover: { title: `⚙️ Auto vs. Manual Mode ${SUB(8)}`, description: 'Auto lets AVONIC manage fans, pumps, and alerts. Switch to Manual when you want direct control over every actuator.', side: 'bottom', align: 'end' }
          },
          // DUMMY — keeps mode-selector at idx 0 as non-last so onNextClick fires
          { element: '#page-bin1 .mode-selector-wrap', popover: { title: '', description: '' } },
        ]
      });
      dm.drive();
    }

    // ── Segment 2a+b: Sensor grid + soil card (steps 4–5) ─────────
    const d2 = window.driver.js.driver({
      popoverClass: 'av-tour-popover', showProgress: false,
      nextBtnText: 'Next →', prevBtnText: '← Back', doneBtnText: 'Next →',
      allowClose: true, smoothScroll: true,
      onCloseClick() { tourCleanup(); d2.destroy(); },
      onNextClick() {
        const idx = d2.getActiveIndex();
        if (idx === 0) {
          d2.moveNext();
        } else if (idx === 1) {
          // Destroy d2's overlay NOW before the modal opens — having two
          // overlays active at once caused the visible flicker that required
          // a second click to proceed. The d2.destroy() inside showManual's
          // callback becomes a harmless no-op.
          d2.destroy();
          function showAuto() {
            window.avonicTourSensorPreview('auto', showManual, null);
          }
          function showManual() {
            window.avonicTourSensorPreview(
              'manual',
              function() {
                // Tear down modal state directly without going through
                // window.closeAllModals() (which is patched and fights our buttons)
                ModalManager.closeAll();
                document.body.classList.remove('av-tour-sensor');
                const m = document.getElementById('sensor-detail-modal');
                const o = document.getElementById('sys-modal-overlay');
                if (m) m.classList.remove('show', 'tour-preview');
                if (o) o.classList.remove('show', 'tour-preview');
                // Destroy d2 so its overlay doesn't flicker, then launch
                // the mode-selector step as a fresh independent driver.
                d2.destroy();
                setTimeout(startModeTour, 80);
              },
              showAuto
            );
          }
          showAuto();
        }
      },
      steps: [
        {
          element: '#page-bin1 .sensor-grid',
          popover: { title: `📡 Live Sensor Readings ${SUB(4)}`, description: 'Four sensors update every 10 seconds. Green ring = optimal, yellow = warning, red = needs attention.', side: 'top', align: 'center' }
        },
        {
          element: '#b1-soil-card',
          popover: { title: `👆 Tap Any Sensor Card ${SUB(5)}`, description: 'Tapping a card opens its detail view — current reading, worm health status, and actuator controls when in Manual mode.', side: 'bottom', align: 'start' }
        },
        // DUMMY — keeps soil-card at idx 1 as non-last so onNextClick fires
        { element: '#b1-soil-card', popover: { title: '', description: '' } },
      ]
    });
    d2.drive();
  }

  // ── Segment 1: Home (steps 1–3) ───────────────────────────────
  // Set hash first, then wait one NAV tick for the Router's hashchange
  // handler to activate #page-home before Driver.js measures positions.
  // Without this delay the popover lands at top-left (element not yet visible).
  window.location.hash = '#/home';

  const d1 = window.driver.js.driver({
    popoverClass: 'av-tour-popover', showProgress: false,
    nextBtnText: 'Next →', prevBtnText: '← Back', doneBtnText: 'Next →',
    allowClose: true, smoothScroll: true,
    onCloseClick() { tourCleanup(); d1.destroy(); },
    onNextClick() {
      if (d1.getActiveIndex() === 2) {
        d1.destroy();
        window.location.hash = '#/bin1';
        setTimeout(startBinTour, NAV);
      } else {
        d1.moveNext();
      }
    },
    steps: [
      { element: '.status-pills',    popover: { title: `🔋 Machine Status ${SUB(1)}`, description: 'Battery level, water tank, and water temperature at a glance. Tap any pill to see full details.', side: 'bottom', align: 'end' } },
      { element: '.tb-bin-selector', popover: { title: `🪣 Switch Bins ${SUB(2)}`,   description: 'Managing multiple bins? Use this dropdown to jump between them instantly. Each shows its own live readings.', side: 'bottom', align: 'end' } },
      { element: '.bins-grid',       popover: { title: `📦 Your Bins ${SUB(3)}`,      description: 'Tap a bin card to open its live monitoring view. The dot next to the mode label shows Auto or Manual.', side: 'top', align: 'center' } },
      // DUMMY — keeps .bins-grid at idx 2 as non-last so onNextClick fires
      { element: '.bins-grid', popover: { title: '', description: '' } },
    ]
  });

  setTimeout(function () { d1.drive(); }, NAV);
};

/**
 * maybeStartTour()
 * Called after loadDevices() resolves. Checks localStorage flag set by
 * Phase 2 (welcome modal CTA) and fires the tour if bins are present.
 */
function maybeStartTour() {
  try {
    const armed     = localStorage.getItem('avonic_tour_ready') === 'true';
    const hasDevice = S.bins && S.bins.length > 0;
    const modal     = document.getElementById('av-modal-overlay');
    const modalOpen = modal && modal.style.display !== 'none';
    if (armed && hasDevice && !modalOpen) {
      setTimeout(window.avonicStartTour, 800);
    }
  } catch (e) {}
}
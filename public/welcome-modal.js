/**
 * welcome-modal.js — AVONIC Welcome Modal  v3
 * Drop after lang.js. No dependencies, no fuss.
 *
 *  DEV_MODE = true  → always reopens, dev toolbar visible
 *  DEV_MODE = false → shows once per session (production)
 */

(function () {
  'use strict';

  /* ┌──────────────────────────────────────┐
     │  🔧 FLIP TO false BEFORE DEPLOYING   │
     └──────────────────────────────────────┘ */
  var DEV_MODE = true;

  var STORAGE_KEY = 'avonic_lang';
  var MODAL_SEEN  = 'avonic_modal_seen';

  if (!DEV_MODE) {
    try { if (sessionStorage.getItem(MODAL_SEEN)) return; } catch (e) {}
  }


  try { localStorage.removeItem('avonic_tour_ready'); } catch (e) {}

  /* ─────────────────────────────────────────────
     COPY
  ───────────────────────────────────────────── */
  var COPY = {
    en: {
      eyebrow:   'Welcome to AVONIC',
      heading:   'Healthier worms,<br>better harvests.',
      body:      'AVONIC monitors your vermicomposting bin so you never have to guess — just grow.',
      langLabel: 'Choose your language to get started',
      cta:       'Get Started →',
      skip:      'Skip',
    },
    tl: {
      eyebrow:   'Maligayang pagdating sa AVONIC',
      heading:   'Mas malusog na uod,<br>mas magandang ani.',
      body:      'Sinusubaybayan ng AVONIC ang iyong vermicomposting bin para hindi ka na kailangang humulaan — mag-focus ka na lang sa pagtatanim.',
      langLabel: 'Piliin ang iyong wika para magsimula',
      cta:       'Magsimula →',
      skip:      'Laktawan',
    }
  };

  /* ─────────────────────────────────────────────
     STYLES
  ───────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = [

    '#av-modal-overlay {',
    '  position: fixed; inset: 0; z-index: 9999;',
    '  display: flex; align-items: center; justify-content: center;',
    '  padding: 20px;',
    '  background: rgba(10,22,14,0.72);',
    '  backdrop-filter: blur(6px);',
    '  -webkit-backdrop-filter: blur(6px);',
    '  opacity: 0; transition: opacity 0.3s ease;',
    '}',
    '#av-modal-overlay.av-visible { opacity: 1; }',

    '#av-modal-card {',
    '  width: 100%; max-width: 400px;',
    '  background: #F2EDE3;',
    '  border-radius: 20px;',
    '  border: 1.5px solid rgba(30,58,40,0.1);',
    '  box-shadow: 0 20px 60px rgba(10,22,14,0.3);',
    '  padding: 32px 28px 24px;',
    '  font-family: "Plus Jakarta Sans", sans-serif;',
    '  transform: translateY(20px) scale(0.98);',
    '  transition: transform 0.38s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease;',
    '  opacity: 0;',
    '}',
    '#av-modal-overlay.av-visible #av-modal-card {',
    '  transform: translateY(0) scale(1); opacity: 1;',
    '}',

    /* Logo mark */
    '#av-modal-logomark {',
    '  width: 44px; height: 44px;',
    '  background: #1E3A28;',
    '  border-radius: 12px;',
    '  display: flex; align-items: center; justify-content: center;',
    '  margin-bottom: 18px;',
    '}',

    /* Eyebrow */
    '#av-modal-eyebrow {',
    '  display: inline-flex; align-items: center; gap: 5px;',
    '  font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em;',
    '  text-transform: uppercase; color: #4A7C3F;',
    '  background: rgba(74,124,63,0.1); border-radius: 99px;',
    '  padding: 3px 10px; margin-bottom: 14px;',
    '}',

    /* Heading */
    '#av-modal-heading {',
    '  font-family: "DM Serif Display", Georgia, serif;',
    '  font-size: clamp(22px, 6vw, 26px); line-height: 1.2;',
    '  color: #1E3A28; margin: 0 0 10px;',
    '}',

    /* Body */
    '#av-modal-body {',
    '  font-size: 13.5px; color: #5A5A5A;',
    '  line-height: 1.55; margin: 0 0 20px;',
    '}',

    /* Divider */
    '#av-modal-card hr {',
    '  border: none; border-top: 1.5px solid #E8E0D0;',
    '  margin: 0 0 14px;',
    '}',

    /* Lang label */
    '#av-modal-lang-label {',
    '  display: block;',
    '  font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em;',
    '  text-transform: uppercase; color: #bbb;',
    '  margin-bottom: 8px;',
    '}',

    /* Lang buttons */
    '#av-modal-lang-btns { display: flex; gap: 8px; margin-bottom: 20px; }',
    '.av-lang-btn {',
    '  flex: 1; padding: 10px 0;',
    '  border-radius: 10px;',
    '  border: 1.5px solid #E8E0D0;',
    '  background: #fff;',
    '  font-family: "Plus Jakarta Sans", sans-serif;',
    '  font-size: 13px; font-weight: 700; color: #5A5A5A;',
    '  cursor: pointer;',
    '  display: flex; align-items: center; justify-content: center; gap: 6px;',
    '  transition: border-color 0.15s, color 0.15s, background 0.15s, box-shadow 0.15s;',
    '}',
    '.av-lang-btn:hover { border-color: #4A7C3F; color: #1E3A28; }',
    '.av-lang-btn.av-selected {',
    '  background: #1E3A28; border-color: #1E3A28;',
    '  color: #fff; box-shadow: 0 2px 10px rgba(30,58,40,0.2);',
    '}',

    /* CTA */
    '#av-modal-cta {',
    '  width: 100%; padding: 13px;',
    '  background: #ECBD01; color: #1A1A1A;',
    '  border: 1.5px solid #1A1A1A;',
    '  border-radius: 99px;',
    '  font-family: "Plus Jakarta Sans", sans-serif;',
    '  font-size: 14px; font-weight: 700;',
    '  cursor: pointer; margin-bottom: 10px;',
    '  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;',
    '}',
    '#av-modal-cta:hover {',
    '  background: #E8B84B;',
    '  box-shadow: 1px 3px 0 0 rgba(0,0,0,1);',
    '  transform: translateY(-1px);',
    '}',

    /* Skip */
    '#av-modal-skip {',
    '  display: block; width: 100%; text-align: center;',
    '  background: none; border: none;',
    '  font-family: "Plus Jakarta Sans", sans-serif;',
    '  font-size: 12px; color: #aaa;',
    '  cursor: pointer; padding: 2px;',
    '  transition: color 0.15s;',
    '}',
    '#av-modal-skip:hover { color: #1E3A28; }',

    /* Close */
    '#av-modal-close {',
    '  position: absolute; top: 14px; right: 14px;',
    '  background: none; border: none; cursor: pointer;',
    '  font-size: 20px; color: #bbb; line-height: 1;',
    '  padding: 2px 6px; border-radius: 6px;',
    '  transition: color 0.15s, background 0.15s;',
    '}',
    '#av-modal-close:hover { color: #1E3A28; background: rgba(30,58,40,0.07); }',

  ].join('\n');
  document.head.appendChild(style);

  /* ─────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────── */
  var savedLang = 'en';
  try { savedLang = localStorage.getItem(STORAGE_KEY) || 'en'; } catch (e) {}
  var currentLang = savedLang === 'tl' ? 'tl' : 'en';
  function t(k) { return COPY[currentLang][k]; }

  /* ─────────────────────────────────────────────
     BUILD DOM
  ───────────────────────────────────────────── */
  var overlay = document.createElement('div');
  overlay.id = 'av-modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'av-modal-heading');

  var card = document.createElement('div');
  card.id = 'av-modal-card';
  card.style.position = 'relative';

  /* Close × */
  var closeBtn = document.createElement('button');
  closeBtn.id = 'av-modal-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = '&times;';
  card.appendChild(closeBtn);

  /* Logo mark */
//   card.innerHTML += [
//     '<div id="av-modal-logomark">',
//     '  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">',
//     '    <ellipse cx="12" cy="9" rx="6" ry="4"/>',
//     '    <path d="M6 9c0 4.5 2.5 7.5 6 8.5 3.5-1 6-4 6-8.5"/>',
//     '    <line x1="12" y1="1" x2="12" y2="5"/>',
//     '  </svg>',
//     '</div>',
//   ].join('');

  /* Eyebrow */
  var eyebrow = document.createElement('div');
  eyebrow.id = 'av-modal-eyebrow';
  eyebrow.innerHTML =
    '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' +
    '<span id="av-modal-eyebrow-text"></span>';
  card.appendChild(eyebrow);

  /* Heading */
  var heading = document.createElement('h2');
  heading.id = 'av-modal-heading';
  card.appendChild(heading);

  /* Body */
  var body = document.createElement('p');
  body.id = 'av-modal-body';
  card.appendChild(body);

  /* Divider */
  card.appendChild(document.createElement('hr'));

  /* Lang label */
  var langLabel = document.createElement('span');
  langLabel.id = 'av-modal-lang-label';
  card.appendChild(langLabel);

  /* Lang buttons */
  var langBtns = document.createElement('div');
  langBtns.id = 'av-modal-lang-btns';

  var btnEN = document.createElement('button');
  btnEN.className = 'av-lang-btn' + (currentLang === 'en' ? ' av-selected' : '');
  btnEN.dataset.lang = 'en';
  btnEN.innerHTML = '<span style="font-size:15px">🇺🇸</span> English';

  var btnTL = document.createElement('button');
  btnTL.className = 'av-lang-btn' + (currentLang === 'tl' ? ' av-selected' : '');
  btnTL.dataset.lang = 'tl';
  btnTL.innerHTML = '<span style="font-size:15px">🇵🇭</span> Tagalog';

  langBtns.appendChild(btnEN);
  langBtns.appendChild(btnTL);
  card.appendChild(langBtns);

  /* CTA */
  var cta = document.createElement('button');
  cta.id = 'av-modal-cta';
  cta.textContent = t('cta');
  card.appendChild(cta);

  /* Skip */
  var skip = document.createElement('button');
  skip.id = 'av-modal-skip';
  skip.textContent = t('skip');
  card.appendChild(skip);

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  /* ─────────────────────────────────────────────
     LANGUAGE SWITCH
  ───────────────────────────────────────────── */
  function switchLang(lang) {
    currentLang = lang;

    document.getElementById('av-modal-eyebrow-text').textContent = t('eyebrow');
    heading.innerHTML     = t('heading');
    body.textContent      = t('body');
    langLabel.textContent = t('langLabel');
    cta.textContent       = t('cta');
    skip.textContent      = t('skip');

    [btnEN, btnTL].forEach(function (b) {
      b.classList.toggle('av-selected', b.dataset.lang === lang);
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}

    document.querySelectorAll('.lang-dropdown').forEach(function (sel) {
      sel.value = lang;
      var ev = document.createEvent('Event');
      ev.initEvent('change', true, true);
      sel.dispatchEvent(ev);
    });

    document.documentElement.lang = lang === 'tl' ? 'tl' : 'en';
  }

  btnEN.addEventListener('click', function () { switchLang('en'); });
  btnTL.addEventListener('click', function () { switchLang('tl'); });

  /* ─────────────────────────────────────────────
     OPEN / CLOSE
  ───────────────────────────────────────────── */
  function openModal() {
    overlay.style.display = 'flex';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add('av-visible');
      });
    });
    document.body.style.overflow = 'hidden';
  }

  function closeModal(onComplete) {
  overlay.classList.remove('av-visible');
  document.body.style.overflow = '';
  if (!DEV_MODE) {
    try { sessionStorage.setItem(MODAL_SEEN, '1'); } catch (e) {}
  }
  setTimeout(function () {
    overlay.style.display = 'none';
    if (typeof onComplete === 'function') onComplete();
  }, 320);
}

  closeBtn.addEventListener('click', closeModal);
  skip.addEventListener('click', closeModal);

  /* ── Phase 2: CTA → Tour Bridge ─────────────────────────────
     "Get Started" saves the language, sets a tour flag, then
     fires the Driver.js tour if the dashboard already has a bin.
     If the user hasn't claimed a bin yet the flag stays in
     localStorage and maybeStartTour() in app.js picks it up
     automatically after the first successful claim.           */
cta.addEventListener('click', function () {
  try { localStorage.setItem(STORAGE_KEY, currentLang); } catch (e) {}
  try { localStorage.setItem('avonic_tour_ready', 'true'); } catch (e) {}

  closeModal(function () {
    if (typeof window.avonicStartTour === 'function') {
      window.avonicStartTour();
    }
  });
});
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  /* ─────────────────────────────────────────────
     DEV TOOLBAR
  ───────────────────────────────────────────── */
  function injectDevToolbar() {
    var s = document.createElement('style');
    s.textContent = [
      '#av-dev-bar {',
      '  position: fixed; bottom: 18px; right: 18px; z-index: 99999;',
      '  display: flex; align-items: center; gap: 8px;',
      '  background: #1A1A1A; border-radius: 99px;',
      '  padding: 7px 14px 7px 10px;',
      '  box-shadow: 0 4px 20px rgba(0,0,0,0.4);',
      '  font-family: "Plus Jakarta Sans", monospace;',
      '  font-size: 11px; font-weight: 700; color: #ECBD01;',
      '  letter-spacing: 0.06em; user-select: none;',
      '}',
      '.av-dev-dot {',
      '  width: 7px; height: 7px; border-radius: 50%;',
      '  background: #ECBD01; flex-shrink: 0;',
      '  animation: av-blink 1.4s ease-in-out infinite;',
      '}',
      '@keyframes av-blink { 0%,100%{opacity:1} 50%{opacity:0.2} }',
      '.av-dev-divider { width:1px; height:14px; background:rgba(255,255,255,0.12); margin:0 2px; }',
      '.av-dev-btn {',
      '  background: rgba(255,255,255,0.07);',
      '  border: 1px solid rgba(255,255,255,0.13);',
      '  border-radius: 99px; color: #fff;',
      '  font-size: 11px; font-weight: 700;',
      '  font-family: inherit; letter-spacing: 0.04em;',
      '  cursor: pointer; padding: 3px 10px;',
      '  transition: background 0.15s, border-color 0.15s, color 0.15s;',
      '}',
      '.av-dev-btn:hover { background: rgba(236,189,1,0.16); border-color: #ECBD01; color: #ECBD01; }',
    ].join('\n');
    document.head.appendChild(s);

    var bar = document.createElement('div');
    bar.id = 'av-dev-bar';
    bar.innerHTML =
      '<span class="av-dev-dot"></span>' +
      '<span style="margin-right:2px">DEV</span>' +
      '<span class="av-dev-divider"></span>';

    var reopenBtn = document.createElement('button');
    reopenBtn.className = 'av-dev-btn';
    reopenBtn.textContent = '↩ Reopen';
    reopenBtn.addEventListener('click', openModal);
    bar.appendChild(reopenBtn);

    var resetBtn = document.createElement('button');
    resetBtn.className = 'av-dev-btn';
    resetBtn.textContent = '🗑 Reset';
    resetBtn.addEventListener('click', function () {
      try {
        sessionStorage.removeItem(MODAL_SEEN);
        localStorage.removeItem(MODAL_SEEN);
      } catch (e) {}
      resetBtn.textContent = '✓ Done';
      setTimeout(function () { resetBtn.textContent = '🗑 Reset'; }, 1400);
    });
    bar.appendChild(resetBtn);

    document.body.appendChild(bar);
  }

  /* ─────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────── */
  function init() {
    switchLang(currentLang);
    setTimeout(openModal, 420);
    if (DEV_MODE) injectDevToolbar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
/**
 * lang.js — AVONIC Language Switcher
 * Supports: English (en) and Tagalog (tl)
 * Persists preference via localStorage.
 *
 * Usage:
 *   - Add  data-i18n="key"       to elements whose textContent should swap.
 *   - Add  data-i18n-html="key"  to elements whose innerHTML should swap
 *     (use only when the translation contains safe HTML like <strong>).
 *   - Add  id="lang-dropdown-desktop"  to the desktop <select> element.
 *   - Add  id="lang-dropdown-mobile"   to the mobile <select> element.
 *   - (Legacy toggle buttons with class="lang-toggle-btn" still work.)
 *   - Add  class="lang-display-label"  to any span that shows the current
 *     language abbreviation (EN / TL).
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'avonic_lang';

  /* ─────────────────────────────────────────────
     TRANSLATION DICTIONARY
  ───────────────────────────────────────────── */
  var translations = {

    /* ── ENGLISH (default) ─────────────────── */
    en: {
      /* Nav */
      'nav-login':     'Login',
      'nav-signup':    'Sign-up',
      'nav-farmers':   'Filipino Farmers',
      'nav-features':  'Features',
      'nav-hiw':       'How It Works',
      'nav-gs':        'Get Started',
      'nav-tutorials': 'Tutorials',
      'nav-faq':       'FAQ',

      /* Hero */
      'hero-badge':  'LOCALIZED  •  AUTOMATED  •  SUSTAINABLE',
      'hero-h1-1':   'Smarter',
      'hero-h1-2':   'Worm Health.',
      'hero-h1-3':   'Better Compost.',
      'hero-body':   'AVONIC monitors your vermicomposting bin in real-time — tracking soil moisture, temperature, humidity, and gas levels so your worms always thrive.',
      'hero-cta':    'Get Started →',
      'hero-stat-1': 'Sensors Tracked',
      'hero-stat-2': 'Smart Modes',
      'hero-stat-3': 'Real-time Data',

      /* Watches section */
      /* Watches section */
      'watches-eyebrow':  'Sensor Data',
      'watches-h2':       'What <span style="color:#4A7C3F;font-style:italic;">AVONIC</span> Watches',
      'watches-subhead':  'Four critical parameters — monitored continuously so your worms always have the perfect environment.',
      'watches-note':     'These are live sensor values that update automatically',

      /* Farmers section */
      'farmers-eyebrow':   'THIS PROJECT IS DEDICATED FOR OUR HARDWORKING',
      'farmers-h2':        'Filipino Farmers',
      'farmers-mission':   'it\'s our mission to make them become more productive than ever',
      'farmers-body':      'Vermicomposting is transforming agriculture across the Philippines, but managing worm bins effectively remains a challenge. AVONIC gives every Filipino farmer the smart tools they need — no expertise required.',
      'farmers-tag-1':     'Boosts soil quality',
      'farmers-tag-2':     'Mobile monitoring',
      'farmers-tag-3':     'Zero-waste farming',
      'farmers-learn':     'Learn about our impact',

      /* System / What is AVONIC section */
      'system-eyebrow':    'What is AVONIC?',
      'system-h2-1':       'A Vermicomposting',
      'system-h2-2':       'System That',
      'system-h2-3':       'Thinks For You',
      'system-feat-1':     'Real-time soil moisture tracking and alerts',
      'system-feat-2':     'Automatic temperature and humidity regulation',
      'system-feat-3':     'Harmful gas level detection before damage occurs',
      'system-feat-4':     'Mobile alerts so you never miss a critical change',
      'system-callout-label': 'Why traditional vermicomposting keeps failing',
      'system-callout-body':  'Most farmers rely on guesswork — checking moisture by feel, eyeballing temperature, missing early warning signs. Without real data, worm colonies crash silently. AVONIC replaces guesswork with precision monitoring, 24/7.',

      /* Modes */
      'modes-eyebrow':        'Smart Control',
      'modes-h2-plain':       'What\'s Your ',
      'modes-h2-em':          'Mode?',
      'modes-subhead':        'Choose how AVONIC manages your bin — let it think for you, or take full control yourself.',
      'modes-tab-auto':       'Auto Mode',
      'modes-tab-manual':     'Manual Mode',
      'modes-auto-badge':     '✦ Recommended',
      'modes-auto-h3-plain':  'Auto Mode — ',
      'modes-auto-h3-em':     'Set it & forget it',
      'modes-auto-body':      'The system continuously monitors all four parameters and automatically adjusts conditions to keep your worms in the perfect environment. AVONIC reacts in real-time — so you can focus on your farm, not your bin.',
      'modes-auto-feat-1':    'Real-time automated adjustments',
      'modes-auto-feat-2':    'Smart alerts only when action is needed',
      'modes-auto-feat-3':    'Learns optimal patterns over time',
      'modes-manual-badge':   'Full Control',
      'modes-manual-h3-plain':'Manual Mode — ',
      'modes-manual-h3-em':   'You call the shots',
      'modes-manual-body':    'Take complete control of your vermicomposting system. Manually adjust moisture, temperature, and ventilation from the app — ideal for experienced farmers who know exactly what their worms need.',
      'modes-manual-feat-1':  'Full manual override from the app',
      'modes-manual-feat-2':  'Adjust any parameter remotely, anytime',
      'modes-manual-feat-3':  'Live sensor data always visible',

      /* Get Started */
      'gs-eyebrow':     'Onboarding',
      'gs-h2-plain':    'How to get ',
      'gs-h2-em':       'started',
      'gs-step1-label': 'Step 1',
      'gs-step1-title': 'Register your AVONIC account',
      'gs-step1-body':  'Create your free account in seconds. No credit card needed — just your email and you\'re in.',
      'gs-step2-label': 'Step 2',
      'gs-step2-title': 'Log in to your account',
      'gs-step2-body':  'Sign in on any device — mobile, tablet, or desktop. Your dashboard is always in sync.',
      'gs-step3-label': 'Step 3',
      'gs-step3-title': 'Connect to your ESP ID',
      'gs-step3-body':  'Pair your AVONIC sensor module by entering your unique ESP ID. Live data starts flowing immediately.',
      'gs-cta':         'Register Now',

      /* Tutorials section */
      'tutorials-eyebrow':   'Learn AVONIC',
      'tutorials-h2':        'Watch the Tutorials',
      'tutorials-subhead':   'Get up and running fast with our step-by-step video guides.',
      'tutorials-card1-tag': 'Getting Started',
      'tutorials-card1-title': 'Setting up your AVONIC device',
      'tutorials-card2-tag': 'Dashboard',
      'tutorials-card2-title': 'Reading your sensor data live',
      'tutorials-card3-tag': 'Advanced',
      'tutorials-card3-title': 'Auto vs Manual mode explained',
      'tutorials-watch-more': 'Watch More',

      /* Contributes / SDG section */
      'contributes-eyebrow': 'Sustainability Impact',
      'contributes-h2-plain':'This Project',
      'contributes-h2-em':   'Contributes To',
      'contributes-subhead': 'AVONIC aligns with the United Nations Sustainable Development Goals, bringing technology to farming communities that need it most.',
      'contributes-sdg2-title': 'SDG 2: Zero Hunger',
      'contributes-sdg2-body':  'AVONIC supports sustainable agriculture by improving compost quality and plant health, helping local farmers grow more nutritious crops with fewer resources.',
      'contributes-sdg12-title':'SDG 12: Responsible Consumption and Production',
      'contributes-sdg12-body': 'By recycling organic waste through vermicomposting, AVONIC promotes responsible production and consumption, reducing landfill waste and closing the nutrient loop in farming.',
      'contributes-sdg15-title':'SDG 15: Life on Land',
      'contributes-sdg15-body': 'AVONIC supports the restoration and sustainable management of land ecosystems by improving soil health and promoting sustainable agriculture, helping local farmers cultivate crops responsibly while protecting biodiversity and preventing land degradation.',
      'contributes-quote':      '"By putting smart technology in the hands of Filipino farmers, we\'re not just improving harvests — we\'re building a more sustainable future for agriculture."',
      'contributes-quote-attr': '— AVONIC Team',

      /* FAQ */
      'faq-badge':   'Got Questions?',
      'faq-h2-line1':'Frequently\u00a0 Asked',
      'faq-h2-em':   'Questions',
      'faq-q1': 'What sensors does AVONIC use?',
      'faq-a1': 'AVONIC uses four precision sensors: a soil moisture sensor, a DHT22 temperature and humidity sensor, and an MQ-4 gas sensor to detect harmful methane or ammonia levels. All readings are captured in real-time and transmitted to your AVONIC dashboard via Wi-Fi.',
      'faq-q2': 'Do I need technical knowledge to use AVONIC?',
      'faq-a2': 'Not at all. AVONIC is designed with Filipino farmers in mind — no coding or tech experience required. Simply plug in your device, connect it to your Wi-Fi, and follow the step-by-step setup tutorial in the app. The dashboard uses simple visuals and plain language to show you exactly what your bin needs.',
      'faq-q3': 'What is the difference between Auto Mode and Manual Mode?',
      'faq-a3': 'In <strong style="color:#1A1A1A;">Auto Mode</strong>, AVONIC continuously monitors your bin and automatically activates pumps, fans, or alerts when values go out of the optimal range — a true set-it-and-forget-it experience. In <strong style="color:#1A1A1A;">Manual Mode</strong>, you receive all the same real-time data but control every action yourself, giving you full visibility and hands-on management of your bin.',
      'faq-q4': 'Is AVONIC suitable for large-scale farms?',
      'faq-a4': 'AVONIC works great for both home gardeners and larger operations. Each unit monitors one bin independently, and multiple units can be registered to a single account — giving you a unified dashboard view across all your bins from one screen.',

      /* Footer */
      'footer-tagline':      'Smart vermicomposting IoT for Filipino farmers. Monitor, automate, and grow — from anywhere.',
      'footer-col-product':  'Product',
      'footer-link-features':'Features',
      'footer-link-hiw':     'How It Works',
      'footer-link-gs':      'Get Started',
      'footer-link-tutorials':'Tutorials',
      'footer-col-learn':    'Learn',
      'footer-link-farmers': 'Filipino Farmers',
      'footer-link-vermi':   'Vermicomposting',
      'footer-link-sdg':     'SDG Impact',
      'footer-link-faq':     'FAQ',
      'footer-col-gs':       'Get Started',
      'footer-gs-body':      'Ready to put your vermicomposting bin on autopilot? Register your AVONIC account today.',
      'footer-gs-cta':       'Register Now',
      'footer-copyright':    '© 2025 AVONIC. All rights reserved. Built for Filipino farmers. 🇵🇭',
      'footer-privacy':      'Privacy Policy',
      'footer-terms':        'Terms of Service',
      'footer-contact':      'Contact',

      /* Sensor */
    'sensor-soil': 'Soil Moisture',
      'sensor-temp': 'Temperature',
      'sensor-hum':  'Humidity',
      'sensor-gas':  'Gas Levels',
    },

    /* ── TAGALOG ───────────────────────────── */
    tl: {
      /* Nav */
      'nav-login':     'Mag-log in',
      'nav-signup':    'Mag-sign up',
      'nav-farmers':   'Mga Magsasaka',
      'nav-features':  'Mga Feature',
      'nav-hiw':       'Paano Gumagana',
      'nav-gs':        'Magsimula',
      'nav-tutorials': 'Mga Tutorial',
      'nav-faq':       'FAQ',

      /* Hero */
      'hero-badge':  'LOKAL  •  AWTOMATIKO  •  NAPAPANATILI',
      'hero-h1-1':   'Mas Matalinong',
      'hero-h1-2':   'Kalusugan ng Uod.',
      'hero-h1-3':   'Mas Magandang Compost.',
      'hero-body':   'Sinusubaybayan ng AVONIC ang iyong vermicomposting bin sa real-time — tinitiyak na laging malusog ang iyong mga uod sa pamamagitan ng pagsubaybay sa tubig, temperatura, humidity, at gas.',
      'hero-cta':    'Magsimula →',
      'hero-stat-1': 'Sensor',
      'hero-stat-2': 'Paraan',
      'hero-stat-3': 'Live na Data',

     
      /* Watches section */
      'watches-eyebrow':  'Data ng Sensor',
      'watches-h2':       'Ano ang Sinusubaybayan ng <span style="color:#4A7C3F;font-style:italic;">AVONIC</span>',
      'watches-subhead':  'Apat na mahalagang parameter — patuloy na sinusubaybayan para laging perpekto ang kapaligiran ng iyong mga uod.',
      'watches-note':     'Ito ay live na halaga ng sensor na awtomatikong nag-a-update',

      /* Farmers section */
      'farmers-eyebrow':   'ANG PROYEKTONG ITO AY PARA SA ATING MGA SIPAG NA',
      'farmers-h2':        'Mga Magsasakang Pilipino',
      'farmers-mission':   'ang aming misyon ay gawing mas produktibo sila kaysa dati',
      'farmers-body':      'Binabago ng vermicomposting ang agrikultura sa buong Pilipinas, ngunit ang epektibong pamamahala ng worm bin ay nananatiling isang hamon. Ibinibigay ng AVONIC sa bawat Pilipinong magsasaka ang matalinong kagamitan na kailangan nila — hindi kailangan ng kaalaman.',
      'farmers-tag-1':     'Nagpapabuti ng kalidad ng lupa',
      'farmers-tag-2':     'Mobile na pagsubaybay',
      'farmers-tag-3':     'Zero-waste na pagsasaka',
      'farmers-learn':     'Alamin ang aming epekto',

      /* System / What is AVONIC section */
      'system-eyebrow':    'Ano ang AVONIC?',
      'system-h2-1':       'Isang Vermicomposting',
      'system-h2-2':       'System Na',
      'system-h2-3':       'Nag-iisip Para sa Iyo',
      'system-feat-1':     'Real-time na pagsubaybay at alerto sa soil moisture',
      'system-feat-2':     'Awtomatikong regulasyon ng temperatura at humidity',
      'system-feat-3':     'Pagtuklas ng mapanganib na gas bago pa mangyari ang pinsala',
      'system-feat-4':     'Mga alerto sa mobile para hindi ka makaligtaan ng mahalagang pagbabago',
      'system-callout-label': 'Bakit palaging nabibigo ang tradisyonal na vermicomposting',
      'system-callout-body':  'Karamihan sa mga magsasaka ay umaasa sa hula — sinusuri ang moisture sa pamamagitan ng pakiramdam, tinitingnan ang temperatura, nawawala ang maagang babala. Kung wala ang tunay na datos, ang mga kolonya ng uod ay tahimik na guguho. Pinapalitan ng AVONIC ang hula ng tumpak na pagsubaybay, 24/7.',

      /* Modes */
      'modes-eyebrow':        'Matalinong Kontrol',
      'modes-h2-plain':       'Ano ang Iyong ',
      'modes-h2-em':          'Paraan?',
      'modes-subhead':        'Piliin kung paano pangasiwain ng AVONIC ang iyong bin — hayaan itong mag-isip, o ikaw na ang mag-kontrol.',
      'modes-tab-auto':       'Auto Mode',
      'modes-tab-manual':     'Manual Mode',
      'modes-auto-badge':     '✦ Inirerekomenda',
      'modes-auto-h3-plain':  'Auto Mode — ',
      'modes-auto-h3-em':     'Itakda na, Hayaan Na',
      'modes-auto-body':      'Patuloy na sinusubaybayan ng system ang lahat ng sensor at awtomatikong inaayos ang kondisyon para manatiling malusog ang iyong mga uod. Tumutugon ang AVONIC sa real-time — kaya makapagtuon ka sa iyong bukid, hindi sa bin.',
      'modes-auto-feat-1':    'Awtomatikong pag-aayos sa real-time',
      'modes-auto-feat-2':    'Alerto lamang kapag kailangan ng aksyon',
      'modes-auto-feat-3':    'Natututo ng pinakamainam na kondisyon',
      'modes-manual-badge':   'Buong Kontrol',
      'modes-manual-h3-plain':'Manual Mode — ',
      'modes-manual-h3-em':   'Ikaw ang Bahala',
      'modes-manual-body':    'Ikaw ang mag-kontrol ng iyong vermicomposting system. Manu-manong ayusin ang tubig, temperatura, at hangin mula sa app — angkop para sa bihasang magsasaka na alam kung ano ang kailangan ng kanyang mga uod.',
      'modes-manual-feat-1':  'Buong kontrol mula sa app',
      'modes-manual-feat-2':  'Ayusin ang anumang sensor kahit saan, kahit kailan',
      'modes-manual-feat-3':  'Laging makikita ang live na datos ng sensor',

      /* Get Started */
      'gs-eyebrow':     'Pagsisimula',
      'gs-h2-plain':    'Paano ',
      'gs-h2-em':       'magsimula',
      'gs-step1-label': 'Hakbang 1',
      'gs-step1-title': 'Mag-register ng AVONIC account',
      'gs-step1-body':  'Gumawa ng libreng account sa ilang segundo. Hindi kailangan ng credit card — email mo lang, tapos na.',
      'gs-step2-label': 'Hakbang 2',
      'gs-step2-title': 'Mag-log in sa iyong account',
      'gs-step2-body':  'Mag-sign in sa anumang device — cellphone, tablet, o kompyuter. Laging updated ang iyong dashboard.',
      'gs-step3-label': 'Hakbang 3',
      'gs-step3-title': 'Ikonekta ang iyong ESP ID',
      'gs-step3-body':  'I-pair ang iyong AVONIC sensor module sa pamamagitan ng paglalagay ng iyong ESP ID. Agad magsisimula ang live na datos.',
      'gs-cta':         'Mag-register Na',

      /* Tutorials section */
      'tutorials-eyebrow':   'Alamin ang AVONIC',
      'tutorials-h2':        'Panoorin ang mga Tutorial',
      'tutorials-subhead':   'Makapagsimula nang mabilis sa aming hakbang-hakbang na mga gabay sa video.',
      'tutorials-card1-tag': 'Pagsisimula',
      'tutorials-card1-title': 'Pag-set up ng iyong AVONIC device',
      'tutorials-card2-tag': 'Dashboard',
      'tutorials-card2-title': 'Pagsuri ng iyong live na datos ng sensor',
      'tutorials-card3-tag': 'Advanced',
      'tutorials-card3-title': 'Auto vs Manual mode ipinaliwanag',
      'tutorials-watch-more': 'Manood Pa',

      /* Contributes / SDG section */
      'contributes-eyebrow': 'Epekto sa Sustainability',
      'contributes-h2-plain':'Ang Proyektong Ito ay',
      'contributes-h2-em':   'Nag-aambag Sa',
      'contributes-subhead': 'Naaayon ang AVONIC sa mga Sustainable Development Goals ng United Nations, nagdadala ng teknolohiya sa mga komunidad ng magsasaka na pinaka-nangangailangan.',
      'contributes-sdg2-title': 'SDG 2: Zero Hunger (Walang Gutom)',
      'contributes-sdg2-body':  'Sinusuportahan ng AVONIC ang sustainable na pagsasaka sa pamamagitan ng pagpapabuti ng kalidad ng compost at kalusugan ng halaman, tumutulong sa mga lokal na magsasaka na mapapalaki ang mas masustansiyang pananim gamit ang mas kaunting rekurso.',
      'contributes-sdg12-title':'SDG 12: Responsableng Pagkonsumo at Produksyon',
      'contributes-sdg12-body': 'Sa pamamagitan ng pag-recycle ng organic na basura sa vermicomposting, itinataguyod ng AVONIC ang responsableng produksyon at pagkonsumo, binabawasan ang basura sa landfill at isinasara ang cycle ng nutrients sa pagsasaka.',
      'contributes-sdg15-title':'SDG 15: Buhay sa Lupa',
      'contributes-sdg15-body': 'Sinusuportahan ng AVONIC ang pagpapanumbalik at napapanatiling pamamahala ng mga ecosystem ng lupa sa pamamagitan ng pagpapabuti ng kalusugan ng lupa at pagtataguyod ng sustainable na pagsasaka, tumutulong sa mga lokal na magsasaka na magtanim nang responsable habang pinoprotektahan ang biodiversity.',
      'contributes-quote':      '"Sa paglalagay ng matalinong teknolohiya sa mga kamay ng mga Pilipinong magsasaka, hindi lamang namin pinapabuti ang mga ani — nagtatayo kami ng mas napapanatiling kinabukasan para sa agrikultura."',
      'contributes-quote-attr': '— AVONIC Team',

      /* FAQ */
      'faq-badge':   'May Tanong?',
      'faq-h2-line1':'Mga Madalas',
      'faq-h2-em':   'na Tanong',
      'faq-q1': 'Anong mga sensor ang ginagamit ng AVONIC?',
      'faq-a1': 'Gumagamit ang AVONIC ng apat na sensor: soil moisture sensor, DHT22 temperature at humidity sensor, at MQ-4 gas sensor para matukoy ang mapanganib na gas. Lahat ng datos ay nakuha sa real-time at ipinapadala sa iyong AVONIC dashboard sa pamamagitan ng Wi-Fi.',
      'faq-q2': 'Kailangan ko ba ng teknikal na kaalaman para gamitin ang AVONIC?',
      'faq-a2': 'Hindi. Dinisenyo ang AVONIC para sa mga Pilipinong magsasaka — hindi kailangan ng coding o anumang teknikal na karanasan. I-plug lang ang device, ikonekta sa Wi-Fi, at sundin ang hakbang-hakbang na tutorial sa app. Gumagamit ang dashboard ng simpleng larawan at madaling salita para malaman mo agad kung ano ang kailangan ng iyong bin.',
      'faq-q3': 'Ano ang pagkakaiba ng Auto Mode at Manual Mode?',
      'faq-a3': 'Sa <strong style="color:#1A1A1A;">Auto Mode</strong>, patuloy na sinusubaybayan ng AVONIC ang iyong bin at awtomatikong nagpapaandar ng pump, fan, o alerto kapag lumabas sa tamang antas ang mga halaga — itakda na at hayaan na. Sa <strong style="color:#1A1A1A;">Manual Mode</strong>, matatanggap mo ang parehong live na datos ngunit ikaw ang mag-kontrol ng bawat aksyon, na nagbibigay sa iyo ng buong kakayahan na pamahalaan ang iyong bin.',
      'faq-q4': 'Angkop ba ang AVONIC para sa malalaking sakahan?',
      'faq-a4': 'Angkop ang AVONIC para sa mga home gardener at malalaking operasyon. Bawat unit ay nagmamasid sa isang bin nang nakapag-iisa, at maraming unit ang maaaring irehistro sa iisang account — para makita mo ang lahat ng iyong bin sa isang screen.',

      /* Footer */
      'footer-tagline':      'Matalinong vermicomposting IoT para sa mga Pilipinong magsasaka. Subaybayan, i-automate, at lumago — kahit saan.',
      'footer-col-product':  'Produkto',
      'footer-link-features':'Mga Feature',
      'footer-link-hiw':     'Paano Gumagana',
      'footer-link-gs':      'Magsimula',
      'footer-link-tutorials':'Mga Tutorial',
      'footer-col-learn':    'Matuto',
      'footer-link-farmers': 'Mga Magsasaka',
      'footer-link-vermi':   'Vermicomposting',
      'footer-link-sdg':     'SDG Impact',
      'footer-link-faq':     'FAQ',
      'footer-col-gs':       'Magsimula',
      'footer-gs-body':      'Handa na bang i-autopilot ang iyong vermicomposting bin? Mag-register ng AVONIC account ngayon.',
      'footer-gs-cta':       'Mag-register Na',
      'footer-copyright':    '© 2025 AVONIC. Lahat ng karapatan ay nakalaan. Para sa mga Pilipinong magsasaka. 🇵🇭',
      'footer-privacy':      'Patakaran sa Privacy',
      'footer-terms':        'Mga Tuntunin',
      'footer-contact':      'Makipag-ugnayan',

 /* Sensor */
      'sensor-soil': 'Moisture ng Lupa',
      'sensor-temp': 'Temperatura',
      'sensor-hum':  'Humidity',
      'sensor-gas':  'Antas ng Gas',
    }
  };

  /* ─────────────────────────────────────────────
     APPLY LANGUAGE
  ───────────────────────────────────────────── */
  function applyLang(lang) {
    var t = translations[lang];
    if (!t) return;

    /* Plain-text nodes */
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) {
        el.textContent = t[key];
      }
    });

    /* HTML nodes (contains tags like <strong>) */
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (t[key] !== undefined) {
        el.innerHTML = t[key];
      }
    });

    /* Update all language display labels (EN / TL pill) */
    document.querySelectorAll('.lang-display-label').forEach(function (el) {
      el.textContent = lang.toUpperCase();
    });

    /* Sync all dropdowns to the selected language */
    document.querySelectorAll('.lang-dropdown').forEach(function (sel) {
      sel.value = lang;
    });

    /* Update <html lang> attribute for accessibility */
    document.documentElement.lang = lang === 'tl' ? 'tl' : 'en';

    /* Persist */
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}

    /* After FAQ answers are swapped, reset any open accordion max-heights
       so they re-measure correctly with the new text length.           */
    document.querySelectorAll('.faq-item').forEach(function (item) {
      var trigger = item.querySelector('.faq-trigger');
      var body    = item.querySelector('.faq-body');
      if (!trigger || !body) return;
      var isOpen = trigger.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        body.style.maxHeight = 'none';
        var h = body.scrollHeight;
        body.style.maxHeight = h + 'px';
      }
    });
  }

  /* ─────────────────────────────────────────────
     DROPDOWN STYLES (injected once)
  ───────────────────────────────────────────── */
  function injectDropdownStyles() {
    var style = document.createElement('style');
    style.textContent = [
      '.lang-dropdown-wrap { position: relative; display: inline-flex; align-items: center; gap: 6px; }',
      '.lang-dropdown-wrap svg { pointer-events: none; flex-shrink: 0; }',
      '.lang-dropdown {',
      '  appearance: none;',
      '  -webkit-appearance: none;',
      '  background: transparent;',
      '  border: none;',
      '  outline: none;',
      '  cursor: pointer;',
      '  font-family: inherit;',
      '  font-size: 0.875rem;',
      '  font-weight: 600;',
      '  color: inherit;',
      '  padding: 0 18px 0 0;',
      '  line-height: 1;',
      '}',
      /* Custom caret via background svg */
      '.lang-dropdown-wrap::after {',
      '  content: "";',
      '  position: absolute;',
      '  right: 0;',
      '  top: 50%;',
      '  transform: translateY(-50%);',
      '  width: 10px;',
      '  height: 6px;',
      '  pointer-events: none;',
      '  background-image: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 10 6\'%3E%3Cpath d=\'M0 0l5 6 5-6z\' fill=\'currentColor\'/%3E%3C/svg%3E");',
      '  background-repeat: no-repeat;',
      '  background-size: contain;',
      '  opacity: 0.6;',
      '}',
      /* Dark option text so it's readable in browser native dropdown */
      '.lang-dropdown option { color: #1A1A1A; background: #ffffff; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ─────────────────────────────────────────────
     DROPDOWN STYLES (injected once)
  ───────────────────────────────────────────── */
  function injectDropdownStyles() {
    var style = document.createElement('style');
    style.textContent = [
      /* Wrapper handles layout and perfectly inherits text color */
      '.lang-dropdown-wrap { position: relative; display: inline-flex; align-items: center; gap: 6px; transition: color 0.3s ease; cursor: pointer; }',
      '.lang-dropdown-wrap svg { pointer-events: none; flex-shrink: 0; }',
      
      /* Select element resets and spacing */
      '.lang-dropdown {',
      '  appearance: none;',
      '  -webkit-appearance: none;',
      '  -moz-appearance: none;',
      '  background: transparent;',
      '  border: none;',
      '  outline: none;',
      '  cursor: pointer;',
      '  font-family: inherit;',
      '  font-size: 0.875rem;',
      '  font-weight: 600;',
      '  color: inherit;', 
      '  padding: 4px 18px 4px 0;', /* Added vertical padding so descenders don't clip */
      '  margin: 0;',
      '  line-height: normal;', /* Changed from 1 to normal to fix the 'g' clipping */
      '}',
      '.lang-dropdown:focus { outline: none; }',
      
      /* Bulletproof CSS Triangle for chevron (inherits currentColor natively) */
      '.lang-dropdown-wrap::after {',
      '  content: "";',
      '  position: absolute;',
      '  right: 2px;',
      '  top: 50%;',
      '  transform: translateY(-25%);',
      '  border-left: 4px solid transparent;',
      '  border-right: 4px solid transparent;',
      '  border-top: 5px solid currentColor;', 
      '  pointer-events: none;',
      '  opacity: 0.8;',
      '}',
      
      /* Style the dropdown options */
      '.lang-dropdown option { color: #1A1A1A; background: #F2EDE3; font-weight: 600; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ─────────────────────────────────────────────
     BUILD DROPDOWN ELEMENT
  ───────────────────────────────────────────── */
  function buildDropdown(savedLang) {
    var wrap = document.createElement('span');
    wrap.className = 'lang-dropdown-wrap';

    /* Globe icon */
    wrap.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';

    var sel = document.createElement('select');
    sel.className = 'lang-dropdown';
    sel.setAttribute('aria-label', 'Select language');

    // Full names here
    var optEN = document.createElement('option');
    optEN.value = 'en';
    optEN.textContent = 'English';

    var optTL = document.createElement('option');
    optTL.value = 'tl';
    optTL.textContent = 'Tagalog';

    sel.appendChild(optEN);
    sel.appendChild(optTL);
    sel.value = savedLang;

    sel.addEventListener('change', function () {
      applyLang(sel.value);
    });

    wrap.appendChild(sel);
    return wrap;
  }

  /* ─────────────────────────────────────────────
     REPLACE TOGGLE BUTTONS WITH DROPDOWNS
  ───────────────────────────────────────────── */
  function replaceToggleButtons(savedLang) {
    /* Desktop button */
    var desktopBtn = document.getElementById('lang-btn-desktop');
    if (desktopBtn) {
      var desktopDrop = buildDropdown(savedLang);
      desktopDrop.id = 'lang-btn-desktop'; // Pass ID to new element for scroll listener
      
      // Determine initial color based on scroll position on page load
      var isScrolled = (window.pageYOffset || document.documentElement.scrollTop) > 50;
      desktopDrop.style.color = isScrolled ? '#1a1a1a' : 'rgba(255, 255, 255, 0.75)';
      
      // Hover effect to brighten the white when at the top (matches your other nav links)
      desktopDrop.addEventListener('mouseenter', function() {
        if ((window.pageYOffset || document.documentElement.scrollTop) <= 50) {
          this.style.color = '#ffffff';
        }
      });
      desktopDrop.addEventListener('mouseleave', function() {
        if ((window.pageYOffset || document.documentElement.scrollTop) <= 50) {
          this.style.color = 'rgba(255, 255, 255, 0.75)';
        }
      });

      desktopBtn.parentNode.replaceChild(desktopDrop, desktopBtn);
    }

    /* Mobile toggle buttons */
    document.querySelectorAll('.lang-toggle-btn').forEach(function (btn) {
      if (btn.id === 'lang-btn-desktop') return; // Skip if already handled
      var mobileDrop = buildDropdown(savedLang);
      mobileDrop.style.color = '#1E3A28'; // Always dark inside the mobile menu pane
      btn.parentNode.replaceChild(mobileDrop, btn);
    });
  }

  /* ─────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────── */
  function init() {
    var saved = 'en';
    try { saved = localStorage.getItem(STORAGE_KEY) || 'en'; } catch (e) {}

    injectDropdownStyles();
    replaceToggleButtons(saved);
    applyLang(saved);
  }

  /* Run after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
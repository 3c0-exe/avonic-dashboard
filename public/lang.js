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

      /* ── APP-SPECIFIC (app.html) ───────────────────────────── */

      /* Sidebar nav */
      'app-nav-home':      'Home',
      'app-nav-dashboard': 'Dashboard',
      'app-nav-settings':  'Settings',
      'app-nav-logout':    'Log-out',

      /* Home page */
      'app-home-title':       'Home',
      'app-home-bins-label':  'Vermicompost Bins',

      /* Monitoring page */
      'app-monitoring-crumb-path': 'Home > Monitoring',
      'app-monitoring-crumb-name': 'Monitoring',
      'app-sensor-soilMoisture':   'Soil Moisture',
      'app-sensor-temperature':    'Temperature',
      'app-sensor-humidity':       'Humidity',
      'app-sensor-gasLevels':      'Gas Levels',

      /* Dashboard page */
      'app-dashboard-title':       'Dashboard',
      'app-dashboard-welcome':     'Welcome to AVONIC\'s Dashboard page',
      'app-dashboard-select':      'select a analytical page',
      'app-qi-title':              'Quick Insights',
      'app-qi-desc':               'Get instant snapshots of your bin\'s current conditions',
      'app-bf-title':              'Bin Fluctuations',
      'app-bf-desc':               'Get instant snapshots of your bin\'s current conditions',

      /* Settings page */
      'app-settings-title':           'Settings',
      'app-settings-account-title':   'Account Profile',
      'app-settings-username-label':  'Username',
      'app-settings-email-label':     'Email',
      'app-settings-update-profile':  'Update Profile',
      'app-settings-change-password': 'Change Password',
      'app-settings-claimed-title':   'Claimed Bins',
      'app-settings-claim-btn':       '+ Claim',
      'app-settings-resources-title': 'Resources',
      'app-settings-manual-en':       'User Manual',
      'app-settings-manual-en-lang':  '(English)',
      'app-settings-manual-tl':       'User Manual',
      'app-settings-manual-tl-lang':  '(Tagalog)',
      'app-settings-lang-title':      'Language',
      'app-settings-session-title':   'Session',
      'app-settings-last-login':      'Last Login',
      'app-settings-logout':          'Log Out',

      /* Breadcrumbs — inner dashboard pages */
      'app-qi-crumb-path':   'Dashboard > Quick Insights',
      'app-qi-crumb-name':   'Quick Insights',
      'app-bf-crumb-path':   'Dashboard > Bin Fluctuation',
      'app-bf-crumb-name':   'Bin Fluctuation',

      /* Quick Insights — table headers & stat labels */
      'app-qi-th-time':       'Time',
      'app-qi-th-reading':    'Reading',
      'app-qi-th-status':     'Status',
      'app-qi-stat-min':      'Min',
      'app-qi-stat-avg':      'Average',
      'app-qi-stat-max':      'Max',
      'app-qi-stat-recent':   'Recent',
      'app-qi-insight-label': 'Insight',

      /* Mode labels (used by JS renderer) */
      'app-mode-auto':         'Auto Mode',
      'app-mode-manual':       'Manual Mode',
      'app-mode-auto-short':   'Auto',
      'app-mode-manual-short': 'Manual',
      'app-updated-at':        'Updated at',

      /* Sensor status conditions (used by JS renderer) */
      'status-optimal':         'Optimal',
      'status-critically-cold': 'Critically Cold',
      'status-too-cold':        'Too Cold',
      'status-too-hot':         'Too Hot',
      'status-critically-hot':  'Critically Hot',
      'status-dry':             'Dry',
      'status-critically-dry':  'Critically Dry',
      'status-wet':             'Wet',
      'status-critically-wet':  'Critically Wet',
      'status-high-gas':        'High Gas',
      'status-toxic-gas':       'Toxic Gas',
      'status-unknown':         'Unknown',

      /* Status Modals */
      'status-bat-low-title': 'Battery Low',
      'status-bat-low-desc': 'Battery is at {v}%. Please charge your bin.',
      'status-bat-full-title': 'Battery Full',
      'status-bat-full-desc': 'Battery is at {v}%. Kindly unplug the charger.',
      'status-bat-charge-title': 'Charging…',
      'status-bat-title': 'Battery Status',
      'status-bat-desc': 'Battery level is at {v}%.',

      'status-water-low-title': 'Water Tank Low',
      'status-water-low-desc': 'Water is at {v}%. Kindly refill your water tank.',
      'status-water-full-title': 'Water Tank Full',
      'status-water-full-desc': 'Water is at {v}%. Tank is full.',
      'status-water-title': 'Water Tank',
      'status-water-desc': 'Water level is at {v}%.',

      'status-temp-title': 'Water Temperature',
      'status-temp-desc': 'Current water temperature is {v} °C.',
      'status-temp-nodata': 'No temperature data yet.',

      'modal-btn-okay': 'Okay',
      'modal-btn-dontshow': 'Don\'t show this again',
      /* Action Modals */
      'modal-edit-profile-title': 'Edit Profile',
      'modal-edit-profile-desc': 'Update your display name and contact email.',
      'modal-input-username': 'Username',
      'modal-input-email': 'Email Address',
      'modal-btn-save': 'Save Changes',
      'modal-btn-cancel': 'Cancel',
      
      'modal-change-pw-title': 'Change Password',
      'modal-change-pw-desc': 'Authorized changes require your current password.',
      'modal-input-curr-pw': 'Current Password',
      'modal-input-new-pw': 'New Password',
      'modal-input-rep-pw': 'Repeat New Password',
      'modal-btn-confirm': 'Confirm Update',
      
      'modal-confirm-title': 'Confirm Action',
      'modal-confirm-desc': 'Are you sure you want to proceed?',
      'modal-input-new-nickname': 'Enter new nickname',
      
      'modal-claim-bin-title': 'Claim New Bin',
      'modal-claim-bin-desc': 'Enter the unique 6-digit claim code found on your AVONIC device.',
      'modal-input-claim-code': 'Enter Claim Code',
      'modal-btn-claim': 'Claim Device',
      
      'modal-logout-title': 'Log Out?',
      'modal-logout-desc': 'Are you sure you wanna logout?',
      'modal-btn-logout': 'Yes, log me out',

      /* Auth Screens */
      'auth-heading-login': 'Log in to your Account',
      'auth-sub-login': 'Welcome back, please enter your details',
      'auth-ph-username': 'Username',
      'auth-ph-password': 'Password',
      'auth-forgot-link': 'Forgot password?',
      'auth-btn-login': 'Login →',
      'auth-switch-no-acc': 'Don\'t have an account?',
      'auth-switch-signup': 'Sign up',
      
      'auth-ph-reg-username': 'Username (3–20 alphanumeric)',
      'auth-ph-email': 'Email address',
      'auth-ph-reg-password': 'Password (min 6 characters)',
      'auth-btn-register': 'Create Account →',
      'auth-switch-has-acc': 'Already have an account?',
      'auth-switch-login': 'Log in',
      
      'auth-forgot-desc': 'Enter your registered email and we\'ll send a reset link to your device via MQTT.',
      'auth-ph-email-example': 'you@example.com',
      'auth-btn-send-reset': 'Send Reset Link →',
      'auth-back-login': '← Back to Login',
      
      'auth-reset-desc': 'Enter the token sent to your device and choose a new password.',
      'auth-ph-token': 'Paste token here',
      'auth-ph-new-password': 'New password',
      'auth-btn-reset': 'Reset Password →',

      /* Dashboard & Modes */
      'app-dashboard-selection': 'Selection:',
      'app-dashboard-date-reported': 'Date Reported:',
      'app-dashboard-date-to': 'to',
      'app-data-waiting': 'Waiting for data...',
      'app-data-no-data': 'No data yet',
      'app-data-loading': 'Loading...',
      'app-data-collecting': 'Collecting data...',
      'app-mode-label': 'Mode:',

      /* Modals & Loading States */
      'modal-mode-auto-title': 'Activate Auto Mode?',
      'modal-mode-auto-desc': 'Turning on auto-mode makes the system operate by itself.',
      'modal-mode-manual-title': 'Activate Manual Mode?',
      'modal-mode-manual-desc': 'Turning on Manual Mode disables auto-mode, which also means risk for potential human errors.',
      'modal-btn-activate-bin': 'Activate for this bin',
      'app-updated-just-now': 'Updated just now',
      'app-fetching-bins': 'Fetching your bins...',
      'app-no-bins-claimed': 'No bins claimed yet. Tap "+ Claim" to add one.',
      'app-loading-bins': 'Loading Bins...',
      'app-no-bins-connected': 'No bins connected',


      /* ── TOUR STRINGS (English) ── */
      'tour-btn-next': 'Next →',
      'tour-btn-back': '← Back',
      'tour-btn-done': '✓ Done!',
      'tour-toast-done': '✦ Tour complete! You\'re all set — happy composting!',
      
      'tour-s1-title': '[+] Machine Status',
      'tour-s1-desc': 'Battery level, water tank, and water temperature at a glance. Tap any pill to see full details.',
      'tour-s2-title': '⟲ Switch Bins',
      'tour-s2-desc': 'Managing multiple bins? Use this dropdown to jump between them instantly. Each shows its own live readings.',
      'tour-s3-title': '⛁ Your Bins',
      'tour-s3-desc': 'Tap a bin card to open its live monitoring view. The dot next to the mode label shows Auto or Manual.',
      'tour-s4-title': '⌖ Live Sensor Readings',
      'tour-s4-desc': 'Four sensors update every 10 seconds. Green ring = optimal, yellow = warning, red = needs attention.',
      'tour-s5-title': '⍚ Tap Any Sensor Card',
      'tour-s5-desc': 'Tapping a card opens its detail view — current reading, worm health status, and actuator controls when in Manual mode.',
      'tour-s8-title': '⚙ Auto vs. Manual Mode',
      'tour-s8-desc': 'Auto lets AVONIC manage fans, pumps, and alerts. Switch to Manual when you want direct control over every actuator.',
      'tour-s9-title': '◱ Quick Insights',
      'tour-s9-desc': 'Snapshot view of a sensor\'s hourly readings — min, avg, max, and an AI-written insight. Tap to open.',
      'tour-s10-title': '⌕ Sensor Selector',
      'tour-s10-desc': 'Pick the bin and sensor you want to inspect. Switching sensors instantly refreshes all stats and the readings table.',
      'tour-s11-title': '▤ At-a-Glance Stats',
      'tour-s11-desc': 'Min, Average, Max, and the most recent reading — all pulled from the last 48 hourly snapshots for the selected sensor.',
      'tour-s12-title': '☰ Readings History',
      'tour-s12-desc': 'Every recorded snapshot listed by time, with the exact reading and its condition status. Scroll down to see older entries.',
      'tour-s13-title': '✦ Insights & Actions',
      'tour-s13-desc': 'AVONIC reads the current conditions and writes a plain-language insight here. Tap the wrench to see recommended actions you can take right now.',
      'tour-s14-title': '◿ Bin Fluctuation',
      'tour-s14-desc': 'Track daily averages across a custom date range and visualise long-term trends with an interactive chart. Tap to open.',
      'tour-s15-title': '⊞ Controls',
      'tour-s15-desc': 'Choose a bin, pick a sensor, and set a date range to filter the chart. All controls live here in the sidebar.',
      'tour-s16-title': '◺ Average & Insights',
      'tour-s16-desc': 'The period average and worm-health illustration update with your date range. The wrench opens recommended actions when conditions are off.',
      'tour-s17-title': '▚ Trend Chart',
      'tour-s17-desc': 'Daily averages plotted over your chosen range. Scroll horizontally to pan across longer periods and spot seasonal patterns.',
      'tour-s18-title': '⌂ Account Profile',
      'tour-s18-desc': 'Update your display name and email anytime. Use Change Password below if you ever need to rotate your credentials.',
      'tour-s19-title': '＋ Claimed Bins',
      'tour-s19-desc': 'All your linked AVONIC devices appear here. Tap + Claim to add a new one using its 6-digit code, or remove a device you no longer use.',
      'tour-s20-title': '► Replay Anytime',
      'tour-s20-desc': 'Switch between English and Tagalog at any time — the whole app re-renders in your chosen language instantly.',
      'tour-s21-title': '',
      'tour-s21-desc': 'Finished the tour but want a refresher? This button right here reruns the full walkthrough whenever you need it.',
      // New Step 2 (Top Bar)
  'tour-lang-title': 'Language Toggle',
  'tour-lang-desc': 'Quickly switch between English and Tagalog from here without leaving the page.',

  // New Step 20 (Settings Page)
  'tour-replay-title': 'Replay Tour',
  'tour-replay-desc': 'Click here if you ever want to see this interactive walkthrough again.',
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

      /* ── APP-SPECIFIC (app.html) ───────────────────────────── */

      /* Sidebar nav */
      'app-nav-home':      'Home',
      'app-nav-dashboard': 'Dashboard',
      'app-nav-settings':  'Mga Setting',
      'app-nav-logout':    'Mag-log out',

      /* Home page */
      'app-home-title':       'Home',
      'app-home-bins-label':  'Mga Vermicompost Bin',

      /* Monitoring page */
      'app-monitoring-crumb-path': 'Home > Pagsubaybay',
      'app-monitoring-crumb-name': 'Pagsubaybay',
      'app-sensor-soilMoisture':   'Moisture ng Lupa',
      'app-sensor-temperature':    'Temperatura',
      'app-sensor-humidity':       'Humidity',
      'app-sensor-gasLevels':      'Antas ng Gas',

      /* Dashboard page */
      'app-dashboard-title':       'Dashboard',
      'app-dashboard-welcome':     'Maligayang pagdating sa Dashboard ng AVONIC',
      'app-dashboard-select':      'pumili ng pahina ng pagsusuri',
      'app-qi-title':              'Mabilis na Pananaw',
      'app-qi-desc':               'Makakuha ng mabilis na snapshot ng kasalukuyang kondisyon ng iyong bin',
      'app-bf-title':              'Pagbabago ng Bin',
      'app-bf-desc':               'Makakuha ng mabilis na snapshot ng kasalukuyang kondisyon ng iyong bin',

      /* Settings page */
      'app-settings-title':           'Mga Setting',
      'app-settings-account-title':   'Profile ng Account',
      'app-settings-username-label':  'Username',
      'app-settings-email-label':     'Email',
      'app-settings-update-profile':  'I-update ang Profile',
      'app-settings-change-password': 'Baguhin ang Password',
      'app-settings-claimed-title':   'Mga Naka-claim na Bin',
      'app-settings-claim-btn':       '+ I-claim',
      'app-settings-resources-title': 'Mga Mapagkukunan',
      'app-settings-manual-en':       'Gabay ng Gumagamit',
      'app-settings-manual-en-lang':  '(Ingles)',
      'app-settings-manual-tl':       'Gabay ng Gumagamit',
      'app-settings-manual-tl-lang':  '(Tagalog)',
      'app-settings-lang-title':      'Wika',
      'app-settings-session-title':   'Session',
      'app-settings-last-login':      'Huling Pag-login',
      'app-settings-logout':          'Mag-log Out',

      /* Breadcrumbs — inner dashboard pages */
      'app-qi-crumb-path':   'Dashboard > Mabilis na Pananaw',
      'app-qi-crumb-name':   'Mabilis na Pananaw',
      'app-bf-crumb-path':   'Dashboard > Pagbabago ng Bin',
      'app-bf-crumb-name':   'Pagbabago ng Bin',

      /* Quick Insights — table headers & stat labels */
      'app-qi-th-time':       'Oras',
      'app-qi-th-reading':    'Basahin',
      'app-qi-th-status':     'Katayuan',
      'app-qi-stat-min':      'Pinakamababa',
      'app-qi-stat-avg':      'Karaniwan',
      'app-qi-stat-max':      'Pinakamataas',
      'app-qi-stat-recent':   'Pinakabago',
      'app-qi-insight-label': 'Pananaw',

      /* Mode labels (used by JS renderer) */
      'app-mode-auto':         'Awtomatiko',
      'app-mode-manual':       'Manwal',
      'app-mode-auto-short':   'Awtomatiko',
      'app-mode-manual-short': 'Manwal',
      'app-updated-at':        'Na-update noong',

      /* Sensor status conditions (used by JS renderer) */
      'status-optimal':         'Mainam',
      'status-critically-cold': 'Kritikal na Malamig',
      'status-too-cold':        'Masyadong Malamig',
      'status-too-hot':         'Masyadong Mainit',
      'status-critically-hot':  'Kritikal na Mainit',
      'status-dry':             'Tuyo',
      'status-critically-dry':  'Kritikal na Tuyo',
      'status-wet':             'Basa',
      'status-critically-wet':  'Kritikal na Basa',
      'status-high-gas':        'Mataas na Gas',
      'status-toxic-gas':       'Nakakalason na Gas',
      'status-unknown':         'Hindi Kilala',

      /* Status Modals */
      'status-bat-low-title': 'Mababa ang Baterya',
      'status-bat-low-desc': 'Nasa {v}% ang baterya. Mangyaring i-charge ang iyong bin.',
      'status-bat-full-title': 'Puno na ang Baterya',
      'status-bat-full-desc': 'Nasa {v}% ang baterya. Mangyaring alisin ang charger.',
      'status-bat-charge-title': 'Nagcha-charge…',
      'status-bat-title': 'Katayuan ng Baterya',
      'status-bat-desc': 'Ang antas ng baterya ay nasa {v}%.',

      'status-water-low-title': 'Mababa ang Tangke ng Tubig',
      'status-water-low-desc': 'Nasa {v}% ang tubig. Mangyaring lagyan ng tubig ang tangke.',
      'status-water-full-title': 'Puno ang Tangke ng Tubig',
      'status-water-full-desc': 'Nasa {v}% ang tubig. Puno na ang tangke.',
      'status-water-title': 'Tangke ng Tubig',
      'status-water-desc': 'Ang antas ng tubig ay nasa {v}%.',

      'status-temp-title': 'Temperatura ng Tubig',
      'status-temp-desc': 'Ang kasalukuyang temperatura ng tubig ay {v} °C.',
      'status-temp-nodata': 'Wala pang datos ng temperatura.',

      'modal-btn-okay': 'Sige',
      'modal-btn-dontshow': 'Huwag na itong ipakita muli',

      /* Action Modals */
      'modal-edit-profile-title': 'I-edit ang Profile',
      'modal-edit-profile-desc': 'I-update ang iyong display name at contact email.',
      'modal-input-username': 'Username',
      'modal-input-email': 'Email Address',
      'modal-btn-save': 'I-save ang Pagbabago',
      'modal-btn-cancel': 'Kanselahin',
      
      'modal-change-pw-title': 'Baguhin ang Password',
      'modal-change-pw-desc': 'Kailangan ng kasalukuyang password para sa mga pagbabago.',
      'modal-input-curr-pw': 'Kasalukuyang Password',
      'modal-input-new-pw': 'Bagong Password',
      'modal-input-rep-pw': 'Ulitin ang Bagong Password',
      'modal-btn-confirm': 'Kumpirmahin',
      
      'modal-confirm-title': 'Kumpirmahin ang Aksyon',
      'modal-confirm-desc': 'Sigurado ka bang gusto mong magpatuloy?',
      'modal-input-new-nickname': 'Ipasok ang bagong palayaw',
      
      'modal-claim-bin-title': 'I-claim ang Bagong Bin',
      'modal-claim-bin-desc': 'Ipasok ang natatanging 6-digit claim code sa iyong AVONIC device.',
      'modal-input-claim-code': 'Ipasok ang Claim Code',
      'modal-btn-claim': 'I-claim ang Device',
      
      'modal-logout-title': 'Mag-log Out?',
      'modal-logout-desc': 'Sigurado ka bang gusto mong mag-logout?',
      'modal-btn-logout': 'Oo, i-log out ako',

      /* Auth Screens */
      'auth-heading-login': 'Mag-log in sa iyong Account',
      'auth-sub-login': 'Maligayang pagbabalik, mangyaring ilagay ang iyong detalye',
      'auth-ph-username': 'Username',
      'auth-ph-password': 'Password',
      'auth-forgot-link': 'Nakalimutan ang password?',
      'auth-btn-login': 'Mag-log in →',
      'auth-switch-no-acc': 'Wala pang account?',
      'auth-switch-signup': 'Mag-sign up',
      
      'auth-ph-reg-username': 'Username (3–20 alphanumeric)',
      'auth-ph-email': 'Email address',
      'auth-ph-reg-password': 'Password (min 6 characters)',
      'auth-btn-register': 'Gumawa ng Account →',
      'auth-switch-has-acc': 'Mayroon na bang account?',
      'auth-switch-login': 'Mag-log in',
      
      'auth-forgot-desc': 'Ipasok ang iyong rehistradong email at magpapadala kami ng reset link sa iyong device via MQTT.',
      'auth-ph-email-example': 'ikaw@example.com',
      'auth-btn-send-reset': 'Ipadala ang Reset Link →',
      'auth-back-login': '← Bumalik sa Login',
      
      'auth-reset-desc': 'Ipasok ang token na ipinadala sa iyong device at pumili ng bagong password.',
      'auth-ph-token': 'I-paste ang token dito',
      'auth-ph-new-password': 'Bagong password',
      'auth-btn-reset': 'I-reset ang Password →',
      /* Dashboard & Modes */
      'app-dashboard-selection': 'Pagpili:',
      'app-dashboard-date-reported': 'Petsa ng Ulat:',
      'app-dashboard-date-to': 'hanggang',
      'app-data-waiting': 'Naghihintay ng datos...',
      'app-data-no-data': 'Wala pang datos',
      'app-data-loading': 'Naglo-load...',
      'app-data-collecting': 'Kumukuha ng datos...',
      'app-mode-label': 'Paraan:',

      /* Modals & Loading States */
      'modal-mode-auto-title': 'I-activate ang Awtomatiko?',
      'modal-mode-auto-desc': 'Ang pag-on ng awtomatiko ay nagpapahintulot sa system na gumana nang mag-isa.',
      'modal-mode-manual-title': 'I-activate ang Manwal Mode?',
      'modal-mode-manual-desc': 'Ang pag-on ng Manwal Mode ay humihinto sa awtomatiko, na nangangahulugan din ng posibleng pagkakamali ng tao.',
      'modal-btn-activate-bin': 'I-activate para sa bin na ito',
      'app-updated-just-now': 'Na-update ngayon lang',
      'app-fetching-bins': 'Kinukuha ang iyong mga bin...',
      'app-no-bins-claimed': 'Wala pang naka-claim na bin. I-tap ang "+ Claim" para magdagdag.',
      'app-loading-bins': 'Nilo-load ang mga Bin...',
      'app-no-bins-connected': 'Walang nakakonektang bin',

      /* ── TOUR STRINGS (Tagalog) ── */
      'tour-btn-next': 'Susunod →',
      'tour-btn-back': '← Bumalik',
      'tour-btn-done': '✓ Tapos na!',
      'tour-toast-done': '✦ Tapos na ang tour! Handa ka na — maligayang pagtatanim!',
      
      'tour-s1-title': '[+] Katayuan ng Makina',
      'tour-s1-desc': 'Antas ng baterya, tangke ng tubig, at temperatura sa isang tingin. I-tap ang anumang pill para makita ang buong detalye.',
      'tour-s2-title': '⟲ Palitan ang mga Bin',
      'tour-s2-desc': 'May maraming bin? Gamitin ang dropdown na ito para lumipat nang mabilis. Ipinapakita ng bawat isa ang sarili nitong live na datos.',
      'tour-s3-title': '⛁ Iyong mga Bin',
      'tour-s3-desc': 'I-tap ang bin card para buksan ang live na pagsubaybay. Ipinapakita ng tuldok sa tabi ng label kung naka-Auto o Manual.',
      'tour-s4-title': '⌖ Live na Sensor',
      'tour-s4-desc': 'Nag-a-update ang apat na sensor tuwing 10 segundo. Berde = mainam, dilaw = babala, pula = kailangan ng atensyon.',
      'tour-s5-title': '⍚ I-tap ang Anumang Sensor Card',
      'tour-s5-desc': 'Pag-tap sa card ay magbubukas ng detalye — kasalukuyang basa, kalusugan ng uod, at mga kontrol kung nasa Manual mode.',
      'tour-s8-title': '⚙ Auto vs. Manual Mode',
      'tour-s8-desc': 'Pinapamahalaan ng Auto ang fan, pump, at alerto. Lumipat sa Manual kung gusto mong ikaw mismo ang magkontrol.',
      'tour-s9-title': '◱ Mabilis na Pananaw',
      'tour-s9-desc': 'Tingnan ang orasang pagbabasa ng sensor — pinakamababa, karaniwan, pinakamataas, at AI insight. I-tap para buksan.',
      'tour-s10-title': '⌕ Tagapili ng Sensor',
      'tour-s10-desc': 'Piliin ang bin at sensor na nais mong suriin. Ang paglipat ay agad na magre-refresh sa mga istatistika at talahanayan.',
      'tour-s11-title': '▤ Mabilisang Istatistika',
      'tour-s11-desc': 'Pinakamababa, Karaniwan, Pinakamataas, at pinakabago — kinuha mula sa huling 48 oras na datos para sa napiling sensor.',
      'tour-s12-title': '☰ Kasaysayan ng Pagbabasa',
      'tour-s12-desc': 'Nakalista ang bawat datos ayon sa oras. Mag-scroll pababa para makita ang mga lumang tala.',
      'tour-s13-title': '✦ Mga Pananaw at Aksyon',
      'tour-s13-desc': 'Binabasa ng AVONIC ang kasalukuyang kondisyon at nagbibigay ng payo dito. I-tap ang wrench para makita ang mga rekomendasyon.',
      'tour-s14-title': '◿ Pagbabago ng Bin',
      'tour-s14-desc': 'Subaybayan ang pang-araw-araw na karaniwan gamit ang napiling petsa at tsart. I-tap para buksan.',
      'tour-s15-title': '⊞ Mga Kontrol',
      'tour-s15-desc': 'Piliin ang bin, sensor, at petsa para i-filter ang tsart. Lahat ng kontrol ay nandito sa gilid.',
      'tour-s16-title': '◺ Karaniwan at Mga Pananaw',
      'tour-s16-desc': 'Nag-a-update ang karaniwan at kalusugan ng uod ayon sa petsa. Nagbubukas ang wrench ng mga aksyon kapag may problema.',
      'tour-s17-title': '▚ Tsart ng Trend',
      'tour-s17-desc': 'Pang-araw-araw na datos na naka-plot. Mag-scroll pakaliwa at pakanan para makita ang mga mas mahabang panahon.',
      'tour-s18-title': '⌂ Profile ng Account',
      'tour-s18-desc': 'I-update ang iyong pangalan at email. Gamitin ang Baguhin ang Password kung kailangan mong mag-update.',
      'tour-s19-title': '＋ Mga Naka-claim na Bin',
      'tour-s19-desc': 'Nandito lahat ng iyong AVONIC device. I-tap ang + Claim para magdagdag gamit ang 6-digit code, o alisin ang hindi na ginagamit.',
      'tour-s20-title': '⨁ Wika',
      'tour-s20-desc': 'Lumipat sa Ingles o Tagalog anumang oras — ang buong app ay agad na magbabago sa napiling wika.',
      'tour-s21-title': '► Ulitin Kahit Kailan',
      'tour-s21-desc': 'Tapos na sa tour ngunit gusto ng refresher? Ang pindutang ito ay uulitin ang buong walkthrough kung kailangan mo.',

      // New Step 2 (Top Bar)
  'tour-lang-title': 'Palit-Wika',
  'tour-lang-desc': 'Mabilis na lumipat sa pagitan ng English at Tagalog dito mismo.',

  // New Step 20 (Settings Page)
  'tour-replay-title': 'Ulitin ang Tour',
  'tour-replay-desc': 'I-click ito kung gusto mong makita muli ang walkthrough na ito.',
    }
  };

  /* ─────────────────────────────────────────────
     APPLY LANGUAGE
  ───────────────────────────────────────────── */
  function applyLang(lang) {
    var t = translations[lang];
    if (!t) return;

   /* Plain-text nodes & Placeholders */
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = t[key];
        } else {
          el.textContent = t[key];
        }
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

    /* Sync the settings-page language select (#app-language-select) */
    var appSel = document.getElementById('app-language-select');
    if (appSel) appSel.value = lang;

    /* Update <html lang> attribute for accessibility */
    document.documentElement.lang = lang === 'tl' ? 'tl' : 'en';

    /* Persist */
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}

    /* Fire a custom event so app.js can re-render any JS-injected text */
    try { document.dispatchEvent(new CustomEvent('avonic:langchange', { detail: lang })); } catch(e) {}

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

  /* ─────────────────────────────────────────────
     PUBLIC API
     applyLanguage(lang) — called by the settings
     page <select onchange="applyLanguage(...)">
  ───────────────────────────────────────────── */
  window.applyLanguage = applyLang;

  /* t(key) — returns the translated string for the current language.
     Useful for JS-rendered text that can't use data-i18n attributes. */
  window.t = function(key) {
    var lang = 'en';
    try { lang = localStorage.getItem(STORAGE_KEY) || 'en'; } catch(e) {}
    var dict = translations[lang] || translations['en'];
    return dict[key] !== undefined ? dict[key] : (translations['en'][key] || key);
  };

})();
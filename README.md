# 🪱 AVONIC — Smarter Worm Health (Standalone Demo Edition)

> **Final Year Project Showcase**: Intelligent vermicomposting environmental monitoring and actuator management dashboard, ported to run 100% client-side with realistic simulated telemetry. Zero hardware or external database dependencies required. Ready for instant deployment on [Vercel](https://vercel.com).

---

## 🌟 Key Features

- **Decoupled Architecture**: Operates fully offline/client-side using a browser-persisted mock database (`localStorage`) and dynamic telemetry simulation engine.
- **Smart Telemetry Simulation**: Real-time sensor fluctuations (Temperature, Soil Moisture, Humidity, Biogas Levels, Water Reservoir, Battery Level, and DS18B20 Water Temperature).
- **Automated Actuator Logic**: In **Auto Mode**, cooling fans, misting pumps, and exhaust automatically engage when conditions exceed optimal vermicomposting thresholds. In **Manual Mode**, users can toggle actuators interactively.
- **Interactive Simulation Deck**: An on-screen floating control bar to switch between demonstration scenarios on the fly (or use stealth keyboard hotkeys).
- **Time-Series Charts**: Pre-loaded 24-hour and custom time-range historical charts powered by Chart.js on the **Bin Fluctuations** and **Quick Insights** pages.
- **Full Device Management**: Claim new bins (e.g. `AV-B92`, `AV-X11`, or any custom ID), rename nicknames, or unclaim devices with immediate local persistence.
- **Export Reports**: Generate downloadable **PDF**, **DOCS**, and **CSV** audit reports with real simulated data spans.
- **Bilingual Support**: Instant toggle between English and Filipino/Tagalog with full translations.
- **Guided UI Tour**: Driver.js onboarding tour guiding viewers through all 6 major segments of the dashboard.

---

## 🚀 Quick Start (Local)

### Option 1: Node.js / npm
```bash
# Install local static server (optional)
npm install

# Start local server
npm start
# or
npm run dev
```
Then open `http://localhost:3000` (or `http://localhost:5000`) in your browser.

### Option 2: Python HTTP Server
```bash
python -m http.server 3000
```
Then navigate to:
- Landing Page: `http://localhost:3000/public/index.html`
- Dashboard: `http://localhost:3000/public/app.html`

---

## ⚡ Instant Demo Access & Login

On `app.html`, you have multiple ways to access the dashboard:
1. **One-Click Access**: Click the prominent **✨ Instant Demo / Guest Access** button to enter immediately.
2. **Pre-Filled Login**: Credentials `demo` / `demo123` are pre-filled by default.
3. **Any Username**: Any credentials entered will automatically initialize a demo session.
4. **Sign Up**: Creating a new account stores your profile in `localStorage` and logs you straight in.

---

## 🧪 Simulation Deck & Demonstration Scenarios

A floating **AVONIC Demo Deck** widget is available in the bottom-right corner of the dashboard. You can click any scenario to demonstrate system behavior during presentations:

| Scenario | Condition Simulated | System Response |
| :--- | :--- | :--- |
| 🌿 **Optimal** | Temp 24.5°C, Moisture 72%, Humidity 70%, Gas 28 ppm | Green status badges, happy worm (`Normal.png`), actuators idle. |
| 🔥 **Heat Alert** | Temp 36.5°C | Warning badge, `Too Hot.png` worm, intake & exhaust cooling fans automatically engage. |
| 💧 **Drought** | Soil Moisture 35%, Humidity 36% | Warning badge, `Too Dry.png` worm, automated mist pump activates. |
| ⚠️ **Gas Spike** | Gas 215 ppm | Danger badge, `Gas Too High.png` worm, exhaust fan engages to vent biogas. |
| ⚡ **Low Power** | Battery 12%, Water Reservoir 8% | Low battery and water status alerts & modals trigger. |
| 🎲 **Live Drift** | Dynamic bounded random walk | Continuous realistic fluctuating telemetry. |

### Stealth Keyboard Hotkeys (Hold `Shift`):
- `Shift + S`: Optimal / Stable Scenario
- `Shift + U`: Heat Alert Scenario
- `Shift + L`: Live Dynamic Drift
- `Shift + D`: Instant Demo Login Bypass
- `Shift + H`: Hide / Show the Simulation Deck widget (ideal for clean screenshots or videos)
- `Shift + R`: Reset Telemetry to defaults

---

## ☁️ Deploying to Vercel

This repository includes a pre-configured `vercel.json` routing configuration.

1. Push this branch (`standalone-demo`) to your GitHub repository:
   ```bash
   git push -u origin standalone-demo
   ```
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Select your repository and select branch `standalone-demo`.
4. Leave all build settings as default (Framework Preset: **Other**, Root Directory: `./`).
5. Click **Deploy**!

Vercel will deploy the site in seconds. Visitors will arrive at the landing page (`/`) and can seamlessly navigate to the full dashboard (`/app.html` or `/app`).

---

## 📁 Project Structure

```
avonic-dashboard-1/
├── public/
│   ├── index.html              # Marketing & Project Landing Page
│   ├── app.html                # Main Dashboard Application
│   ├── styles.css              # Custom styling + Simulation Deck styles
│   ├── app.js                  # Standalone API & Simulation Logic
│   ├── dummy-data-injector.js  # Interactive Simulation Deck Controller
│   ├── export.js               # PDF / DOCS / CSV report generator
│   ├── lang.js                 # English & Tagalog translations
│   ├── tour.js                 # Driver.js interactive guided tour
│   ├── welcome-modal.js        # Onboarding welcome dialog
│   ├── img/                    # UI icons, cliparts, worm conditions
│   ├── assets/                 # Custom typography (Quicksand)
│   └── vid/                    # Landing page demonstration video
├── vercel.json                 # Vercel deployment & rewrite configuration
├── package.json                # Local dev scripts
└── README.md                   # Project documentation
```

// ========================================
// 🎯 AVONIC MAIN COMPONENTS ENTRY POINT
// ========================================
// This file orchestrates all component modules

console.log('🚀 Initializing AVONIC Component System...');

// ========================================
// 📦 COMPONENT LOAD ORDER (Critical!)
// ========================================
// Components are loaded in dependency order:
// 1. Config/Utils first
// 2. Core components
// 3. UI components
// 4. Page loaders last

// Note: All components are now loaded via separate <script> tags in app.html
// This file serves as documentation and initialization orchestrator

// ========================================
// 🎨 UI ENHANCEMENTS
// ========================================

// Contrast mode for header sections
function getContrastMode(rgbArray) {
  let [r, g, b] = rgbArray;
  let luminance = (0.299*r + 0.587*g + 0.114*b) / 255;
  return luminance > 0.5 ? "light-mode" : "dark-mode";
}

function rgbStringToArray(rgbString) {
  return rgbString.match(/\d+/g).map(Number);
}

const header = document.querySelector(".page-header.help-sec");
const sections = document.querySelectorAll("section.section");

if (header && sections.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bg = window.getComputedStyle(entry.target).backgroundColor;
          const rgbArray = rgbStringToArray(bg);
          const mode = getContrastMode(rgbArray);

          header.classList.remove("light-mode", "dark-mode");
          header.classList.add(mode);
        }
      });
    },
    { threshold: 0.6 }
  );

  sections.forEach(sec => observer.observe(sec));
}

// ========================================
// 🔄 INITIALIZATION COMPLETE
// ========================================

console.log('✅ AVONIC Component System Ready');
console.log('📦 Components Loaded:');
console.log('  ├─ 🔧 Dev Mode');
console.log('  ├─ 🗑️ Bin Card');
console.log('  ├─ 📊 Status Card');
console.log('  ├─ 🔄 Mode Switcher');
console.log('  ├─ 🎨 Modal System');
console.log('  ├─ 📈 Card Visuals');
console.log('  ├─ 🪱 Worm Conditions');
console.log('  ├─ 📊 Dashboard Loader');
console.log('  ├─ 🔗 Claim Device');
console.log('  ├─ ✏️ Nickname Manager');
console.log('  ├─ 🗑️ Bin Page Loader');
console.log('  └─ 🍞 Toast Notifications');
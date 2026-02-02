// ========================================
// 🌐 API CONFIGURATION
// ========================================

const API_BASE = 'https://avonic-main-hub-production.up.railway.app';

// ✅ CRITICAL: Export to window for browser JavaScript
window.API_BASE = API_BASE;

// Export for Node.js modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_BASE };
}

console.log('✅ API Configuration loaded:', API_BASE);
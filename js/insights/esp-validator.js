// ========================================
// QUICK INSIGHTS - ESP ID VALIDATOR
// js/insights/esp-validator.js
// ========================================

/**
 * Validate ESP ID against user's claimed devices
 * @returns {Promise<string|null>} Valid ESP ID or null
 */
async function getValidEspID() {
    const storedESP = localStorage.getItem('selected_espID');
    const token = localStorage.getItem('avonic_token');
    
    if (!token) {
        console.warn('⚠️ No auth token found');
        return null;
    }
    
    try {
        // Fetch user's claimed devices
        const API_BASE = window.API_BASE || 'https://avonic-main-hub-production.up.railway.app';
        const response = await fetch(`${API_BASE}/api/devices/claimed`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            console.error('❌ Failed to fetch claimed devices');
            return storedESP;
        }
        
        const data = await response.json();
        
        // No devices claimed
        if (!data.devices || data.devices.length === 0) {
            console.warn('⚠️ No devices claimed yet');
            localStorage.removeItem('selected_espID');
            return null;
        }
        
        // Get first device (or find matching device if multiple)
        const validESP = data.devices[0].espID;
        
        // Check if stored ESP ID is still valid
        const isValid = data.devices.some(d => d.espID === storedESP);
        
        if (!isValid) {
            console.log(`🔄 Stored ESP ID invalid. Updating: ${storedESP} → ${validESP}`);
            localStorage.setItem('selected_espID', validESP);
            return validESP;
        }
        
        console.log(`✅ ESP ID validated: ${storedESP}`);
        return storedESP;
        
    } catch (error) {
        console.error('❌ ESP ID validation error:', error);
        return storedESP; // Fallback to stored value
    }
}

/**
 * Get ESP ID from URL or localStorage
 * @returns {Promise<string|null>}
 */
async function getEspIDWithURLOverride() {
    // 1. Validate ESP ID (checks against claimed devices)
    let espID = await getValidEspID();

    // 2. Check URL for override (optional - for multi-device support)
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const urlESP = urlParams.get('espID');
    if (urlESP) {
        espID = urlESP;
        localStorage.setItem('selected_espID', urlESP);
    }

    return espID;
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.QI_EspValidator = {
        getValidEspID,
        getEspIDWithURLOverride
    };
}

console.log('✅ Quick Insights ESP validator loaded');
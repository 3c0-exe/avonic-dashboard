// services/device-service.js - Device Management API

/**
 * Fetch all claimed devices for the authenticated user
 * @returns {Promise<Array>} Array of device objects
 */
async function fetchClaimedDevices() {
  const token = getAuthToken();
  if (!token) {
    console.warn('⚠️ No auth token - cannot fetch devices');
    return [];
  }

  try {
    const response = await fetch(`${API_BASE}/api/devices/claimed`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch devices`);
    }

    const data = await response.json();
    
    if (!data.devices || data.devices.length === 0) {
      console.log('ℹ️ No devices claimed yet');
      return [];
    }

    console.log(`📱 Fetched ${data.devices.length} device(s):`, 
                data.devices.map(d => d.espID));
    
    return data.devices;
    
  } catch (error) {
    console.error('❌ Fetch devices error:', error);
    return [];
  }
}

/**
 * Get the first claimed device (helper for single-device scenarios)
 * @returns {Promise<Object|null>} Device object or null
 */
async function getFirstDevice() {
  const devices = await fetchClaimedDevices();
  return devices.length > 0 ? devices[0] : null;
}

/**
 * Get current device from URL parameters
 * @returns {string|null} ESP ID from URL or null
 */
function getCurrentDeviceFromURL() {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  return urlParams.get('espID');
}

console.log('✅ Device service loaded');
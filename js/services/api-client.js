// services/api-client.js - Base API Client with Authentication

/**
 * Get authentication token from localStorage
 * @returns {string|null} JWT token or null
 */
function getAuthToken() {
  return localStorage.getItem('avonic_token');
}

/**
 * Get headers with authentication token
 * @returns {Object} Headers object with Authorization and Content-Type
 */
function getAuthHeaders() {
  return {
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Generic API request wrapper with error handling
 * @param {string} endpoint - API endpoint (e.g., '/api/sensors/latest')
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<Object>} JSON response
 */
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const url = `${API_BASE}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
function isAuthenticated() {
  return !!getAuthToken();
}

console.log('✅ API Client loaded');
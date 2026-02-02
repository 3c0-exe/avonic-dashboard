// ========================================
// 🔧 DEVELOPMENT MODE CONFIGURATION
// ========================================

const DEV_MODE = false; // Set to false when connecting to real backend
const MOCK_DELAY = 300; // Simulate network delay (ms)

// ========================================
// 📦 MOCK DATA
// ========================================

const MOCK_DEVICES = [
  {
    espID: 'AVONIC-DEV001',
    nickname: 'Office Compost Bin',
    claimedAt: new Date().toISOString()
  },
  {
    espID: 'AVONIC-DEV002',
    nickname: 'Garden Bin',
    claimedAt: new Date().toISOString()
  },
  {
    espID: 'AVONIC-DEV003',
    nickname: 'Rooftop Compost',
    claimedAt: new Date().toISOString()
  }
];

const MOCK_SENSOR_DATA = {
  'AVONIC-DEV001': {
    espID: 'AVONIC-DEV001',
    battery: 85,
    water_level: 65,
    water_temp: 24,
    bin1: {
      soil: 72,
      temp: 26,
      humidity: 68,
      gas: 45,
      ds18b20: 25.5
    },
    bin2: {
      soil: 58,
      temp: 28,
      humidity: 75,
      gas: 89,
      ds18b20: 27.2
    },
    timestamp: new Date().toISOString()
  },
  'AVONIC-DEV002': {
    espID: 'AVONIC-DEV002',
    battery: 92,
    water_level: 78,
    water_temp: 22,
    bin1: {
      soil: 80,
      temp: 24,
      humidity: 71,
      gas: 32,
      ds18b20: 23.8
    },
    bin2: {
      soil: 65,
      temp: 26,
      humidity: 69,
      gas: 56,
      ds18b20: 25.1
    },
    timestamp: new Date().toISOString()
  },
  'AVONIC-DEV003': {
    espID: 'AVONIC-DEV003',
    battery: 45,
    water_level: 28,
    water_temp: 26,
    bin1: {
      soil: 45,
      temp: 30,
      humidity: 55,
      gas: 120,
      ds18b20: 29.5
    },
    bin2: {
      soil: 38,
      temp: 32,
      humidity: 48,
      gas: 145,
      ds18b20: 31.2
    },
    timestamp: new Date().toISOString()
  }
};

// ========================================
// 🎭 MOCK API FUNCTIONS
// ========================================

async function mockFetch(url, options = {}) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  
  console.log('🔧 DEV MODE: Mocking API call to:', url);
  console.log('📤 Request options:', options);
  
  const method = options.method || 'GET';
  
  // Mock: Get claimed devices
  if (url.includes('/api/devices/claimed') && method === 'GET') {
    return {
      ok: true,
      json: async () => ({
        success: true,
        devices: MOCK_DEVICES
      })
    };
  }
  
  // Mock: Get all devices (dashboard)
  if (url.includes('/api/devices') && method === 'GET') {
    return {
      ok: true,
      json: async () => ({
        success: true,
        devices: MOCK_DEVICES
      })
    };
  }
  
  // Mock: Claim device
  if (url.includes('/api/devices/claim') && method === 'POST') {
    const body = JSON.parse(options.body);
    const newDevice = {
      espID: body.espID,
      nickname: `My Device ${MOCK_DEVICES.length + 1}`,
      claimedAt: new Date().toISOString()
    };
    MOCK_DEVICES.push(newDevice);
    
    return {
      ok: true,
      json: async () => ({
        success: true,
        message: 'Device claimed successfully',
        device: newDevice
      })
    };
  }
  
  // Mock: Update nickname
  if (url.includes('/nickname') && method === 'PUT') {
    const espID = url.split('/').slice(-2)[0];
    const body = JSON.parse(options.body);
    const device = MOCK_DEVICES.find(d => d.espID === espID);
    
    if (device) {
      device.nickname = body.nickname;
      return {
        ok: true,
        json: async () => ({
          success: true,
          message: 'Nickname updated',
          device
        })
      };
    }
  }
  
  // Mock: Get latest sensor data for specific device
  if (url.includes('/api/sensors/latest/')) {
    const espID = url.split('/').pop();
    const data = MOCK_SENSOR_DATA[espID];
    
    if (data) {
      // Add some randomness to make it feel live
      const randomized = JSON.parse(JSON.stringify(data));
      randomized.bin1.soil += Math.random() * 4 - 2;
      randomized.bin1.temp += Math.random() * 2 - 1;
      randomized.bin2.soil += Math.random() * 4 - 2;
      randomized.bin2.temp += Math.random() * 2 - 1;
      randomized.timestamp = new Date().toISOString();
      
      return {
        ok: true,
        json: async () => randomized
      };
    }
    
    return {
      ok: false,
      json: async () => ({ error: 'Device not found' })
    };
  }
  
  // Mock: Get latest sensor data (all devices)
  if (url.includes('/api/sensors/latest') && method === 'GET') {
    return {
      ok: true,
      json: async () => ({
        success: true,
        readings: Object.values(MOCK_SENSOR_DATA)
      })
    };
  }
  
  // Mock: Control device (pump/fan)
  if ((url.includes('/pump') || url.includes('/fan')) && method === 'POST') {
    const body = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({
        success: true,
        message: `Device ${body.state === 'on' ? 'activated' : 'deactivated'}`,
        state: body.state
      })
    };
  }
  
  // Mock: Login
  if (url.includes('/auth/login') && method === 'POST') {
    return {
      ok: true,
      json: async () => ({
        success: true,
        token: 'mock_dev_token_' + Date.now(),
        user: {
          email: 'dev@avonic.com',
          name: 'Dev User'
        }
      })
    };
  }
  
  // Default fallback
  return {
    ok: true,
    json: async () => ({ success: true, message: 'Mock response' })
  };
}

// ========================================
// 🔄 OVERRIDE FETCH GLOBALLY
// ========================================

if (DEV_MODE) {
  console.log('🔧 DEVELOPMENT MODE ENABLED');
  console.log('📦 Mock data loaded with', MOCK_DEVICES.length, 'devices');
  
  // Store original fetch
  window._originalFetch = window.fetch;
  
  // Override fetch
  window.fetch = function(url, options) {
    // Only mock API calls, let other fetches go through
    if (url.includes('api/') || url.includes('auth/')) {
      return mockFetch(url, options);
    }
    // Let image/resource fetches work normally
    return window._originalFetch(url, options);
  };
  
  // Auto-login for dev mode
  if (!localStorage.getItem('avonic_token')) {
    localStorage.setItem('avonic_token', 'mock_dev_token');
    console.log('✅ Auto-logged in for dev mode');
  }
}

// ========================================
// 🛠️ DEV MODE UTILITIES
// ========================================

// Add mock sensor data for a specific device
window.addMockDevice = function(espID, nickname) {
  const newDevice = {
    espID,
    nickname,
    claimedAt: new Date().toISOString()
  };
  
  MOCK_DEVICES.push(newDevice);
  
  MOCK_SENSOR_DATA[espID] = {
    espID,
    battery: Math.floor(Math.random() * 40) + 60,
    water_level: Math.floor(Math.random() * 50) + 30,
    water_temp: Math.floor(Math.random() * 10) + 20,
    bin1: {
      soil: Math.floor(Math.random() * 40) + 40,
      temp: Math.floor(Math.random() * 15) + 20,
      humidity: Math.floor(Math.random() * 40) + 40,
      gas: Math.floor(Math.random() * 100),
      ds18b20: Math.random() * 15 + 20
    },
    bin2: {
      soil: Math.floor(Math.random() * 40) + 40,
      temp: Math.floor(Math.random() * 15) + 20,
      humidity: Math.floor(Math.random() * 40) + 40,
      gas: Math.floor(Math.random() * 100),
      ds18b20: Math.random() * 15 + 20
    },
    timestamp: new Date().toISOString()
  };
  
  console.log('✅ Added mock device:', espID);
  return newDevice;
};

// Randomize sensor values (simulate live updates)
window.randomizeSensorData = function(espID) {
  const data = MOCK_SENSOR_DATA[espID || MOCK_DEVICES[0].espID];
  if (!data) return;
  
  data.bin1.soil = Math.max(0, Math.min(100, data.bin1.soil + (Math.random() * 10 - 5)));
  data.bin1.temp = Math.max(15, Math.min(40, data.bin1.temp + (Math.random() * 4 - 2)));
  data.bin1.humidity = Math.max(30, Math.min(100, data.bin1.humidity + (Math.random() * 8 - 4)));
  data.bin1.gas = Math.max(0, Math.min(250, data.bin1.gas + (Math.random() * 20 - 10)));
  
  data.bin2.soil = Math.max(0, Math.min(100, data.bin2.soil + (Math.random() * 10 - 5)));
  data.bin2.temp = Math.max(15, Math.min(40, data.bin2.temp + (Math.random() * 4 - 2)));
  data.bin2.humidity = Math.max(30, Math.min(100, data.bin2.humidity + (Math.random() * 8 - 4)));
  data.bin2.gas = Math.max(0, Math.min(250, data.bin2.gas + (Math.random() * 20 - 10)));
  
  data.timestamp = new Date().toISOString();
  
  console.log('🔄 Randomized sensor data for', espID);
};

// Clear all mock data
window.clearMockData = function() {
  MOCK_DEVICES.length = 0;
  Object.keys(MOCK_SENSOR_DATA).forEach(key => delete MOCK_SENSOR_DATA[key]);
  console.log('🗑️ Cleared all mock data');
};

console.log('✅ Development mode utilities loaded');
console.log('💡 Try: addMockDevice("AVONIC-TEST", "Test Device")');
console.log('💡 Try: randomizeSensorData("AVONIC-DEV001")');
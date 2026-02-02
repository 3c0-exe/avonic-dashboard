// ========================================
// 🗑️ BIN PAGE GUARDS & DATA LOADING
// ========================================

// Track which page is currently loaded to prevent duplicate fetches
let currentBinPage = null;
let isLoadingBinData = false;

// Load data for specific bin page
async function loadBinPageData(binNumber) {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const espID = urlParams.get('espID');
  
  // Guard: Check if we're already loading
  if (isLoadingBinData) {
    console.log('⏳ Already loading bin data, skipping...');
    return;
  }
  
  // Guard: Check if ESP-ID exists
  if (!espID) {
    console.error('❌ No ESP-ID in URL, cannot load bin data');
    showBinError(binNumber, 'No device selected');
    return;
  }
  
  // Guard: Check if we're already on this bin page
  if (currentBinPage === `bin${binNumber}-${espID}`) {
    console.log(`✅ Already viewing Bin ${binNumber} for ${espID}`);
    return;
  }
  
  console.log(`🔄 Loading Bin ${binNumber} data for ${espID}...`);
  isLoadingBinData = true;
  currentBinPage = `bin${binNumber}-${espID}`;
  
  const token = localStorage.getItem('avonic_token');
  if (!token) {
    console.error('❌ No auth token');
    isLoadingBinData = false;
    return;
  }
  
  try {
    // Show loading state
    updateBinCards(binNumber, 'loading');
    
    // Correct URL structure
    const response = await fetch(`${API_BASE}/api/devices/${espID}/latest`, { 
      headers: { 'Authorization': `Bearer ${token}` } 
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();

    // UNWRAP THE DATA OBJECT
    const sensorData = result.data; 
    
    if (!sensorData) {
        console.warn(`⚠️ No sensor data found for device ${espID}`);
    }

    // Pass the unwrapped 'sensorData'
    updateBinCards(binNumber, 'success', sensorData, espID);
    
    console.log(`✅ Bin ${binNumber} data loaded successfully`);
    
  } catch (error) {
    console.error(`❌ Failed to load Bin ${binNumber} data:`, error);
    updateBinCards(binNumber, 'error');
  } finally {
    isLoadingBinData = false;
  }
}

// Update bin page cards with data
function updateBinCards(binNumber, state, data = null, espID = null) {
  const binPage = binNumber === 2 
    ? document.querySelector('.content.bin2')
    : document.querySelector('.content.bin');
  
  if (!binPage) return;
  
  const cards = binPage.querySelectorAll('.card_stats');
  
  cards.forEach(card => {
    const dataType = card.dataset.type;
    const label = card.querySelector('.status_label')?.textContent || '';
    const valueElem = card.querySelector('.card_value');
    const unitElem = card.querySelector('.card_unit');
    
    if (state === 'loading') {
      if (valueElem) valueElem.textContent = '--';
      if (unitElem) unitElem.textContent = '';
      return;
    }
    
    if (state === 'error') {
      if (valueElem) valueElem.textContent = 'ERR';
      if (unitElem) unitElem.textContent = '';
      return;
    }
    
    if (state === 'success' && data) {
      // Get the correct bin data
      const binData = binNumber === 2 ? data.bin2 : data.bin1;
      
      if (!binData) {
        console.warn(`⚠️ No data for bin${binNumber}`);
        return;
      }
      
      // Update sensor cards
      if (dataType === 'Sensors') {
        if (label.includes('Soil Moisture') && binData.soil !== undefined) {
          setCardValue(card, binData.soil);
        } else if (label.includes('Temperature') && binData.temp !== undefined) {
          setCardValue(card, binData.temp);
        } else if (label.includes('Humidity') && binData.humidity !== undefined) {
          setCardValue(card, binData.humidity);
        } else if (label.includes('Gas') && binData.gas !== undefined) {
          setCardValue(card, binData.gas);
        } else if (label.includes('DS18B20') && binData.ds18b20 !== undefined) {
          setCardValue(card, binData.ds18b20);
        }
      }
    }
  });
  
  // Update ESP-ID display
  const espDisplay = binPage.querySelector('.esp-id-display');
  if (espDisplay && espID) {
    espDisplay.textContent = `Device: ${espID}`;
  }
}

// Show error message on bin page
function showBinError(binNumber, message) {
  const binPage = binNumber === 2 
    ? document.querySelector('.content.bin2')
    : document.querySelector('.content.bin');
  
  if (!binPage) return;
  
  const cards = binPage.querySelectorAll('.card_stats');
  cards.forEach(card => {
    const valueElem = card.querySelector('.card_value');
    const unitElem = card.querySelector('.card_unit');
    if (valueElem) valueElem.textContent = '--';
    if (unitElem) unitElem.textContent = '';
  });
}

// Route handler with guards
window.addEventListener('hashchange', () => {
  const hash = window.location.hash;
  
  // Reset current page if navigating away from bins
  if (!hash.includes('#/bin')) {
    currentBinPage = null;
    isLoadingBinData = false;
  }
  
  // Load Bin 1 data
  if (hash.startsWith('#/bin?') || hash.startsWith('#/bin1?')) {
    setTimeout(() => loadBinPageData(1), 100);
  }
  
  // Load Bin 2 data
  if (hash.startsWith('#/bin2?')) {
    setTimeout(() => loadBinPageData(2), 100);
  }
});

// Initial load with guard
document.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash;
  
  if (hash.startsWith('#/bin2?')) {
    setTimeout(() => loadBinPageData(2), 200);
  } else if (hash.startsWith('#/bin?') || hash.startsWith('#/bin1?')) {
    setTimeout(() => loadBinPageData(1), 200);
  }
});

// DISPLAY ESP-ID ON BIN PAGES
window.addEventListener('hashchange', displayCurrentDevice);
document.addEventListener('DOMContentLoaded', displayCurrentDevice);

function displayCurrentDevice() {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const espID = urlParams.get('espID');
  
  const espDisplay = document.querySelector('.esp-id-display');
  if (espDisplay && espID) {
    espDisplay.textContent = `Device: ${espID}`;
  }
}

console.log('✅ Bin page guards & loader initialized');
// ========================================
// 🍞 TOAST NOTIFICATION SYSTEM
// ========================================

window.showToast = function(message, type = 'info') {
    // 1. Remove existing toast if any
    const existing = document.querySelector('.avonic-toast');
    if (existing) existing.remove();

    // 2. Create Element
    const toast = document.createElement('div');
    toast.className = `avonic-toast ${type}`;
    
    // 3. Add Content
    toast.innerHTML = `
        <div class="toast-dot"></div>
        <span>${message}</span>
    `;

    // 4. Inject styles if they don't exist yet
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .avonic-toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-50px); background: #fff; border: 2px solid #000; padding: 12px 24px; border-radius: 50px; z-index: 10000; opacity: 0; transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55); box-shadow: 4px 4px 0 #000; font-weight: 700; display: flex; align-items: center; gap: 8px; font-family: sans-serif; pointer-events: none; }
            .avonic-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
            .avonic-toast.success .toast-dot { background: #4CAF50; }
            .avonic-toast.error .toast-dot { background: #F44336; }
            .avonic-toast.warning .toast-dot { background: #FF9800; }
            .toast-dot { width: 12px; height: 12px; border-radius: 50%; border: 1px solid #000; }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // 5. Animate In
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
    });

    // 6. Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300); 
    }, 3000);
};

// ========================================
// 🎮 DEVICE CONTROL FROM MODAL
// ========================================

window.controlDeviceFromModal = async function(binId, device, state) {
  // Check if manual mode is enabled
  if (!isManualMode) {
    showToast("⚠️ Switch to Manual Mode to control devices", "warning");
    return;
  }
  
  const endpoint = `${API_BASE}/api/bin${binId}/${device}`;
  const statusId = `modal-bin${binId}-${device}-status`;
  const statusElement = document.getElementById(statusId);
  
  // Disable buttons temporarily
  const modal = document.querySelector('.status_modal');
  if (modal) {
    const buttons = modal.querySelectorAll('.control-btn');
    buttons.forEach(btn => btn.disabled = true);
  }
  
  // Show loading state
  if (statusElement) {
    statusElement.textContent = '⏳ Sending command...';
    statusElement.style.color = '#FFA500';
  }
  
  try {
    const token = localStorage.getItem('avonic_token');
    
    if (!token) {
      throw new Error('Not logged in');
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ state: state ? 'on' : 'off' })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Update modal status
      if (statusElement) {
        statusElement.textContent = state ? '🟢 ON' : '⚪ OFF';
        statusElement.style.color = state ? '#4CAF50' : '#757575';
      }
      
      showToast(`✅ ${device.toUpperCase()} turned ${state ? 'ON' : 'OFF'}`, 'success');
      
      console.log('✅ Control successful:', data);
    } else {
      throw new Error(data.error || 'Control failed');
    }
  } catch (error) {
    console.error('❌ Control error:', error);
    if (statusElement) {
      statusElement.textContent = '❌ Failed';
      statusElement.style.color = '#f44336';
    }
    showToast('❌ ' + error.message, 'error');
  } finally {
    // Re-enable buttons
    if (modal) {
      const buttons = modal.querySelectorAll('.control-btn');
      buttons.forEach(btn => btn.disabled = false);
    }
  }
};

console.log('✅ Toast notifications & device control loaded');
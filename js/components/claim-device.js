// ========================================
// 🔗 CLAIM DEVICE HANDLER
// ========================================

async function handleClaimSubmit(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  console.log('🎯 Claim button clicked!');
  
  const espID = document.getElementById('espID').value.trim();
  const alertBox = document.getElementById('claimAlertBox');
  const claimBtn = document.getElementById('claimBtn');
  const loadingSpinner = document.getElementById('claimLoadingSpinner');
  const deviceInfo = document.getElementById('claimDeviceInfo');

  // Validate ESP-ID format
  if (!espID.startsWith('AVONIC-') || espID.length < 17) {
    showClaimAlert('Please enter a valid ESP-ID (format: AVONIC-XXXXXXXXXXXX)', 'error');
    return;
  }

  // Hide previous alerts
  if (alertBox) alertBox.style.display = 'none';
  if (deviceInfo) deviceInfo.style.display = 'none';

  // Show loading
  claimBtn.disabled = true;
  if (loadingSpinner) loadingSpinner.style.display = 'block';

  try {
    const token = localStorage.getItem('avonic_token');
    
    console.log('📡 Sending claim request for:', espID);
    
    const response = await fetch(`${API_BASE}/api/devices/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ espID })
    });

    const data = await response.json();
    if (loadingSpinner) loadingSpinner.style.display = 'none';

    if (response.ok) {
      document.getElementById('claimedESPID').textContent = data.device.espID;
      document.getElementById('claimedNickname').textContent = data.device.nickname || 'My Compost Bin';
      if (deviceInfo) deviceInfo.style.display = 'block';

      console.log('✅ Device claimed:', data.device);

      setTimeout(() => {
        window.location.hash = '#/dashboard';
      }, 2000);

    } else {
      showClaimAlert(data.error || 'Failed to claim device', 'error');
      claimBtn.disabled = false;
    }

  } catch (error) {
    console.error('❌ Claim error:', error);
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    showClaimAlert('Network error. Please check your connection.', 'error');
    claimBtn.disabled = false;
  }
}

function showClaimAlert(message, type) {
  const alertBox = document.getElementById('claimAlertBox');
  if (alertBox) {
    alertBox.textContent = message;
    alertBox.className = `alert ${type}`;
    alertBox.style.display = 'block';
  }
}

// BUTTON CLICK LISTENER (not form submit)
document.body.addEventListener('click', function(e) {
  if (e.target.id === 'claimBtn') {
    console.log('🔘 Claim button clicked via delegation!');
    handleClaimSubmit(e);
  }
});

console.log('✅ Claim device functionality loaded');
// ========================================
// ✏️ NICKNAME MANAGEMENT
// ========================================

// Open nickname edit modal
function openNicknameModal(espID, currentNickname) {
  const modal = document.createElement('div');
  modal.className = 'status_modal nickname-modal';
  
  modal.innerHTML = `
    <div class="modal">
      <div class="modalHeader">
        <h1>Edit Device Nickname</h1>
        <div class="close_btn">
          <img src="img/icons/navIcons/closeIcon.svg" alt="">
        </div>
      </div>
      
      <div class="modalCard">
        <div class="modalContent defaultContent active">
          <div class="nickname-form">
            <div class="form-group">
              <label for="nicknameInput">Device ID:</label>
              <input type="text" value="${espID}" disabled class="disabled-input">
            </div>
            
            <div class="form-group">
              <label for="nicknameInput">Nickname:</label>
              <input 
                type="text" 
                id="nicknameInput" 
                value="${currentNickname || ''}" 
                placeholder="Enter device nickname"
                maxlength="50"
              >
            </div>
            
            <div class="nickname-alert" style="display:none;"></div>
            
            <div class="manualControl">
              <div class="btn modalConfirm" id="saveNicknameBtn">Save</div>
              <div class="btn modalCancel">Cancel</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Focus input
  const input = modal.querySelector('#nicknameInput');
  input.focus();
  input.select();
  
  // Close button
  modal.querySelector('.close_btn').addEventListener('click', () => modal.remove());
  modal.querySelector('.modalCancel').addEventListener('click', () => modal.remove());
  
  // Save button
  modal.querySelector('#saveNicknameBtn').addEventListener('click', () => {
    saveNickname(espID, input.value.trim(), modal);
  });
  
  // Enter key to save
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveNickname(espID, input.value.trim(), modal);
    }
  });
}

// Save nickname to backend
async function saveNickname(espID, newNickname, modal) {
  const token = localStorage.getItem('avonic_token');
  const alertBox = modal.querySelector('.nickname-alert');
  const saveBtn = modal.querySelector('#saveNicknameBtn');
  
  if (!newNickname) {
    showNicknameAlert(alertBox, 'Please enter a nickname', 'error');
    return;
  }
  
  // Show loading
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';
  
  try {
    const response = await fetch(`${API_BASE}/api/devices/${espID}/nickname`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ nickname: newNickname })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showNicknameAlert(alertBox, '✅ Nickname saved!', 'success');
      
      // Update UI elements with new nickname
      updateNicknameInUI(espID, newNickname);
      
      setTimeout(() => modal.remove(), 1000);
      
    } else {
      showNicknameAlert(alertBox, data.error || 'Failed to save nickname', 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save';
    }
    
  } catch (error) {
    console.error('❌ Save nickname error:', error);
    showNicknameAlert(alertBox, 'Network error. Please try again.', 'error');
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
}

// Show alert in nickname modal
function showNicknameAlert(alertBox, message, type) {
  alertBox.textContent = message;
  alertBox.className = `nickname-alert ${type}`;
  alertBox.style.display = 'block';
  
  if (type === 'success') {
    setTimeout(() => {
      alertBox.style.display = 'none';
    }, 2000);
  }
}

// Update nickname throughout the UI
function updateNicknameInUI(espID, newNickname) {
  // Update device selector
  const selector = document.getElementById('home-device-selector');
  if (selector) {
    const option = selector.querySelector(`option[value="${espID}"]`);
    if (option) {
      option.textContent = `${newNickname} (${espID.slice(-6)})`;
    }
  }
  
  // Update bin cards
  const binCards = document.querySelectorAll(`bin-card[data-esp-id="${espID}"]`);
  binCards.forEach(card => {
    const binNumber = card.getAttribute('data-bin-number');
    card.setAttribute('bin_name', `${newNickname} - Bin ${binNumber}`);
    const nameElement = card.querySelector('.bin_name');
    if (nameElement) {
      nameElement.textContent = `${newNickname} - Bin ${binNumber}`;
    }
  });
  
  // Update machine status title
  const statusSection = document.querySelector(`.machine_status[data-esp-id="${espID}"]`);
  if (statusSection) {
    const title = statusSection.querySelector('h1');
    if (title) {
      title.textContent = `Machine Status - ${newNickname}`;
    }
  }
  
  // Update edit button
  const editBtn = document.querySelector('.edit-nickname-btn');
  if (editBtn) {
    editBtn.dataset.nickname = newNickname;
  }
  
  console.log(`✅ Updated nickname in UI: ${espID} -> ${newNickname}`);
}

// Add edit button click listener
document.body.addEventListener('click', function(e) {
  if (e.target.closest('.edit-nickname-btn')) {
    const btn = e.target.closest('.edit-nickname-btn');
    const espID = btn.dataset.espId;
    const currentNickname = btn.dataset.nickname;
    
    console.log('✏️ Edit nickname clicked:', espID);
    openNicknameModal(espID, currentNickname);
  }
});

console.log('✅ Nickname management loaded');
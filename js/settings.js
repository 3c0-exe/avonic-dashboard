// ====== INTEGRATED SETTINGS SYSTEM ======
const SETTINGS_API_BASE = 'https://avonic-main-hub-production.up.railway.app/api';

console.log('✅ Integrated Settings.js loaded');

// ====== 1. NAVIGATION ======
window.settingsNav = {

    handleLogout: () => {
        openSaveChangesModal(() => {
            performLogout();
        }, "Are you sure you want to log out?");
    },
    handleClaimSubmit: async (event) => {
        event.preventDefault();
        const espInput = document.getElementById('settings-esp-id');
        const alertBox = document.getElementById('settings-claim-alert');
        const loading = document.getElementById('settings-claim-loading');
        const successBox = document.getElementById('settings-claim-success');
        const btn = event.target.querySelector('button');
        
        alertBox.style.display = 'none';
        successBox.style.display = 'none';
        btn.disabled = true;
        loading.style.display = 'block';

        try {
            const token = localStorage.getItem('avonic_token');
            const espID = espInput.value.trim().toUpperCase();

            const response = await fetch(`${SETTINGS_API_BASE}/devices/claim`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ espID })
            });

            const data = await response.json();
            loading.style.display = 'none';
            btn.disabled = false;

            if (response.ok) {
                openSuccessModal("Device claimed successfully!");
                successBox.style.display = 'block';
                espInput.value = '';
                if(typeof loadAccountSettings === 'function') loadClaimedBinsAccount();
            } else {
                alertBox.textContent = data.error || 'Failed to claim device';
                alertBox.className = 'alert error';
                alertBox.style.display = 'block';
                alertBox.style.color = 'red';
            }
        } catch (error) {
            loading.style.display = 'none';
            btn.disabled = false;
            alertBox.textContent = 'Network error. Please try again.';
            alertBox.style.display = 'block';
            alertBox.style.color = 'red';
        }
    }
};

function performLogout() {
    const token = localStorage.getItem('avonic_token');
    fetch(`${SETTINGS_API_BASE}/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    }).finally(() => {
        localStorage.removeItem('avonic_token');
        localStorage.removeItem('avonic_user');
        window.location.href = 'forms.html';
    });
}

// ====== 2. DATA LOADING ======
async function loadAccountSettings() {
    const token = localStorage.getItem('avonic_token');
    if (!token) {
        window.location.href = 'forms.html';
        return;
    }

    try {
        const userRes = await fetch(`${SETTINGS_API_BASE}/user/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (userRes.ok) {
            const userData = await userRes.json();
            const usernameEl = document.getElementById('account-username');
            const emailEl = document.getElementById('account-email');
            
            if (usernameEl) usernameEl.value = userData.username;
            if (emailEl) emailEl.value = userData.email;
        }
    } catch (error) {
        console.error('Failed to load profile:', error);
    }
    loadClaimedBinsAccount();
}

async function loadClaimedBinsAccount() {
    const container = document.getElementById('account-bins-list');
    const token = localStorage.getItem('avonic_token');
    if (!container) return;

    try {
        const res = await fetch(`${SETTINGS_API_BASE}/devices/claimed`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok && data.devices && data.devices.length > 0) {
            // Show ALL devices (not just first 2)
            container.innerHTML = data.devices.map(device => `
                <div class="bin-item">
                    <img src="/settings-content/settings-img/Account/bin-icon.svg" alt="Bin" class="bin-icon">
                    <div class="bin-info">
                        <h3>${device.nickname || 'My Bin'} - ${device.espID.substring(7, 11)}...</h3>
                        <p>${device.status === 'active' ? 'Online' : 'Offline'}</p>
                    </div>
                    <button class="remove-bin" onclick="openUnclaimModal('${device.espID}', '${device.nickname || device.espID}')">
                        <img src="/settings-content/settings-img/Account/remove.svg" alt="Remove" class="close-icon">
                    </button>
                </div>
            `).join('');
            
            // Initialize the View More button after loading bins
            initializeViewMoreButton();
        } else {
            container.innerHTML = `<div style="text-align:center; color:#888; padding:20px;">No devices yet</div>`;
        }
    } catch (error) {
        container.innerHTML = '<p style="color:red; text-align:center">Error loading devices</p>';
    }
}

// ====== VIEW MORE BINS FUNCTIONALITY ======
function toggleViewMoreBins() {
    const binsList = document.getElementById('account-bins-list');
    const viewMoreBtn = document.querySelector('.bins-card .view-more-btn');
    
    if (!binsList || !viewMoreBtn) return;
    
    const isExpanded = binsList.classList.contains('expanded');
    
    if (isExpanded) {
        binsList.classList.remove('expanded');
        viewMoreBtn.textContent = 'View More';
    } else {
        binsList.classList.add('expanded');
        viewMoreBtn.textContent = 'View Less';
    }
}

function initializeViewMoreButton() {
    const binsList = document.getElementById('account-bins-list');
    const viewMoreBtn = document.querySelector('.bins-card .view-more-btn');
    
    if (!binsList || !viewMoreBtn) return;
    
    const binItems = binsList.querySelectorAll('.bin-item');
    
    if (binItems.length > 2) {
        viewMoreBtn.style.display = 'block';
        viewMoreBtn.onclick = toggleViewMoreBins;
        binsList.classList.remove('expanded');
    } else {
        viewMoreBtn.style.display = 'none';
        binsList.classList.add('expanded');
    }
}

// ====== 3. MODAL SYSTEM ======
let pendingModalAction = null;

function openSaveChangesModal(actionCallback, customMessage) {
    const modal = document.getElementById('save-changes-modal');
    if (!modal) return;

    const desc = modal.querySelector('.modal-description');
    if (desc) desc.textContent = customMessage || "Your changes will be saved";

    modal.style.display = 'flex';
    pendingModalAction = actionCallback;

    const saveBtn = modal.querySelector('.btn-primary');
    const cancelBtn = modal.querySelector('.btn-secondary');

    const newSave = saveBtn.cloneNode(true);
    const newCancel = cancelBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSave, saveBtn);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

    newSave.addEventListener('click', () => {
        if (pendingModalAction) pendingModalAction();
        closeSaveChangesModal();
    });

    newCancel.addEventListener('click', closeSaveChangesModal);
}

function closeSaveChangesModal() {
    const modal = document.getElementById('save-changes-modal');
    if (modal) modal.style.display = 'none';
    pendingModalAction = null;
}

function showCurrentPasswordModal() {
    const modal = document.getElementById('current-password-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    setTimeout(() => {
        const input = modal.querySelector('.input-field');
        if(input) input.focus();
    }, 100);
}

function closeCurrentPasswordModal() {
    const modal = document.getElementById('current-password-modal');
    if (modal) {
        modal.style.display = 'none';
        const input = modal.querySelector('.input-field');
        if (input) input.value = '';
    }
}

function openSuccessModal(message) {
    const modal = document.getElementById('success-modal');
    if (modal) {
        const msgEl = document.getElementById('success-modal-msg');
        if(msgEl) msgEl.textContent = message;
        modal.style.display = 'flex';
    } else {
        alert(message);
    }
}

function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) modal.style.display = 'none';
}

// ====== 4. EMAIL LOGIC ======
let isEditingEmail = false;

function toggleEmailEdit() {
    const input = document.getElementById('account-email');
    const btn = document.querySelector('.settings-card:nth-child(2) .edit-btn');
    
    if (!isEditingEmail) {
        input.removeAttribute('readonly');
        input.focus();
        btn.textContent = 'Save';
        btn.style.background = '#B8D989';
        isEditingEmail = true;
    } else {
        if (!input.value || !input.value.includes('@')) {
            showModalMessage('Please enter a valid email', 'error');
            return;
        }
        openSaveChangesModal(() => {
            performEmailUpdate(input.value, btn, input);
        });
    }
}

async function performEmailUpdate(newEmail, btn, input) {
    const token = localStorage.getItem('avonic_token');
    btn.textContent = 'Saving...';
    btn.disabled = true;

    try {
        const res = await fetch(`${SETTINGS_API_BASE}/user/email`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email: newEmail })
        });

        const data = await res.json();

        if (res.ok) {
            openSuccessModal('Email updated successfully!');
            input.setAttribute('readonly', 'readonly');
            btn.textContent = 'Edit';
            btn.style.background = '';
            isEditingEmail = false;
        } else {
            showModalMessage(data.error || 'Failed to update email', 'error');
            btn.textContent = 'Save';
        }
    } catch (error) {
        showModalMessage('Network error', 'error');
        btn.textContent = 'Save';
    } finally {
        btn.disabled = false;
    }
}

// ====== 5. PASSWORD LOGIC ======
let isEditingPassword = false;

function togglePasswordEdit() {
    const card = document.querySelector('.password-card');
    const inputs = card.querySelectorAll('.password-input');
    const btn = card.querySelector('.edit-btn');
    
    if (!isEditingPassword) {
        inputs.forEach(input => input.removeAttribute('readonly'));
        inputs[0].focus();
        btn.textContent = 'Save';
        btn.style.background = '#B8D989';
        isEditingPassword = true;
    } else {
        const newPass = inputs[0].value;
        const confirmPass = inputs[1].value;

        if (!newPass || !confirmPass) {
            showModalMessage('Please fill in both fields', 'error');
            return;
        }
        if (newPass !== confirmPass) {
            showModalMessage('Passwords do not match', 'error');
            return;
        }
        if (newPass.length < 6) {
            showModalMessage('Password must be at least 6 characters', 'error');
            return;
        }
        showCurrentPasswordModal();
    }
}

async function submitCurrentPassword() {
    const modal = document.getElementById('current-password-modal');
    const currentPassword = modal.querySelector('.input-field').value;
    
    const inputs = document.querySelectorAll('.password-card .password-input');
    const newPassword = inputs[0].value;
    const token = localStorage.getItem('avonic_token');

    if (!currentPassword) {
        showModalMessage('Please enter your current password', 'error');
        return;
    }

    try {
        const res = await fetch(`${SETTINGS_API_BASE}/user/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });

        if (res.ok) {
            closeCurrentPasswordModal();
            openSuccessModal('Password updated successfully!');
            
            inputs.forEach(i => {
                i.value = '';
                i.setAttribute('readonly', 'readonly');
            });
            const btn = document.querySelector('.password-card .edit-btn');
            btn.textContent = 'Edit';
            btn.style.background = '';
            isEditingPassword = false;
        } else {
            const data = await res.json();
            showModalMessage(data.error || 'Incorrect current password', 'error');
        }
    } catch (error) {
        showModalMessage('Network error', 'error');
    }
}

// ====== 6. UNCLAIM DEVICE ======
let deviceToUnclaim = null;

function openUnclaimModal(espID, deviceName) {
    deviceToUnclaim = espID;
    const modal = document.getElementById('unclaim-modal');
    const nameEl = document.getElementById('unclaim-device-name');
    if (nameEl) nameEl.textContent = deviceName;
    if (modal) modal.style.display = 'flex';
}

function closeUnclaimModal() {
    deviceToUnclaim = null;
    const modal = document.getElementById('unclaim-modal');
    if (modal) modal.style.display = 'none';
}

async function confirmUnclaim() {
    if (!deviceToUnclaim) return;
    const token = localStorage.getItem('avonic_token');

    try {
        const res = await fetch(`${SETTINGS_API_BASE}/devices/${deviceToUnclaim}/unclaim`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            closeUnclaimModal();
            openSuccessModal('Device unclaimed successfully');
            loadClaimedBinsAccount();
        } else {
            showModalMessage('Failed to unclaim', 'error');
        }
    } catch (error) {
        showModalMessage('Network error', 'error');
    }
}

// ====== 7. UTILS ======
function togglePasswordVisibility(button) {
    const input = button.previousElementSibling;
    const eyeIcon = button.querySelector('.eye-icon');
    if (input.type === 'password') {
        input.type = 'text';
        eyeIcon.src = '/settings-content/settings-img/Account/open-eyes.svg';
    } else {
        input.type = 'password';
        eyeIcon.src = '/settings-content/settings-img/Account/close-eyes.svg';
    }
}

function showModalMessage(message, type = 'error') {
    let msgDiv = document.getElementById('modal-message');
    if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.id = 'modal-message';
        msgDiv.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 16px 24px;
            border-radius: 12px; font-size: 15px; font-weight: 600; z-index: 10000;
            border: 2px solid #000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(msgDiv);
    }
    if (type === 'error') {
        msgDiv.style.background = '#FFE8E8'; msgDiv.style.color = '#D32F2F';
    } else {
        msgDiv.style.background = '#E8F5B3'; msgDiv.style.color = '#2A4633';
    }
    msgDiv.textContent = message;
    msgDiv.style.display = 'block';
    setTimeout(() => { msgDiv.style.display = 'none'; }, 4000);
}

// ====== EXPORTS ======
window.loadAccountSettings = loadAccountSettings;
window.toggleEmailEdit = toggleEmailEdit;
window.togglePasswordEdit = togglePasswordEdit;
window.togglePasswordVisibility = togglePasswordVisibility;
window.showCurrentPasswordModal = showCurrentPasswordModal;
window.closeCurrentPasswordModal = closeCurrentPasswordModal;
window.submitCurrentPassword = submitCurrentPassword;
window.openUnclaimModal = openUnclaimModal;
window.closeUnclaimModal = closeUnclaimModal;
window.confirmUnclaim = confirmUnclaim;
window.openSaveChangesModal = openSaveChangesModal;
window.closeSaveChangesModal = closeSaveChangesModal;
window.openSuccessModal = openSuccessModal;
window.closeSuccessModal = closeSuccessModal;

console.log('✅ Integrated Settings loaded');
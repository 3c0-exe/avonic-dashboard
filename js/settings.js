// ====== INTEGRATED SETTINGS SYSTEM ======
const SETTINGS_API_BASE = 'https://avonic-main-hub-production.up.railway.app/api';

console.log('✅ Integrated Settings.js loaded');

// ====== 1. NAVIGATION ======
window.settingsNav = {
    navigateToAccount: () => {
        window.location.hash = '#/settings/account';
    },
    navigateToClaim: () => {
        window.location.hash = '#/settings/claim';
    },
    navigateToUserManual: () => {
        window.open('/user-manual.pdf', '_blank');
    },
    handleLogout: () => {
        // Confirmation before logging out
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
            console.error(error);
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
            const displayDevices = data.devices.slice(0, 2);
            container.innerHTML = displayDevices.map(device => `
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
            
            const viewMoreBtn = document.querySelector('.view-more-btn');
            if (viewMoreBtn) {
                viewMoreBtn.style.display = data.devices.length > 2 ? 'block' : 'none';
            }
        } else {
            container.innerHTML = `<div style="text-align:center; color:#888; padding:20px;">No devices yet</div>`;
        }
    } catch (error) {
        container.innerHTML = '<p style="color:red; text-align:center">Error loading devices</p>';
    }
}

// ====== 3. MODAL SYSTEM (CORRECTED FLOW) ======
let pendingModalAction = null;

// Opens "Save Changes?" Modal
function openSaveChangesModal(actionCallback, customMessage) {
    const modal = document.getElementById('save-changes-modal');
    if (!modal) return;

    // Optional: Update text if provided
    const desc = modal.querySelector('.modal-description');
    if (desc && customMessage) desc.textContent = customMessage;
    else if (desc) desc.textContent = "Your changes will be saved";

    modal.style.display = 'flex';
    pendingModalAction = actionCallback;

    // Set up one-time listener for the SAVE button inside the modal
    const saveBtn = modal.querySelector('.btn-primary');
    const cancelBtn = modal.querySelector('.btn-secondary');

    // Clone to remove old listeners
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

// Opens "Current Password" Modal
function showCurrentPasswordModal() {
    const modal = document.getElementById('current-password-modal');
    if (!modal) return;

    modal.style.display = 'flex';
    
    // Auto-focus the input
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

// ====== 4. EMAIL LOGIC (WITH SAVE MODAL) ======
let isEditingEmail = false;

function toggleEmailEdit() {
    const input = document.getElementById('account-email');
    const btn = document.querySelector('.settings-card:nth-child(2) .edit-btn');
    
    if (!isEditingEmail) {
        // Step 1: Click Edit -> Become Editable
        input.removeAttribute('readonly');
        input.focus();
        btn.textContent = 'Save';
        btn.style.background = '#B8D989';
        isEditingEmail = true;
    } else {
        // Step 2: Click Save -> Validate -> Open Modal
        if (!input.value || !input.value.includes('@')) {
            showModalMessage('Please enter a valid email', 'error');
            return;
        }
        
        // Triggers the "Save Changes?" modal
        openSaveChangesModal(() => {
            performEmailUpdate(input.value, btn, input);
        });
    }
}

async function performEmailUpdate(newEmail, btn, input) {
    const token = localStorage.getItem('avonic_token');
    
    // UI Loading state (button inside modal is already closed, so we update the page button)
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
            showModalMessage('Email updated successfully!', 'success');
            // Reset UI to "View" mode
            input.setAttribute('readonly', 'readonly');
            btn.textContent = 'Edit';
            btn.style.background = '';
            isEditingEmail = false;
        } else {
            showModalMessage(data.error || 'Failed to update email', 'error');
            btn.textContent = 'Save'; // Revert button if failed
        }
    } catch (error) {
        showModalMessage('Network error', 'error');
        btn.textContent = 'Save';
    } finally {
        btn.disabled = false;
    }
}

// ====== 5. PASSWORD LOGIC (WITH CURRENT PASSWORD MODAL) ======
let isEditingPassword = false;

function togglePasswordEdit() {
    const card = document.querySelector('.password-card');
    const inputs = card.querySelectorAll('.password-input');
    const btn = card.querySelector('.edit-btn');
    
    if (!isEditingPassword) {
        // Step 1: Click Edit -> Become Editable
        inputs.forEach(input => input.removeAttribute('readonly'));
        inputs[0].focus();
        btn.textContent = 'Save';
        btn.style.background = '#B8D989';
        isEditingPassword = true;
    } else {
        // Step 2: Click Save -> Validate -> Open "Current Password" Modal
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

        // Open the modal to ask for old password
        showCurrentPasswordModal();
    }
}

// Called by the "Enter" button inside the Current Password Modal
async function submitCurrentPassword() {
    const modal = document.getElementById('current-password-modal');
    const currentPasswordInput = modal.querySelector('.input-field');
    const currentPassword = currentPasswordInput.value;
    
    // Get new password from the page inputs
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

        const data = await res.json();

        if (res.ok) {
            closeCurrentPasswordModal();
            showModalMessage('Password updated successfully!', 'success');
            
            // Reset Page UI
            inputs.forEach(i => {
                i.value = '';
                i.setAttribute('readonly', 'readonly');
            });
            const btn = document.querySelector('.password-card .edit-btn');
            btn.textContent = 'Edit';
            btn.style.background = '';
            isEditingPassword = false;
        } else {
            // Show error but keep modal open so they can retry
            showModalMessage(data.error || 'Incorrect current password', 'error');
            currentPasswordInput.value = '';
            currentPasswordInput.focus();
        }
    } catch (error) {
        showModalMessage('Network error', 'error');
        closeCurrentPasswordModal();
    }
}

// ====== UNCLAIM DEVICE ======
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
            showModalMessage('Device unclaimed successfully', 'success');
            closeUnclaimModal();
            loadClaimedBinsAccount();
        } else {
            showModalMessage('Failed to unclaim', 'error');
        }
    } catch (error) {
        showModalMessage('Network error', 'error');
    }
}

// ====== UTILS ======
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

console.log('✅ All integrated settings functions exposed');
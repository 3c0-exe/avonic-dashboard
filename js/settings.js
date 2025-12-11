// ====== INTEGRATED SETTINGS SYSTEM ======
const SETTINGS_API_BASE = 'https://avonic-main-hub-production.up.railway.app/api';

console.log('✅ Integrated Settings.js loaded');

// ====== SETTINGS HUB NAVIGATION ======
// ====== SETTINGS HUB NAVIGATION ======
window.settingsNav = {
    navigateToAccount: () => {
        window.location.hash = '#/settings/account';
    },
    // CHANGED: WiFi -> Claim
    navigateToClaim: () => {
        window.location.hash = '#/settings/claim';
    },
    navigateToUserManual: () => {
        window.open('/user-manual.pdf', '_blank');
    },
    handleLogout: () => {
        if (!confirm('Are you sure you want to logout?')) return;
        
        const token = localStorage.getItem('avonic_token');
        
        fetch(`${SETTINGS_API_BASE}/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        }).catch(err => console.error('⚠️ Logout request failed:', err));
        
        localStorage.removeItem('avonic_token');
        localStorage.removeItem('avonic_user');
        console.log('👋 Logged out');
        window.location.href = 'forms.html';
    },
    // ADDED: Handle the Claim Form Submit
    handleClaimSubmit: async (event) => {
        event.preventDefault();
        
        const espInput = document.getElementById('settings-esp-id');
        const alertBox = document.getElementById('settings-claim-alert');
        const loading = document.getElementById('settings-claim-loading');
        const successBox = document.getElementById('settings-claim-success');
        const btn = event.target.querySelector('button');
        
        // Reset UI
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
                espInput.value = ''; // Clear input
                
                // Refresh the account list so the new bin shows up there immediately
                if(typeof loadAccountSettings === 'function') {
                   // We don't call loadAccountSettings() directly to avoid page jump, 
                   // but we can refresh the bin list if needed next time.
                }
            } else {
                alertBox.textContent = data.error || 'Failed to claim device';
                alertBox.className = 'alert error';
                alertBox.style.display = 'block';
                alertBox.style.color = 'red';
                alertBox.style.marginBottom = '10px';
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

// ====== ACCOUNT SETTINGS PAGE ======
async function loadAccountSettings() {
    console.log('📄 Loading account settings...');
    const token = localStorage.getItem('avonic_token');
    
    if (!token) {
        console.error('❌ No token found');
        window.location.href = 'forms.html';
        return;
    }

    try {
        const userRes = await fetch(`${SETTINGS_API_BASE}/user/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (userRes.ok) {
            const userData = await userRes.json();
            console.log('✅ User data loaded:', userData);
            
            const usernameEl = document.getElementById('account-username');
            const emailEl = document.getElementById('account-email');
            
            if (usernameEl) usernameEl.value = userData.username;
            if (emailEl) emailEl.value = userData.email;
        } else {
            console.error('❌ Failed to load user profile:', userRes.status);
        }
    } catch (error) {
        console.error('❌ Failed to load user data:', error);
    }

    loadClaimedBinsAccount();
}

async function loadClaimedBinsAccount() {
    console.log('🗑️ Loading claimed bins for account page...');
    const container = document.getElementById('account-bins-list');
    const token = localStorage.getItem('avonic_token');

    if (!container) {
        console.error('❌ account-bins-list not found');
        return;
    }

    try {
        const res = await fetch(`${SETTINGS_API_BASE}/devices/claimed`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();
        console.log('📦 Devices response:', data);

        if (res.ok && data.devices && data.devices.length > 0) {
            console.log(`✅ Found ${data.devices.length} devices`);
            
            // Show only first 2 bins on mobile, all on desktop
            const displayDevices = data.devices.slice(0, 2);
            
            container.innerHTML = displayDevices.map(device => `
                <div class="bin-item">
                    <img src="/settings-content/settings-img/Account/bin-icon.svg" alt="Bin" class="bin-icon">
                    <div class="bin-info">
                        <h3>${device.nickname || 'My Bin'} - ${device.espID.substring(7, 11)} ${device.espID.substring(11, 15)}</h3>
                        <p>${device.status === 'active' ? 'Active bin' : 'Offline'}</p>
                    </div>
                    <button class="remove-bin" onclick="openUnclaimModal('${device.espID}', '${device.nickname || device.espID}')">
                        <img src="/settings-content/settings-img/Account/remove.svg" alt="Remove" class="close-icon">
                    </button>
                </div>
            `).join('');

            // Show "View More" button if more than 2 devices
            const viewMoreBtn = document.querySelector('.view-more-btn');
            if (viewMoreBtn && data.devices.length > 2) {
                viewMoreBtn.style.display = 'block';
                viewMoreBtn.onclick = () => {
                    // Could navigate to a full bins page or expand the list
                    alert(`You have ${data.devices.length} total devices. View them in Dashboard.`);
                };
            }
        } else {
            console.log('ℹ️ No devices claimed');
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #808080;">
                    <p>No devices claimed yet</p>
                    <button onclick="window.location.hash='#/claim-device'" 
                            style="margin-top: 16px; padding: 12px 24px; background: #E8F5B3; 
                                   border: 1px solid #000; border-radius: 20px; cursor: pointer;">
                        ➕ Claim Your First Device
                    </button>
                </div>
            `;
        }
    } catch (error) {
        console.error('❌ Failed to load devices:', error);
        container.innerHTML = '<p style="color: #FF0000; text-align: center;">Failed to load devices</p>';
    }
}

// ====== EMAIL UPDATE ======
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
        updateEmail();
    }
}

async function updateEmail() {
    console.log('📧 Updating email...');
    const input = document.getElementById('account-email');
    const newEmail = input.value;
    const token = localStorage.getItem('avonic_token');
    const btn = document.querySelector('.settings-card:nth-child(2) .edit-btn');
    
    if (!newEmail || !newEmail.includes('@')) {
        showModalMessage('Please enter a valid email', 'error');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Saving...';

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
            console.log('✅ Email updated');
            showModalMessage('Email updated successfully!', 'success');
            input.setAttribute('readonly', 'readonly');
            btn.textContent = 'Edit';
            btn.style.background = '#E8F5B3';
            isEditingEmail = false;
        } else {
            console.error('❌ Email update failed:', data);
            showModalMessage(data.error || 'Failed to update email', 'error');
        }
    } catch (error) {
        console.error('❌ Email update error:', error);
        showModalMessage('Network error. Please try again.', 'error');
    } finally {
        btn.disabled = false;
    }
}

// ====== PASSWORD UPDATE ======
let isEditingPassword = false;

function togglePasswordEdit() {
    const card = document.querySelector('.password-card');
    const inputs = card.querySelectorAll('.password-input');
    const btn = card.querySelector('.edit-btn');
    
    if (!isEditingPassword) {
        inputs.forEach(input => input.removeAttribute('readonly'));
        btn.textContent = 'Save';
        btn.style.background = '#B8D989';
        isEditingPassword = true;
    } else {
        updatePassword();
    }
}

async function updatePassword() {
    console.log('🔐 Updating password...');
    const inputs = document.querySelectorAll('.password-card .password-input');
    const newPassword = inputs[0].value;
    const confirmPassword = inputs[1].value;
    const btn = document.querySelector('.password-card .edit-btn');

    if (!newPassword || !confirmPassword) {
        showModalMessage('Please fill in both password fields', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showModalMessage('Password must be at least 6 characters', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showModalMessage('Passwords do not match', 'error');
        return;
    }

    // Show current password modal first
    showCurrentPasswordModal(newPassword);
}

// ====== PASSWORD VISIBILITY TOGGLE ======
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

// ====== MODAL SYSTEM ======
function showCurrentPasswordModal(newPassword) {
    const modal = document.getElementById('current-password-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.dataset.newPassword = newPassword;
    }
}

function closeCurrentPasswordModal() {
    const modal = document.getElementById('current-password-modal');
    if (modal) {
        modal.style.display = 'none';
        const input = modal.querySelector('.input-field');
        if (input) input.value = '';
    }
}

async function submitCurrentPassword() {
    const modal = document.getElementById('current-password-modal');
    const currentPassword = modal.querySelector('.input-field').value;
    const newPassword = modal.dataset.newPassword;
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
            console.log('✅ Password updated');
            closeCurrentPasswordModal();
            showModalMessage('Password updated successfully!', 'success');
            
            // Reset password inputs
            const inputs = document.querySelectorAll('.password-card .password-input');
            inputs.forEach(input => {
                input.value = '';
                input.setAttribute('readonly', 'readonly');
            });
            
            const btn = document.querySelector('.password-card .edit-btn');
            btn.textContent = 'Edit';
            btn.style.background = '#E8F5B3';
            isEditingPassword = false;
        } else {
            console.error('❌ Password update failed:', data);
            showModalMessage(data.error || 'Incorrect current password', 'error');
        }
    } catch (error) {
        console.error('❌ Password update error:', error);
        showModalMessage('Network error. Please try again.', 'error');
    }
}

// ====== UNCLAIM DEVICE ======
let deviceToUnclaim = null;

function openUnclaimModal(espID, deviceName) {
    console.log('🗑️ Opening unclaim modal for:', espID);
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

    console.log('🗑️ Unclaiming device:', deviceToUnclaim);
    const token = localStorage.getItem('avonic_token');

    try {
        const res = await fetch(`${SETTINGS_API_BASE}/devices/${deviceToUnclaim}/unclaim`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        if (res.ok) {
            console.log('✅ Device unclaimed');
            showModalMessage('Device unclaimed successfully', 'success');
            closeUnclaimModal();
            loadClaimedBinsAccount();
        } else {
            console.error('❌ Unclaim failed:', data);
            showModalMessage(data.error || 'Failed to unclaim device', 'error');
        }
    } catch (error) {
        console.error('❌ Unclaim error:', error);
        showModalMessage('Failed to unclaim device', 'error');
    }
}



// ====== MESSAGE DISPLAY ======
function showModalMessage(message, type = 'error') {
    // Create or get message element
    let msgDiv = document.getElementById('modal-message');
    
    if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.id = 'modal-message';
        msgDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            z-index: 10000;
            border: 2px solid #000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(msgDiv);
    }
    
    if (type === 'error') {
        msgDiv.style.background = '#FFE8E8';
        msgDiv.style.color = '#D32F2F';
    } else if (type === 'success') {
        msgDiv.style.background = '#E8F5B3';
        msgDiv.style.color = '#2A4633';
    } else {
        msgDiv.style.background = '#E3F2FD';
        msgDiv.style.color = '#1565C0';
    }
    
    msgDiv.textContent = message;
    msgDiv.style.display = 'block';
    
    setTimeout(() => {
        msgDiv.style.display = 'none';
    }, 4000);
}

// ====== EXPOSE FUNCTIONS TO WINDOW ======
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
window.loadWiFiSettings = loadWiFiSettings;
window.connectWiFi = connectWiFi;

console.log('✅ All integrated settings functions exposed');
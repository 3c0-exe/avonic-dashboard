// ====== SETTINGS PAGE FUNCTIONALITY ======

const SETTINGS_API_BASE = 'https://avonic-main-hub-production.up.railway.app/api';

console.log('✅ Settings.js loaded - defining functions...');

// All function declarations
async function loadUserSettings() {
    console.log('🔄 Loading user settings...');
    const token = localStorage.getItem('avonic_token');
    if (!token) {
        console.error('❌ No token found');
        window.location.href = 'login.html';
        return;
    }

    try {
        const userRes = await fetch(`${SETTINGS_API_BASE}/user/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (userRes.ok) {
            const userData = await userRes.json();
            console.log('✅ User data loaded:', userData);
            const usernameEl = document.getElementById('username-display');
            const emailEl = document.getElementById('email-input');
            if (usernameEl) usernameEl.value = userData.username;
            if (emailEl) emailEl.value = userData.email;
        } else {
            console.error('❌ Failed to load user profile:', userRes.status);
        }
    } catch (error) {
        console.error('❌ Failed to load user data:', error);
    }

    loadClaimedBins();
}

async function loadClaimedBins() {
    console.log('🔄 Loading claimed bins...');
    const container = document.getElementById('claimed-bins-container');
    const token = localStorage.getItem('avonic_token');

    if (!container) {
        console.error('❌ claimed-bins-container not found');
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
            container.innerHTML = data.devices.map(device => `
                <div class="bin-card" data-device-id="${device.espID}">
                    <div class="bin-icon">🗑️</div>
                    <div class="bin-info">
                        <div class="bin-name">${device.nickname || 'My Compost Bin'}</div>
                        <div class="bin-id">${device.espID}</div>
                        <div class="bin-status ${device.status === 'active' ? '' : 'offline'}">
                            <span>${device.status === 'active' ? '● Online' : '○ Offline'}</span>
                        </div>
                    </div>
                    <button class="btn-unclaim" onclick="window.openUnclaimModal('${device.espID}', '${device.nickname || device.espID}')" title="Unclaim device">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
            `).join('');
        } else {
            console.log('ℹ️ No devices claimed');
            container.innerHTML = `
                <div class="loading-bins">
                    <p style="color: var(--text-muted);">No devices claimed yet</p>
                    <button class="btn-add-device" onclick="window.location.hash = '#/claim-device'" style="margin-top: 16px;">
                        ➕ Claim Your First Device
                    </button>
                </div>
            `;
        }
    } catch (error) {
        console.error('❌ Failed to load devices:', error);
        container.innerHTML = '<p class="error">Failed to load devices. Please refresh.</p>';
    }
}

async function updateEmail() {
    console.log('📧 Updating email...');
    const newEmail = document.getElementById('email-input').value;
    const token = localStorage.getItem('avonic_token');
    
    if (!newEmail || !newEmail.includes('@')) {
        showMessage('password-message', 'Please enter a valid email', 'error');
        return;
    }

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
            showMessage('password-message', '✅ Email updated successfully!', 'success');
        } else {
            console.error('❌ Email update failed:', data);
            showMessage('password-message', '❌ ' + (data.error || 'Failed to update email'), 'error');
        }
    } catch (error) {
        console.error('❌ Email update error:', error);
        showMessage('password-message', '❌ Network error. Please try again.', 'error');
    }
}

async function updatePassword() {
    console.log('🔐 Updating password...');
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const token = localStorage.getItem('avonic_token');

    if (!currentPassword || !newPassword) {
        showMessage('password-message', 'Please fill in both password fields', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showMessage('password-message', 'New password must be at least 6 characters', 'error');
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
            showMessage('password-message', '✅ Password updated successfully!', 'success');
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
        } else {
            console.error('❌ Password update failed:', data);
            showMessage('password-message', '❌ ' + (data.error || 'Failed to update password'), 'error');
        }
    } catch (error) {
        console.error('❌ Password update error:', error);
        showMessage('password-message', '❌ Network error. Please try again.', 'error');
    }
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
}

let deviceToUnclaim = null;

function openUnclaimModal(espID, deviceName) {
    console.log('🗑️ Opening unclaim modal for:', espID);
    deviceToUnclaim = espID;
    const modal = document.getElementById('unclaim-modal');
    const nameEl = document.getElementById('unclaim-device-name');
    
    if (nameEl) nameEl.textContent = deviceName;
    if (modal) modal.classList.add('active');
}

function closeUnclaimModal() {
    deviceToUnclaim = null;
    const modal = document.getElementById('unclaim-modal');
    if (modal) modal.classList.remove('active');
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
            showMessage('bins-message', '✅ Device unclaimed successfully', 'success');
            closeUnclaimModal();
            loadClaimedBins();
        } else {
            console.error('❌ Unclaim failed:', data);
            showMessage('bins-message', '❌ ' + (data.error || 'Failed to unclaim device'), 'error');
            closeUnclaimModal();
        }
    } catch (error) {
        console.error('❌ Unclaim error:', error);
        showMessage('bins-message', '❌ Failed to unclaim device', 'error');
        closeUnclaimModal();
    }
}

async function handleLogout() {
    console.log('👋 Logging out...');
    if (!confirm('Are you sure you want to logout?')) return;

    const token = localStorage.getItem('avonic_token');

    try {
        const res = await fetch(`${SETTINGS_API_BASE}/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            console.log('✅ Logout successful');
        }
    } catch (error) {
        console.error('⚠️ Logout request failed:', error);
    }
    
    localStorage.removeItem('avonic_token');
    localStorage.removeItem('avonic_user');
    window.location.href = 'login.html';
}

function showMessage(elementId, message, type) {
    const el = document.getElementById(elementId);
    if (!el) {
        console.error('❌ Message element not found:', elementId);
        return;
    }
    
    el.textContent = message;
    el.className = `settings-message ${type}`;
    el.style.display = 'block';

    setTimeout(() => {
        el.style.display = 'none';
    }, 5000);
}

// Expose to window
window.loadUserSettings = loadUserSettings;
window.updateEmail = updateEmail;
window.updatePassword = updatePassword;
window.togglePasswordVisibility = togglePasswordVisibility;
window.openUnclaimModal = openUnclaimModal;
window.closeUnclaimModal = closeUnclaimModal;
window.confirmUnclaim = confirmUnclaim;
window.handleLogout = handleLogout;

console.log('✅ All settings functions exposed to window');

// Auto-load on hash change
window.addEventListener('hashchange', () => {
    if (window.location.hash === '#/settings') {
        console.log('⚙️ Navigated to settings');
        setTimeout(() => loadUserSettings(), 200);
    }
});

// Initial load if already on settings
if (window.location.hash === '#/settings') {
    console.log('⚙️ Already on settings page');
    setTimeout(() => loadUserSettings(), 200);
}
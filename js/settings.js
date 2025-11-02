// ====== SETTINGS PAGE FUNCTIONALITY ======

const API_BASE = 'https://avonic-main-hub-production.up.railway.app/api';

// Load user data on settings page load
async function loadUserSettings() {
    const token = localStorage.getItem('avonic_token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        // Load user info (you'll need to add this endpoint to backend)
        const userRes = await fetch(`${API_BASE}/user/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (userRes.ok) {
            const userData = await userRes.json();
            document.getElementById('username-display').value = userData.username;
            document.getElementById('email-input').value = userData.email;
        }
    } catch (error) {
        console.error('Failed to load user data:', error);
    }

    // Load claimed devices
    loadClaimedBins();
}

// Load claimed bins/devices
async function loadClaimedBins() {
    const container = document.getElementById('claimed-bins-container');
    const token = localStorage.getItem('avonic_token');

    try {
        const res = await fetch(`${API_BASE}/devices/claimed`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        if (res.ok && data.devices && data.devices.length > 0) {
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
                    <button class="btn-unclaim" onclick="openUnclaimModal('${device.espID}', '${device.nickname || device.espID}')" title="Unclaim device">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
            `).join('');
        } else {
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
        console.error('Failed to load devices:', error);
        container.innerHTML = '<p class="error">Failed to load devices. Please refresh.</p>';
    }
}

// Update email
async function updateEmail() {
    const newEmail = document.getElementById('email-input').value;
    const token = localStorage.getItem('avonic_token');
    
    if (!newEmail || !newEmail.includes('@')) {
        showMessage('password-message', 'Please enter a valid email', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/user/email`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email: newEmail })
        });

        const data = await res.json();

        if (res.ok) {
            showMessage('password-message', '✅ Email updated successfully!', 'success');
        } else {
            showMessage('password-message', '❌ ' + data.error, 'error');
        }
    } catch (error) {
        showMessage('password-message', '❌ Network error. Please try again.', 'error');
    }
}

// Update password
async function updatePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const token = localStorage.getItem('avonic_token');
    const messageEl = document.getElementById('password-message');

    if (!currentPassword || !newPassword) {
        showMessage('password-message', 'Please fill in both password fields', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showMessage('password-message', 'New password must be at least 6 characters', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/user/password`, {
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
            showMessage('password-message', '✅ Password updated successfully!', 'success');
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
        } else {
            showMessage('password-message', '❌ ' + data.error, 'error');
        }
    } catch (error) {
        showMessage('password-message', '❌ Network error. Please try again.', 'error');
    }
}

// Toggle password visibility
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

// Unclaim modal
let deviceToUnclaim = null;

function openUnclaimModal(espID, deviceName) {
    deviceToUnclaim = espID;
    document.getElementById('unclaim-device-name').textContent = deviceName;
    document.getElementById('unclaim-modal').classList.add('active');
}

function closeUnclaimModal() {
    deviceToUnclaim = null;
    document.getElementById('unclaim-modal').classList.remove('active');
}

async function confirmUnclaim() {
    if (!deviceToUnclaim) return;

    const token = localStorage.getItem('avonic_token');
    const messageEl = document.getElementById('bins-message');

    try {
        const res = await fetch(`${API_BASE}/devices/${deviceToUnclaim}/unclaim`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        if (res.ok) {
            showMessage('bins-message', '✅ Device unclaimed successfully', 'success');
            closeUnclaimModal();
            loadClaimedBins(); // Reload the list
        } else {
            showMessage('bins-message', '❌ ' + data.error, 'error');
            closeUnclaimModal();
        }
    } catch (error) {
        showMessage('bins-message', '❌ Failed to unclaim device', 'error');
        closeUnclaimModal();
    }
}

// Logout
async function handleLogout() {
    if (!confirm('Are you sure you want to logout?')) return;

    try {
        const res = await fetch(`${API_BASE}/logout`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('avonic_token')}` }
        });

        if (res.ok) {
            localStorage.removeItem('avonic_token');
            window.location.href = '/login.html';
        }
    } catch (error) {
        // Clear token anyway
        localStorage.removeItem('avonic_token');
        window.location.href = '/login.html';
    }
}

// Helper function
function showMessage(elementId, message, type) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.className = `settings-message ${type}`;
    el.style.display = 'block';

    setTimeout(() => {
        el.style.display = 'none';
    }, 5000);
}

// Initialize on page load
if (window.location.hash === '#/settings') {
    loadUserSettings();
}

// Also listen for hash changes
window.addEventListener('hashchange', () => {
    if (window.location.hash === '#/settings') {
        loadUserSettings();
    }
});
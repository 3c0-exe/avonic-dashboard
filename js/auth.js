// auth.js - Authentication Handler
// ✅ FIXED: Added https:// protocol

const API_BASE = 'https://avonic-main-hub-production.up.railway.app'; // ← FIXED!

// Handle Login Form Submission
async function handleLogin(event) {
  event.preventDefault();
  
  const form = event.target;
  const username = form.querySelector('input[name="username"]')?.value.trim();
  const password = form.querySelector('input[type="password"]')?.value;
  const submitBtn = form.querySelector('button[type="submit"]');
  const msgDiv = document.getElementById('message');
  
  if (!username || !password) {
    if (msgDiv) msgDiv.innerHTML = '<div class="error">❌ Please enter username and password</div>';
    else alert('Please enter username and password');
    return;
  }
  
  // Disable button
  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';
  if (msgDiv) msgDiv.innerHTML = '';
  
  console.log('🔐 Attempting login:', username);
  
  try {
    // ✅ Call /api/login (backend hashes the password)
    const response = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    console.log('📡 Response status:', response.status);
    const data = await response.json();
    console.log('📦 Response data:', data);
    
    if (response.ok && data.success) {
      // Store token and user info
      localStorage.setItem('avonic_token', data.token);
      localStorage.setItem('avonic_user', JSON.stringify(data.user));
      
      console.log('✅ Login successful');
      if (msgDiv) msgDiv.innerHTML = '<div class="success">✅ Login successful!</div>';
      
      // Navigate to dashboard
      setTimeout(() => {
        if (window.location.hash) {
          window.location.hash = '#/';
        } else {
          window.location.href = 'index.html';
        }
      }, 1000);
    } else {
      const errorMsg = data.error || 'Login failed';
      console.error('❌ Login failed:', errorMsg);
      if (msgDiv) msgDiv.innerHTML = `<div class="error">❌ ${errorMsg}</div>`;
      else alert(errorMsg);
    }
    
  } catch (error) {
    console.error('❌ Login error:', error);
    const errorMsg = `Connection error: ${error.message}`;
    if (msgDiv) msgDiv.innerHTML = `<div class="error">❌ ${errorMsg}</div>`;
    else alert(errorMsg);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Login';
  }
}

// Logout function
function logout() {
  localStorage.removeItem('avonic_token');
  localStorage.removeItem('avonic_user');
  
  if (window.location.hash) {
    window.location.hash = '#/login';
  } else {
    window.location.href = 'login.html';
  }
}

// Get stored auth token
function getAuthToken() {
  return localStorage.getItem('avonic_token');
}

// Get stored user info
function getUser() {
  const userStr = localStorage.getItem('avonic_user');
  return userStr ? JSON.parse(userStr) : null;
}

// Check if user is authenticated
function isAuthenticated() {
  return !!getAuthToken();
}

// Setup form handlers when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
    console.log('✅ Login form handler attached');
  }
});

console.log('✅ auth.js loaded');

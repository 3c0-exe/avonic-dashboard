// auth.js - Authentication Handler for Hash-Based Routing
// ✅ UPDATED TO MATCH YOUR BACKEND API

const API_BASE = 'avonic-main-hub-production.up.railway.app'; // ← Your actual backend (no /api here)

// Handle Login Form Submission
async function handleLogin(event) {
  event.preventDefault();
  
  const form = event.target;
  const username = form.querySelector('input[type="email"]')?.value.trim() || 
                   form.querySelector('input[placeholder*="Email"]')?.value.trim() ||
                   form.querySelector('input[name="email"]')?.value.trim();
  const password = form.querySelector('input[type="password"]').value;
  const submitBtn = form.querySelector('button[type="submit"]');
  
  if (!username || !password) {
    alert('Please enter username and password');
    return;
  }
  
  // Disable button
  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';
  
  try {
    // ✅ Call /api/login (backend hashes the password for you)
    const response = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }) // Send plain password
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      // Store token and user info
      localStorage.setItem('avonic_token', data.token);
      localStorage.setItem('avonic_user', JSON.stringify(data.user));
      
      console.log('✅ Login successful');
      
      // Navigate to home using hash routing
      window.location.hash = '#/';
    } else {
      alert(data.error || 'Login failed');
    }
    
  } catch (error) {
    console.error('❌ Login error:', error);
    alert('Network error. Please check your connection.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Login';
  }
}

// Handle Register Form Submission
async function handleRegister(event) {
  event.preventDefault();
  
  const form = event.target;
  const name = form.querySelector('input[type="text"]')?.value.trim() ||
               form.querySelector('input[placeholder*="Name"]')?.value.trim();
  const email = form.querySelector('input[type="email"]')?.value.trim() ||
                form.querySelector('input[placeholder*="Email"]')?.value.trim();
  const password = form.querySelector('input[type="password"]').value;
  const submitBtn = form.querySelector('button[type="submit"]');
  
  // Validation
  if (!name || !email || !password) {
    alert('All fields are required');
    return;
  }
  
  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account...';
  
  try {
    // ✅ Call /api/register/online for web registration
    const response = await fetch(`${API_BASE}/api/register/online`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: name,  // Your backend expects 'username'
        email, 
        password 
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      // Store token
      localStorage.setItem('avonic_token', data.token);
      
      console.log('✅ Registration successful');
      alert('Account created successfully!');
      
      // Navigate to home using hash routing
      window.location.hash = '#/';
    } else {
      alert(data.error || 'Registration failed');
    }
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    alert('Network error. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
  }
}

// Setup form handlers when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
    console.log('✅ Login form handler attached');
  }
  
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
    console.log('✅ Register form handler attached');
  }
});

// Logout function (can be called from UI)
function logout() {
  if (window.router && window.router.logout) {
    window.router.logout();
  } else {
    localStorage.removeItem('avonic_token');
    localStorage.removeItem('avonic_user');
    window.location.hash = '#/login';
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

console.log('✅ auth.js loaded');

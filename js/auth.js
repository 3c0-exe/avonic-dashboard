// auth.js - Updated for New Split Layout Design
const API_BASE = 'https://avonic-main-hub-production.up.railway.app';

// ====== FORM SWITCHING LOGIC ======

const formSections = {
  login: 0,
  register: 1,
  forgot: 2,
  reset: 3
};

let currentForm = 'login';

function showForm(formName) {
  const containers = document.querySelectorAll('.form-container');
  
  // Hide all containers first
  containers.forEach(c => c.style.display = 'none');
  
  // Show the target container
  const targetIndex = formSections[formName];
  if (containers[targetIndex]) {
    containers[targetIndex].style.display = 'flex';
  }
  
  currentForm = formName;
  console.log(`📄 Showing form: ${formName}`);
}

function setupFormNavigation() {
  const containers = document.querySelectorAll('.form-container');
  const loginContainer = containers[0];
  const registerContainer = containers[1];
  const forgotContainer = containers[2];
  const resetContainer = containers[3];

  // 1. LOGIN SCREEN NAV
  if (loginContainer) {
    // Login -> Register
    const regLink = loginContainer.querySelector('.signup-link');
    if (regLink) {
      regLink.addEventListener('click', (e) => {
        e.preventDefault();
        showForm('register');
      });
    }

    // Login -> Forgot Password (FIXED CLASS NAME HERE)
    const forgotLink = loginContainer.querySelector('.forgot-link');
    if (forgotLink) {
      forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        showForm('forgot');
      });
    }
  }

  // 2. REGISTER SCREEN NAV
  if (registerContainer) {
    // Register -> Login
    const loginLink = registerContainer.querySelector('.signup-link');
    if (loginLink) {
      loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showForm('login');
      });
    }
  }

  // 3. FORGOT PASSWORD NAV
  if (forgotContainer) {
    // Forgot -> Login
    const backLink = forgotContainer.querySelector('.signup-link');
    if (backLink) {
      backLink.addEventListener('click', (e) => {
        e.preventDefault();
        showForm('login');
      });
    }
  }

  // 4. RESET PASSWORD NAV
  // (Usually triggered automatically, but purely for navigation)
  if (resetContainer) {
    // Reset -> Login (if needed manually)
    // Note: The reset form usually redirects automatically on success
  }

  console.log('✅ Form navigation setup complete (New Layout)');
}

// ====== MESSAGE DISPLAY ======

function showMessage(message, type = 'error') {
  let msgDiv = document.getElementById('form-message');
  
  // Find the active form to insert the message into
  const activeContainer = document.querySelectorAll('.form-container')[formSections[currentForm]];
  
  if (!msgDiv) {
    msgDiv = document.createElement('div');
    msgDiv.id = 'form-message';
    msgDiv.style.cssText = `
      padding: 12px 16px;
      margin-bottom: 20px;
      border-radius: 12px;
      font-size: 14px;
      text-align: center;
      font-weight: 500;
    `;
  }
  
  // Move message div to the active form, right before the <form> tag
  if (activeContainer) {
    const formEl = activeContainer.querySelector('form');
    if (formEl) {
      activeContainer.insertBefore(msgDiv, formEl);
    }
  }
  
  if (type === 'error') {
    msgDiv.style.backgroundColor = '#FFE8E8';
    msgDiv.style.color = '#D32F2F';
    msgDiv.style.border = '1px solid #ffcdd2';
  } else if (type === 'success') {
    msgDiv.style.backgroundColor = '#E8F5B3';
    msgDiv.style.color = '#2A4633';
    msgDiv.style.border = '1px solid #C5E1A5';
  } else {
    msgDiv.style.backgroundColor = '#E3F2FD';
    msgDiv.style.color = '#1565C0';
  }
  
  msgDiv.textContent = message;
  msgDiv.style.display = 'block';
  
  setTimeout(() => {
    msgDiv.style.display = 'none';
  }, 5000);
}

// ====== LOGIN HANDLER ======

async function handleLogin(event) {
  event.preventDefault();
  
  const form = event.target;
  const inputs = form.querySelectorAll('input');
  const username = inputs[0].value.trim();
  const password = inputs[1].value;
  const submitBtn = form.querySelector('button[type="submit"]');
  
  if (!username || !password) {
    showMessage('Please enter username and password', 'error');
    return;
  }
  
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Logging in...';
  
  console.log('🔐 Attempting login:', username);
  
  try {
    const response = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    console.log('📦 Login response:', data);
    
    if (response.ok && data.success) {
      localStorage.setItem('avonic_token', data.token);
      localStorage.setItem('avonic_user', JSON.stringify(data.user));
      
      console.log('✅ Login successful');
      showMessage('Login successful! Redirecting...', 'success');
      
      setTimeout(() => {
        window.location.href = 'app.html#/dashboard';
      }, 1000);
    } else {
      const errorMsg = data.error || 'Login failed';
      console.error('❌ Login failed:', errorMsg);
      showMessage(errorMsg, 'error');
    }
    
  } catch (error) {
    console.error('❌ Login error:', error);
    showMessage(`Connection error: ${error.message}`, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// ====== REGISTER HANDLER ======

async function handleRegister(event) {
  event.preventDefault();
  
  const form = event.target;
  const inputs = form.querySelectorAll('input');
  const username = inputs[0].value.trim();
  const email = inputs[1].value.trim();
  const password = inputs[2].value;
  const confirmPassword = inputs[3].value;
  const submitBtn = form.querySelector('button[type="submit"]');
  
  // Validation
  if (!username || !email || !password || !confirmPassword) {
    showMessage('All fields are required', 'error');
    return;
  }
  
  if (username.length < 3 || username.length > 20) {
    showMessage('Username must be 3-20 characters', 'error');
    return;
  }
  
  if (!email.includes('@')) {
    showMessage('Please enter a valid email', 'error');
    return;
  }
  
  if (password.length < 6) {
    showMessage('Password must be at least 6 characters', 'error');
    return;
  }
  
  if (password !== confirmPassword) {
    showMessage('Passwords do not match', 'error');
    return;
  }
  
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Creating account...';
  
  console.log('📝 Attempting registration:', username, email);
  
  try {
    const response = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await response.json();
    console.log('📦 Register response:', data);
    
    if (response.ok && data.success) {
      localStorage.setItem('avonic_token', data.token);
      localStorage.setItem('avonic_user', JSON.stringify(data.user));
      
      console.log('✅ Registration successful');
      showMessage('Account created! Redirecting...', 'success');
      
      setTimeout(() => {
        window.location.href = 'app.html#/dashboard';
      }, 1500);
    } else {
      const errorMsg = data.error || 'Registration failed';
      console.error('❌ Registration failed:', errorMsg);
      showMessage(errorMsg, 'error');
    }
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    showMessage(`Connection error: ${error.message}`, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// ====== FORGOT PASSWORD HANDLER ======

async function handleForgotPassword(event) {
  event.preventDefault();
  
  const form = event.target;
  const emailInput = form.querySelector('input[type="email"]');
  const email = emailInput.value.trim();
  const submitBtn = form.querySelector('button[type="submit"]');
  
  if (!email || !email.includes('@')) {
    showMessage('Please enter a valid email', 'error');
    return;
  }
  
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Sending code...';
  
  console.log('📧 Requesting password reset for:', email);
  
  try {
    const response = await fetch(`${API_BASE}/api/password/reset-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    console.log('📦 Reset request response:', data);
    
    if (response.ok && data.success) {
      console.log('✅ Reset code sent');
      showMessage('Reset code sent to your email!', 'success');
      
      setTimeout(() => {
        showForm('reset');
      }, 2000);
    } else {
      showMessage(data.error || 'Failed to send reset code', 'error');
    }
    
  } catch (error) {
    console.error('❌ Reset request error:', error);
    showMessage(`Connection error: ${error.message}`, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// ====== RESET PASSWORD HANDLER ======

async function handleResetPassword(event) {
  event.preventDefault();
  
  const form = event.target;
  const codeInputs = document.querySelectorAll('.code-inputs input');
  const code = Array.from(codeInputs).map(i => i.value).join('');
  const passwordInputs = form.querySelectorAll('input[type="password"]');
  const newPassword = passwordInputs[0].value;
  const confirmPassword = passwordInputs[1].value;
  const submitBtn = form.querySelector('button[type="submit"]');
  
  // Validation
  if (code.length !== 6) {
    showMessage('Please enter the 6-digit code', 'error');
    return;
  }
  
  if (!newPassword || newPassword.length < 6) {
    showMessage('Password must be at least 6 characters', 'error');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showMessage('Passwords do not match', 'error');
    return;
  }
  
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Resetting...';
  
  console.log('🔐 Resetting password with code:', code);
  
  try {
    const response = await fetch(`${API_BASE}/api/password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        token: code, 
        new_password: newPassword 
      })
    });
    
    const data = await response.json();
    console.log('📦 Reset response:', data);
    
    if (response.ok && data.success) {
      console.log('✅ Password reset successful');
      showMessage('Password reset successful! Redirecting to login...', 'success');
      
      setTimeout(() => {
        showForm('login');
        codeInputs.forEach(input => input.value = '');
        passwordInputs.forEach(input => input.value = '');
      }, 2000);
    } else {
      showMessage(data.error || 'Failed to reset password', 'error');
    }
    
  } catch (error) {
    console.error('❌ Reset error:', error);
    showMessage(`Connection error: ${error.message}`, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// ====== UTILITY FUNCTIONS ======

function logout() {
  localStorage.removeItem('avonic_token');
  localStorage.removeItem('avonic_user');
  console.log('👋 Logged out');
  window.location.href = 'forms.html';
}

function getAuthToken() {
  return localStorage.getItem('avonic_token');
}

function getUser() {
  const userStr = localStorage.getItem('avonic_user');
  return userStr ? JSON.parse(userStr) : null;
}

function isAuthenticated() {
  return !!getAuthToken();
}

// ====== INITIALIZATION ======

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ auth.js initializing...');
  
  // Check if already logged in
  if (isAuthenticated()) {
    console.log('ℹ️ User already logged in, redirecting to dashboard');
    window.location.href = 'app.html#/dashboard';
    return;
  }
  
  // Setup form switching
  setupFormNavigation();
  
  // Show only login form initially
  showForm('login');
  
  // Attach form handlers
  // We use querySelectorAll('.form-container form') to ensure we grab forms inside the new layout
  const containers = document.querySelectorAll('.form-container');
  
  if (containers[0]) {
    const loginForm = containers[0].querySelector('form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
  }
  
  if (containers[1]) {
    const registerForm = containers[1].querySelector('form');
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
  }
  
  if (containers[2]) {
    const forgotForm = containers[2].querySelector('form');
    if (forgotForm) forgotForm.addEventListener('submit', handleForgotPassword);
  }
  
  if (containers[3]) {
    const resetForm = containers[3].querySelector('form');
    if (resetForm) resetForm.addEventListener('submit', handleResetPassword);
  }
  
  console.log('✅ auth.js loaded and ready');
});

// Export functions for use in other scripts
window.auth = {
  logout,
  getAuthToken,
  getUser,
  isAuthenticated
};
// auth.js - Complete Authentication Handler for forms.html
// Handles login, register, forgot password, and reset password

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
  
  containers.forEach((container, index) => {
    if (index === formSections[formName]) {
      container.style.display = 'flex';
    } else {
      container.style.display = 'none';
    }
  });
  
  currentForm = formName;
  console.log(`📄 Showing form: ${formName}`);
}

function setupFormNavigation() {
  // Login -> Register
  const loginSignupLink = document.querySelectorAll('.signup-link')[0];
  if (loginSignupLink) {
    loginSignupLink.addEventListener('click', (e) => {
      e.preventDefault();
      showForm('register');
    });
  }
  
  // Login -> Forgot Password
  const forgotLink = document.querySelector('.forgot a');
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      showForm('forgot');
    });
  }
  
  // Register -> Login
  const registerLoginLink = document.querySelectorAll('.signup-link')[1];
  if (registerLoginLink) {
    registerLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      showForm('login');
    });
  }
  
  // Forgot Password -> Login
  const forgotLoginLink = document.querySelectorAll('.signup-link')[2];
  if (forgotLoginLink) {
    forgotLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      showForm('login');
    });
  }
  
  // Reset Password -> Login
  const resetLoginLink = document.querySelectorAll('.signup-link')[3];
  if (resetLoginLink) {
    resetLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      showForm('login');
    });
  }
  
  console.log('✅ Form navigation setup complete');
}

// ====== MESSAGE DISPLAY ======

function showMessage(message, type = 'error') {
  let msgDiv = document.getElementById('form-message');
  
  if (!msgDiv) {
    msgDiv = document.createElement('div');
    msgDiv.id = 'form-message';
    msgDiv.style.cssText = `
      padding: 12px 16px;
      margin: 16px 0;
      border-radius: 8px;
      font-size: 14px;
      text-align: center;
    `;
    
    const activeContainer = document.querySelectorAll('.form-container')[formSections[currentForm]];
    const form = activeContainer.querySelector('form');
    if (form) {
      form.insertBefore(msgDiv, form.firstChild);
    }
  }
  
  if (type === 'error') {
    msgDiv.style.backgroundColor = '#ffebee';
    msgDiv.style.color = '#c62828';
    msgDiv.style.border = '1px solid #ef5350';
  } else if (type === 'success') {
    msgDiv.style.backgroundColor = '#e8f5e9';
    msgDiv.style.color = '#2e7d32';
    msgDiv.style.border = '1px solid #66bb6a';
  } else if (type === 'info') {
    msgDiv.style.backgroundColor = '#e3f2fd';
    msgDiv.style.color = '#1565c0';
    msgDiv.style.border = '1px solid #42a5f5';
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
        window.location.href = 'index.html#/dashboard';
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
  
  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    showMessage('Username must be alphanumeric only', 'error');
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
        window.location.href = 'index.html#/dashboard';
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
        const emailDisplay = document.querySelector('.core-msg b');
        if (emailDisplay) {
          emailDisplay.textContent = email;
        }
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
    window.location.href = 'index.html#/dashboard';
    return;
  }
  
  // Setup form switching
  setupFormNavigation();
  
  // Show only login form initially
  showForm('login');
  
  // Attach form handlers
  const forms = document.querySelectorAll('form');
  
  if (forms[0]) {
    forms[0].addEventListener('submit', handleLogin);
    console.log('✅ Login form handler attached');
  }
  
  if (forms[1]) {
    forms[1].addEventListener('submit', handleRegister);
    console.log('✅ Register form handler attached');
  }
  
  if (forms[2]) {
    forms[2].addEventListener('submit', handleForgotPassword);
    console.log('✅ Forgot password handler attached');
  }
  
  if (forms[3]) {
    forms[3].addEventListener('submit', handleResetPassword);
    console.log('✅ Reset password handler attached');
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

console.log('📦 auth.js module loaded');
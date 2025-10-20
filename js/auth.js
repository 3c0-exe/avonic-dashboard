// auth.js - Online Authentication Handler
const API_BASE = 'https://your-backend.railway.app/api'; // ← CHANGE THIS to your backend URL

// SHA-256 hash function (matches ESP32 and backend)
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Handle Login Form Submission
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error-message');
    const submitBtn = document.querySelector('button[type="submit"]');
    
    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    errorDiv.textContent = '';
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Store token and user info
            localStorage.setItem('avonic_token', data.token);
            localStorage.setItem('avonic_user', JSON.stringify(data.user));
            
            console.log('✅ Login successful');
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html'; // or wherever your dashboard is
        } else {
            errorDiv.textContent = data.error || 'Login failed';
            errorDiv.style.display = 'block';
        }
        
    } catch (error) {
        console.error('❌ Login error:', error);
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
    }
}

// Handle Register Form Submission
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorDiv = document.getElementById('error-message');
    const submitBtn = document.querySelector('button[type="submit"]');
    
    // Validation
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (password.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters';
        errorDiv.style.display = 'block';
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';
    errorDiv.textContent = '';
    
    try {
        const response = await fetch(`${API_BASE}/register/online`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Store token and redirect
            localStorage.setItem('avonic_token', data.token);
            
            console.log('✅ Registration successful');
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            errorDiv.textContent = data.error || 'Registration failed';
            errorDiv.style.display = 'block';
        }
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
    }
}

// Check if user is already logged in
function checkAuth() {
    const token = localStorage.getItem('avonic_token');
    if (token) {
        // Already logged in, redirect to dashboard
        window.location.href = 'dashboard.html';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('avonic_token');
    localStorage.removeItem('avonic_user');
    window.location.href = 'login.html';
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        // On login page
        checkAuth(); // Redirect if already logged in
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        // On register page
        checkAuth(); // Redirect if already logged in
        registerForm.addEventListener('submit', handleRegister);
    }
});

console.log('✅ auth.js loaded');

// auth.js - MODIFIED: AUTH DISABLED / BYPASS MODE
const API_BASE = 'https://avonic-main-hub-production.up.railway.app';

// ====== FORM SWITCHING LOGIC ======
const formSections = { login: 0, register: 1, forgot: 2, reset: 3 };
let currentForm = 'login';

function showForm(formName) {
  const containers = document.querySelectorAll('.form-container');
  containers.forEach((container, index) => {
    container.style.display = index === formSections[formName] ? 'flex' : 'none';
  });
  currentForm = formName;
}

function setupFormNavigation() {
  const links = document.querySelectorAll('.signup-link');
  if (links[0]) links[0].addEventListener('click', (e) => { e.preventDefault(); showForm('register'); });
  const forgotLink = document.querySelector('.forgot-link');
  if (forgotLink) forgotLink.addEventListener('click', (e) => { e.preventDefault(); showForm('forgot'); });
  if (links[1]) links[1].addEventListener('click', (e) => { e.preventDefault(); showForm('login'); });
  if (links[2]) links[2].addEventListener('click', (e) => { e.preventDefault(); showForm('login'); });
  if (links[3]) links[3].addEventListener('click', (e) => { e.preventDefault(); showForm('login'); });
}

// ====== MESSAGE DISPLAY ======
function showMessage(message, type = 'info') {
  let msgDiv = document.getElementById('form-message');
  if (!msgDiv) {
    msgDiv = document.createElement('div');
    msgDiv.id = 'form-message';
    msgDiv.style.cssText = `padding: 12px; margin: 16px 0; border-radius: 8px; text-align: center;`;
    const activeContainer = document.querySelectorAll('.form-container')[formSections[currentForm]];
    const form = activeContainer.querySelector('form');
    if (form) form.insertBefore(msgDiv, form.firstChild);
  }
  msgDiv.style.backgroundColor = type === 'success' ? '#e8f5e9' : '#e3f2fd';
  msgDiv.textContent = message;
  msgDiv.style.display = 'block';
  setTimeout(() => { msgDiv.style.display = 'none'; }, 3000);
}

// ====== BYPASS HANDLERS ======

async function handleLogin(event) {
  event.preventDefault();
  console.log('🔓 Bypass: Logging in without credentials');
  
  // Set dummy data
  localStorage.setItem('avonic_token', 'bypass-token-123');
  localStorage.setItem('avonic_user', JSON.stringify({ username: 'GuestUser', email: 'guest@example.com' }));
  
  showMessage('Bypass Success! Redirecting...', 'success');
  setTimeout(() => { window.location.href = 'app.html#/dashboard'; }, 1000);
}

async function handleRegister(event) {
  event.preventDefault();
  console.log('🔓 Bypass: Registering account');
  
  localStorage.setItem('avonic_token', 'bypass-token-123');
  localStorage.setItem('avonic_user', JSON.stringify({ username: 'NewUser', email: 'new@example.com' }));
  
  showMessage('Account created (Bypass)! Redirecting...', 'success');
  setTimeout(() => { window.location.href = 'app.html#/dashboard'; }, 1000);
}

// Dummy handlers for remaining forms
async function handleForgotPassword(event) {
  event.preventDefault();
  showMessage('Bypass: Reset code "sent" to email.', 'success');
  setTimeout(() => { showForm('reset'); }, 1000);
}

async function handleResetPassword(event) {
  event.preventDefault();
  showMessage('Bypass: Password updated.', 'success');
  setTimeout(() => { showForm('login'); }, 1000);
}

// ====== UTILITY FUNCTIONS ======
function logout() {
  localStorage.removeItem('avonic_token');
  localStorage.removeItem('avonic_user');
  window.location.href = 'forms.html';
}
function getAuthToken() { return localStorage.getItem('avonic_token'); }
function getUser() { return JSON.parse(localStorage.getItem('avonic_user')); }
function isAuthenticated() { return !!getAuthToken(); }

// ====== INITIALIZATION ======
document.addEventListener('DOMContentLoaded', () => {
  setupFormNavigation();
  showForm('login');
  
  const forms = document.querySelectorAll('form');
  if (forms[0]) forms[0].addEventListener('submit', handleLogin);
  if (forms[1]) forms[1].addEventListener('submit', handleRegister);
  if (forms[2]) forms[2].addEventListener('submit', handleForgotPassword);
  if (forms[3]) forms[3].addEventListener('submit', handleResetPassword);
});

window.auth = { logout, getAuthToken, getUser, isAuthenticated };
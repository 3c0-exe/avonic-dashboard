// AVONIC URL Router with Authentication & External Pages
// Handles page navigation using URL hash routing

const routes = {
    '/': '.content.home',
    '/landing': '.content.landing',
    '/dashboard': '.content.dashboard',
    '/claim-device': '.content.claim-device',
    '/settings': '.content.settings',
    '/help': '.content.help',
    '/bin': '.content.bin',
    '/bin2': '.content.bin2'
};

// External HTML pages configuration
const externalPages = {
    '/landing': 'landing-page.html'
};

let currentPage = null;

// Check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem('avonic_token');
    return !!token;
}

// Redirect to login.html if not authenticated
function requireAuth() {
    if (!isAuthenticated()) {
        console.log('🔒 Not authenticated, redirecting to login');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Load external HTML file
async function loadExternalPage(route) {
    const filePath = externalPages[route];
    
    if (!filePath) {
        return false;
    }
    
    try {
        console.log(`📥 Loading external page: ${filePath}`);
        const response = await fetch(filePath);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        
        let container = document.querySelector('.content.landing');
        if (!container) {
            container = document.createElement('div');
            container.className = 'content landing';
            document.body.appendChild(container);
        }
        
        container.innerHTML = html;
        console.log(`✅ External page loaded: ${route}`);
        return true;
        
    } catch (error) {
        console.error(`❌ Failed to load external page ${filePath}:`, error);
        return false;
    }
}

// Initialize router
function initRouter() {
    console.log('🚀 Router initialized');
    
    // Don't require auth for landing page
    const currentHash = window.location.hash.slice(1) || '';
    const route = currentHash.split('?')[0];
    
    if (route !== '/landing' && !requireAuth()) {
        return;
    }

    const homePage = document.querySelector('.content.home');
    if (homePage) {
        homePage.classList.remove('active');
    }
    
    if (document.readyState === 'loading') {
        console.log('⏳ DOM still loading, waiting...');
        document.addEventListener('DOMContentLoaded', () => {
            console.log('✅ DOM ready, handling route');
            window.addEventListener('hashchange', handleRouteChange);
            handleRouteChange();
            setupNavigation();
        });
    } else {
        console.log('✅ DOM already ready');
        window.addEventListener('hashchange', handleRouteChange);
        handleRouteChange();
        setupNavigation();
    }
}

// Handle route changes
async function handleRouteChange() {
    let hash = window.location.hash.slice(1);
    
    // Default routing based on auth status
    if (!hash || hash === '') {
        hash = isAuthenticated() ? '/dashboard' : '/landing';
        window.location.hash = '#' + hash;
        return;
    }
    
    const route = hash.split('?')[0];
    
    // Try loading external page first
    const isExternal = await loadExternalPage(route);
    
    const pageSelector = routes[route];
    
    if (pageSelector || isExternal) {
        showPage(pageSelector, route);
    } else {
        console.warn(`⚠️ Route not found: ${route}, redirecting to dashboard`);
        window.location.hash = '#/dashboard';
    }
}

// Handle bin page navigation with ESP-ID parameter
function handleBinPageLoad(route) {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash.split('?')[1]);
    const espID = params.get('espID');
    
    if (!espID) {
        console.warn('⚠️ No espID provided, redirecting to home');
        window.location.hash = '#/';
        return;
    }
    
    const binNumber = route === '/bin2' ? 2 : 1;
    const binPage = document.querySelector(route === '/bin2' ? '.content.bin2' : '.content.bin');
    
    if (binPage) {
        binPage.dataset.currentEspId = espID;
        
        const binNameElem = binPage.querySelector('.bin_name');
        if (binNameElem) {
            binNameElem.textContent = `Bin ${binNumber}`;
        }
        
        console.log(`✅ Loaded Bin ${binNumber} for device: ${espID}`);
        
        if (typeof fetchLatestSensorData === 'function') {
            fetchLatestSensorData();
        }
    }
}

// Show specific page and hide all others
function showPage(selector, route) {
    console.log(`📄 Navigating to: ${route}`);
    
    // Remove active from all pages
    document.querySelectorAll('.content').forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
    
    // Show target page
    const targetPage = document.querySelector(selector);
    if (targetPage) {
        targetPage.classList.add('active');
        targetPage.style.display = 'block';
        currentPage = route;
        updateActiveNav(route);
        window.scrollTo(0, 0);
        
        // Load page-specific data
        if (route === '/settings' && typeof loadUserSettings === 'function') {
            console.log('📥 Loading settings data...');
            loadUserSettings();
        }
        
        if (route === '/dashboard' && typeof loadDashboard === 'function') {
            console.log('📥 Loading dashboard data...');
            loadDashboard();
        }
        
        if (route === '/bin' || route === '/bin2') {
            handleBinPageLoad(route);
        }
        
        if (route === '/' && typeof loadBinCards === 'function') {
            console.log('📥 Loading bin cards...');
            setTimeout(() => loadBinCards(), 100);
        }
        
        console.log(`✅ Page displayed: ${route}`);
    } else {
        console.error(`❌ Page element not found: ${selector}`);
    }
}

// Update active state in navigation
function updateActiveNav(route) {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`nav a[href="#${route}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Setup navigation click handlers
function setupNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            console.log(`🔗 Nav clicked: ${link.getAttribute('href')}`);
        });
    });
    
    console.log('✅ Navigation handlers setup');
}

// Programmatic navigation helper
function navigateTo(route) {
    window.location.hash = '#' + route;
}

// Logout function
function logout() {
    localStorage.removeItem('avonic_token');
    localStorage.removeItem('avonic_user');
    console.log('👋 Logged out');
    window.location.href = 'login.html';
}

// Initialize router
initRouter();

// Export for use in other scripts
window.router = {
    navigateTo,
    logout,
    getCurrentPage: () => currentPage,
    isAuthenticated,
    routes
};

console.log('📦 url-router.js loaded');
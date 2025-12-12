// AVONIC URL Router with Authentication
// Handles page navigation using URL hash routing

const routes = {
    '/': '.content.home',
    '/dashboard': '.content.dashboard',
    '/claim-device': '.content.claim-device',
    '/settings': '.content.settings',
    '/help': '.content.help',
    '/bin': '.content.bin',
    '/bin2': '.content.bin2'
};

let currentPage = null;

// Check if user is authenticated
function isAuthenticated() {
    // TEMPORARY: Always return true for CSS development
    return true;

    // const token = localStorage.getItem('avonic_token');
    // return !!token;
}

// Redirect to forms.html if not authenticated
function requireAuth() {
    // TEMPORARY: Disable redirect for development
    return true;

    // if (!isAuthenticated()) {
    //     console.log('🔒 Not authenticated, redirecting to login');
    //     window.location.href = 'app.html';
    //     return false;
    // }
    // return true;
}

// Initialize router
function initRouter() {
    console.log('🚀 Router initialized');
    
    if (!requireAuth()) {
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
function handleRouteChange() {
    let hash = window.location.hash.slice(1);
    
    // Default to DASHBOARD if authenticated
    if (!hash || hash === '') {
        hash = '/dashboard';
    }
    
    // Strip query parameters for route matching
    const route = hash.split('?')[0];
    
    // Find matching route
    const pageSelector = routes[route];
    
    if (pageSelector) {
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
        
        // Handle bin pages with ESP-ID parameter
        if (route === '/bin' || route === '/bin2') {
            handleBinPageLoad(route);
        }
        
        // Load bin cards on home page
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
    window.location.href = 'app.html';
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
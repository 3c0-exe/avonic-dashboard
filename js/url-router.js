// AVONIC URL Router with Authentication
// Handles page navigation using URL hash routing

// Define all pages with their routes and CSS selectors
const routes = {
    '/': '.content.home',
    '/dashboard': '.content.dashboard',
    '/claim-device': '.content.claim-device',
    '/help': '.content.help',
    '/bin': '.content.bin',
    '/bin2': '.content.bin2'
};

// Current active page
let currentPage = null;

// ✅ Check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem('avonic_token');
    return !!token; // Returns true if token exists
}

// ✅ Redirect to login.html if not authenticated
function requireAuth() {
    if (!isAuthenticated()) {
        console.log('🔒 Not authenticated, redirecting to login');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Initialize router
function initRouter() {
    console.log('🚀 Router initialized');
    
    // ✅ Check auth FIRST before doing anything
    if (!requireAuth()) {
        return; // Stop here if not authenticated
    }

    // ✅ Remove active class from home on load
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
    
    // ✅ Default to DASHBOARD (not home) if authenticated
    if (!hash || hash === '' || hash === '/') {
        // Prevent infinite loop by checking if we're already trying to go to dashboard
        if (window.location.hash !== '#/dashboard') {
            window.location.hash = '#/dashboard';
            return; // Let the hashchange event handle the rest
        }
        hash = '/dashboard';
    }
    
    // Strip query parameters for route matching
    const route = hash.split('?')[0]; // Get "/bin" from "/bin?id=1"
    
    // Find matching route
    const pageSelector = routes[route];
    
    if (pageSelector) {
        showPage(pageSelector, route);
    } else {
        console.warn(`⚠️ Route not found: ${route}, redirecting to dashboard`);
        window.location.hash = '#/dashboard';
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

// ✅ Logout function
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
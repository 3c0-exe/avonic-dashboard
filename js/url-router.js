// AVONIC URL Router with Authentication
// Handles page navigation using URL hash routing

// ✅ FIXED: All routes now have consistent .content prefix
const routes = {
    '/': '.content.home',
    '/dashboard': '.content.dashboard',
    '/claim-device': '.content.claim-device',
    '/settings': '.content.settings',  // ✅ FIXED: Added .content prefix
    '/help': '.content.help',
    '/bin': '.content.bin',
    '/bin2': '.content.bin2'
};

// Current active page
let currentPage = null;

// ✅ Check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem('avonic_token');
    return !!token;
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
    
    // ✅ Check auth FIRST
    if (!requireAuth()) {
        return;
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
    
    // ✅ Default to DASHBOARD if authenticated
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
        
        // ✅ Load data after a tiny delay to ensure functions are available
        setTimeout(() => {
            if (route === '/settings') {
                console.log('⚙️ Loading settings...');
                if (typeof window.loadUserSettings === 'function') {
                    window.loadUserSettings();
                } else {
                    console.error('❌ loadUserSettings not found on window object');
                }
            }
            
            if (route === '/dashboard') {
                console.log('📊 Loading dashboard...');
                if (typeof window.loadDashboard === 'function') {
                    window.loadDashboard();
                }
            }
        }, 100); // Small delay ensures settings.js has loaded
        
    } else {
        console.error(`❌ Page element not found: ${selector}`);
        console.log('Available .content elements:', 
            Array.from(document.querySelectorAll('.content')).map(el => el.className)
        );
    }
}
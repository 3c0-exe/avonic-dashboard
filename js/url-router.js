// AVONIC URL Router with Authentication
// Handles page navigation using URL hash routing

// Define all pages with their routes and CSS selectors
const routes = {
    '/': '.content.home',
    '/dashboard': '.content.dashboard',
    '/help': '.content.help',
    '/bin': '.content.bin',
    '/bin2': '.content.bin2',
    '/login': '.content.login',
    '/register': '.content.register'
};

// Pages that don't require authentication
const publicRoutes = ['/login', '/register'];

// Current active page
let currentPage = null;

// ✅ Check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem('avonic_token');
    return !!token; // Returns true if token exists
}

// ✅ Redirect to login if not authenticated
function requireAuth(route) {
    if (!publicRoutes.includes(route) && !isAuthenticated()) {
        console.log('🔒 Not authenticated, redirecting to login');
        window.location.hash = '#/login';
        return false;
    }
    return true;
}

// Initialize router
function initRouter() {
    console.log('🚀 Router initialized');
    
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
    let hash = window.location.hash.slice(1); // Remove the #
    
    // ✅ Default to LOGIN if no hash (not home!)
    if (!hash || hash === '') {
        hash = isAuthenticated() ? '/' : '/login';
    }
    
    // Strip query parameters for route matching
    const route = hash.split('?')[0]; // Get "/bin" from "/bin?id=1"
    
    // ✅ Check authentication before showing page
    if (!requireAuth(route)) {
        return; // Auth check failed, already redirected to login
    }
    
    // Find matching route
    const pageSelector = routes[route];
    
    if (pageSelector) {
        showPage(pageSelector, route);
    } else {
        console.warn(`⚠️ Route not found: ${route}, redirecting to home`);
        window.location.hash = isAuthenticated() ? '#/' : '#/login';
    }
}

// Show specific page and hide all others
function showPage(selector, route) {
    console.log(`📄 Navigating to: ${route}`);
    
    // Hide all pages first
    Object.values(routes).forEach(pageSelector => {
        const page = document.querySelector(pageSelector);
        if (page) {
            page.style.display = 'none';
        }
    });
    
    // Show the requested page
    const targetPage = document.querySelector(selector);
    if (targetPage) {
        targetPage.style.display = 'block';
        currentPage = route;
        
        // Update active navigation state
        updateActiveNav(route);
        
        // Scroll to top of page
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
    window.location.hash = '#/login';
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

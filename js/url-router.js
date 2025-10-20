// AVONIC URL Router
// Handles page navigation using URL hash routing

// Define all pages with their routes and CSS selectors
const routes = {
    '/': '.content.home',
    '/dashboard': '.content.dashboard',
    '/help': '.content.help',
    '/bin': '.content.bin',
    '/bin2': '.content.bin2'  // ✅ Add Bin 2 route
    '/login': '.content.login',      // ✅ Added login page
    '/register': '.content.register' // ✅ Added register page
};

// Current active page
let currentPage = null;

// Initialize router
// Replace the initRouter function with this:
function initRouter() {
    console.log('🚀 Router initialized');
    
    // IMPORTANT: Wait for ALL content to be parsed
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

// Remove the duplicate initialization at the bottom, keep only:
initRouter();

// Handle route changes
// Replace handleRouteChange function:
function handleRouteChange() {
    // Get current hash (e.g., "#/dashboard" or "#/bin?id=1")
    let hash = window.location.hash.slice(1); // Remove the #
    
    // Default to home if no hash or just "#"
    if (!hash || hash === '') {
        hash = '/';
    }
    
    // ✅ Strip query parameters for route matching
    const route = hash.split('?')[0]; // Get "/bin" from "/bin?id=1"
    
    // Find matching route
    const pageSelector = routes[route];
    
    if (pageSelector) {
        showPage(pageSelector, route);
    } else {
        console.warn(`⚠️ Route not found: ${route}, redirecting to home`);
        window.location.hash = '#/';
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
    // Remove active class from all nav links
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current page link
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
            // Let the hash change event handle the routing
            console.log(`🔗 Nav clicked: ${link.getAttribute('href')}`);
        });
    });
    
    console.log('✅ Navigation handlers setup');
}

// Programmatic navigation helper
function navigateTo(route) {
    window.location.hash = '#' + route;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRouter);
} else {
    initRouter();
}

// Export for use in other scripts
window.router = {
    navigateTo,
    getCurrentPage: () => currentPage,
    routes
};


console.log('📦 url-router.js loaded');

// UPDATED URL Router with Settings Sub-routes
const routes = {
    '/': '.content.home',
    '/dashboard': '.content.dashboard',
    '/claim-device': '.content.claim-device',
    '/settings': '.content.settings',
    '/settings/account': '.content.settings-account',
    '/settings/wifi': '.content.settings-wifi',
    '/help': '.content.help',
    '/bin': '.content.bin',
    '/bin2': '.content.bin2'
};

let currentPage = null;

function isAuthenticated() {
    const token = localStorage.getItem('avonic_token');
    return !!token;
}

function requireAuth() {
    if (!isAuthenticated()) {
        console.log('🔒 Not authenticated, redirecting to login');
        window.location.href = 'app.html';
        return false;
    }
    return true;
}

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

function handleRouteChange() {
    let hash = window.location.hash.slice(1);
    
    if (!hash || hash === '') {
        hash = '/dashboard';
    }
    
    const route = hash.split('?')[0];
    const pageSelector = routes[route];
    
    if (pageSelector) {
        showPage(pageSelector, route);
    } else {
        console.warn(`⚠️ Route not found: ${route}, redirecting to dashboard`);
        window.location.hash = '#/dashboard';
    }
}

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

function showPage(selector, route) {
    console.log(`📄 Navigating to: ${route}`);
    
    document.querySelectorAll('.content').forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
    
    const targetPage = document.querySelector(selector);
    if (targetPage) {
        targetPage.classList.add('active');
        targetPage.style.display = 'block';
        currentPage = route;
        updateActiveNav(route);
        window.scrollTo(0, 0);
        
        // Load page-specific data
        if (route === '/settings' && typeof window.settingsNav !== 'undefined') {
            console.log('⚙️ Loading settings hub...');
        }
        
        if (route === '/settings/account' && typeof loadAccountSettings === 'function') {
            console.log('👤 Loading account settings...');
            loadAccountSettings();
        }
        
        if (route === '/settings/wifi' && typeof loadWiFiSettings === 'function') {
            console.log('📡 Loading WiFi settings...');
            loadWiFiSettings();
        }
        
        if (route === '/dashboard' && typeof loadDashboard === 'function') {
            console.log('📊 Loading dashboard data...');
            loadDashboard();
        }
        
        if (route === '/bin' || route === '/bin2') {
            handleBinPageLoad(route);
        }
        
        if (route === '/' && typeof loadBinCards === 'function') {
            console.log('🗑️ Loading bin cards...');
            setTimeout(() => loadBinCards(), 100);
        }
        
        console.log(`✅ Page displayed: ${route}`);
    } else {
        console.error(`❌ Page element not found: ${selector}`);
    }
}

function updateActiveNav(route) {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Handle settings sub-routes
    const baseRoute = route.startsWith('/settings') ? '/settings' : route;
    const activeLink = document.querySelector(`nav a[href="#${baseRoute}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            console.log(`🔗 Nav clicked: ${link.getAttribute('href')}`);
        });
    });
    
    console.log('✅ Navigation handlers setup');
}

function navigateTo(route) {
    window.location.hash = '#' + route;
}

function logout() {
    localStorage.removeItem('avonic_token');
    localStorage.removeItem('avonic_user');
    console.log('👋 Logged out');
    window.location.href = 'app.html';
}

initRouter();

window.router = {
    navigateTo,
    logout,
    getCurrentPage: () => currentPage,
    isAuthenticated,
    routes
};

console.log('📦 url-router.js loaded');
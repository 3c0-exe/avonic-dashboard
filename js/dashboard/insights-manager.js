// dashboard/insights-manager.js - Insights & Actions Manager

/**
 * Update insights text in dashboard section
 * @param {HTMLElement} section - Dashboard section element
 * @param {string} insightText - Full insight text with actions
 */
function updateInsights(section, insightText) {
    const mainMessage = insightText.split(/🔧 Actions:|🔧 URGENT Actions:/)[0].trim();
    
    const insightContent = section.querySelector('.dashboard-insights-content');
    if (insightContent) {
        insightContent.textContent = mainMessage;
    }
    
    // Extract and store actions
    const actions = extractActions(insightText);
    section.dataset.currentActions = JSON.stringify(actions);
    updateActionButton(section, actions);
}

/**
 * Extract action items from insight text
 * @param {string} insightText - Full insight text
 * @returns {Array<Object>} Array of action objects with text and icon
 */
function extractActions(insightText) {
    const actionsPart = insightText.split(/🔧 Actions:|🔧 URGENT Actions:/)[1];
    
    if (!actionsPart) return [];

    const actions = actionsPart
        .split('•')
        .map(action => action.trim())
        .filter(action => action.length > 0 && !action.toLowerCase().startsWith('optimal'));

    return actions.map(text => ({
        text: text,
        icon: 'img/icons/action-icon.svg'
    }));
}

/**
 * Update action button state based on available actions
 * @param {HTMLElement} section - Dashboard section element
 * @param {Array<Object>} actions - Array of action objects
 */
function updateActionButton(section, actions) {
    const actionIcon = section.querySelector('.dashboard-action-icon');
    const actionBadge = section.querySelector('.dashboard-action-badge');
    
    if (!actionIcon) return;
    
    const hasActions = actions && actions.length > 0;
    
    if (hasActions) {
        actionIcon.style.opacity = '1';
        actionIcon.style.cursor = 'pointer';
        actionIcon.style.pointerEvents = 'auto';
        
        if (actionBadge) {
            actionBadge.style.display = 'block';
        }
    } else {
        actionIcon.style.opacity = '0.3';
        actionIcon.style.cursor = 'not-allowed';
        actionIcon.style.pointerEvents = 'none';
        
        if (actionBadge) {
            actionBadge.style.display = 'none';
        }
    }
}

console.log('✅ Insights manager loaded');
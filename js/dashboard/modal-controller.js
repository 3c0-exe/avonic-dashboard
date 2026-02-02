// dashboard/modal-controller.js - Modal Controller

/**
 * Open action modal and populate with actions
 * @param {HTMLElement} section - Dashboard section element
 */
function openDashboardModal(section) {
    const actionsJSON = section.dataset.currentActions;
    if (!actionsJSON) {
        console.log('No actions available');
        return;
    }
    
    const actions = JSON.parse(actionsJSON);
    
    if (!actions || actions.length === 0) {
        console.log('No actions available');
        return;
    }
    
    const modal = document.querySelector('.dashboard-modal-overlay');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        populateDashboardActions(actions);
    }
}

/**
 * Close action modal
 */
function closeDashboardModal() {
    const modal = document.querySelector('.dashboard-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Populate modal with action items
 * @param {Array<Object>} actionsArray - Array of action objects
 */
function populateDashboardActions(actionsArray) {
    const actionsList = document.querySelector('.dashboard-actions-list');
    if (!actionsList) return;
    
    actionsList.innerHTML = '';

    actionsArray.forEach((action, index) => {
        const actionItem = document.createElement('div');
        actionItem.className = 'dashboard-action-item';
        actionItem.style.opacity = '0';
        actionItem.style.transform = 'translateY(10px)';
        
        actionItem.innerHTML = `
            <div class="dashboard-action-item-icon">
                <img src="${action.icon}" alt="Action icon" onerror="this.style.display='none'">
            </div>
            <div class="dashboard-action-item-content">
                <p class="dashboard-action-item-text">${action.text}</p>
            </div>
        `;
        
        actionsList.appendChild(actionItem);
        
        // Animate in
        setTimeout(() => {
            actionItem.style.transition = 'all 0.3s ease';
            actionItem.style.opacity = '1';
            actionItem.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

/**
 * Setup modal event listeners
 */
function setupDashboardModalListeners() {
    // Action icon clicks
    document.querySelectorAll('.dashboard-action-icon').forEach(icon => {
        icon.addEventListener('click', function(e) {
            const section = e.target.closest('.dashboard-section');
            if (section) {
                openDashboardModal(section);
            }
        });
    });
    
    // Close on overlay click
    const modalOverlay = document.querySelector('.dashboard-modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeDashboardModal();
            }
        });
    }
    
    // Close button
    const closeButton = document.querySelector('.dashboard-modal-close');
    if (closeButton) {
        closeButton.addEventListener('click', closeDashboardModal);
    }
    
    // Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeDashboardModal();
        }
    });
}

console.log('✅ Dashboard modal controller loaded');
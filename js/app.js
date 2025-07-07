// Main application file for Shell Pack Booster

// Create app namespace if it doesn't exist
window.app = window.app || {};

// Initialize the application
window.app.init = function() {
    console.log('[app] Initializing application...');
    
    // Check for required dependencies
    if (!window.storage) {
        const errorMsg = 'Storage module not loaded';
        console.error('[app]', errorMsg);
        showNotification(`Error: ${errorMsg}. Please refresh the page.`, 'error');
        return false;
    }
    
    if (!window.cards) {
        const errorMsg = 'Cards module not loaded';
        console.error('[app]', errorMsg);
        showNotification(`Error: ${errorMsg}. Please refresh the page.`, 'error');
        return false;
    }
    
    try {
        // Initialize the application
        initApp();
        
        // Set up event listeners
        setupEventListeners();
        
        console.log('[app] Application initialized successfully');
        return true;
    } catch (error) {
        console.error('[app] Error initializing application:', error);
        showNotification('Error initializing application. Please check the console for details.', 'error');
        return false;
    }
};

// Auto-initialize if not using the module pattern
if (!window.app.initialized) {
    document.addEventListener('DOMContentLoaded', window.app.init);
}

// Initialize the application
function initApp() {
    console.log('[initApp] Starting application initialization');

    try {
        // Render the card collection
        console.log('[initApp] Rendering card collection...');
        window.cards.renderCardCollection();
        
        // Initialize the timers module, which will handle its own updates
        console.log('[initApp] Initializing timers...');
        if (window.timers && typeof window.timers.init === 'function') {
            window.timers.init();
        }

        // Perform initial update of shell pack count
        updateShellPackCount();
        
        console.log('[initApp] Application initialized successfully');
    } catch (error) {
        console.error('[initApp] Error during initialization:', error);
        throw error; // Re-throw to be caught by the global error handler
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Humanoid Booster button - functional
    const humanoidBoosterBtn = document.getElementById('humanoid-booster-btn');
    if (humanoidBoosterBtn) {
        humanoidBoosterBtn.addEventListener('click', () => showTimerModal('humanoid'));
    }
    
    // Weapon Booster button - disabled/coming soon
    const weaponBoosterBtn = document.getElementById('weapon-booster-btn');
    if (weaponBoosterBtn) {
        weaponBoosterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Weapon Boosters are coming soon!', 'info');
        });
    }
    
    // Timer modal elements
    const timerModal = document.getElementById('timer-modal');
    const timerSlider = document.getElementById('timer-slider');
    const selectedTime = document.getElementById('selected-time');
    const confirmTimerBtn = document.getElementById('confirm-timer');
    const cancelTimerBtn = document.getElementById('cancel-timer');
    
    // Update selected time display when slider changes
    if (timerSlider && selectedTime) {
        timerSlider.addEventListener('input', (e) => {
            selectedTime.textContent = `${e.target.value}h`;
        });
    }
    
    // Confirm timer button
    if (confirmTimerBtn) {
        confirmTimerBtn.addEventListener('click', () => {
            const hours = parseInt(timerSlider.value, 10);
            const boosterType = timerModal.dataset.boosterType || 'humanoid';
            
            const timer = window.storage.addTimer(hours, boosterType);
            if (timer) {
                window.timers.update(); // Just update the display
                showNotification(`${boosterType === 'humanoid' ? 'Humanoid' : 'Weapon'} Booster timer set for ${hours} hours!`, 'success');
                closeTimerModal();
            } else {
                showNotification('A timer is already active.', 'error');
            }
        });
    }
    
    // Cancel timer button
    if (cancelTimerBtn) {
        cancelTimerBtn.addEventListener('click', closeTimerModal);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        const timerModal = document.getElementById('timer-modal');
        if (event.target === timerModal) {
            closeTimerModal();
        }
    });
    
    // Empty Card Collection button
    const emptyCollectionBtn = document.getElementById('empty-collection-btn');
    if (emptyCollectionBtn) {
        emptyCollectionBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to empty your entire card collection? This cannot be undone.')) {
                if (window.storage.emptyCardCollection()) {
                    window.cards.renderCardCollection();
                    showNotification('Card collection has been emptied.', 'success');
                } else {
                    showNotification('Failed to empty card collection.', 'error');
                }
            }
        });
    }

    // Close card modal button
    const closeCardBtn = document.getElementById('close-card');
    if (closeCardBtn) {
        closeCardBtn.addEventListener('click', () => {
            const cardModal = document.getElementById('card-modal');
            if (cardModal) {
                cardModal.style.display = 'none';
            }
        });
    }
}

// Show the timer setup modal
function showTimerModal(boosterType = 'humanoid') {
    const modal = document.getElementById('timer-modal');
    if (!modal) return;
    
    const modalTitle = modal.querySelector('h2');
    if (modalTitle) {
        modalTitle.textContent = `Set ${boosterType === 'humanoid' ? 'Humanoid' : 'Weapon'} Booster Timer`;
    }
    
    modal.dataset.boosterType = boosterType;
    
    const timerSlider = document.getElementById('timer-slider');
    const selectedTime = document.getElementById('selected-time');
    
    if (timerSlider && selectedTime) {
        timerSlider.value = 4;
        selectedTime.textContent = '4h';
    }
    
    modal.style.display = 'flex';
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    
    // Stop click inside modal from closing it
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.onclick = (e) => e.stopPropagation();
    }
}

// Close the timer modal
function closeTimerModal() {
    const timerModal = document.getElementById('timer-modal');
    if (timerModal) {
        timerModal.style.display = 'none';
        timerModal.classList.remove('show');
        document.body.classList.remove('modal-open');
    }
}



// Show a notification message
function showNotification(message, type = 'info') {
    console.log(`[${type}] ${message}`);
    
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        document.body.appendChild(notification);
    }

    // Clear any existing timeouts
    if (notification.timeoutId) {
        clearTimeout(notification.timeoutId);
    }

    // Set the message and class based on type
    notification.textContent = message;
    notification.className = ''; // Reset classes
    notification.classList.add(type, 'visible');

    // Auto-hide after delay
    notification.timeoutId = setTimeout(() => {
        notification.classList.remove('visible');
        notification.timeoutId = null;
    }, 5000);

    // Make it available globally
    return notification;
}

// Make the function available globally
window.showNotification = showNotification;

// This function is called on init and by other modules.
function updateShellPackCount() {
    const countElement = document.getElementById('shell-pack-count');
    if (countElement) {
        const count = window.storage.getShellPackCount();
        countElement.textContent = count;
        
        const openPackBtn = document.getElementById('open-pack-btn');
        if (openPackBtn) {
            openPackBtn.disabled = count <= 0;
        }
    }
}
// Make it globally accessible for other modules
window.updateShellPackCount = updateShellPackCount;

// This function is called by the 'Open Now' button in the active timers section
window.openPackImmediately = function(hours) {
    console.log(`[app.js] openPackImmediately called for ${hours} hours`);

    // Calculate bonus based on the original timer duration
    const bonusPercentage = Math.min(Math.max((hours - 4) * (100 / 20), 0), 100);
    
    // Generate a single card
    const card = window.cards.generateCard(bonusPercentage);
    
    if (card) {
        // Add the card to the collection
        window.storage.addCardToCollection(card);
        
        // Show the card in a modal
        window.cards.showCardModal([card]);
        
        // Update the collection display
        window.cards.renderCardCollection();
        
        // Update the shell pack count
        updateShellPackCount();
        
        // Show success notification
        showNotification(`Added a new card to your collection with ${bonusPercentage.toFixed(0)}% bonus!`, 'success');
    } else {
        showNotification('Failed to generate a card.', 'error');
    }
}

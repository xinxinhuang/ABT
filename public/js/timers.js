// timers.js: Manages all timer-related logic and UI updates.
(function() {
    'use strict';

    // Check for dependencies
    if (!window.storage) {
        console.error('[timers.js] FATAL: storage.js module not loaded before timers.js.');
        return;
    }
    if (!window.cards) {
        console.error('[timers.js] FATAL: cards.js module not loaded before timers.js.');
        return;
    }

    // --- Private Helper Functions ---

    function formatTimeRemaining(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            secs.toString().padStart(2, '0')
        ].join(':');
    }

    function getTimeRemaining(endTime) {
        const now = new Date().getTime();
        const end = new Date(endTime).getTime();
        const remainingMs = Math.max(0, end - now);
        return {
            total: Math.floor(remainingMs / 1000), // in seconds
        };
    }
    
    function calculateBonus(originalHours, elapsedHours) {
        if (elapsedHours >= originalHours) {
            return 100; // Max bonus if waited full time
        }
        // Prorated bonus
        const bonus = (elapsedHours / originalHours) * 100;
        return Math.min(Math.max(bonus, 0), 100);
    }

    // --- DOM Manipulation ---

    function createTimerElement(timer) {
        const now = new Date().getTime();
        const startTime = new Date(timer.startTime).getTime();
        const endTime = startTime + (timer.targetDelay * 60 * 60 * 1000);
        const totalDuration = endTime - startTime;
        const elapsedTime = now - startTime;
        const progress = totalDuration > 0 ? Math.min((elapsedTime / totalDuration) * 100, 100) : 100;

        const timerElement = document.createElement('div');
        timerElement.className = 'timer';
        timerElement.id = `timer-${timer.id}`;

        const timeRemaining = getTimeRemaining(new Date(endTime).toISOString());
        const isReady = timeRemaining.total <= 0;
        const isActive = timer.status === 'active';

        // Get booster type or default to humanoid for backward compatibility
        const boosterType = timer.boosterType || 'humanoid';
        const boosterDisplayName = boosterType === 'humanoid' ? 'Humanoid' : 'Weapon';
        
        timerElement.innerHTML = `
            <div class="timer-info">
                <div class="timer-duration">${boosterDisplayName} Booster (${timer.originalHours}h)</div>
                <div class="timer-status">
                    ${isReady ? 'Ready to open!' : `Ready in ${formatTimeRemaining(timeRemaining.total)}`}
                </div>
            </div>
            <div class="timer-progress">
                <div class="progress-bar" style="width: ${progress}%;"></div>
            </div>
            <div class="timer-actions">
                ${isActive ? `
                    <button class="btn open-now-btn" data-timer-id="${timer.id}">
                        Open Now
                    </button>
                ` : ''}
                <button class="btn ${isReady ? 'primary' : ''} open-pack-btn"
                        data-timer-id="${timer.id}"
                        ${!isReady ? 'disabled' : ''}>
                    ${isReady ? 'Open Pack!' : 'Waiting...'}
                </button>
            </div>
        `;
        
        // Attach event listener directly
        const openButton = timerElement.querySelector('.open-pack-btn');
        if (openButton) {
            openButton.addEventListener('click', () => openPack(timer.id));
        }

        return timerElement;
    }
    
    // --- Public API ---

    // Store the event listener to prevent multiple additions
    let isOpenNowListenerAdded = false;

    function updateTimers() {
        const timersContainer = document.getElementById('active-timers');
        if (!timersContainer) return;

        const activeTimers = window.storage.getActiveTimers();
        
        if (activeTimers.length === 0) {
            timersContainer.innerHTML = '<p>No active timers. Open a new pack to start!</p>';
            isOpenNowListenerAdded = false;
            return;
        }

        // Store the current HTML to check if it has changed
        const currentHTML = timersContainer.innerHTML;
        
        // Create a document fragment to build the new content
        const fragment = document.createDocumentFragment();
        activeTimers.forEach(timer => {
            const timerElement = createTimerElement(timer);
            fragment.appendChild(timerElement);
        });

        // Only update the DOM if the content has changed
        timersContainer.innerHTML = '';
        timersContainer.appendChild(fragment);

        // Add the event listener only once
        if (!isOpenNowListenerAdded) {
            timersContainer.addEventListener('click', handleOpenNowClick);
            isOpenNowListenerAdded = true;
            console.log('Added Open Now click listener');
        }
    }

    function handleOpenNowClick(e) {
        const openNowBtn = e.target.closest('.open-now-btn');
        if (openNowBtn) {
            e.preventDefault();
            e.stopPropagation(); // Prevent event bubbling
            
            const timerId = openNowBtn.dataset.timerId;
            const activeTimers = window.storage.getActiveTimers();
            const timer = activeTimers.find(t => t.id === timerId);
            
            if (timer) {
                console.log('Open Now clicked for timer:', timerId);
                // Disable the button to prevent multiple clicks
                openNowBtn.disabled = true;
                openNowBtn.textContent = 'Opening...';
                
                // Immediately open the pack with the timer's original hours
                window.openPackImmediately(timer.originalHours, timer.boosterType);
                
                // Remove the timer since we're opening it now
                window.storage.completeTimer(timerId);
                
                // Update the UI
                updateTimers();
            }
        }
    }

    function openPack(timerId) {
        const timer = window.storage.getActiveTimers().find(t => t.id === timerId);
        if (!timer) {
            console.error(`Timer with ID ${timerId} not found.`);
            return;
        }

        const startTime = new Date(timer.startTime).getTime();
        const now = new Date().getTime();
        const elapsedHours = (now - startTime) / (1000 * 60 * 60);
        const bonusPercentage = calculateBonus(timer.originalHours, elapsedHours);
        const boosterType = timer.boosterType || 'humanoid';
        
        console.log(`Opening ${boosterType} pack for timer ${timer.id} with ${bonusPercentage.toFixed(2)}% bonus.`);

        // Generate a single card based on booster type
        const card = window.cards.generateCard(bonusPercentage, boosterType);
        
        if (card) {
            window.storage.addCardToCollection(card);
            window.storage.completeTimer(timerId);
            window.cards.showCardModal([card]);
            updateTimers();
            window.cards.renderCardCollection();
            showNotification(`Added a new ${boosterType} card to your collection!`, 'success');
        } else {
            showNotification('Failed to generate a card.', 'error');
        }
    }

    function startNewTimer(hours) {
        const timer = window.storage.addTimer(hours);
        
        if (timer) {
            // Calculate end time
            const startTime = new Date(timer.startTime);
            const endTime = new Date(startTime.getTime() + (hours * 60 * 60 * 1000));
            timer.endTime = endTime.toISOString();
            
            // Update the UI
            updateTimers();
            
            // Start the countdown
            const timerInterval = setInterval(updateTimers, 1000);
            
            // Store the interval ID so we can clear it later
            window.timerIntervals = window.timerIntervals || {};
            window.timerIntervals[timer.id] = timerInterval;
            
            return timer;
        } else {
            // Show error message if a timer is already active
            const notification = document.createElement('div');
            notification.className = 'notification error';
            notification.textContent = 'A booster is already being opened. Please wait until it\'s ready.';
            document.body.appendChild(notification);
            
            // Trigger the show animation
            setTimeout(() => notification.classList.add('show'), 10);
            
            // Remove the notification after 3 seconds
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
            
            return null;
        }
    }

    let timerInterval = null;
    function init() {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        updateTimers();
        timerInterval = setInterval(updateTimers, 1000);
        console.log('[timers.js] Timers initialized and updating every second.');
    }

    // --- Public API ---
    window.timers = {
        init: init,
        update: updateTimers
    };

    console.log('[timers.js] Script loaded. window.timers is:', window.timers ? 'defined' : 'undefined');

})();

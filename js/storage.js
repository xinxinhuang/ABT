// Storage utility functions for the Shell Pack Booster app

// Initialize local storage with default values if empty
function initStorage() {
    if (!localStorage.getItem('shellPackData')) {
        const defaultData = {
            cards: [],
            activeTimers: []
        };
        localStorage.setItem('shellPackData', JSON.stringify(defaultData));
    }
}

// Get all data from storage
function getStorageData() {
    const data = localStorage.getItem('shellPackData');
    return data ? JSON.parse(data) : null;
}

// Update storage with new data
function updateStorage(data) {
    localStorage.setItem('shellPackData', JSON.stringify(data));
}

// No shell pack functions needed anymore

// Card functions
function addCardToCollection(card) {
    const data = getStorageData();
    if (data) {
        card.id = Date.now().toString();
        card.timestamp = new Date().toISOString();
        data.cards.push(card);
        updateStorage(data);
        return card;
    }
    return null;
}

function getAllCards() {
    const data = getStorageData();
    return data ? data.cards : [];
}

function emptyCardCollection() {
    const data = getStorageData();
    if (data) {
        data.cards = [];
        updateStorage(data);
        console.log('[storage.js] Card collection emptied.');
        return true;
    }
    return false;
}

// Timer functions
function addTimer(delayHours, boosterType = 'humanoid') {
    const data = getStorageData();
    if (!data) return null;
    
    // Check if there's already an active timer
    const hasActiveTimer = data.activeTimers.some(timer => timer.status === 'active');
    if (hasActiveTimer) {
        console.log('[storage.js] A timer is already active');
        return null; // Return null to indicate a timer is already active
    }
    
    const timer = {
        id: Date.now().toString(),
        startTime: new Date().toISOString(),
        targetDelay: delayHours,
        originalHours: delayHours, // Store the original hours for Open Now
        status: 'active',
        boosterType: boosterType // Store the type of booster
    };
    
    // Clear any existing timers (shouldn't be any, but just in case)
    data.activeTimers = [];
    data.activeTimers.push(timer);
    updateStorage(data);
    return timer;
}

function getActiveTimers() {
    const data = getStorageData();
    if (!data) return [];
    
    // Check timer statuses
    const now = new Date();
    let timersUpdated = false;
    
    const updatedTimers = data.activeTimers.map(timer => {
        const startTime = new Date(timer.startTime);
        const elapsedHours = (now - startTime) / (1000 * 60 * 60);
        
        if (timer.status === 'active' && elapsedHours >= timer.targetDelay) {
            timersUpdated = true;
            return { ...timer, status: 'ready' };
        }
        return timer;
    });
    
    if (timersUpdated) {
        data.activeTimers = updatedTimers;
        updateStorage(data);
    }
    
    return updatedTimers;
}

function completeTimer(timerId) {
    const data = getStorageData();
    if (data) {
        const timerIndex = data.activeTimers.findIndex(t => t.id === timerId);
        console.log('[completeTimer] timerId:', timerId, 'Found index:', timerIndex);
        if (timerIndex !== -1) {
            // Remove the timer from active timers
            data.activeTimers.splice(timerIndex, 1);
            updateStorage(data);
            console.log('[completeTimer] Timer removed. Remaining timers:', data.activeTimers.map(t => t.id));
            return true;
        } else {
            console.warn('[completeTimer] TimerId not found:', timerId);
        }
    }
    return false;
}

// Initialize storage when the module loads
initStorage();

// Create the storage object with all methods
const storage = {
    addCardToCollection,
    getAllCards,
    emptyCardCollection,
    addTimer,
    getActiveTimers,
    completeTimer,
    // Add a test method to verify the module is loaded
    test: function() {
        console.log('[storage] Storage module is working correctly');
        return true;
    }
};

// Expose to global scope
window.storage = storage;

// Log that the module is loaded
console.log('[storage] Storage module initialized with methods:', Object.keys(storage));

// Test the storage module
if (window.storage && typeof window.storage.test === 'function') {
    window.storage.test();
} else {
    console.error('[storage] Failed to initialize storage module');
}
console.log('[storage.js] Script loaded. window.storage is:', window.storage ? 'defined' : 'undefined');

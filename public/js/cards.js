// --- Constants and Config ---
const TYPE_ORDER = { dwarf: 1, bigfoot: 2, elf: 3 };
const RARITY_ORDER = { gold: 3, silver: 2, bronze: 1 };
const CARD_STATS = ['str', 'dex', 'int'];
const MAX_STAT = 40; // Consider moving to config per cardType if needed

// --- Current Booster Pack Config ---
let currentBoosterPackConfig = null;

// --- Helper: Get Config Safely ---
function getBoosterPackConfig(packName) {
    if (!window.boosterPacks || !window.boosterPacks[packName]) {
        throw new Error(`[cards.js] Missing booster pack config for '${packName}'.`);
    }
    return window.boosterPacks[packName];
}

// --- Set Current Booster Pack ---
function setCurrentBoosterPack(packName) {
    if (!packName) return;
    try {
        currentBoosterPackConfig = getBoosterPackConfig(packName);
        console.log(`[cards.js] Current booster pack set to '${packName}'.`);
    } catch (e) {
        console.error(e);
        currentBoosterPackConfig = null;
    }
}


// --- Helper: Find Pack Config By Card Type ---
function findPackConfigByCardType(cardType) {
    if (!window.boosterPacks) return null;
    return Object.values(window.boosterPacks).find(packCfg =>
        Array.isArray(packCfg.CARD_TYPES) && packCfg.CARD_TYPES.some(ct => ct.type === cardType)
    ) || null;
}

// --- Helper: Get Current Booster Pack Config Safely ---
function getCurrentBoosterPackConfig() {
    if (!currentBoosterPackConfig) {
        throw new Error('[cards.js] Current booster pack config not set.');
    }
    return currentBoosterPackConfig;
}

// --- Card Generation Wrapper (for compatibility) ---
/**
 * Generate a card using cardLogic based on the specified or current booster pack.
 * This keeps compatibility with older code that expects window.cards.generateCard.
 * @param {number} bonusPercentage - Bonus percentage for rarity rolls.
 * @param {string} [boosterType] - Booster pack name (defaults to current or 'humanoid').
 * @returns {object|null}
 */
function generateCard(bonusPercentage = 0, boosterType = 'humanoid') {
    try {
        // Directly get the config for the requested booster type.
        const packConfig = getBoosterPackConfig(boosterType);
        
        // Set the current config for other functions that might need it (like UI rendering).
        currentBoosterPackConfig = packConfig;

        // Generate the card using the retrieved configuration.
        return window.cardLogic.generateCard(bonusPercentage, packConfig.CARD_TYPES);
    } catch (err) {
        console.error(`[cards.js] generateCard failed for boosterType '${boosterType}':`, err);
        return null;
    }
}

// --- Card UI ---
/**
 * Create HTML for a card element.
 * @param {object} card - The card object.
 * @param {boolean} isPack - True for simplified pack view, false for detailed collection view.
 * @returns {HTMLElement}
 */
function createCardElement(card, isPack = false) {
    const cardElement = document.createElement('div');
    let cardType, ATTRIBUTE_LABELS;
    try {
        // Prefer the pack config that actually contains this card type to avoid mismatches.
        const boosterPackConfig = findPackConfigByCardType(card.type) || getCurrentBoosterPackConfig();
        cardType = boosterPackConfig.CARD_TYPES.find(ct => ct.type === card.type) || boosterPackConfig.CARD_TYPES[0];
        ATTRIBUTE_LABELS = boosterPackConfig.ATTRIBUTE_LABELS;
    } catch (e) {
        cardElement.textContent = "Error: Card config missing.";
        cardElement.className = "card error";
        return cardElement;
    }

    if (isPack) {
        // --- Simplified booster pack view ---
        cardElement.className = `card-pack ${card.rarity}`;
        cardElement.setAttribute('data-card-type', card.type);
        cardElement.innerHTML = `
            <div class="card-pack-inner">
                <div class="card-pack-content">
                    <div class="card-pack-rarity ${card.rarity}"></div>
                    <h3>${card.name}</h3>
                    <p>${card.description}</p>
                    <div class="card-pack-stats">
                        ${CARD_STATS.map(stat => `
                            <div class="stat">
                                <span class="stat-label">${ATTRIBUTE_LABELS[stat]}</span>
                                <span class="stat-value">${card.stats[stat]}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    } else {
        // --- Detailed collection view ---
        cardElement.className = `card ${card.rarity}`;

        const createStatBar = (value, max = MAX_STAT) => {
            const percentage = (value / max) * 100;
            return `
                <div class="stat-bar-container">
                    <div class="stat-bar" style="width: ${percentage}%;"></div>
                </div>
                <span class="stat-value">${value}</span>
            `;
        };

        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-header">
                    <h3 class="card-title">${card.name}</h3>
                    <span class="card-rarity ${card.rarity}">${card.rarity.toUpperCase()}</span>
                </div>
                <div class="card-type">${cardType.description}</div>
                <div class="card-stats">
                    ${CARD_STATS.map(stat => `
                        <div class="stat ${cardType.primaryStat === stat ? 'primary-stat' : ''}">
                            <div class="stat-header">
                                <span class="stat-label">${ATTRIBUTE_LABELS[stat]}</span>
                                <span class="stat-value">${card.stats[stat]}</span>
                            </div>
                            ${createStatBar(card.stats[stat])}
                        </div>
                    `).join('')}
                </div>
                <p class="card-flavor">"${card.flavorText || ''}"</p>
                <div class="card-footer">
                    <small>Bonus: ${card.bonusPercentage ?? 0}%</small>
                    <small>${card.createdAt ? new Date(card.createdAt).toLocaleDateString() : ''}</small>
                </div>
            </div>
        `;
    }
    return cardElement;
}

// --- Stats UI ---
/**
 * Render stats for the card collection (advanced version, replaces updateCollectionStats).
 * @param {Array} cards
 */
/**
 * Update the collection stats in the UI.
 * @param {Array} cards - Array of card objects in the collection.
 */
function renderCollectionStats(cards) {
    // Get the stats elements from the DOM
    const totalCardsEl = document.getElementById('total-cards');
    const goldCardsEl = document.getElementById('gold-cards');
    const silverCardsEl = document.getElementById('silver-cards');
    const bronzeCardsEl = document.getElementById('bronze-cards');
    
    if (!totalCardsEl || !goldCardsEl || !silverCardsEl || !bronzeCardsEl) {
        console.error('Could not find all stats elements in the DOM');
        return;
    }
    
    // Count cards by rarity
    const goldCount = cards.filter(card => card.rarity === 'gold').length;
    const silverCount = cards.filter(card => card.rarity === 'silver').length;
    const bronzeCount = cards.filter(card => card.rarity === 'bronze').length;
    
    // Update the DOM elements
    totalCardsEl.textContent = cards.length;
    goldCardsEl.textContent = goldCount;
    silverCardsEl.textContent = silverCount;
    bronzeCardsEl.textContent = bronzeCount;
}

// --- Render Collection ---
/**
 * Render the entire card collection in the UI.
 */
function renderCardCollection() {
    console.log('[renderCardCollection] Starting to render card collection');
    
    const humanoidContainer = document.getElementById('humanoid-collection');
    const weaponContainer = document.getElementById('weapon-collection');
    
    if (!humanoidContainer || !weaponContainer) {
        console.error('[renderCardCollection] Collection containers not found');
        return;
    }
    
    // Clear both containers
    humanoidContainer.innerHTML = '';
    weaponContainer.innerHTML = '';

    if (!window.storage || typeof window.storage.getAllCards !== 'function') {
        const errorMsg = 'Storage module or getAllCards function not found.';
        console.error(`[renderCardCollection] ${errorMsg}`);
        humanoidContainer.innerHTML = `<p>Error: ${errorMsg} Please refresh.</p>`;
        return;
    }

    let cards = [];
    try {
        cards = window.storage.getAllCards();
        console.log(`[renderCardCollection] Retrieved ${cards.length} cards from storage`);
    } catch (error) {
        console.error('[renderCardCollection] Error getting cards from storage:', error);
        humanoidContainer.innerHTML = '<p>Error: Could not load cards. Please refresh.</p>';
        return;
    }

    // Separate cards into humanoid and weapon types
    const humanoidCards = [];
    const weaponCards = [];
    
    cards.forEach(card => {
        if (['dwarf', 'bigfoot', 'elf'].includes(card.type)) {
            humanoidCards.push(card);
        } else if (['shield', 'sword', 'hammer'].includes(card.type)) {
            weaponCards.push(card);
        }
    });

    // Sort each category
    const sortCards = (cards) => {
        return cards.sort((a, b) => {
            if ((TYPE_ORDER[a.type] || 0) !== (TYPE_ORDER[b.type] || 0))
                return (TYPE_ORDER[a.type] || 0) - (TYPE_ORDER[b.type] || 0);
            if ((RARITY_ORDER[a.rarity] || 0) !== (RARITY_ORDER[b.rarity] || 0))
                return (RARITY_ORDER[b.rarity] || 0) - (RARITY_ORDER[a.rarity] || 0);
            const aTotal = CARD_STATS.reduce((sum, stat) => sum + (a.stats[stat] || 0), 0);
            const bTotal = CARD_STATS.reduce((sum, stat) => sum + (b.stats[stat] || 0), 0);
            return bTotal - aTotal;
        });
    };

    const sortedHumanoidCards = sortCards(humanoidCards);
    const sortedWeaponCards = sortCards(weaponCards);

    // Render stats with both counts
    renderCollectionStats(cards);

    // Render humanoid cards
    if (sortedHumanoidCards.length > 0) {
        sortedHumanoidCards.forEach(card => {
            const cardElement = createCardElement(card, false);
            if (cardElement) {
                humanoidContainer.appendChild(cardElement);
            }
        });
    } else {
        humanoidContainer.innerHTML = '<p class="no-cards">No humanoid cards yet. Open a Humanoid Booster to get started!</p>';
    }

    // Render weapon cards
    if (sortedWeaponCards.length > 0) {
        sortedWeaponCards.forEach(card => {
            const cardElement = createCardElement(card, false);
            if (cardElement) {
                weaponContainer.appendChild(cardElement);
            }
        });
    } else {
        weaponContainer.innerHTML = '<p class="no-cards">No weapon cards yet. Open a Weapon Booster to get started!</p>';
    }
}

// --- Modal UI ---
/**
 * Show a modal with the opened cards.
 * @param {Array} cards - An array of card objects to display.
 */
function showCardModal(cards) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close';
    closeBtn.innerHTML = '&times;';
    closeBtn.tabIndex = 0;
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.onclick = () => document.body.removeChild(modal);
    closeBtn.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            document.body.removeChild(modal);
        }
    };

    const title = document.createElement('h2');
    title.textContent = 'You got...';

    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'cards-container';
    cards.forEach(card => {
        const cardElement = createCardElement(card, true);
        cardsContainer.appendChild(cardElement);
    });

    const continueBtn = document.createElement('button');
    continueBtn.className = 'btn primary';
    continueBtn.textContent = 'Add to Collection';
    continueBtn.onclick = () => document.body.removeChild(modal);

    modalContent.append(closeBtn, title, cardsContainer, continueBtn);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Modal close on background click
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };

    // Accessibility: Focus on close
    setTimeout(() => closeBtn.focus(), 50);
}

// --- Expose to window ---
// --- Expose to window ---
// Initialize default booster pack once DOM scripts loaded
if (!currentBoosterPackConfig) {
    if (window.boosterPacks && window.boosterPacks.humanoid) {
        setCurrentBoosterPack('humanoid');
    } else {
        // Set to first available booster pack if any
        const packs = window.boosterPacks ? Object.keys(window.boosterPacks) : [];
        if (packs.length) setCurrentBoosterPack(packs[0]);
    }
}

window.cards = {
    renderCardCollection,
    createCardElement,
    showCardModal,
    generateCard,
    setCurrentBoosterPack
};

console.log('[cards.js] Refactored UI script loaded. window.cards is defined.');

// Card generation and management for the Shell Pack Booster app

// Attribute labels for display
const ATTRIBUTE_LABELS = {
    str: 'Strength',
    dex: 'Dexterity',
    int: 'Intelligence'
};

const CARD_TYPES = [
    {
        name: 'Dwarf — Heavy Arms',
        type: 'dwarf',
        description: 'A sturdy dwarf with powerful arms',
        primaryStat: 'str',
        baseStats: {
            str: 20,
            dex: 5,
            int: 5
        },
        flavorText: 'Brawn over brains, always.'
    },
    {
        name: 'Big Foot — Large Feet',
        type: 'bigfoot',
        description: 'A nimble creature with large, dexterous feet',
        primaryStat: 'dex',
        baseStats: {
            str: 5,
            dex: 20,
            int: 5
        },
        flavorText: 'Light on his feet, quick as the wind.'
    },
    {
        name: 'Elf — Large Head',
        type: 'elf',
        description: 'An intelligent elf with a large, wise head',
        primaryStat: 'int',
        baseStats: {
            str: 5,
            dex: 5,
            int: 20
        },
        flavorText: 'Knowledge is power, and I am its vessel.'
    }
];

// Calculate bonus based on wait time (4-24 hours)
function calculateBonus(elapsedHours) {
    // Ensure elapsedHours is between 4 and 24
    const hours = Math.min(Math.max(elapsedHours, 4), 24);
    // Linear scale: 4h = 1%, 24h = 20%
    const bonusPercentage = Math.floor((hours - 4) * 1);
    return Math.min(Math.max(bonusPercentage, 1), 20);
}

// Roll a random number between min and max (inclusive)
function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a card with random attributes based on bonus percentage
function generateCard(bonusPercentage) {
    // Select a random card type
    const cardType = CARD_TYPES[Math.floor(Math.random() * CARD_TYPES.length)];
    
    // Determine rarity based on bonus percentage
    let rarity = 'grey';
    let bonus = 0;
    
    // Determine bonus based on probability
    const roll = randomInRange(1, 100);
    
    // Gold (Legendary): +15 to +20 bonus (5% chance at max bonus)
    if (roll <= bonusPercentage * 0.25) {
        rarity = 'gold';
        bonus = randomInRange(15, 20);
    } 
    // Blue (Rare): +5 to +14 bonus (15% chance at max bonus)
    else if (roll <= bonusPercentage * 0.75) {
        rarity = 'blue';
        bonus = randomInRange(5, 14);
    }
    // Grey (Common): +0 to +4 bonus (80% chance at max bonus)
    else {
        bonus = randomInRange(0, 4);
    }
    
    // Apply bonus to stats
    const finalStats = {};
    for (const [stat, baseValue] of Object.entries(cardType.baseStats)) {
        // Primary stat gets full bonus, others get half (rounded down)
        const statBonus = stat === cardType.primaryStat ? bonus : Math.floor(bonus / 2);
        finalStats[stat] = baseValue + statBonus;
    }

    // Create the final card object
    const card = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5), // Unique ID
        name: cardType.name,
        type: cardType.type,
        description: cardType.description,
        flavorText: cardType.flavorText,
        rarity: rarity,
        stats: finalStats,
        bonusPercentage: bonus, // The actual bonus applied to stats
        createdAt: new Date().toISOString()
    };

    return card;
}

// Show a modal with the opened cards
function showCardModal(cards) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.right = '0';
    modal.style.bottom = '0';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.zIndex = '1000';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.background = 'white';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.maxWidth = '800px';
    modalContent.style.width = '90%';
    modalContent.style.maxHeight = '90vh';
    modalContent.style.overflowY = 'auto';
    modalContent.style.position = 'relative';
    
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close';
    closeBtn.innerHTML = '&times;';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '10px';
    closeBtn.style.right = '15px';
    closeBtn.style.fontSize = '24px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => document.body.removeChild(modal);
    
    const title = document.createElement('h2');
    title.textContent = 'You got...';
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'cards-container';
    cardsContainer.style.display = 'flex';
    cardsContainer.style.justifyContent = 'center';
    cardsContainer.style.flexWrap = 'wrap';
    cardsContainer.style.gap = '20px';
    cardsContainer.style.margin = '20px 0';
    
    // Add each card to the container
    cards.forEach(card => {
        const cardElement = createCardElement(card, true); // true for pack view
        cardsContainer.appendChild(cardElement);
    });
    
    const continueBtn = document.createElement('button');
    continueBtn.className = 'btn primary';
    continueBtn.textContent = 'Add to Collection';
    continueBtn.style.display = 'block';
    continueBtn.style.margin = '20px auto 0';
    continueBtn.style.padding = '10px 20px';
    continueBtn.onclick = () => {
        document.body.removeChild(modal);
    };
    
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(title);
    modalContent.appendChild(cardsContainer);
    modalContent.appendChild(continueBtn);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

// Expose functions
window.cards = {
    generateCard,
    renderCardCollection,
    createCardElement,
    showCardModal
};
console.log('[cards.js] Script loaded. window.cards is:', window.cards ? 'defined' : 'undefined');

// Create HTML for a card element
function createCardElement(card, isPack = false) {
    const cardElement = document.createElement('div');
    const cardType = CARD_TYPES.find(ct => ct.type === card.type) || CARD_TYPES[0];
    
    if (isPack) {
        // For pack view (simplified)
        cardElement.className = `card-pack ${card.rarity}`;
        cardElement.setAttribute('data-card-type', card.type);
        
        cardElement.innerHTML = `
            <div class="card-pack-inner">
                <div class="card-pack-content">
                    <div class="card-pack-rarity ${card.rarity}"></div>
                    <h3>${card.name}</h3>
                    <p>${card.description}</p>
                    <div class="card-pack-stats">
                        <div class="stat">
                            <span class="stat-label">${ATTRIBUTE_LABELS.str}</span>
                            <span class="stat-value">${card.stats.str}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">${ATTRIBUTE_LABELS.dex}</span>
                            <span class="stat-value">${card.stats.dex}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">${ATTRIBUTE_LABELS.int}</span>
                            <span class="stat-value">${card.stats.int}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        // For collection view (detailed)
        cardElement.className = `card ${card.rarity}`;
        
        // Create stat bars for visual representation
        const createStatBar = (value, max = 40) => {
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
                    <div class="stat ${cardType.primaryStat === 'str' ? 'primary-stat' : ''}">
                        <div class="stat-header">
                            <span class="stat-label">${ATTRIBUTE_LABELS.str}</span>
                            <span class="stat-value">${card.stats.str}</span>
                        </div>
                        ${createStatBar(card.stats.str)}
                    </div>
                    
                    <div class="stat ${cardType.primaryStat === 'dex' ? 'primary-stat' : ''}">
                        <div class="stat-header">
                            <span class="stat-label">${ATTRIBUTE_LABELS.dex}</span>
                            <span class="stat-value">${card.stats.dex}</span>
                        </div>
                        ${createStatBar(card.stats.dex)}
                    </div>
                    
                    <div class="stat ${cardType.primaryStat === 'int' ? 'primary-stat' : ''}">
                        <div class="stat-header">
                            <span class="stat-label">${ATTRIBUTE_LABELS.int}</span>
                            <span class="stat-value">${card.stats.int}</span>
                        </div>
                        ${createStatBar(card.stats.int)}
                    </div>
                </div>
                
                <p class="card-flavor">"${card.flavorText}"</p>
                
                <div class="card-footer">
                    <small>Bonus: ${card.bonusPercentage}%</small>
                    <small>${new Date(card.createdAt).toLocaleDateString()}</small>
                </div>
            </div>
        `;
    }
    
    return cardElement;
}

// Render the card collection
function renderCardCollection() {
    console.log('[renderCardCollection] Starting to render card collection');
    
    const collectionContainer = document.getElementById('card-collection');
    if (!collectionContainer) {
        console.error('[renderCardCollection] Collection container not found');
        return;
    }
    
    console.log('[renderCardCollection] Collection container found');
    
    // Clear the container
    collectionContainer.innerHTML = '';
    
    // Check if storage is available
    if (!window.storage) {
        const errorMsg = '[renderCardCollection] Storage module not found';
        console.error(errorMsg);
        collectionContainer.innerHTML = `<p>Error: ${errorMsg}. Please refresh the page.</p>`;
        return;
    }
    
    if (typeof window.storage.getAllCards !== 'function') {
        const errorMsg = '[renderCardCollection] getAllCards is not a function';
        console.error(errorMsg, 'Available methods:', Object.keys(window.storage));
        collectionContainer.innerHTML = `<p>Error: ${errorMsg}. Please refresh the page.</p>`;
        return;
    }
    
    console.log('[renderCardCollection] Storage module is available');
    
    // Get all cards from storage
    console.log('[renderCardCollection] Getting all cards from storage...');
    let cards = [];
    try {
        cards = window.storage.getAllCards();
        console.log(`[renderCardCollection] Retrieved ${cards.length} cards from storage`);
    } catch (error) {
        console.error('[renderCardCollection] Error getting cards from storage:', error);
        collectionContainer.innerHTML = '<p>Error: Could not load cards. Please refresh the page.</p>';
        return;
    }
    
    // No need to show empty state message anymore
    // The grid will be empty but the stats will still show
    
    // Sort cards by type, then rarity, then total stats
    cards.sort((a, b) => {
        // Sort by type (Dwarf > Bigfoot > Elf)
        const typeOrder = { 'dwarf': 1, 'bigfoot': 2, 'elf': 3 };
        const aType = typeOrder[a.type] || 0;
        const bType = typeOrder[b.type] || 0;
        
        if (aType !== bType) {
            return aType - bType;
        }
        
        // Then by rarity (gold > blue > grey)
        const rarityOrder = { 'gold': 3, 'blue': 2, 'grey': 1 };
        const aRarity = rarityOrder[a.rarity] || 0;
        const bRarity = rarityOrder[b.rarity] || 0;
        
        if (aRarity !== bRarity) {
            return bRarity - aRarity;
        }
        
        // Then by total stats
        const aTotal = Object.values(a.stats).reduce((sum, val) => sum + val, 0);
        const bTotal = Object.values(b.stats).reduce((sum, val) => sum + val, 0);
        return bTotal - aTotal;
    });
    
    // Create a grid container
    const grid = document.createElement('div');
    grid.className = 'cards-grid';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
    grid.style.gap = '20px';
    grid.style.padding = '20px 0';
    
    // Add cards to the grid
    cards.forEach(card => {
        const cardElement = createCardElement(card, false); // false for collection view
        grid.appendChild(cardElement);
    });
    
    // Add collection stats
    const statsContainer = document.createElement('div');
    statsContainer.className = 'collection-stats';
    
    const totalCards = cards.length;
    const goldCards = cards.filter(c => c.rarity === 'gold').length;
    const blueCards = cards.filter(c => c.rarity === 'blue').length;
    const greyCards = cards.filter(c => c.rarity === 'grey').length;
    
    // Create stats elements
    const statsHeader = document.createElement('div');
    statsHeader.style.display = 'flex';
    statsHeader.style.justifyContent = 'space-between';
    statsHeader.style.alignItems = 'center';
    statsHeader.style.marginBottom = '15px';
    
    const statsTitle = document.createElement('h3');
    statsTitle.textContent = 'Collection Overview';
    statsTitle.style.margin = '0';
    
    const emptyCollectionBtn = document.createElement('button');
    emptyCollectionBtn.id = 'empty-collection-btn';
    emptyCollectionBtn.className = 'btn danger';
    emptyCollectionBtn.textContent = 'Empty Collection';
    emptyCollectionBtn.style.marginLeft = '15px';
    
    statsHeader.appendChild(statsTitle);
    statsHeader.appendChild(emptyCollectionBtn);
    
    // Add event listener for the empty collection button
    emptyCollectionBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to empty your collection? This cannot be undone.')) {
            window.storage.clearCardCollection();
            window.cards.renderCardCollection();
            showNotification('Collection has been cleared', 'info');
        }
    });
    
    const statsGrid = document.createElement('div');
    statsGrid.className = 'stats-grid';
    statsGrid.style.display = 'grid';
    statsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(150px, 1fr))';
    statsGrid.style.gap = '15px';
    statsGrid.style.marginBottom = '20px';
    
    const createStatBox = (label, value, color = '') => {
        const box = document.createElement('div');
        box.className = 'stat-box';
        box.style.background = '#fff';
        box.style.padding = '15px';
        box.style.borderRadius = '8px';
        box.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        box.style.textAlign = 'center';
        
        const valueEl = document.createElement('div');
        valueEl.textContent = value;
        valueEl.style.fontSize = '1.5em';
        valueEl.style.fontWeight = 'bold';
        valueEl.style.color = color || 'var(--text-color)';
        valueEl.style.marginBottom = '5px';
        
        const labelEl = document.createElement('div');
        labelEl.textContent = label;
        labelEl.style.fontSize = '0.9em';
        labelEl.style.color = 'var(--text-light)';
        
        box.appendChild(valueEl);
        box.appendChild(labelEl);
        return box;
    };
    
    // Add stat boxes
    statsGrid.appendChild(createStatBox('Total Cards', totalCards, 'var(--primary-color)'));
    statsGrid.appendChild(createStatBox('Gold Cards', goldCards, '#ffd700'));
    statsGrid.appendChild(createStatBox('Blue Cards', blueCards, '#4fc3dc'));
    statsGrid.appendChild(createStatBox('Grey Cards', greyCards, '#999'));
    
    // Add type distribution
    const typeCounts = cards.reduce((acc, card) => {
        acc[card.type] = (acc[card.type] || 0) + 1;
        return acc;
    }, {});
    
    const typeStats = document.createElement('div');
    typeStats.className = 'type-stats';
    typeStats.style.marginTop = '15px';
    typeStats.style.paddingTop = '15px';
    typeStats.style.borderTop = '1px solid #eee';
    
    const typeTitle = document.createElement('h4');
    typeTitle.textContent = 'By Type';
    typeTitle.style.marginBottom = '10px';
    typeTitle.style.color = 'var(--text-color)';
    
    const typeGrid = document.createElement('div');
    typeGrid.style.display = 'grid';
    typeGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(120px, 1fr))';
    typeGrid.style.gap = '10px';
    
    Object.entries(typeCounts).forEach(([type, count]) => {
        const typeBox = document.createElement('div');
        typeBox.className = 'type-box';
        typeBox.style.background = '#fff';
        typeBox.style.padding = '10px';
        typeBox.style.borderRadius = '6px';
        typeBox.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
        typeBox.style.display = 'flex';
        typeBox.style.justifyContent = 'space-between';
        typeBox.style.alignItems = 'center';
        
        const typeName = document.createElement('span');
        typeName.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        typeName.style.fontWeight = '500';
        
        const typeCount = document.createElement('span');
        typeCount.textContent = count;
        typeCount.style.background = 'var(--primary-color)';
        typeCount.style.color = 'white';
        typeCount.style.borderRadius = '12px';
        typeCount.style.padding = '2px 8px';
        typeCount.style.fontSize = '0.8em';
        
        typeBox.appendChild(typeName);
        typeBox.appendChild(typeCount);
        typeGrid.appendChild(typeBox);
    });
    
    typeStats.appendChild(typeTitle);
    typeStats.appendChild(typeGrid);
    
    // Assemble stats container
    statsContainer.appendChild(statsHeader);
    statsContainer.appendChild(statsGrid);
    statsContainer.appendChild(typeStats);
    
    // Add stats and grid to the container
    collectionContainer.innerHTML = ''; // Clear any existing content
    collectionContainer.appendChild(statsContainer);
    collectionContainer.appendChild(grid);
}

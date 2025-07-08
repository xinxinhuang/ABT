// Core card generation logic

/**
 * Calculate bonus based on wait time (4-24 hours).
 * @param {number} elapsedHours - The time elapsed since the last pack opening.
 * @returns {number} The bonus percentage (1-20).
 */
function calculateBonus(elapsedHours) {
    // Ensure elapsedHours is between 4 and 24
    const hours = Math.min(Math.max(elapsedHours, 4), 24);
    // Linear scale: 4h = 1%, 24h = 20%
    const bonusPercentage = Math.floor((hours - 4) * 1);
    return Math.min(Math.max(bonusPercentage, 1), 20);
}

/**
 * Roll a random number between min and max (inclusive).
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} A random integer within the range.
 */
function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a card with random attributes based on a bonus percentage.
 * @param {number} bonusPercentage - The bonus percentage for rarity rolls.
 * @param {Array} cardTypes - An array of card type objects from a booster pack.
 * @returns {object|null} The generated card object or null if cardTypes is invalid.
 */
function generateCard(bonusPercentage, cardTypes) {
    if (!cardTypes || cardTypes.length === 0) {
        console.error('generateCard requires an array of cardTypes.');
        return null;
    }

    // Select a random card type
    const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];

    // Determine rarity and bonus based on probability
    let rarity = 'bronze';
    let bonus = 0;
    const roll = randomInRange(1, 100);

    // Gold (Legendary): +15 to +20 bonus (e.g., 5% chance at max bonus)
    if (roll <= bonusPercentage * 0.25) {
        rarity = 'gold';
        bonus = randomInRange(15, 20);
    } 
    // Silver (Rare): +5 to +14 bonus (e.g., 15% chance at max bonus)
    else if (roll <= bonusPercentage * 0.75) {
        rarity = 'silver';
        bonus = randomInRange(5, 14);
    }
    // Bronze (Common): +0 to +4 bonus
    else {
        bonus = randomInRange(0, 4);
    }

    // Apply bonus to stats
    const finalStats = {};
    for (const [stat, baseValue] of Object.entries(cardType.baseStats)) {
        // Primary stat gets the full bonus, others get half (rounded down)
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
        bonusPercentage: bonus, // The actual bonus applied to the primary stat
        createdAt: new Date().toISOString()
    };

    return card;
}

// Expose functions for other scripts
window.cardLogic = {
    calculateBonus,
    randomInRange,
    generateCard
};

console.log('[card-logic.js] Script loaded. window.cardLogic is defined.');

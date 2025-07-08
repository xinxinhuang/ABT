// Domain model for the Weapon Booster Pack

// Domain model for the Weapon Booster Pack

// Expose for other scripts
window.boosterPacks = window.boosterPacks || {};
window.boosterPacks.weapon = {
    ATTRIBUTE_LABELS: {
        str: 'Strength',
        dex: 'Dexterity',
        int: 'Intelligence'
    },
    CARD_TYPES: [
        {
            name: 'Shield of the Sentinel',
            type: 'shield',
            description: 'A formidable shield pulsing with arcane energy.',
            primaryStat: 'int',
            baseStats: {
                str: 0,
                dex: 0,
                int: 20
            },
            flavorText: 'The best offense is an unbreakable defense.'
        },
        {
            name: 'Blade of the Swift',
            type: 'sword',
            description: 'A razor-sharp sword, light and deadly.',
            primaryStat: 'dex',
            baseStats: {
                str: 0,
                dex: 20,
                int: 0
            },
            flavorText: 'A blur of steel, a whisper of death.'
        },
        {
            name: 'Hammer of the Titan',
            type: 'hammer',
            description: 'A massive hammer that crushes foes with raw power.',
            primaryStat: 'str',
            baseStats: {
                str: 20,
                dex: 0,
                int: 0
            },
            flavorText: 'Might makes right.'
        }
    ]
};

console.log('[weapon-pack.js] Script loaded. window.boosterPacks.weapon is defined.');

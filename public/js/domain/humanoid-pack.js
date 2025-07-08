// Domain model for the Humanoid Booster Pack

// Domain model for the Humanoid Booster Pack

// Expose for other scripts
window.boosterPacks = window.boosterPacks || {};
window.boosterPacks.humanoid = {
    ATTRIBUTE_LABELS: {
        str: 'Strength',
        dex: 'Dexterity',
        int: 'Intelligence'
    },
    CARD_TYPES: [
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
    ]
};

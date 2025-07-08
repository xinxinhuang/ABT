# Weapon Pack Booster System - Development Instructions

## Overview
A JavaScript-based weapon booster pack system that integrates with the existing Humanoid Pack system. Features timed opening mechanics with single-attribute weapon cards that provide specialized combat bonuses.

## Weapon Pack Features

### 1. Weapon Card Types
- **Shield** (INT focused: 20-40 range)
- **Sword** (DEX focused: 20-40 range) 
- **Hammer** (STR focused: 20-40 range)

### 2. Attribute System
- **Single Attribute**: Each weapon has only one primary attribute
- **Base Stats**: 20 for the weapon's primary attribute
- **Bonus Range**: +1 to +20 based on wait time
- **No Secondary Stats**: Unlike humanoid cards, weapons are specialized

### 3. Rarity System
- **Grey**: Base stats (20)
- **Blue**: +5 to +14 bonus (25-34 total)
- **Gold**: +15 to +20 bonus (35-40 total)

### 4. Timer Mechanics
- **Minimum Wait**: 4 hours
- **Maximum Wait**: 24 hours
- **Bonus Calculation**: 
  - 4 hours = 1% chance for max roll
  - 24 hours = 20% chance for max roll
  - Linear scaling: `bonus% = min(max(elapsedHours - 4, 0), 20)`

## Technical Implementation

### Local Storage Schema
```javascript
// Weapon Pack Inventory
{
  "weaponPacks": 5,
  "cards": [
    {
      "id": "weapon_001",
      "type": "weapon",
      "name": "Shield",
      "int": 32,
      "rarity": "blue",
      "timestamp": "2025-07-06T12:00:00Z"
    },
    {
      "id": "weapon_002", 
      "type": "weapon",
      "name": "Hammer",
      "str": 38,
      "rarity": "gold",
      "timestamp": "2025-07-06T12:00:00Z"
    }
  ]
}

// Weapon Pack Timers
{
  "activeTimers": [
    {
      "id": "weapon_timer_001",
      "packType": "weapon",
      "startTime": "2025-07-06T12:00:00Z",
      "targetDelay": 16,
      "status": "active"
    }
  ]
}
```

### Core Functions

#### 1. Weapon Card Generation
```javascript
// Weapon card configuration
const WEAPON_TYPES = {
  SHIELD: { name: "Shield", attribute: "int" },
  SWORD: { name: "Sword", attribute: "dex" },
  HAMMER: { name: "Hammer", attribute: "str" }
};

// Generate weapon card
function generateWeaponCard(bonusPercentage) {
  const weaponKeys = Object.keys(WEAPON_TYPES);
  const selectedKey = weaponKeys[Math.floor(Math.random() * weaponKeys.length)];
  const selectedWeapon = WEAPON_TYPES[selectedKey];
  
  const attributeValue = rollWeaponAttribute(20, bonusPercentage);
  
  const card = {
    id: generateUniqueId(),
    type: "weapon",
    name: selectedWeapon.name,
    [selectedWeapon.attribute]: attributeValue,
    rarity: determineWeaponRarity(attributeValue),
    timestamp: new Date().toISOString()
  };
  
  return card;
}

// Roll weapon attribute with bonus
function rollWeaponAttribute(baseValue, bonusPercentage) {
  const maxBonus = 20;
  const roll = Math.random() * 100;
  
  if (roll <= bonusPercentage) {
    // Bonus roll: scale from base+1 to base+maxBonus
    const bonusAmount = Math.floor(Math.random() * maxBonus) + 1;
    return baseValue + bonusAmount;
  } else {
    // Normal roll: return base value
    return baseValue;
  }
}

// Determine weapon rarity based on attribute value
function determineWeaponRarity(attributeValue) {
  if (attributeValue >= 35) return "gold";
  if (attributeValue >= 25) return "blue";
  return "grey";
}
```

#### 2. Weapon Pack Management
```javascript
// Check weapon pack availability
function hasWeaponPacks() {
  const inventory = getInventory();
  return inventory.weaponPacks > 0;
}

// Consume weapon pack
function consumeWeaponPack() {
  const inventory = getInventory();
  if (inventory.weaponPacks > 0) {
    inventory.weaponPacks--;
    saveInventory(inventory);
    return true;
  }
  return false;
}

// Add weapon packs (for testing/rewards)
function addWeaponPacks(quantity = 1) {
  const inventory = getInventory();
  inventory.weaponPacks += quantity;
  saveInventory(inventory);
  updateWeaponPackDisplay();
}
```

#### 3. Weapon Timer System
```javascript
// Start weapon pack timer
function startWeaponPackTimer(delayHours) {
  if (!hasWeaponPacks()) {
    showError("No weapon packs available");
    return false;
  }
  
  if (delayHours < 4 || delayHours > 24) {
    showError("Timer must be between 4 and 24 hours");
    return false;
  }
  
  const timer = {
    id: generateUniqueId(),
    packType: "weapon",
    startTime: new Date().toISOString(),
    targetDelay: delayHours,
    status: "active"
  };
  
  // Consume pack immediately
  consumeWeaponPack();
  
  // Save timer
  saveTimer(timer);
  
  // Update UI
  updateTimerDisplay();
  
  return true;
}

// Open weapon pack from timer
function openWeaponPack(timerId) {
  const timer = getTimer(timerId);
  if (!timer || timer.packType !== "weapon") {
    showError("Invalid weapon pack timer");
    return;
  }
  
  const elapsedHours = calculateElapsedHours(timer.startTime);
  if (elapsedHours < 4) {
    showError("Must wait at least 4 hours");
    return;
  }
  
  const bonusPercentage = calculateBonus(elapsedHours);
  const weaponCard = generateWeaponCard(bonusPercentage);
  
  // Add to collection
  addCardToCollection(weaponCard);
  
  // Remove timer
  removeTimer(timerId);
  
  // Show opening animation
  showWeaponOpeningAnimation(weaponCard);
  
  // Update UI
  updateTimerDisplay();
  updateCollectionDisplay();
}
```

### UI Components

#### 1. Weapon Pack Selection
```html
<div class="weapon-pack-section">
  <div class="pack-header">
    <h3>Weapon Packs</h3>
    <span class="pack-count" id="weapon-pack-count">0</span>
  </div>
  <button class="open-pack-btn" id="open-weapon-pack-btn" disabled>
    Open with Timer
  </button>
</div>
```

#### 2. Weapon Timer Display
```html
<div class="weapon-timer" data-timer-id="weapon_timer_001">
  <div class="timer-header">
    <span class="pack-type-indicator weapon">Weapon Pack</span>
    <span class="timer-id">#001</span>
  </div>
  <div class="timer-progress">
    <div class="progress-bar">
      <div class="progress-fill" style="width: 45%"></div>
      <div class="minimum-marker" style="left: 16.67%"></div>
    </div>
    <div class="timer-text">Ready in 8h 30m</div>
  </div>
  <button class="open-now-btn" disabled>Open Now</button>
</div>
```

#### 3. Weapon Card Display
```html
<div class="weapon-card gold" data-card-id="weapon_001">
  <div class="card-type-indicator">⚔️</div>
  <div class="card-name">Shield</div>
  <div class="card-stats">
    <div class="stat-item">
      <span class="stat-name">INT</span>
      <span class="stat-value">37</span>
    </div>
  </div>
  <div class="rarity-indicator gold"></div>
</div>
```

### CSS Styling

#### 1. Weapon Pack Styling
```css
.weapon-pack-section {
  border: 2px solid #8B4513;
  background: linear-gradient(135deg, #D2691E, #CD853F);
}

.pack-type-indicator.weapon {
  background: linear-gradient(90deg, #8B4513, #A0522D);
  color: white;
}

.weapon-card {
  border: 2px solid #8B4513;
  background: linear-gradient(135deg, #F5DEB3, #DEB887);
}

.weapon-card .card-type-indicator {
  font-size: 24px;
  color: #8B4513;
}
```

#### 2. Weapon Rarity Colors
```css
.weapon-card.grey {
  border-color: #808080;
  box-shadow: 0 0 10px rgba(128, 128, 128, 0.3);
}

.weapon-card.blue {
  border-color: #4169E1;
  box-shadow: 0 0 10px rgba(65, 105, 225, 0.5);
}

.weapon-card.gold {
  border-color: #FFD700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.7);
}
```

## Integration Points

### 1. With Humanoid Pack System
- **Shared Timer System**: Use same timer mechanics and UI
- **Unified Collection**: Display both card types together
- **Consistent Rarity System**: Same color coding and bonus calculations

### 2. With Main Application
- **Pack Selection**: Toggle between humanoid and weapon packs
- **Timer Management**: Handle both pack types in same timer list
- **Collection Display**: Mixed card display with type indicators

### 3. With Local Storage
- **Shared Schema**: Use same localStorage structure
- **Unified Functions**: Extend existing storage utilities
- **Consistent Naming**: Follow established patterns

## Development Phases

### Phase 1: Core Weapon System
1. Implement weapon card generation
2. Add weapon pack inventory management
3. Create weapon-specific timer functions
4. Test weapon attribute rolling

### Phase 2: UI Integration
1. Add weapon pack selection interface
2. Integrate weapon timers into existing display
3. Create weapon card display components
4. Add weapon-specific styling

### Phase 3: Animation & Polish
1. Implement weapon pack opening animation
2. Add weapon-specific visual effects
3. Create weapon card reveal animations
4. Polish weapon pack interactions

### Phase 4: Testing & Validation
1. Test weapon pack timer accuracy
2. Validate weapon attribute generation
3. Ensure proper rarity distribution
4. Test integration with humanoid system

## Testing Scenarios
1. **Single Weapon Pack**: Open one weapon pack after 4h wait
2. **Extended Weapon Wait**: Test 24h maximum bonus for weapons
3. **Mixed Pack Types**: Run both humanoid and weapon timers simultaneously
4. **Weapon Rarity**: Verify correct rarity distribution for weapons
5. **Collection Display**: Ensure weapons display correctly with humanoids

## Success Metrics
- Correct weapon attribute generation (single attribute only)
- Proper weapon rarity color coding
- Smooth integration with existing timer system
- Intuitive weapon pack selection
- Accurate weapon bonus calculations

## Notes
- Weapons are simpler than humanoids (single attribute)
- Use consistent visual design with humanoid packs
- Maintain same timer mechanics for consistency
- Focus on weapon specialization (INT/DEX/STR focus)
- Plan for easy addition of more weapon types
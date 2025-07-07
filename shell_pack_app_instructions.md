# Shell Pack Booster Web Application - Development Instructions

## Overview
A JavaScript-based web application implementing a timed "Shell Pack" booster opening system with temporary local storage. Players can open card packs with delayed timers to increase chances of better card attributes.

## Core Features

### 1. Card System
- **Card Types**: 3 common body-shell cards
  - **Dwarf — Heavy Arms** (STR focused)
  - **Big Foot — Large Feet** (DEX focused) 
  - **Elf — Large Head** (INT focused)

### 2. Attribute System
- **Base Stats**: 20 for primary attribute
- **Bonus Range**: +1 to +20 based on wait time
- **Rarity Colors**:
  - Grey: Base stats (20)
  - Blue: +5 to +14 bonus
  - Gold: +15 to +20 bonus

### 3. Timer Mechanics
- **Minimum Wait**: 4 hours
- **Maximum Wait**: 24 hours
- **Bonus Calculation**: 
  - 4 hours = 1% chance for max roll
  - 24 hours = 20% chance for max roll
  - Linear scaling between 4-24 hours

## Technical Requirements

### Local Storage Structure
```javascript
// Player Inventory
{
  "shellPacks": 0,
  "cards": [
    {
      "id": "unique_id",
      "name": "Dwarf — Heavy Arms",
      "str": 25,
      "dex": 20,
      "int": 20,
      "rarity": "blue",
      "timestamp": "2025-07-06T12:00:00Z"
    }
  ]
}

// Active Timers
{
  "activeTimers": [
    {
      "id": "timer_id",
      "startTime": "2025-07-06T12:00:00Z",
      "targetDelay": 12, // hours
      "status": "active" // "active", "ready", "opened"
    }
  ]
}
```

### Visual Components

#### 1. Card Pack Visualization
- **Shape**: Rectangle with rounded corners
- **Size**: 120px width × 180px height
- **Colors**: Gradient background suggesting mystery
- **Animation**: Subtle glow effect when hoverable

#### 2. Opening Animation
- **Flash Effect**: White overlay with opacity fade
- **Duration**: 0.5 seconds
- **Card Reveal**: Slide-in animation from center

#### 3. Timer Display
- **Progress Bar**: Shows time until 24 hours
- **Minimum Indicator**: Mark at 4-hour point
- **Status Text**: "Ready in X hours" or "Ready to open!"

### Core Functions

#### 1. Timer Management
```javascript
// Start new timer
function startTimer(delayHours) {
  // Validate 4 ≤ delayHours ≤ 24
  // Create timer object
  // Store in localStorage
  // Update UI
}

// Check timer status
function checkTimerStatus(timerId) {
  // Calculate elapsed time
  // Return status: "waiting", "ready"
}

// Calculate bonus percentage
function calculateBonus(elapsedHours) {
  // Linear scale: 4h = 1%, 24h = 20%
  // Formula: min(max(elapsedHours - 4, 0), 20)
}
```

#### 2. Card Generation
```javascript
// Generate card with attributes
function generateCard(bonusPercentage) {
  // Roll for card type (equal probability)
  // Apply bonus to primary attribute
  // Determine rarity color
  // Return card object
}

// Attribute rolling
function rollAttribute(baseValue, bonusPercentage) {
  // Random roll with bonus chance
  // Return value between base and (base + 20)
}
```

#### 3. Inventory Management
```javascript
// Add shell pack to inventory
function addShellPack(quantity = 1) {
  // Update localStorage
  // Refresh UI
}

// Remove shell pack
function consumeShellPack() {
  // Validate availability
  // Decrease count
  // Update localStorage
}

// Add card to collection
function addCardToCollection(card) {
  // Generate unique ID
  // Add to cards array
  // Update localStorage
  // Show notification
}
```

## UI Layout

### Main Screen
1. **Header**: "Shell Pack Booster"
2. **Inventory Section**: 
   - Shell Packs count
   - "Add Pack" button (for testing)
3. **Active Timers Section**:
   - List of ongoing timers
   - Progress bars
   - "Open Now" buttons (enabled after 4h)
4. **Card Collection Section**:
   - Grid of collected cards
   - Stats display on hover/click

### Timer Setup Modal
1. **Timer Slider**: 4-24 hours
2. **Bonus Explanation**: "Every hour after 4h adds +1% chance for better stats (max +20% at 24h)"
3. **Confirm Button**: Start timer
4. **Cancel Button**: Close modal

### Card Opening Modal
1. **Pack Animation**: Rectangle with opening effect
2. **Card Reveal**: Show card with stats
3. **Rarity Indication**: Color-coded border
4. **Continue Button**: Add to collection

## Development Steps

### Phase 1: Core Structure
1. Create HTML skeleton
2. Set up CSS for card pack visualization
3. Implement localStorage utilities
4. Create basic inventory system

### Phase 2: Timer System
1. Implement timer creation and storage
2. Add progress bar visualization
3. Create timer checking mechanism
4. Handle timer completion states

### Phase 3: Card Generation
1. Implement card type selection
2. Add attribute rolling with bonuses
3. Create rarity determination
4. Add card to collection system

### Phase 4: UI Polish
1. Add opening animations
2. Implement flash effects
3. Create responsive layout
4. Add notification system

### Phase 5: Testing & Refinement
1. Test timer accuracy
2. Validate probability calculations
3. Ensure localStorage persistence
4. Debug edge cases

## File Structure
```
shell-pack-app/
├── index.html
├── styles.css
├── script.js
├── utils/
│   ├── storage.js
│   ├── timer.js
│   └── cards.js
└── assets/
    └── (any additional resources)
```

## Testing Scenarios
1. **Basic Flow**: Open pack immediately after 4h wait
2. **Extended Wait**: Test 24h maximum bonus
3. **Multiple Timers**: Handle several concurrent timers
4. **Page Refresh**: Ensure timers persist across sessions
5. **Edge Cases**: Validate boundary conditions (exactly 4h, 24h)

## Success Metrics
- Timer accuracy within 1-minute tolerance
- Proper bonus calculation
- Smooth animations (60fps target)
- Persistent storage across browser sessions
- Intuitive user experience

## Notes
- Start with empty inventory (add test button for Shell Packs)
- Focus on core functionality before visual polish
- Ensure all calculations are client-side
- Use modern JavaScript features (ES6+)
- Make responsive for mobile devices
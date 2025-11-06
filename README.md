# Warhammer-Inspired Dungeon Crawler RPG

A turn-based dungeon crawler RPG web application inspired by Warhammer Fantasy Roleplay (WFRP), built with modern web technologies.

## Tech Stack

- **Frontend**: Astro + React + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: Prisma ORM (SQLite for dev, PostgreSQL for production)

## Features

- **Character Creation**: Choose from 4 races (Human, Dwarf, Elf, Halfling) and multiple classes
- **Village Customization**: Design your own village by selecting which services are available - more services = easier game, fewer services = harder challenge
- **Random Village Events**: Optional gameplay mode where shops may be temporarily closed due to weddings, festivals, sickness, etc.
- **WFRP-inspired Stats**: Weapon Skill, Ballistic Skill, Strength, Toughness, Initiative, Agility, Dexterity, Intelligence, Willpower, Fellowship
- **Turn-based Combat**: Initiative-based combat with modifiers
- **Procedurally Generated Dungeons**: Explore randomly generated dungeon grids
- **Multi-Level Dungeons**: Descend deeper for greater challenges and better rewards
- **Skill Progression**: Skills improve with use, bonus/penalty modifiers based on practice
- **Inventory & Trading**: Collect equipment, trade with gold (if you have merchants!)
- **Magic System**: Cast spells using mana

## Project Structure

```
/crawler
  /client       - Astro + React frontend
  /server       - Express backend with Prisma
  /shared       - Shared TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Install all dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start development servers (both frontend and backend)
npm run dev
```

### Development Commands

```bash
npm run dev              # Start both client and server
npm run dev:client       # Start Astro dev server only
npm run dev:server       # Start Express server only
npm run build            # Build all workspaces
npm run db:studio        # Open Prisma Studio
```

## Game Mechanics

### Multi-Level Dungeon System
The dungeon has multiple levels with increasing difficulty:

#### **Level 0: The Village (Safe Haven)**
**Customizable Village Creation**: Before or after character creation, the player designs their own village by choosing which services to include. This creates strategic trade-offs and increases replayability.

**Available Services to Choose From**:
- **Weapon Smith**: Buy/sell/upgrade weapons
- **Armor Smith**: Buy/sell/upgrade armor  
- **Potion Shop**: Buy health potions, mana potions, antidotes
- **Ye Olde Tavern**: Rest to restore HP/MP, hire companions, hear rumors
- **General Merchant**: Buy/sell general goods and supplies
- **Temple/Healer**: Cure ailments, remove curses, resurrection services
- **Blacksmith Workshop**: Repair damaged equipment
- **Enchanter**: Add magical properties to items
- **Alchemist**: Craft potions from ingredients found in dungeon
- **Training Ground**: Practice skills between dungeon runs

**Strategic Implications**:
- **All Services**: Easiest mode - full access to upgrades, healing, and equipment
- **Limited Services**: More challenging - must rely on dungeon loot and careful resource management
- **No Weapon Smith**: Forces you to use whatever weapons you find as loot
- **No Temple**: Cannot cure curses or resurrect - permadeath becomes more dangerous
- **No Potion Shop**: Must rely on loot potions or Alchemist crafting

**Random Availability Mode (Optional Gameplay Modifier)**:
Even if you selected a service during village creation, there's a chance it might be temporarily unavailable when you return from the dungeon!

**Random Events**:
- **"The blacksmith is at a wedding in the neighboring village"** - Cannot repair equipment
- **"The potion shop is closed - the owner is gathering rare herbs"** - No potions available
- **"The temple is holding a sacred ceremony"** - No healing services today
- **"The weapon smith is sick with fever"** - No weapon upgrades
- **"The tavern is full - there's a festival in town!"** - Cannot rest
- **"The enchanter is studying ancient texts in seclusion"** - No enchanting available

**Game Design**: This creates dramatic moments - "After a brutal orc hunt on level 9, your sword is shattered. You return to repair it, only to find the blacksmith at a wedding!" Now you must decide: venture back down with broken equipment, wait (time penalty?), or adapt your strategy.

**Difficulty Settings**:
- **Reliable Village**: Services always available (easier)
- **Realistic Village**: 10-20% chance each service is temporarily unavailable
- **Chaotic Village**: 30-40% chance services unavailable (hardcore mode)

**Design Philosophy**: Each service excluded makes the game harder but also more varied. Players can create their own difficulty level and playstyle through village customization.

#### **Level 1-5+: The Dungeon Depths**
Each level becomes progressively harder:
- **Difficulty Scaling**: Higher levels = more combat rooms, tougher enemies, better loot
- **EXIT Room** (🏁): Descend deeper to Level N+1
- **ENTRANCE Room** (🚪): Ascend back to Level N-1 (or return to Village from Level 1)
- **Room Distribution by Difficulty**:
  - Level 1: 20% combat, 30% treasure, 15% merchant
  - Level 3: 40% combat, 24% treasure, 9% merchant  
  - Level 5+: 60% combat, 15% treasure, 5% merchant

**Progression Loop**: Village → Descend → Explore → Find Exit → Go Deeper → Die or Escape back to Village

### Character Stats (WFRP-based)
- **WS** (Weapon Skill): Melee combat proficiency
- **BS** (Ballistic Skill): Ranged combat proficiency
- **S** (Strength): Physical power
- **T** (Toughness): Resilience and damage resistance
- **I** (Initiative): Turn order in combat
- **Ag** (Agility): Speed and reflexes
- **Dex** (Dexterity): Fine motor skills
- **Int** (Intelligence): Learning and magic power
- **WP** (Willpower): Mental fortitude and spell resistance
- **Fel** (Fellowship): Social interaction

### Combat System
- Initiative-based turn order
- Action points system
- Weapon proficiency affects hit chance
- Armor reduces damage

### Progression System
- Experience points from combat and exploration
- Skill-based advancement: frequently used skills gain bonuses
- Neglected skills may gain penalties
- Character levels unlock new abilities
- **Upgrade Points**: Gained on level-up based on (INT + WP) / 4
  - **Skills**: Cost 1 point each (Dodge, Block, Parry, Lockpicking, Stealth, Perception)
  - **Stats**: Cost 3 points each (WS, BS, S, T, I, Ag, Dex, Int, WP, Fel)

## Roadmap

### ✅ Completed
- [x] Character creation with stat generation and race/class selection
- [x] Procedural dungeon generation (20x20 maze with recursive backtracking)
- [x] Dungeon exploration with minimap and movement
- [x] Character progression and leveling system
- [x] Upgrade point system for skills and stats
- [x] Multi-level dungeon system with difficulty scaling

### 🚧 In Progress
- [ ] **Village Customization System** - Player chooses which services to include in their village
- [ ] **Level 0: Village Hub** - Safe area with selected merchants and services
- [ ] **Random Village Events** - Optional mode where services may be temporarily unavailable
- [ ] **Combat System** - Turn-based combat with enemies scaled to dungeon difficulty

### 📋 Planned
- [ ] Village service implementations (Weapon Smith, Armor Smith, Potion Shop, etc.)
- [ ] Strategic difficulty scaling based on village choices
- [ ] Random event system with humorous flavor text
- [ ] Multiple difficulty presets (Reliable/Realistic/Chaotic Village)
- [ ] Enemy spawning in COMBAT rooms (difficulty-based stats)
- [ ] Loot system with treasure chests and item drops
- [ ] Inventory management UI with equipment slots
- [ ] Item system (weapons, armor, consumables)
- [ ] Trading interface for village merchants
- [ ] Equipment repair and upgrade mechanics
- [ ] Magic/spell casting system
- [ ] Item enchanting and potion crafting
- [ ] Status effects (poison, bleeding, buffs)
- [ ] Save/load game state
- [ ] Permadeath option for hardcore mode
- [ ] Achievement system for village customization challenges (e.g., "Beat the game with no Temple")

## License

MIT

// ============================================================================
// ENUMS
// ============================================================================

export enum Race {
  HUMAN = 'HUMAN',
  DWARF = 'DWARF',
  ELF = 'ELF',
  HALFLING = 'HALFLING'
}

export enum CharacterClass {
  WARRIOR = 'WARRIOR',
  ROGUE = 'ROGUE',
  MAGE = 'MAGE',
  CLERIC = 'CLERIC',
  RANGER = 'RANGER'
}

export enum ItemType {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR',
  POTION = 'POTION',
  SCROLL = 'SCROLL',
  ACCESSORY = 'ACCESSORY',
  MISC = 'MISC'
}

export enum ItemRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

export enum WeaponType {
  MELEE = 'MELEE',
  RANGED = 'RANGED',
  MAGIC = 'MAGIC'
}

export enum ArmorSlot {
  HEAD = 'HEAD',
  CHEST = 'CHEST',
  LEGS = 'LEGS',
  HANDS = 'HANDS',
  FEET = 'FEET'
}

export enum SpellSchool {
  FIRE = 'FIRE',
  ICE = 'ICE',
  LIGHTNING = 'LIGHTNING',
  HEALING = 'HEALING',
  DARK = 'DARK',
  LIGHT = 'LIGHT',
  NATURE = 'NATURE'
}

export enum DungeonRoomType {
  EMPTY = 'EMPTY',
  COMBAT = 'COMBAT',
  TREASURE = 'TREASURE',
  MERCHANT = 'MERCHANT',
  BOSS = 'BOSS',
  ENTRANCE = 'ENTRANCE',
  EXIT = 'EXIT',
  TRAP = 'TRAP'
}

export enum CombatActionType {
  ATTACK = 'ATTACK',
  DEFEND = 'DEFEND',
  CAST_SPELL = 'CAST_SPELL',
  USE_ITEM = 'USE_ITEM',
  FLEE = 'FLEE'
}

// ============================================================================
// CHARACTER STATS (WFRP-inspired)
// ============================================================================

export interface CharacterStats {
  // Combat stats
  weaponSkill: number;      // WS - Melee combat proficiency
  ballisticSkill: number;   // BS - Ranged combat proficiency
  strength: number;         // S - Physical power, damage bonus
  toughness: number;        // T - Resilience, damage reduction
  
  // Physical stats
  initiative: number;       // I - Turn order in combat
  agility: number;         // Ag - Speed, dodge chance
  dexterity: number;       // Dex - Fine motor skills, disarm traps
  
  // Mental stats
  intelligence: number;    // Int - Learning, magic power
  willpower: number;       // WP - Mental fortitude, spell resistance
  fellowship: number;      // Fel - Social interaction, trading
}

// Track skill usage for progression system
export interface SkillProgress {
  weaponSkillUses: number;
  ballisticSkillUses: number;
  strengthUses: number;
  toughnessUses: number;
  initiativeUses: number;
  agilityUses: number;
  dexterityUses: number;
  intelligenceUses: number;
  willpowerUses: number;
  fellowshipUses: number;
}

// ============================================================================
// RACE DEFINITIONS
// ============================================================================

export interface RaceDefinition {
  id: Race;
  name: string;
  description: string;
  statModifiers: Partial<CharacterStats>;
  specialAbilities: string[];
}

// ============================================================================
// CLASS DEFINITIONS
// ============================================================================

export interface ClassDefinition {
  id: CharacterClass;
  name: string;
  description: string;
  statModifiers: Partial<CharacterStats>;
  startingEquipment: string[];
  availableSpells?: string[];
}

// ============================================================================
// CHARACTER / PLAYER
// ============================================================================

export interface Character {
  id: string;
  name: string;
  race: Race;
  class: CharacterClass;
  level: number;
  experience: number;
  
  // Core stats
  stats: CharacterStats;
  skillProgress: SkillProgress;
  
  // Resources
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  gold: number;
  
  // Inventory
  inventoryId: string;
  
  // Equipped items
  equippedWeaponId?: string;
  equippedArmorIds: string[];
  
  // Known spells
  knownSpellIds: string[];
  
  // Current position
  currentDungeonId?: string;
  currentRoomX?: number;
  currentRoomY?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ITEMS
// ============================================================================

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  value: number;
  
  // Equipment stats
  weaponType?: WeaponType;
  damage?: number;
  armorSlot?: ArmorSlot;
  armorValue?: number;
  
  // Stat modifiers
  statModifiers?: Partial<CharacterStats>;
  
  // Consumable effects
  healthRestore?: number;
  manaRestore?: number;
  
  isStackable: boolean;
  maxStackSize?: number;
}

export interface InventoryItem {
  id: string;
  itemId: string;
  inventoryId: string;
  quantity: number;
  isEquipped: boolean;
}

export interface Inventory {
  id: string;
  characterId: string;
  maxSlots: number;
  items: InventoryItem[];
}

// ============================================================================
// SPELLS
// ============================================================================

export interface Spell {
  id: string;
  name: string;
  description: string;
  school: SpellSchool;
  manaCost: number;
  damage?: number;
  healing?: number;
  requiredIntelligence: number;
  effectDescription: string;
}

// ============================================================================
// DUNGEON
// ============================================================================

export interface DungeonRoom {
  x: number;
  y: number;
  type: DungeonRoomType;
  isExplored: boolean;
  isVisible: boolean;
  enemyIds?: string[];
  treasureIds?: string[];
  merchantId?: string;
}

export interface Dungeon {
  id: string;
  name: string;
  level: number;
  width: number;
  height: number;
  rooms: DungeonRoom[][];
  characterId: string;
  createdAt: Date;
}

// ============================================================================
// COMBAT
// ============================================================================

export interface Enemy {
  id: string;
  name: string;
  description: string;
  level: number;
  stats: CharacterStats;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  experienceReward: number;
  goldReward: number;
  possibleLootIds: string[];
}

export interface CombatAction {
  type: CombatActionType;
  actorId: string;
  targetId?: string;
  spellId?: string;
  itemId?: string;
}

export interface CombatState {
  id: string;
  dungeonId: string;
  characterId: string;
  enemyIds: string[];
  turnOrder: string[]; // IDs in initiative order
  currentTurnIndex: number;
  isActive: boolean;
  roundNumber: number;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

// Character Creation
export interface CreateCharacterRequest {
  name: string;
  race: Race;
  class: CharacterClass;
}

export interface CreateCharacterResponse {
  character: Character;
  message: string;
}

// Combat Actions
export interface PerformCombatActionRequest {
  combatId: string;
  action: CombatAction;
}

export interface PerformCombatActionResponse {
  success: boolean;
  message: string;
  damage?: number;
  healing?: number;
  combatState: CombatState;
}

// Dungeon Exploration
export interface MoveToDungeonRoomRequest {
  characterId: string;
  dungeonId: string;
  newX: number;
  newY: number;
}

export interface MoveToDungeonRoomResponse {
  success: boolean;
  room: DungeonRoom;
  message: string;
}

// Inventory Management
export interface EquipItemRequest {
  characterId: string;
  itemId: string;
}

export interface EquipItemResponse {
  success: boolean;
  character: Character;
  message: string;
}

// Trading
export interface TradeItemRequest {
  characterId: string;
  itemId: string;
  quantity: number;
  isBuying: boolean; // true for buy, false for sell
}

export interface TradeItemResponse {
  success: boolean;
  character: Character;
  message: string;
}

// ============================================================================
// GAME DATA CONSTANTS
// ============================================================================

export const RACE_DEFINITIONS: Record<Race, RaceDefinition> = {
  [Race.HUMAN]: {
    id: Race.HUMAN,
    name: 'Human',
    description: 'Versatile and adaptable, humans are the most common race in the Old World.',
    statModifiers: {
      // Balanced stats, no major bonuses
      fellowship: 5
    },
    specialAbilities: ['Versatile: +10% experience gain']
  },
  [Race.DWARF]: {
    id: Race.DWARF,
    name: 'Dwarf',
    description: 'Sturdy and resilient, dwarfs are master craftsmen and fierce warriors.',
    statModifiers: {
      toughness: 10,
      strength: 5,
      agility: -5,
      willpower: 5
    },
    specialAbilities: ['Resilient: +20% poison/disease resistance', 'Night Vision']
  },
  [Race.ELF]: {
    id: Race.ELF,
    name: 'Elf',
    description: 'Graceful and long-lived, elves possess keen senses and affinity for magic.',
    statModifiers: {
      agility: 10,
      dexterity: 5,
      intelligence: 5,
      toughness: -5
    },
    specialAbilities: ['Keen Senses: +20% perception', 'Magic Affinity: -10% spell cost']
  },
  [Race.HALFLING]: {
    id: Race.HALFLING,
    name: 'Halfling',
    description: 'Small but lucky, halflings are surprisingly resilient and hard to hit.',
    statModifiers: {
      agility: 10,
      dexterity: 10,
      fellowship: 5,
      strength: -5,
      toughness: -5
    },
    specialAbilities: ['Lucky: Reroll failed saves once per combat', 'Small Target: +10% dodge']
  }
};

export const CLASS_DEFINITIONS: Record<CharacterClass, ClassDefinition> = {
  [CharacterClass.WARRIOR]: {
    id: CharacterClass.WARRIOR,
    name: 'Warrior',
    description: 'A master of weapons and armor, excelling in close combat.',
    statModifiers: {
      weaponSkill: 15,
      strength: 10,
      toughness: 10
    },
    startingEquipment: ['Iron Sword', 'Leather Armor', 'Small Shield', 'Health Potion']
  },
  [CharacterClass.ROGUE]: {
    id: CharacterClass.ROGUE,
    name: 'Rogue',
    description: 'A nimble fighter skilled in stealth, traps, and precision strikes.',
    statModifiers: {
      agility: 15,
      dexterity: 15,
      initiative: 10
    },
    startingEquipment: ['Daggers', 'Leather Armor', 'Lockpicks', 'Smoke Bomb']
  },
  [CharacterClass.MAGE]: {
    id: CharacterClass.MAGE,
    name: 'Mage',
    description: 'A wielder of arcane power, casting devastating spells.',
    statModifiers: {
      intelligence: 20,
      willpower: 15,
      toughness: -5
    },
    startingEquipment: ['Wooden Staff', 'Robes', 'Spellbook', 'Mana Potion'],
    availableSpells: ['Fireball', 'Magic Missile', 'Shield']
  },
  [CharacterClass.CLERIC]: {
    id: CharacterClass.CLERIC,
    name: 'Cleric',
    description: 'A holy warrior who channels divine magic for healing and protection.',
    statModifiers: {
      willpower: 15,
      fellowship: 10,
      toughness: 5,
      intelligence: 5
    },
    startingEquipment: ['Mace', 'Chainmail', 'Holy Symbol', 'Healing Potion'],
    availableSpells: ['Heal', 'Bless', 'Smite']
  },
  [CharacterClass.RANGER]: {
    id: CharacterClass.RANGER,
    name: 'Ranger',
    description: 'A skilled hunter and tracker, deadly with bow and blade.',
    statModifiers: {
      ballisticSkill: 15,
      agility: 10,
      dexterity: 10,
      initiative: 5
    },
    startingEquipment: ['Shortbow', 'Arrows', 'Hunting Knife', 'Leather Armor']
  }
};

// Base starting stats (before race/class modifiers)
export const BASE_STARTING_STATS: CharacterStats = {
  weaponSkill: 20,
  ballisticSkill: 20,
  strength: 20,
  toughness: 20,
  initiative: 20,
  agility: 20,
  dexterity: 20,
  intelligence: 20,
  willpower: 20,
  fellowship: 20
};

export const STARTING_HEALTH = 100;
export const STARTING_MANA = 50;
export const STARTING_GOLD = 100;
export const INVENTORY_DEFAULT_SLOTS = 20;

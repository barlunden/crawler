import React from 'react';

interface CharacterClass {
  id: string;
  name: string;
  description: string;
  statBonuses: string[];
  startingEquipment: string[];
  primaryRole: string;
}

const classes: CharacterClass[] = [
  {
    id: 'WARRIOR',
    name: 'Warrior',
    description: 'A master of weapons and armor, excelling in close combat.',
    statBonuses: ['+15 Weapon Skill', '+10 Strength', '+10 Toughness'],
    startingEquipment: ['Iron Sword', 'Leather Armor', 'Small Shield', 'Health Potion'],
    primaryRole: 'Tank / Melee DPS',
  },
  {
    id: 'ROGUE',
    name: 'Rogue',
    description: 'A nimble fighter skilled in stealth, traps, and precision strikes.',
    statBonuses: ['+15 Agility', '+15 Dexterity', '+10 Initiative'],
    startingEquipment: ['Daggers', 'Leather Armor', 'Lockpicks', 'Smoke Bomb'],
    primaryRole: 'Stealth / Critical Damage',
  },
  {
    id: 'MAGE',
    name: 'Mage',
    description: 'A wielder of arcane power, casting devastating spells.',
    statBonuses: ['+20 Intelligence', '+15 Willpower'],
    startingEquipment: ['Wooden Staff', 'Robes', 'Spellbook', 'Mana Potion'],
    primaryRole: 'Ranged Magic DPS',
  },
  {
    id: 'CLERIC',
    name: 'Cleric',
    description: 'A holy warrior who channels divine magic for healing and protection.',
    statBonuses: ['+15 Willpower', '+10 Fellowship', '+5 Toughness', '+5 Intelligence'],
    startingEquipment: ['Mace', 'Chainmail', 'Holy Symbol', 'Healing Potion'],
    primaryRole: 'Healer / Support',
  },
  {
    id: 'RANGER',
    name: 'Ranger',
    description: 'A skilled hunter and tracker, deadly with bow and blade.',
    statBonuses: ['+15 Ballistic Skill', '+10 Agility', '+10 Dexterity', '+5 Initiative'],
    startingEquipment: ['Shortbow', 'Arrows', 'Hunting Knife', 'Leather Armor'],
    primaryRole: 'Ranged Physical DPS',
  },
];

interface ClassSelectorProps {
  onSelect: (characterClass: string) => void;
  selectedRace: string;
}

const ClassSelector: React.FC<ClassSelectorProps> = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {classes.map((characterClass) => (
        <button
          key={characterClass.id}
          onClick={() => onSelect(characterClass.id)}
          className="text-left p-6 bg-surface-light rounded-lg border-2 border-surface-light hover:border-secondary transition-all duration-200 hover:scale-105"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold text-secondary">{characterClass.name}</h3>
            <span className="text-xs px-2 py-1 bg-accent rounded text-gold">{characterClass.primaryRole}</span>
          </div>
          <p className="text-text-muted text-sm mb-4">{characterClass.description}</p>
          
          <div className="mb-3">
            <p className="text-xs text-text-muted uppercase mb-1">Stat Bonuses</p>
            <div className="flex flex-wrap gap-2">
              {characterClass.statBonuses.map((bonus, index) => (
                <span key={index} className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded">
                  {bonus}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-xs text-text-muted uppercase mb-1">Starting Equipment</p>
            <p className="text-sm text-text">{characterClass.startingEquipment.join(', ')}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ClassSelector;

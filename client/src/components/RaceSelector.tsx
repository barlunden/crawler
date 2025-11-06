import React from 'react';

interface Race {
  id: string;
  name: string;
  description: string;
  statBonuses: string[];
  specialAbility: string;
}

const races: Race[] = [
  {
    id: 'HUMAN',
    name: 'Human',
    description: 'Versatile and adaptable, humans are the most common race in the Old World.',
    statBonuses: ['+5 Fellowship'],
    specialAbility: 'Versatile: +10% experience gain',
  },
  {
    id: 'DWARF',
    name: 'Dwarf',
    description: 'Sturdy and resilient, dwarfs are master craftsmen and fierce warriors.',
    statBonuses: ['+10 Toughness', '+5 Strength', '+5 Willpower'],
    specialAbility: 'Resilient: +20% poison/disease resistance',
  },
  {
    id: 'ELF',
    name: 'Elf',
    description: 'Graceful and long-lived, elves possess keen senses and affinity for magic.',
    statBonuses: ['+10 Agility', '+5 Dexterity', '+5 Intelligence'],
    specialAbility: 'Magic Affinity: -10% spell cost',
  },
  {
    id: 'HALFLING',
    name: 'Halfling',
    description: 'Small but lucky, halflings are surprisingly resilient and hard to hit.',
    statBonuses: ['+10 Agility', '+10 Dexterity', '+5 Fellowship'],
    specialAbility: 'Lucky: Reroll failed saves once per combat',
  },
];

interface RaceSelectorProps {
  onSelect: (race: string) => void;
}

const RaceSelector: React.FC<RaceSelectorProps> = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {races.map((race) => (
        <button
          key={race.id}
          onClick={() => onSelect(race.id)}
          className="text-left p-6 bg-surface-light rounded-lg border-2 border-surface-light hover:border-secondary transition-all duration-200 hover:scale-105"
        >
          <h3 className="text-xl font-semibold text-secondary mb-2">{race.name}</h3>
          <p className="text-text-muted text-sm mb-4">{race.description}</p>
          
          <div className="mb-3">
            <p className="text-xs text-text-muted uppercase mb-1">Stat Bonuses</p>
            <div className="flex flex-wrap gap-2">
              {race.statBonuses.map((bonus, index) => (
                <span key={index} className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded">
                  {bonus}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-xs text-text-muted uppercase mb-1">Special Ability</p>
            <p className="text-sm text-gold">{race.specialAbility}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default RaceSelector;

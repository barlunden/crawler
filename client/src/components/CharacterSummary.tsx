import React from 'react';

interface Stats {
  weaponSkill: number;
  ballisticSkill: number;
  strength: number;
  toughness: number;
  initiative: number;
  agility: number;
  dexterity: number;
  intelligence: number;
  willpower: number;
  fellowship: number;
}

interface CharacterSummaryProps {
  name: string;
  race: string;
  characterClass: string;
  baseStats?: Stats;
}

const raceNames: Record<string, string> = {
  HUMAN: 'Human',
  DWARF: 'Dwarf',
  ELF: 'Elf',
  HALFLING: 'Halfling',
};

const classNames: Record<string, string> = {
  WARRIOR: 'Warrior',
  ROGUE: 'Rogue',
  MAGE: 'Mage',
  CLERIC: 'Cleric',
  RANGER: 'Ranger',
};

const raceBonuses: Record<string, string[]> = {
  HUMAN: ['+5 Fellowship'],
  DWARF: ['+10 Toughness', '+5 Strength', '+5 Willpower'],
  ELF: ['+10 Agility', '+5 Dexterity', '+5 Intelligence'],
  HALFLING: ['+10 Agility', '+10 Dexterity', '+5 Fellowship'],
};

const classBonuses: Record<string, string[]> = {
  WARRIOR: ['+15 Weapon Skill', '+10 Strength', '+10 Toughness'],
  ROGUE: ['+15 Agility', '+15 Dexterity', '+10 Initiative'],
  MAGE: ['+20 Intelligence', '+15 Willpower'],
  CLERIC: ['+15 Willpower', '+10 Fellowship', '+5 Toughness', '+5 Intelligence'],
  RANGER: ['+15 Ballistic Skill', '+10 Agility', '+10 Dexterity', '+5 Initiative'],
};

const CharacterSummary: React.FC<CharacterSummaryProps> = ({ name, race, characterClass, baseStats }) => {
  const defaultBaseStats: Stats = {
    weaponSkill: 20,
    ballisticSkill: 20,
    strength: 20,
    toughness: 20,
    initiative: 20,
    agility: 20,
    dexterity: 20,
    intelligence: 20,
    willpower: 20,
    fellowship: 20,
  };

  const stats = baseStats || defaultBaseStats;

  // Calculate final stats with bonuses
  const raceMods: Record<string, Partial<Stats>> = {
    HUMAN: { fellowship: 5 },
    DWARF: { toughness: 10, strength: 5, willpower: 5 },
    ELF: { agility: 10, dexterity: 5, intelligence: 5 },
    HALFLING: { agility: 10, dexterity: 10, fellowship: 5 },
  };

  const classMods: Record<string, Partial<Stats>> = {
    WARRIOR: { weaponSkill: 15, strength: 10, toughness: 10 },
    ROGUE: { agility: 15, dexterity: 15, initiative: 10 },
    MAGE: { intelligence: 20, willpower: 15 },
    CLERIC: { willpower: 15, fellowship: 10, toughness: 5, intelligence: 5 },
    RANGER: { ballisticSkill: 15, agility: 10, dexterity: 10, initiative: 5 },
  };

  const raceMod = raceMods[race] || {};
  const classMod = classMods[characterClass] || {};

  const finalStats: Stats = {
    weaponSkill: stats.weaponSkill + (raceMod.weaponSkill || 0) + (classMod.weaponSkill || 0),
    ballisticSkill: stats.ballisticSkill + (raceMod.ballisticSkill || 0) + (classMod.ballisticSkill || 0),
    strength: stats.strength + (raceMod.strength || 0) + (classMod.strength || 0),
    toughness: stats.toughness + (raceMod.toughness || 0) + (classMod.toughness || 0),
    initiative: stats.initiative + (raceMod.initiative || 0) + (classMod.initiative || 0),
    agility: stats.agility + (raceMod.agility || 0) + (classMod.agility || 0),
    dexterity: stats.dexterity + (raceMod.dexterity || 0) + (classMod.dexterity || 0),
    intelligence: stats.intelligence + (raceMod.intelligence || 0) + (classMod.intelligence || 0),
    willpower: stats.willpower + (raceMod.willpower || 0) + (classMod.willpower || 0),
    fellowship: stats.fellowship + (raceMod.fellowship || 0) + (classMod.fellowship || 0),
  };

  const statDisplayNames: Record<keyof Stats, string> = {
    weaponSkill: 'Weapon Skill',
    ballisticSkill: 'Ballistic Skill',
    strength: 'Strength',
    toughness: 'Toughness',
    initiative: 'Initiative',
    agility: 'Agility',
    dexterity: 'Dexterity',
    intelligence: 'Intelligence',
    willpower: 'Willpower',
    fellowship: 'Fellowship',
  };

  return (
    <div className="space-y-6">{/* Character Info */}
      {/* Character Info */}
      <div className="bg-accent p-6 rounded-lg">
        <h3 className="text-2xl font-bold text-secondary mb-1">{name}</h3>
        <p className="text-lg text-text">
          {raceNames[race]} {classNames[characterClass]}
        </p>
      </div>

      {/* Combined Bonuses */}
      <div>
        <h4 className="text-lg font-semibold text-secondary mb-3">Your Bonuses</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-light p-4 rounded-lg">
            <p className="text-xs text-text-muted uppercase mb-2">From Race ({raceNames[race]})</p>
            <div className="flex flex-wrap gap-2">
              {raceBonuses[race].map((bonus, index) => (
                <span key={index} className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded">
                  {bonus}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-surface-light p-4 rounded-lg">
            <p className="text-xs text-text-muted uppercase mb-2">From Class ({classNames[characterClass]})</p>
            <div className="flex flex-wrap gap-2">
              {classBonuses[characterClass].map((bonus, index) => (
                <span key={index} className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded">
                  {bonus}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Starting Resources */}
      <div>
        <h4 className="text-lg font-semibold text-secondary mb-3">Starting Resources</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface-light p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-health">100</p>
            <p className="text-xs text-text-muted uppercase">Health</p>
          </div>
          <div className="bg-surface-light p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-mana">50</p>
            <p className="text-xs text-text-muted uppercase">Mana</p>
          </div>
          <div className="bg-surface-light p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-gold">100</p>
            <p className="text-xs text-text-muted uppercase">Gold</p>
          </div>
        </div>
      </div>

      {/* Final Stats */}
      <div>
        <h4 className="text-lg font-semibold text-secondary mb-3">Final Stats</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {(Object.keys(statDisplayNames) as Array<keyof Stats>).map((stat) => (
            <div key={stat} className="flex justify-between bg-surface-light px-3 py-2 rounded">
              <span className="text-text-muted">{statDisplayNames[stat]}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">{stats[stat]}</span>
                <span className="text-text-muted text-xs">+</span>
                <span className="text-xs text-secondary">
                  {((raceMod[stat] || 0) + (classMod[stat] || 0))}
                </span>
                <span className="text-text-muted text-xs">=</span>
                <span className="text-text font-bold">{finalStats[stat]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CharacterSummary;

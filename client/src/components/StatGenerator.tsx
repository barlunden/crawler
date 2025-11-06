import React, { useState, useEffect } from 'react';

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

interface StatGeneratorProps {
  race: string;
  characterClass: string;
  onStatsConfirmed: (stats: Stats) => void;
  onBack: () => void;
}

const statNames: Array<keyof Stats> = [
  'weaponSkill',
  'ballisticSkill',
  'strength',
  'toughness',
  'initiative',
  'agility',
  'dexterity',
  'intelligence',
  'willpower',
  'fellowship',
];

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

const raceBonuses: Record<string, Partial<Stats>> = {
  HUMAN: { fellowship: 5 },
  DWARF: { toughness: 10, strength: 5, willpower: 5 },
  ELF: { agility: 10, dexterity: 5, intelligence: 5 },
  HALFLING: { agility: 10, dexterity: 10, fellowship: 5 },
};

const classBonuses: Record<string, Partial<Stats>> = {
  WARRIOR: { weaponSkill: 15, strength: 10, toughness: 10 },
  ROGUE: { agility: 15, dexterity: 15, initiative: 10 },
  MAGE: { intelligence: 20, willpower: 15 },
  CLERIC: { willpower: 15, fellowship: 10, toughness: 5, intelligence: 5 },
  RANGER: { ballisticSkill: 15, agility: 10, dexterity: 10, initiative: 5 },
};

const StatGenerator: React.FC<StatGeneratorProps> = ({
  race,
  characterClass,
  onStatsConfirmed,
  onBack,
}) => {
  const [generationMethod, setGenerationMethod] = useState<'random' | 'pointbuy' | null>(null);
  const [baseStats, setBaseStats] = useState<Stats>({
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
  });
  const [pointsRemaining, setPointsRemaining] = useState(30);
  const [rolls, setRolls] = useState(0);

  // Calculate final stats with race and class bonuses
  const calculateFinalStats = (base: Stats): Stats => {
    const final = { ...base };
    const raceMods = raceBonuses[race] || {};
    const classMods = classBonuses[characterClass] || {};

    statNames.forEach((stat) => {
      final[stat] = base[stat] + (raceMods[stat] || 0) + (classMods[stat] || 0);
    });

    return final;
  };

  const finalStats = calculateFinalStats(baseStats);

  // Random generation with some variance
  const generateRandomStats = () => {
    const newStats: Stats = {
      weaponSkill: 15 + Math.floor(Math.random() * 11), // 15-25
      ballisticSkill: 15 + Math.floor(Math.random() * 11),
      strength: 15 + Math.floor(Math.random() * 11),
      toughness: 15 + Math.floor(Math.random() * 11),
      initiative: 15 + Math.floor(Math.random() * 11),
      agility: 15 + Math.floor(Math.random() * 11),
      dexterity: 15 + Math.floor(Math.random() * 11),
      intelligence: 15 + Math.floor(Math.random() * 11),
      willpower: 15 + Math.floor(Math.random() * 11),
      fellowship: 15 + Math.floor(Math.random() * 11),
    };
    setBaseStats(newStats);
    setRolls(rolls + 1);
  };

  // Point buy system
  const adjustStat = (stat: keyof Stats, delta: number) => {
    const currentValue = baseStats[stat];
    const newValue = currentValue + delta;

    // Limits: 10-30 for base stats
    if (newValue < 10 || newValue > 30) return;

    // Cost calculation: each point costs 1, but points above 25 cost 2
    let cost = 0;
    if (delta > 0) {
      for (let i = currentValue; i < newValue; i++) {
        cost += i >= 25 ? 2 : 1;
      }
    } else {
      for (let i = currentValue - 1; i >= newValue; i--) {
        cost -= i >= 25 ? 2 : 1;
      }
    }

    if (pointsRemaining - cost < 0) return;

    setBaseStats({ ...baseStats, [stat]: newValue });
    setPointsRemaining(pointsRemaining - cost);
  };

  const resetPointBuy = () => {
    setBaseStats({
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
    });
    setPointsRemaining(30);
  };

  if (!generationMethod) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-secondary mb-2">Choose Stat Generation Method</h2>
          <p className="text-text-muted">How would you like to determine your character's abilities?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => {
              setGenerationMethod('random');
              generateRandomStats();
            }}
            className="p-8 bg-surface-light rounded-lg border-2 border-surface-light hover:border-secondary transition-all duration-200 hover:scale-105 text-left"
          >
            <h3 className="text-xl font-semibold text-secondary mb-3">🎲 Roll the Dice</h3>
            <p className="text-text-muted text-sm mb-4">
              Let fate decide your stats! Roll random values for all attributes (15-25 range).
              You can reroll up to 3 times if you're unhappy with the results.
            </p>
            <div className="flex items-center gap-2 text-gold text-sm">
              <span>⚡</span>
              <span>Quick and exciting</span>
            </div>
          </button>

          <button
            onClick={() => setGenerationMethod('pointbuy')}
            className="p-8 bg-surface-light rounded-lg border-2 border-surface-light hover:border-secondary transition-all duration-200 hover:scale-105 text-left"
          >
            <h3 className="text-xl font-semibold text-secondary mb-3">📊 Point Buy</h3>
            <p className="text-text-muted text-sm mb-4">
              Carefully craft your character with 30 points to distribute.
              Start at 20 in all stats, with costs increasing for higher values.
            </p>
            <div className="flex items-center gap-2 text-gold text-sm">
              <span>🎯</span>
              <span>Strategic and balanced</span>
            </div>
          </button>
        </div>

        <div className="flex gap-4 mt-6">
          <button onClick={onBack} className="btn-secondary flex-1">
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-secondary">
            {generationMethod === 'random' ? 'Roll Your Stats' : 'Distribute Points'}
          </h2>
          {generationMethod === 'pointbuy' && (
            <p className="text-text-muted mt-1">
              Points remaining: <span className="text-gold font-semibold">{pointsRemaining}</span>
            </p>
          )}
          {generationMethod === 'random' && (
            <p className="text-text-muted mt-1">
              Rerolls remaining: <span className="text-gold font-semibold">{3 - rolls}</span>
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setGenerationMethod(null);
            resetPointBuy();
            setRolls(0);
          }}
          className="text-text-muted hover:text-secondary text-sm"
        >
          Change Method
        </button>
      </div>

      {/* Stats Display */}
      <div className="bg-accent p-6 rounded-lg space-y-3">
        {statNames.map((stat) => (
          <div key={stat} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-text-muted">{statDisplayNames[stat]}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">Base:</span>
                  <span className="text-sm font-semibold text-text w-8 text-right">
                    {baseStats[stat]}
                  </span>
                  {generationMethod === 'pointbuy' && (
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => adjustStat(stat, -1)}
                        disabled={baseStats[stat] <= 10}
                        className="w-6 h-6 bg-surface-light rounded hover:bg-surface text-text disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <button
                        onClick={() => adjustStat(stat, 1)}
                        disabled={baseStats[stat] >= 30 || pointsRemaining <= 0}
                        className="w-6 h-6 bg-surface-light rounded hover:bg-surface text-text disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {/* Progress bar showing final stat with bonuses */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-surface-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-secondary to-gold transition-all duration-300"
                    style={{ width: `${(finalStats[stat] / 50) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-secondary w-8 text-right">
                  {finalStats[stat]}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bonus breakdown */}
      <div className="bg-surface-light p-4 rounded-lg">
        <p className="text-xs text-text-muted mb-2">Final stats include:</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 bg-accent rounded text-text">Base Stats</span>
          <span className="px-2 py-1 bg-secondary/20 rounded text-secondary">+ Race Bonuses</span>
          <span className="px-2 py-1 bg-secondary/20 rounded text-secondary">+ Class Bonuses</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button onClick={onBack} className="btn-secondary flex-1">
          Back
        </button>
        {generationMethod === 'random' && rolls < 3 && (
          <button onClick={generateRandomStats} className="btn-secondary flex-1">
            Reroll ({3 - rolls} left)
          </button>
        )}
        {generationMethod === 'pointbuy' && (
          <button onClick={resetPointBuy} className="btn-secondary flex-1">
            Reset
          </button>
        )}
        <button
          onClick={() => onStatsConfirmed(baseStats)}
          className="btn-primary flex-1"
        >
          Confirm Stats
        </button>
      </div>
    </div>
  );
};

export default StatGenerator;

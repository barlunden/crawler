import React, { useState } from 'react';
import SkillUpgradeModal from './SkillUpgradeModal.tsx';
import StatUpgradeModal from './StatUpgradeModal.tsx';

interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  experience: number;
  availableSkillPoints: number;
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
  // Combat Skills
  swordSkill: number;
  twoHandedSwordSkill: number;
  axeSkill: number;
  twoHandedAxeSkill: number;
  daggerSkill: number;
  spearSkill: number;
  maceSkill: number;
  bowSkill: number;
  crossbowSkill: number;
  slingSkill: number;
  throwingSkill: number;
  // Magic Skills
  fireMagicSkill: number;
  iceMagicSkill: number;
  lightningMagicSkill: number;
  healingMagicSkill: number;
  darkMagicSkill: number;
  lightMagicSkill: number;
  natureMagicSkill: number;
  // Defense & Utility
  dodgeSkill: number;
  blockSkill: number;
  parrySkill: number;
  lockpickingSkill: number;
  stealthSkill: number;
  perceptionSkill: number;
}

interface CharacterPanelProps {
  character: Character;
  onCharacterUpdate?: () => void;
}

const CharacterPanel: React.FC<CharacterPanelProps> = ({ character, onCharacterUpdate }) => {
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showStatModal, setShowStatModal] = useState(false);

  const stats = [
    { name: 'Weapon Skill', value: character.weaponSkill, abbr: 'WS' },
    { name: 'Ballistic Skill', value: character.ballisticSkill, abbr: 'BS' },
    { name: 'Strength', value: character.strength, abbr: 'STR' },
    { name: 'Toughness', value: character.toughness, abbr: 'TOU' },
    { name: 'Initiative', value: character.initiative, abbr: 'INI' },
    { name: 'Agility', value: character.agility, abbr: 'AGI' },
    { name: 'Dexterity', value: character.dexterity, abbr: 'DEX' },
    { name: 'Intelligence', value: character.intelligence, abbr: 'INT' },
    { name: 'Willpower', value: character.willpower, abbr: 'WIL' },
    { name: 'Fellowship', value: character.fellowship, abbr: 'FEL' },
  ];

  return (
    <div className="space-y-3">
      {/* Experience Bar */}
      <div className="bg-surface-light p-2 rounded-lg">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-text-muted">Experience</span>
          <span className="text-xs text-secondary font-semibold">
            {character.experience} / {character.level * 1000}
          </span>
        </div>
        <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-secondary to-gold transition-all duration-300"
            style={{ width: `${(character.experience / (character.level * 1000)) * 100}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-semibold text-secondary uppercase tracking-wide">
            Statistics
          </h4>
          {character.availableSkillPoints >= 3 && (
            <button
              onClick={() => setShowStatModal(true)}
              className="bg-secondary/20 hover:bg-secondary/30 px-2 py-0.5 rounded transition-colors"
            >
              <span className="text-xs font-bold text-secondary">
                Upgrade (3pts)
              </span>
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {stats.map((stat) => (
            <div
              key={stat.abbr}
              className="bg-surface-light p-2 rounded flex items-center justify-between"
            >
              <div>
                <div className="text-xs text-text-muted font-medium">{stat.abbr}</div>
              </div>
              <div className="text-xl font-bold text-secondary">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-semibold text-secondary uppercase tracking-wide">
            Skills
          </h4>
          {character.availableSkillPoints > 0 && (
            <button
              onClick={() => setShowSkillModal(true)}
              className="bg-gold/20 hover:bg-gold/30 px-2 py-0.5 rounded transition-colors"
            >
              <span className="text-xs font-bold text-gold">
                Upgrade (1pt)
              </span>
            </button>
          )}
        </div>
        <div className="space-y-2">
          {/* Melee Skills */}
          {(character.swordSkill > 0 || character.twoHandedSwordSkill > 0 || character.axeSkill > 0 || 
            character.twoHandedAxeSkill > 0 || character.daggerSkill > 0 || character.spearSkill > 0 || 
            character.maceSkill > 0) && (
            <div className="bg-surface-light p-2 rounded">
              <div className="text-xs text-text-muted font-medium mb-1.5">⚔️ Melee</div>
              <div className="space-y-1">
                {character.swordSkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Sword</span>
                    <span className="text-secondary font-semibold">{character.swordSkill}</span>
                  </div>
                )}
                {character.twoHandedSwordSkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Two-Handed Sword</span>
                    <span className="text-secondary font-semibold">{character.twoHandedSwordSkill}</span>
                  </div>
                )}
                {character.axeSkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Axe</span>
                    <span className="text-secondary font-semibold">{character.axeSkill}</span>
                  </div>
                )}
                {character.twoHandedAxeSkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Two-Handed Axe</span>
                    <span className="text-secondary font-semibold">{character.twoHandedAxeSkill}</span>
                  </div>
                )}
                {character.daggerSkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Dagger</span>
                    <span className="text-secondary font-semibold">{character.daggerSkill}</span>
                  </div>
                )}
                {character.spearSkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Spear</span>
                    <span className="text-secondary font-semibold">{character.spearSkill}</span>
                  </div>
                )}
                {character.maceSkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Mace</span>
                    <span className="text-secondary font-semibold">{character.maceSkill}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ranged Skills */}
          {(character.bowSkill > 0 || character.crossbowSkill > 0 || character.slingSkill > 0 || 
            character.throwingSkill > 0) && (
            <div className="bg-surface-light p-2 rounded">
              <div className="text-xs text-text-muted font-medium mb-1.5">🏹 Ranged</div>
              <div className="space-y-1">
                {character.bowSkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Bow</span>
                    <span className="text-secondary font-semibold">{character.bowSkill}</span>
                  </div>
                )}
                {character.crossbowSkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Crossbow</span>
                    <span className="text-secondary font-semibold">{character.crossbowSkill}</span>
                  </div>
                )}
                {character.slingSkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Sling</span>
                    <span className="text-secondary font-semibold">{character.slingSkill}</span>
                  </div>
                )}
                {character.throwingSkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Throwing</span>
                    <span className="text-secondary font-semibold">{character.throwingSkill}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Magic Skills */}
          {(character.fireMagicSkill > 0 || character.iceMagicSkill > 0 || character.lightningMagicSkill > 0 || 
            character.healingMagicSkill > 0 || character.darkMagicSkill > 0 || character.lightMagicSkill > 0 || 
            character.natureMagicSkill > 0) && (
            <div className="bg-surface-light p-2 rounded">
              <div className="text-xs text-text-muted font-medium mb-1.5">✨ Magic</div>
              <div className="space-y-1">
                {character.fireMagicSkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Fire</span>
                    <span className="text-secondary font-semibold">{character.fireMagicSkill}</span>
                  </div>
                )}
                {character.iceMagicSkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Ice</span>
                    <span className="text-secondary font-semibold">{character.iceMagicSkill}</span>
                  </div>
                )}
                {character.lightningMagicSkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Lightning</span>
                    <span className="text-secondary font-semibold">{character.lightningMagicSkill}</span>
                  </div>
                )}
                {character.healingMagicSkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Healing</span>
                    <span className="text-secondary font-semibold">{character.healingMagicSkill}</span>
                  </div>
                )}
                {character.darkMagicSkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Dark</span>
                    <span className="text-secondary font-semibold">{character.darkMagicSkill}</span>
                  </div>
                )}
                {character.lightMagicSkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Light</span>
                    <span className="text-secondary font-semibold">{character.lightMagicSkill}</span>
                  </div>
                )}
                {character.natureMagicSkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Nature</span>
                    <span className="text-secondary font-semibold">{character.natureMagicSkill}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Utility Skills */}
          {(character.dodgeSkill > 0 || character.blockSkill > 0 || character.parrySkill > 0 || 
            character.lockpickingSkill > 0 || character.stealthSkill > 0 || character.perceptionSkill > 0) && (
            <div className="bg-surface-light p-2 rounded">
              <div className="text-xs text-text-muted font-medium mb-1.5">🛡️ Utility</div>
              <div className="space-y-1">
                {character.dodgeSkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Dodge</span>
                    <span className="text-secondary font-semibold">{character.dodgeSkill}</span>
                  </div>
                )}
                {character.blockSkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Block</span>
                    <span className="text-secondary font-semibold">{character.blockSkill}</span>
                  </div>
                )}
                {character.parrySkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Parry</span>
                    <span className="text-secondary font-semibold">{character.parrySkill}</span>
                  </div>
                )}
                {character.lockpickingSkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Lockpicking</span>
                    <span className="text-secondary font-semibold">{character.lockpickingSkill}</span>
                  </div>
                )}
                {character.stealthSkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Stealth</span>
                    <span className="text-secondary font-semibold">{character.stealthSkill}</span>
                  </div>
                )}
                {character.perceptionSkill > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Perception</span>
                    <span className="text-secondary font-semibold">{character.perceptionSkill}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Equipment Preview */}
      <div>
        <h4 className="text-xs font-semibold text-secondary mb-2 uppercase tracking-wide">
          Equipment
        </h4>
        <div className="space-y-1.5">
          <div className="bg-surface-light p-2 rounded flex items-center gap-2">
            <div className="w-8 h-8 bg-surface rounded flex items-center justify-center">
              <span className="text-base">⚔️</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text font-semibold">Main Hand</p>
              <p className="text-xs text-text-muted">Empty</p>
            </div>
          </div>
          <div className="bg-surface-light p-2 rounded flex items-center gap-2">
            <div className="w-8 h-8 bg-surface rounded flex items-center justify-center">
              <span className="text-base">🛡️</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text font-semibold">Off Hand</p>
              <p className="text-xs text-text-muted">Empty</p>
            </div>
          </div>
          <div className="bg-surface-light p-2 rounded flex items-center gap-2">
            <div className="w-8 h-8 bg-surface rounded flex items-center justify-center">
              <span className="text-base">🥼</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text font-semibold">Armor</p>
              <p className="text-xs text-text-muted">Empty</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h4 className="text-xs font-semibold text-secondary mb-2 uppercase tracking-wide">
          Quick Actions
        </h4>
        <div className="space-y-1.5">
          <button className="w-full py-1.5 px-3 bg-surface-light hover:bg-surface text-text rounded transition-colors text-xs">
            🧪 Use Potion
          </button>
          <button className="w-full py-1.5 px-3 bg-surface-light hover:bg-surface text-text rounded transition-colors text-xs">
            💤 Rest (Restore HP/MP)
          </button>
          <button className="w-full py-1.5 px-3 bg-surface-light hover:bg-surface text-text rounded transition-colors text-xs">
            📜 View Spells
          </button>
        </div>
      </div>

      {/* Skill Upgrade Modal */}
      {showSkillModal && (
        <SkillUpgradeModal
          characterId={character.id}
          availablePoints={character.availableSkillPoints}
          skills={[
            { name: 'swordSkill', displayName: 'Sword', category: 'Melee', currentValue: character.swordSkill },
            { name: 'twoHandedSwordSkill', displayName: 'Two-Handed Sword', category: 'Melee', currentValue: character.twoHandedSwordSkill },
            { name: 'axeSkill', displayName: 'Axe', category: 'Melee', currentValue: character.axeSkill },
            { name: 'twoHandedAxeSkill', displayName: 'Two-Handed Axe', category: 'Melee', currentValue: character.twoHandedAxeSkill },
            { name: 'daggerSkill', displayName: 'Dagger', category: 'Melee', currentValue: character.daggerSkill },
            { name: 'spearSkill', displayName: 'Spear', category: 'Melee', currentValue: character.spearSkill },
            { name: 'maceSkill', displayName: 'Mace', category: 'Melee', currentValue: character.maceSkill },
            { name: 'bowSkill', displayName: 'Bow', category: 'Ranged', currentValue: character.bowSkill },
            { name: 'crossbowSkill', displayName: 'Crossbow', category: 'Ranged', currentValue: character.crossbowSkill },
            { name: 'slingSkill', displayName: 'Sling', category: 'Ranged', currentValue: character.slingSkill },
            { name: 'throwingSkill', displayName: 'Throwing', category: 'Ranged', currentValue: character.throwingSkill },
            { name: 'fireMagicSkill', displayName: 'Fire Magic', category: 'Magic', currentValue: character.fireMagicSkill },
            { name: 'iceMagicSkill', displayName: 'Ice Magic', category: 'Magic', currentValue: character.iceMagicSkill },
            { name: 'lightningMagicSkill', displayName: 'Lightning Magic', category: 'Magic', currentValue: character.lightningMagicSkill },
            { name: 'healingMagicSkill', displayName: 'Healing Magic', category: 'Magic', currentValue: character.healingMagicSkill },
            { name: 'darkMagicSkill', displayName: 'Dark Magic', category: 'Magic', currentValue: character.darkMagicSkill },
            { name: 'lightMagicSkill', displayName: 'Light Magic', category: 'Magic', currentValue: character.lightMagicSkill },
            { name: 'natureMagicSkill', displayName: 'Nature Magic', category: 'Magic', currentValue: character.natureMagicSkill },
            { name: 'dodgeSkill', displayName: 'Dodge', category: 'Utility', currentValue: character.dodgeSkill },
            { name: 'blockSkill', displayName: 'Block', category: 'Utility', currentValue: character.blockSkill },
            { name: 'parrySkill', displayName: 'Parry', category: 'Utility', currentValue: character.parrySkill },
            { name: 'lockpickingSkill', displayName: 'Lockpicking', category: 'Utility', currentValue: character.lockpickingSkill },
            { name: 'stealthSkill', displayName: 'Stealth', category: 'Utility', currentValue: character.stealthSkill },
            { name: 'perceptionSkill', displayName: 'Perception', category: 'Utility', currentValue: character.perceptionSkill },
          ]}
          onClose={() => setShowSkillModal(false)}
          onUpgrade={() => {
            setShowSkillModal(false);
            if (onCharacterUpdate) {
              onCharacterUpdate();
            }
          }}
        />
      )}

      {/* Stat Upgrade Modal */}
      {showStatModal && (
        <StatUpgradeModal
          characterId={character.id}
          availablePoints={character.availableSkillPoints}
          stats={[
            { name: 'weaponSkill', displayName: 'Weapon Skill', abbr: 'WS', currentValue: character.weaponSkill },
            { name: 'ballisticSkill', displayName: 'Ballistic Skill', abbr: 'BS', currentValue: character.ballisticSkill },
            { name: 'strength', displayName: 'Strength', abbr: 'STR', currentValue: character.strength },
            { name: 'toughness', displayName: 'Toughness', abbr: 'TOU', currentValue: character.toughness },
            { name: 'initiative', displayName: 'Initiative', abbr: 'INI', currentValue: character.initiative },
            { name: 'agility', displayName: 'Agility', abbr: 'AGI', currentValue: character.agility },
            { name: 'dexterity', displayName: 'Dexterity', abbr: 'DEX', currentValue: character.dexterity },
            { name: 'intelligence', displayName: 'Intelligence', abbr: 'INT', currentValue: character.intelligence },
            { name: 'willpower', displayName: 'Willpower', abbr: 'WIL', currentValue: character.willpower },
            { name: 'fellowship', displayName: 'Fellowship', abbr: 'FEL', currentValue: character.fellowship },
          ]}
          onClose={() => setShowStatModal(false)}
          onUpgrade={() => {
            setShowStatModal(false);
            if (onCharacterUpdate) {
              onCharacterUpdate();
            }
          }}
        />
      )}
    </div>
  );
};

export default CharacterPanel;

import React, { useState } from 'react';

interface Skill {
  name: string;
  displayName: string;
  category: string;
  currentValue: number;
}

interface SkillUpgradeModalProps {
  characterId: string;
  availablePoints: number;
  skills: Skill[];
  onClose: () => void;
  onUpgrade: () => void;
}

const SkillUpgradeModal: React.FC<SkillUpgradeModalProps> = ({
  characterId,
  availablePoints,
  skills,
  onClose,
  onUpgrade,
}) => {
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [pointsToSpend, setPointsToSpend] = useState<number>(1);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleUpgrade = async () => {
    if (!selectedSkill) {
      setError('Please select a skill');
      return;
    }

    if (pointsToSpend > availablePoints) {
      setError('Not enough skill points');
      return;
    }

    setIsUpgrading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:3001/api/characters/${characterId}/spend-upgrade-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'skill',
          name: selectedSkill,
          points: pointsToSpend,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upgrade skill');
      }

      onUpgrade();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upgrade skill');
    } finally {
      setIsUpgrading(false);
    }
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const categoryIcons: Record<string, string> = {
    'Melee': '⚔️',
    'Ranged': '🏹',
    'Magic': '✨',
    'Utility': '🛡️',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-accent rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto border-2 border-secondary">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-secondary">Upgrade Skills</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="bg-surface-light p-3 rounded-lg mb-4">
          <div className="text-sm text-text-muted">Available Skill Points</div>
          <div className="text-2xl font-bold text-gold">{availablePoints}</div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-3 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Select Skill
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full bg-surface border border-surface-light rounded px-3 py-2 text-text focus:outline-none focus:border-secondary"
            >
              <option value="">Choose a skill...</option>
              {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                <optgroup key={category} label={`${categoryIcons[category]} ${category}`}>
                  {categorySkills.map((skill) => (
                    <option key={skill.name} value={skill.name}>
                      {skill.displayName} (Current: {skill.currentValue})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Points to Spend
            </label>
            <input
              type="number"
              min="1"
              max={availablePoints}
              value={pointsToSpend}
              onChange={(e) => setPointsToSpend(Math.max(1, Math.min(availablePoints, parseInt(e.target.value) || 1)))}
              className="w-full bg-surface border border-surface-light rounded px-3 py-2 text-text focus:outline-none focus:border-secondary"
            />
          </div>

          {selectedSkill && (
            <div className="bg-surface-light p-3 rounded">
              <div className="text-xs text-text-muted mb-1">Preview</div>
              <div className="text-sm">
                {skills.find(s => s.name === selectedSkill)?.displayName}:{' '}
                <span className="text-text-muted">{skills.find(s => s.name === selectedSkill)?.currentValue}</span>
                {' → '}
                <span className="text-secondary font-bold">
                  {(skills.find(s => s.name === selectedSkill)?.currentValue || 0) + pointsToSpend}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-surface hover:bg-surface-light text-text rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpgrade}
            disabled={isUpgrading || !selectedSkill || availablePoints === 0}
            className="flex-1 py-2 px-4 bg-secondary hover:bg-secondary/80 text-background font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpgrading ? 'Upgrading...' : 'Upgrade'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillUpgradeModal;

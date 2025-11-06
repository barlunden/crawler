import React, { useState } from 'react';

interface Stat {
  name: string;
  displayName: string;
  abbr: string;
  currentValue: number;
}

interface StatUpgradeModalProps {
  characterId: string;
  availablePoints: number;
  stats: Stat[];
  onClose: () => void;
  onUpgrade: () => void;
}

const StatUpgradeModal: React.FC<StatUpgradeModalProps> = ({
  characterId,
  availablePoints,
  stats,
  onClose,
  onUpgrade,
}) => {
  const [selectedStat, setSelectedStat] = useState<string>('');
  const [pointsToSpend, setPointsToSpend] = useState<number>(1);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [error, setError] = useState<string>('');

  const STAT_COST_MULTIPLIER = 3;

  const calculateCost = (points: number) => points * STAT_COST_MULTIPLIER;
  const maxAffordable = Math.floor(availablePoints / STAT_COST_MULTIPLIER);

  const handleUpgrade = async () => {
    if (!selectedStat) {
      setError('Please select a stat');
      return;
    }

    const totalCost = calculateCost(pointsToSpend);
    if (totalCost > availablePoints) {
      setError('Not enough upgrade points');
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
          type: 'stat',
          name: selectedStat,
          points: pointsToSpend,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upgrade stat');
      }

      onUpgrade();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upgrade stat');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-accent rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto border-2 border-secondary">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-secondary">Upgrade Base Stats</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="bg-surface-light p-3 rounded-lg mb-4">
          <div className="text-sm text-text-muted">Available Upgrade Points</div>
          <div className="text-2xl font-bold text-gold">{availablePoints}</div>
          <div className="text-xs text-text-muted mt-1">
            Stats cost {STAT_COST_MULTIPLIER}× more (max {maxAffordable} stat points)
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-3 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Select Stat
            </label>
            <select
              value={selectedStat}
              onChange={(e) => setSelectedStat(e.target.value)}
              className="w-full bg-surface border border-surface-light rounded px-3 py-2 text-text focus:outline-none focus:border-secondary"
            >
              <option value="">Choose a stat...</option>
              {stats.map((stat) => (
                <option key={stat.name} value={stat.name}>
                  {stat.abbr} - {stat.displayName} (Current: {stat.currentValue})
                </option>
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
              max={maxAffordable}
              value={pointsToSpend}
              onChange={(e) => setPointsToSpend(Math.max(1, Math.min(maxAffordable, parseInt(e.target.value) || 1)))}
              className="w-full bg-surface border border-surface-light rounded px-3 py-2 text-text focus:outline-none focus:border-secondary"
            />
            <div className="text-xs text-text-muted mt-1">
              Cost: {calculateCost(pointsToSpend)} upgrade points
            </div>
          </div>

          {selectedStat && (
            <div className="bg-surface-light p-3 rounded">
              <div className="text-xs text-text-muted mb-1">Preview</div>
              <div className="text-sm">
                {stats.find(s => s.name === selectedStat)?.displayName}:{' '}
                <span className="text-text-muted">{stats.find(s => s.name === selectedStat)?.currentValue}</span>
                {' → '}
                <span className="text-secondary font-bold">
                  {(stats.find(s => s.name === selectedStat)?.currentValue || 0) + pointsToSpend}
                </span>
                <div className="text-xs text-gold mt-1">
                  Cost: {calculateCost(pointsToSpend)} points
                </div>
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
            disabled={isUpgrading || !selectedStat || availablePoints < STAT_COST_MULTIPLIER}
            className="flex-1 py-2 px-4 bg-secondary hover:bg-secondary/80 text-background font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpgrading ? 'Upgrading...' : 'Upgrade'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatUpgradeModal;

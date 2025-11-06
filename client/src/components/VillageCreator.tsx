import React, { useState } from 'react';

interface VillageService {
  id: string;
  name: string;
  icon: string;
  description: string;
  difficulty: string; // Easy, Medium, Hard impact
}

const AVAILABLE_SERVICES: VillageService[] = [
  {
    id: 'weaponSmith',
    name: 'Weapon Smith',
    icon: '⚔️',
    description: 'Buy, sell, and upgrade weapons',
    difficulty: 'Medium',
  },
  {
    id: 'armorSmith',
    name: 'Armor Smith',
    icon: '🛡️',
    description: 'Buy, sell, and upgrade armor',
    difficulty: 'Medium',
  },
  {
    id: 'potionShop',
    name: 'Potion Shop',
    icon: '🧪',
    description: 'Buy health and mana potions',
    difficulty: 'Easy',
  },
  {
    id: 'tavern',
    name: 'Ye Olde Tavern',
    icon: '🍺',
    description: 'Rest, hire companions, hear rumors',
    difficulty: 'Easy',
  },
  {
    id: 'generalMerchant',
    name: 'General Merchant',
    icon: '🏪',
    description: 'Buy and sell general goods',
    difficulty: 'Easy',
  },
  {
    id: 'temple',
    name: 'Temple',
    icon: '⛪',
    description: 'Healing, cure curses, resurrection',
    difficulty: 'Hard',
  },
  {
    id: 'blacksmith',
    name: 'Blacksmith Workshop',
    icon: '🔨',
    description: 'Repair damaged equipment',
    difficulty: 'Medium',
  },
  {
    id: 'enchanter',
    name: 'Enchanter',
    icon: '✨',
    description: 'Add magical properties to items',
    difficulty: 'Hard',
  },
  {
    id: 'alchemist',
    name: 'Alchemist',
    icon: '⚗️',
    description: 'Craft potions from ingredients',
    difficulty: 'Medium',
  },
  {
    id: 'trainingGround',
    name: 'Training Ground',
    icon: '🎯',
    description: 'Practice skills between runs',
    difficulty: 'Easy',
  },
];

interface VillageCreatorProps {
  characterId: string;
  onComplete: (village: any) => void;
  onBack?: () => void;
}

const VillageCreator: React.FC<VillageCreatorProps> = ({ characterId, onComplete, onBack }) => {
  const [villageName, setVillageName] = useState('The Village');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [randomEventsEnabled, setRandomEventsEnabled] = useState(false);
  const [eventDifficulty, setEventDifficulty] = useState<'RELIABLE' | 'REALISTIC' | 'CHAOTIC'>('REALISTIC');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const selectAll = () => {
    setSelectedServices(AVAILABLE_SERVICES.map(s => s.id));
  };

  const selectNone = () => {
    setSelectedServices([]);
  };

  const handleSubmit = async () => {
    if (selectedServices.length === 0) {
      setError('Please select at least one service');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/villages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId,
          name: villageName,
          services: selectedServices,
          randomEventsEnabled,
          eventDifficulty,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onComplete(data.data.village);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create village');
      }
    } catch (err) {
      console.error('Error creating village:', err);
      setError('Failed to create village');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyInfo = () => {
    const count = selectedServices.length;
    if (count === 10) return { level: 'Easiest', color: 'text-green-500', desc: 'All services available' };
    if (count >= 7) return { level: 'Easy', color: 'text-green-400', desc: 'Most services available' };
    if (count >= 5) return { level: 'Medium', color: 'text-gold', desc: 'Balanced challenge' };
    if (count >= 3) return { level: 'Hard', color: 'text-orange-500', desc: 'Limited resources' };
    if (count >= 1) return { level: 'Very Hard', color: 'text-health', desc: 'Minimal support' };
    return { level: 'Extreme', color: 'text-purple-600', desc: 'Pure survival' };
  };

  const difficultyInfo = getDifficultyInfo();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-accent rounded-lg border border-surface p-6">
        <h1 className="text-3xl font-bold text-secondary mb-2">Design Your Village</h1>
        <p className="text-text-muted mb-6">
          Choose which services will be available in your village. Fewer services = harder game!
        </p>

        {/* Village Name */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-secondary mb-2">
            Village Name
          </label>
          <input
            type="text"
            value={villageName}
            onChange={(e) => setVillageName(e.target.value)}
            className="w-full px-4 py-2 bg-surface border border-surface-light rounded text-text"
            placeholder="Enter village name..."
          />
        </div>

        {/* Difficulty Indicator */}
        <div className="mb-6 p-4 bg-surface rounded border border-surface-light">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-text-muted text-sm">Current Difficulty:</span>
              <span className={`ml-2 text-lg font-bold ${difficultyInfo.color}`}>
                {difficultyInfo.level}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-muted">{difficultyInfo.desc}</div>
              <div className="text-xs text-text-muted mt-1">
                {selectedServices.length} / 10 services selected
              </div>
            </div>
          </div>
        </div>

        {/* Quick Select Buttons */}
        <div className="flex gap-3 mb-6">
          <button onClick={selectAll} className="btn-secondary flex-1">
            Select All (Easy Mode)
          </button>
          <button onClick={selectNone} className="btn-secondary flex-1">
            Deselect All (Extreme Mode)
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {AVAILABLE_SERVICES.map(service => (
            <div
              key={service.id}
              onClick={() => toggleService(service.id)}
              className={`p-4 rounded border-2 cursor-pointer transition-all ${
                selectedServices.includes(service.id)
                  ? 'border-secondary bg-secondary bg-opacity-10'
                  : 'border-surface-light hover:border-surface hover:bg-surface'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{service.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text mb-1">{service.name}</h3>
                  <p className="text-xs text-text-muted mb-2">{service.description}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      service.difficulty === 'Easy'
                        ? 'bg-green-600 bg-opacity-20 text-green-400'
                        : service.difficulty === 'Medium'
                        ? 'bg-gold bg-opacity-20 text-gold'
                        : 'bg-health bg-opacity-20 text-health'
                    }`}>
                      {service.difficulty} Impact
                    </span>
                    {selectedServices.includes(service.id) && (
                      <span className="text-xs text-secondary">✓ Selected</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Random Events Mode */}
        <div className="mb-6 p-4 bg-surface rounded border border-surface-light">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-secondary">Random Events Mode</h3>
              <p className="text-xs text-text-muted">
                Services may be temporarily unavailable when you return from the dungeon
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={randomEventsEnabled}
                onChange={(e) => setRandomEventsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-light rounded-full peer peer-checked:bg-secondary transition-colors"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
            </label>
          </div>

          {randomEventsEnabled && (
            <div className="mt-3">
              <label className="block text-sm font-semibold text-text mb-2">
                Event Frequency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['RELIABLE', 'REALISTIC', 'CHAOTIC'] as const).map(level => (
                  <button
                    key={level}
                    onClick={() => setEventDifficulty(level)}
                    className={`px-4 py-2 rounded border-2 transition-colors ${
                      eventDifficulty === level
                        ? 'border-secondary bg-secondary bg-opacity-10 text-secondary'
                        : 'border-surface-light hover:border-surface text-text-muted'
                    }`}
                  >
                    <div className="font-semibold">{level}</div>
                    <div className="text-xs">
                      {level === 'RELIABLE' && 'Always open'}
                      {level === 'REALISTIC' && '15% closed'}
                      {level === 'CHAOTIC' && '35% closed'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-health bg-opacity-10 border border-health rounded text-health text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onBack && (
            <button onClick={onBack} className="btn-secondary" disabled={loading}>
              Back
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading || selectedServices.length === 0}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Village...' : 'Create Village & Start Adventure'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VillageCreator;

import React, { useState } from 'react';
import RaceSelector from './RaceSelector';
import ClassSelector from './ClassSelector';
import StatGenerator from './StatGenerator';
import CharacterSummary from './CharacterSummary';
import VillageCreator from './VillageCreator';

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

interface CharacterData {
  name: string;
  race: string | null;
  class: string | null;
  baseStats?: Stats;
}

const CharacterCreator: React.FC = () => {
  const [step, setStep] = useState<'name' | 'race' | 'class' | 'stats' | 'summary' | 'village'>('name');
  const [character, setCharacter] = useState<CharacterData>({
    name: '',
    race: null,
    class: null,
    baseStats: undefined,
  });
  const [createdCharacterId, setCreatedCharacterId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (character.name.trim().length >= 2) {
      setStep('race');
      setError(null);
    } else {
      setError('Name must be at least 2 characters long');
    }
  };

  const handleRaceSelect = (race: string) => {
    setCharacter({ ...character, race });
    setStep('class');
  };

  const handleClassSelect = (characterClass: string) => {
    setCharacter({ ...character, class: characterClass });
    setStep('stats');
  };

  const handleStatsConfirmed = (stats: Stats) => {
    setCharacter({ ...character, baseStats: stats });
    setStep('summary');
  };

  const handleCreateCharacter = async () => {
    if (!character.name || !character.race || !character.class || !character.baseStats) {
      setError('All fields are required');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: character.name,
          race: character.race,
          class: character.class,
          baseStats: character.baseStats,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create character');
      }

      const data = await response.json();
      console.log('Character created:', data);
      
      // Save character ID and move to village creation
      setCreatedCharacterId(data.data.character.id);
      setStep('village');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const handleVillageComplete = async (village: any) => {
    console.log('Village created:', village);
    
    // Generate initial dungeon for the character
    try {
      const response = await fetch('http://localhost:3001/api/dungeons/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId: createdCharacterId,
          width: 20,
          height: 20,
          level: 1, // Start at level 1
        }),
      });

      if (response.ok) {
        // Redirect to game
        window.location.href = '/game';
      } else {
        throw new Error('Failed to generate dungeon');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate dungeon');
    }
  };

  const handleBack = () => {
    if (step === 'race') setStep('name');
    else if (step === 'class') setStep('race');
    else if (step === 'stats') setStep('class');
    else if (step === 'summary') setStep('stats');
    // Cannot go back from village creation
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div className={`flex-1 text-center ${step === 'name' ? 'text-secondary' : 'text-text-muted'}`}>
            <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
              step === 'name' ? 'bg-secondary text-accent' : 'bg-surface'
            }`}>
              1
            </div>
            <span className="text-sm">Name</span>
          </div>
          <div className="w-8 h-1 bg-surface"></div>
          <div className={`flex-1 text-center ${step === 'race' ? 'text-secondary' : 'text-text-muted'}`}>
            <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
              step === 'race' ? 'bg-secondary text-accent' : 'bg-surface'
            }`}>
              2
            </div>
            <span className="text-sm">Race</span>
          </div>
          <div className="w-8 h-1 bg-surface"></div>
          <div className={`flex-1 text-center ${step === 'class' ? 'text-secondary' : 'text-text-muted'}`}>
            <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
              step === 'class' ? 'bg-secondary text-accent' : 'bg-surface'
            }`}>
              3
            </div>
            <span className="text-sm">Class</span>
          </div>
          <div className="w-8 h-1 bg-surface"></div>
          <div className={`flex-1 text-center ${step === 'stats' ? 'text-secondary' : 'text-text-muted'}`}>
            <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
              step === 'stats' ? 'bg-secondary text-accent' : 'bg-surface'
            }`}>
              4
            </div>
            <span className="text-sm">Stats</span>
          </div>
          <div className="w-8 h-1 bg-surface"></div>
          <div className={`flex-1 text-center ${step === 'summary' ? 'text-secondary' : 'text-text-muted'}`}>
            <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
              step === 'summary' ? 'bg-secondary text-accent' : 'bg-surface'
            }`}>
              5
            </div>
            <span className="text-sm">Confirm</span>
          </div>
          <div className="w-8 h-1 bg-surface"></div>
          <div className={`flex-1 text-center ${step === 'village' ? 'text-secondary' : 'text-text-muted'}`}>
            <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
              step === 'village' ? 'bg-secondary text-accent' : 'bg-surface'
            }`}>
              6
            </div>
            <span className="text-sm">Village</span>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-health/10 border border-health rounded-lg text-health">
          {error}
        </div>
      )}

      {/* Step content */}
      <div className="card">
        {step === 'name' && (
          <div>
            <h2 className="text-2xl font-semibold text-secondary mb-6">What is your name, adventurer?</h2>
            <form onSubmit={handleNameSubmit}>
              <input
                type="text"
                value={character.name}
                onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                placeholder="Enter your character's name"
                className="w-full px-4 py-3 bg-surface-light border border-surface-light rounded-lg text-text focus:outline-none focus:border-secondary transition-colors"
                autoFocus
              />
              <div className="flex gap-3 mt-6">
                <a href="/" className="btn-secondary flex-1">
                  Cancel
                </a>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'race' && (
          <div>
            <h2 className="text-2xl font-semibold text-secondary mb-6">Choose Your Race</h2>
            <RaceSelector onSelect={handleRaceSelect} />
            <button onClick={handleBack} className="btn-secondary mt-6">
              Back
            </button>
          </div>
        )}

        {step === 'class' && (
          <div>
            <h2 className="text-2xl font-semibold text-secondary mb-6">Choose Your Class</h2>
            <ClassSelector onSelect={handleClassSelect} selectedRace={character.race!} />
            <button onClick={handleBack} className="btn-secondary mt-6">
              Back
            </button>
          </div>
        )}

        {step === 'stats' && (
          <div>
            <StatGenerator
              race={character.race!}
              characterClass={character.class!}
              onStatsConfirmed={handleStatsConfirmed}
              onBack={handleBack}
            />
          </div>
        )}

        {step === 'summary' && (
          <div>
            <h2 className="text-2xl font-semibold text-secondary mb-6">Confirm Your Character</h2>
            <CharacterSummary
              name={character.name}
              race={character.race!}
              characterClass={character.class!}
              baseStats={character.baseStats}
            />
            <div className="flex gap-4 mt-8">
              <button onClick={handleBack} className="btn-secondary flex-1">
                Back
              </button>
              <button
                onClick={handleCreateCharacter}
                disabled={isCreating}
                className="btn-primary flex-1"
              >
                {isCreating ? 'Creating...' : 'Create Character'}
              </button>
            </div>
          </div>
        )}

        {step === 'village' && createdCharacterId && (
          <div>
            <VillageCreator
              characterId={createdCharacterId}
              onComplete={handleVillageComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterCreator;

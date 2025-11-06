import React, { useState, useEffect } from 'react';
import CharacterPanel from './CharacterPanel.tsx';
import DungeonView from './DungeonView.tsx';
import InventoryPanel from './InventoryPanel.tsx';
import VillageHub from './VillageHub.tsx';

interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  experience: number;
  availableSkillPoints: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  gold: number;
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
  currentDungeonId: string | null;
  currentRoomX: number | null;
  currentRoomY: number | null;
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

interface Dungeon {
  id: string;
  name: string;
  width: number;
  height: number;
  level: number;
  difficulty: number;
}

interface Village {
  id: string;
  name: string;
  characterId: string;
  hasWeaponSmith: boolean;
  hasArmorSmith: boolean;
  hasPotionShop: boolean;
  hasTavern: boolean;
  hasGeneralMerchant: boolean;
  hasTemple: boolean;
  hasBlacksmith: boolean;
  hasEnchanter: boolean;
  hasAlchemist: boolean;
  hasTrainingGround: boolean;
  randomEventsEnabled: boolean;
  eventDifficulty: string;
  weaponSmithAvailable: boolean;
  armorSmithAvailable: boolean;
  potionShopAvailable: boolean;
  tavernAvailable: boolean;
  generalMerchantAvailable: boolean;
  templeAvailable: boolean;
  blacksmithAvailable: boolean;
  enchanterAvailable: boolean;
  alchemistAvailable: boolean;
  trainingGroundAvailable: boolean;
  weaponSmithReason?: string;
  armorSmithReason?: string;
  potionShopReason?: string;
  tavernReason?: string;
  generalMerchantReason?: string;
  templeReason?: string;
  blacksmithReason?: string;
  enchanterReason?: string;
  alchemistReason?: string;
  trainingGroundReason?: string;
}

const GameInterface: React.FC = () => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [dungeon, setDungeon] = useState<Dungeon | null>(null);
  const [village, setVillage] = useState<Village | null>(null);
  const [currentLocation, setCurrentLocation] = useState<'village' | 'dungeon'>('village');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'character' | 'inventory'>('character');

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    try {
      // Get character by ID or first character
      // For testing, try to load Test Hero (the one with skill points)
      const testHeroId = '666d3de5-d281-4f77-82bc-6c355ef55591';
      
      let charResponse = await fetch(`http://localhost:3001/api/characters/${testHeroId}`);
      
      // If Test Hero doesn't exist, fall back to first character
      if (!charResponse.ok) {
        const allCharsResponse = await fetch('http://localhost:3001/api/characters');
        if (!allCharsResponse.ok) throw new Error('Failed to load character');
        
        const charData = await allCharsResponse.json();
        const characters = charData.data?.characters || [];
        
        if (characters.length === 0) {
          // No character exists, redirect to character creation
          window.location.href = '/character/create';
          return;
        }
        
        charResponse = await fetch(`http://localhost:3001/api/characters/${characters[0].id}`);
      }
      
      if (!charResponse.ok) throw new Error('Failed to load character');
      
      const charData = await charResponse.json();
      const selectedCharacter = charData.data?.character;
      setCharacter(selectedCharacter);

      // Load village
      const villageResponse = await fetch(`http://localhost:3001/api/villages/${selectedCharacter.id}`);
      if (villageResponse.ok) {
        const villageData = await villageResponse.json();
        setVillage(villageData.data?.village);
        
        // Roll for random events if enabled
        if (villageData.data?.village?.randomEventsEnabled) {
          await fetch(`http://localhost:3001/api/villages/${selectedCharacter.id}/roll-events`, {
            method: 'POST',
          });
        }
      }

      // Check if character has an active dungeon
      if (selectedCharacter.currentDungeonId) {
        const dungeonResponse = await fetch(
          `http://localhost:3001/api/dungeons/${selectedCharacter.currentDungeonId}`
        );
        if (dungeonResponse.ok) {
          const dungeonData = await dungeonResponse.json();
          setDungeon(dungeonData.data?.dungeon || dungeonData);
          // If in dungeon, set location to dungeon
          if (selectedCharacter.currentRoomX !== null) {
            setCurrentLocation('dungeon');
          }
        }
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game');
      setLoading(false);
    }
  };

  const handleCharacterUpdate = (updatedCharacter: Character) => {
    setCharacter(updatedCharacter);
  };

  const handleDungeonUpdate = (updatedDungeon: Dungeon) => {
    setDungeon(updatedDungeon);
  };

  const handleVillageUpdate = (updatedVillage: Village) => {
    setVillage(updatedVillage);
  };

  const handleEnterDungeon = async () => {
    if (!character) return;

    // Generate or load level 1 dungeon
    if (!dungeon || dungeon.level !== 1) {
      try {
        const response = await fetch('http://localhost:3001/api/dungeons/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            characterId: character.id,
            width: 20,
            height: 20,
            level: 1,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setDungeon(data.data?.dungeon);
        }
      } catch (err) {
        console.error('Failed to generate dungeon:', err);
      }
    }

    setCurrentLocation('dungeon');
  };

  const handleReturnToVillage = () => {
    setCurrentLocation('village');
    
    // Roll for random events when returning to village
    if (village?.randomEventsEnabled && character) {
      fetch(`http://localhost:3001/api/villages/${character.id}/roll-events`, {
        method: 'POST',
      })
        .then(res => res.json())
        .then(data => setVillage(data.data?.village))
        .catch(err => console.error('Failed to roll events:', err));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card max-w-md">
          <h2 className="text-2xl font-semibold text-health mb-4">Error</h2>
          <p className="text-text-muted mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="btn-primary w-full"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!character) {
    return null;
  }

  // Show village if no village exists (shouldn't happen with new flow)
  if (!village) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card max-w-md text-center">
          <h2 className="text-2xl font-semibold text-secondary mb-4">No Village Found</h2>
          <p className="text-text-muted mb-6">
            You need to create a village first. Please start a new game.
          </p>
          <button
            onClick={() => window.location.href = '/character/create'}
            className="btn-primary w-full"
          >
            Create New Character
          </button>
        </div>
      </div>
    );
  }

  // Village View (full screen)
  if (currentLocation === 'village') {
    return (
      <VillageHub
        character={character}
        village={village}
        onEnterDungeon={handleEnterDungeon}
        onRefreshVillage={handleVillageUpdate}
      />
    );
  }

  // Dungeon View (with sidebar)
  if (!dungeon) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Generating dungeon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Left Sidebar - Character Info + Tabs + Adventure Log */}
      <aside className="w-72 bg-accent border-r border-surface flex flex-col overflow-hidden">
        {/* Back to Village */}
        <div className="p-3 border-b border-surface flex-shrink-0">
          <button 
            onClick={handleReturnToVillage}
            className="text-text-muted hover:text-secondary transition-colors inline-flex items-center gap-2 text-sm w-full"
          >
            <span>←</span>
            <span>Return to {village.name}</span>
          </button>
        </div>

        {/* Character Header */}
        <div className="p-3 border-b border-surface flex-shrink-0">
          <h1 className="text-lg font-bold text-secondary mb-1">{character.name}</h1>
          <p className="text-xs text-text-muted mb-3">
            Level {character.level} {character.race} {character.class}
          </p>
          
          {/* HP Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-text-muted">Health</span>
              <span className="text-xs text-text font-semibold">
                {character.health}/{character.maxHealth}
              </span>
            </div>
            <div className="w-full h-2 bg-surface-light rounded-full overflow-hidden">
              <div
                className="h-full bg-health transition-all duration-300"
                style={{ width: `${(character.health / character.maxHealth) * 100}%` }}
              />
            </div>
          </div>

          {/* MP Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-text-muted">Mana</span>
              <span className="text-xs text-text font-semibold">
                {character.mana}/{character.maxMana}
              </span>
            </div>
            <div className="w-full h-2 bg-surface-light rounded-full overflow-hidden">
              <div
                className="h-full bg-mana transition-all duration-300"
                style={{ width: `${(character.mana / character.maxMana) * 100}%` }}
              />
            </div>
          </div>

          {/* Gold */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-light rounded">
            <span className="text-gold text-base">⚜</span>
            <span className="text-gold font-semibold text-sm">{character.gold} Gold</span>
          </div>
        </div>

        {/* Panel Tabs */}
        <div className="flex gap-2 p-3 border-b border-surface flex-shrink-0">
          <button
            onClick={() => setActivePanel('character')}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
              activePanel === 'character'
                ? 'bg-secondary text-accent'
                : 'bg-surface-light text-text-muted hover:bg-surface'
            }`}
          >
            Character
          </button>
          <button
            onClick={() => setActivePanel('inventory')}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
              activePanel === 'inventory'
                ? 'bg-secondary text-accent'
                : 'bg-surface-light text-text-muted hover:bg-surface'
            }`}
          >
            Inventory
          </button>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-3 border-b border-surface min-h-0">
          {activePanel === 'character' ? (
            <CharacterPanel 
              character={character} 
              onCharacterUpdate={loadGameData}
            />
          ) : (
            <InventoryPanel characterId={character.id} gold={character.gold} />
          )}
        </div>

        {/* Adventure Log */}
        <div className="p-3 flex-shrink-0" style={{ maxHeight: '200px' }}>
          <h3 className="text-xs font-semibold text-secondary mb-2">Adventure Log</h3>
          <div className="space-y-1.5 text-xs text-text-muted overflow-y-auto" style={{ maxHeight: '150px' }}>
            <p className="p-2 bg-surface-light rounded">
              ⚔️ You have entered {dungeon.name}
            </p>
            <p className="p-2 bg-surface-light rounded">
              🗺️ The dungeon is vast and mysterious...
            </p>
            <p className="p-2 bg-surface-light rounded">
              💡 Use arrow keys or click to move
            </p>
          </div>
        </div>
      </aside>

      {/* Center - Dungeon View */}
      <main className="flex-1 overflow-hidden">
        <DungeonView
          character={character}
          dungeon={dungeon}
          onCharacterUpdate={handleCharacterUpdate}
          onDungeonUpdate={handleDungeonUpdate}
        />
      </main>
    </div>
  );
};

export default GameInterface;

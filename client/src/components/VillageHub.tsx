import React, { useState, useEffect } from 'react';

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

interface Character {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  gold: number;
}

interface VillageHubProps {
  character: Character;
  village: Village;
  onEnterDungeon: () => void;
  onRefreshVillage: (village: Village) => void;
}

interface Service {
  id: string;
  name: string;
  icon: string;
  description: string;
  available: boolean;
  reason?: string;
  hasService: boolean;
}

const VillageHub: React.FC<VillageHubProps> = ({
  character,
  village,
  onEnterDungeon,
  onRefreshVillage,
}) => {
  const [rolling, setRolling] = useState(false);

  const services: Service[] = [
    {
      id: 'weaponSmith',
      name: 'Weapon Smith',
      icon: '⚔️',
      description: 'Buy, sell, and upgrade weapons',
      hasService: village.hasWeaponSmith,
      available: village.weaponSmithAvailable,
      reason: village.weaponSmithReason,
    },
    {
      id: 'armorSmith',
      name: 'Armor Smith',
      icon: '🛡️',
      description: 'Buy, sell, and upgrade armor',
      hasService: village.hasArmorSmith,
      available: village.armorSmithAvailable,
      reason: village.armorSmithReason,
    },
    {
      id: 'potionShop',
      name: 'Potion Shop',
      icon: '🧪',
      description: 'Buy health and mana potions',
      hasService: village.hasPotionShop,
      available: village.potionShopAvailable,
      reason: village.potionShopReason,
    },
    {
      id: 'tavern',
      name: 'Ye Olde Tavern',
      icon: '🍺',
      description: 'Rest, hire companions, hear rumors',
      hasService: village.hasTavern,
      available: village.tavernAvailable,
      reason: village.tavernReason,
    },
    {
      id: 'generalMerchant',
      name: 'General Merchant',
      icon: '🏪',
      description: 'Buy and sell general goods',
      hasService: village.hasGeneralMerchant,
      available: village.generalMerchantAvailable,
      reason: village.generalMerchantReason,
    },
    {
      id: 'temple',
      name: 'Temple',
      icon: '⛪',
      description: 'Healing, cure curses, resurrection',
      hasService: village.hasTemple,
      available: village.templeAvailable,
      reason: village.templeReason,
    },
    {
      id: 'blacksmith',
      name: 'Blacksmith Workshop',
      icon: '🔨',
      description: 'Repair damaged equipment',
      hasService: village.hasBlacksmith,
      available: village.blacksmithAvailable,
      reason: village.blacksmithReason,
    },
    {
      id: 'enchanter',
      name: 'Enchanter',
      icon: '✨',
      description: 'Add magical properties to items',
      hasService: village.hasEnchanter,
      available: village.enchanterAvailable,
      reason: village.enchanterReason,
    },
    {
      id: 'alchemist',
      name: 'Alchemist',
      icon: '⚗️',
      description: 'Craft potions from ingredients',
      hasService: village.hasAlchemist,
      available: village.alchemistAvailable,
      reason: village.alchemistReason,
    },
    {
      id: 'trainingGround',
      name: 'Training Ground',
      icon: '🎯',
      description: 'Practice skills between runs',
      hasService: village.hasTrainingGround,
      available: village.trainingGroundAvailable,
      reason: village.trainingGroundReason,
    },
  ];

  const availableServices = services.filter(s => s.hasService);
  const openServices = availableServices.filter(s => s.available);
  const closedServices = availableServices.filter(s => !s.available);

  const handleRollEvents = async () => {
    if (!village.randomEventsEnabled) return;

    setRolling(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/villages/${character.id}/roll-events`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.ok) {
        const data = await response.json();
        onRefreshVillage(data.data.village);
      }
    } catch (err) {
      console.error('Failed to roll events:', err);
    } finally {
      setRolling(false);
    }
  };

  const handleServiceClick = (service: Service) => {
    if (!service.hasService) {
      alert(`${service.name} is not available in this village.`);
    } else if (!service.available) {
      alert(`${service.name} is currently closed: ${service.reason}`);
    } else {
      alert(`${service.name} - Coming soon!`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-accent rounded-lg border border-surface p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary mb-2">
                🏘️ {village.name}
              </h1>
              <p className="text-text-muted">
                Welcome back, {character.name}! Choose a service or venture into the dungeon.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-muted">Character Status</div>
              <div className="text-lg font-bold text-secondary">
                ❤️ {character.health}/{character.maxHealth} HP
              </div>
              <div className="text-lg font-bold text-mana">
                💙 {character.mana}/{character.maxMana} MP
              </div>
              <div className="text-lg font-bold text-gold">💰 {character.gold}g</div>
            </div>
          </div>

          {/* Random Events Info */}
          {village.randomEventsEnabled && (
            <div className="mt-4 p-3 bg-surface rounded border border-surface-light">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎲</span>
                  <div>
                    <div className="text-sm font-semibold text-secondary">
                      Random Events: {village.eventDifficulty}
                    </div>
                    <div className="text-xs text-text-muted">
                      Services may be temporarily unavailable
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleRollEvents}
                  disabled={rolling}
                  className="btn-secondary text-sm disabled:opacity-50"
                >
                  {rolling ? 'Rolling...' : 'Check Availability'}
                </button>
              </div>
              {closedServices.length > 0 && (
                <div className="mt-3 text-sm text-health">
                  ⚠️ Currently closed: {closedServices.map(s => s.name).join(', ')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {services.map(service => {
            if (!service.hasService) return null;

            const isOpen = service.available;
            
            return (
              <div
                key={service.id}
                onClick={() => handleServiceClick(service)}
                className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                  isOpen
                    ? 'border-surface-light hover:border-secondary hover:bg-accent'
                    : 'border-surface bg-surface opacity-60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`text-4xl ${!isOpen && 'grayscale'}`}>
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-text mb-1 flex items-center gap-2">
                      {service.name}
                      {isOpen ? (
                        <span className="text-xs text-green-500">● Open</span>
                      ) : (
                        <span className="text-xs text-health">● Closed</span>
                      )}
                    </h3>
                    <p className="text-xs text-text-muted mb-2">
                      {service.description}
                    </p>
                    {!isOpen && service.reason && (
                      <div className="text-xs italic text-health mt-2">
                        "{service.reason}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dungeon Entrance */}
        <div className="bg-accent rounded-lg border-2 border-secondary p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">⚔️</div>
              <div>
                <h2 className="text-2xl font-bold text-secondary mb-1">
                  Enter the Dungeon
                </h2>
                <p className="text-text-muted">
                  Descend into the depths and face untold dangers...
                </p>
              </div>
            </div>
            <button
              onClick={onEnterDungeon}
              className="btn-primary text-lg px-8 py-4"
            >
              🏰 Enter Dungeon
            </button>
          </div>
        </div>

        {/* Village Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-surface p-4 rounded border border-surface-light text-center">
            <div className="text-2xl font-bold text-secondary">
              {availableServices.length}
            </div>
            <div className="text-xs text-text-muted">Total Services</div>
          </div>
          <div className="bg-surface p-4 rounded border border-surface-light text-center">
            <div className="text-2xl font-bold text-green-500">
              {openServices.length}
            </div>
            <div className="text-xs text-text-muted">Currently Open</div>
          </div>
          <div className="bg-surface p-4 rounded border border-surface-light text-center">
            <div className="text-2xl font-bold text-health">
              {closedServices.length}
            </div>
            <div className="text-xs text-text-muted">Currently Closed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VillageHub;

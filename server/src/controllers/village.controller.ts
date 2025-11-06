import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Random event excuses for each service
const EVENT_REASONS = {
  weaponSmith: [
    'at a wedding in the neighboring village',
    'sick with fever',
    'traveling to the capital for supplies',
    'competing in the annual smithing competition',
  ],
  armorSmith: [
    'attending a guild meeting',
    'sick with the flu',
    'visiting family in the countryside',
    'at a funeral',
  ],
  potionShop: [
    'gathering rare herbs in the forest',
    'closed for inventory',
    'the owner is ill (ironically)',
    'restocking from the alchemist guild',
  ],
  tavern: [
    'full - there\'s a festival in town!',
    'closed for renovations',
    'the innkeeper is at a wedding',
    'hosting a private event',
  ],
  generalMerchant: [
    'robbed - limited stock today',
    'at the market in the next town',
    'closed for religious holiday',
    'taking a well-deserved rest day',
  ],
  temple: [
    'holding a sacred ceremony',
    'the priests are on a pilgrimage',
    'closed for meditation day',
    'performing an important ritual',
  ],
  blacksmith: [
    'at a wedding in the neighboring village',
    'the forge fire went out - relighting',
    'delivering a large order to the castle',
    'sick with exhaustion from overwork',
  ],
  enchanter: [
    'studying ancient texts in seclusion',
    'meditating to restore magical energy',
    'traveling to a magical convergence point',
    'the enchantments went haywire - cleaning up',
  ],
  alchemist: [
    'the lab exploded - closed for repairs',
    'experimenting with dangerous reagents',
    'gathering ingredients from the swamp',
    'teaching at the university today',
  ],
  trainingGround: [
    'flooded from the storm',
    'being used for military drills',
    'closed for tournament preparation',
    'the trainer is recovering from an injury',
  ],
};

// Get random reason for a service being unavailable
const getRandomReason = (service: keyof typeof EVENT_REASONS): string => {
  const reasons = EVENT_REASONS[service];
  return reasons[Math.floor(Math.random() * reasons.length)];
};

// Roll for random events based on difficulty
const rollForAvailability = (difficulty: string, hasService: boolean): boolean => {
  if (!hasService) return false; // Can't be available if not selected
  
  const roll = Math.random();
  switch (difficulty) {
    case 'RELIABLE':
      return true; // Always available
    case 'REALISTIC':
      return roll > 0.15; // 15% chance unavailable
    case 'CHAOTIC':
      return roll > 0.35; // 35% chance unavailable
    default:
      return true;
  }
};

/**
 * Create a new village for a character
 * POST /api/villages
 */
export const createVillage = async (req: Request, res: Response) => {
  try {
    const {
      characterId,
      name = 'The Village',
      services = [],
      randomEventsEnabled = false,
      eventDifficulty = 'REALISTIC',
    } = req.body;

    if (!characterId) {
      return res.status(400).json({
        status: 'error',
        message: 'Character ID is required',
      });
    }

    // Check if character exists
    const character = await prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      return res.status(404).json({
        status: 'error',
        message: 'Character not found',
      });
    }

    // Check if village already exists for this character
    const existingVillage = await prisma.village.findUnique({
      where: { characterId },
    });

    if (existingVillage) {
      return res.status(400).json({
        status: 'error',
        message: 'Village already exists for this character',
      });
    }

    // Create village with selected services
    const village = await prisma.village.create({
      data: {
        characterId,
        name,
        hasWeaponSmith: services.includes('weaponSmith'),
        hasArmorSmith: services.includes('armorSmith'),
        hasPotionShop: services.includes('potionShop'),
        hasTavern: services.includes('tavern'),
        hasGeneralMerchant: services.includes('generalMerchant'),
        hasTemple: services.includes('temple'),
        hasBlacksmith: services.includes('blacksmith'),
        hasEnchanter: services.includes('enchanter'),
        hasAlchemist: services.includes('alchemist'),
        hasTrainingGround: services.includes('trainingGround'),
        randomEventsEnabled,
        eventDifficulty,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { village },
    });
  } catch (err) {
    console.error('Error creating village:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create village',
    });
  }
};

/**
 * Get village for a character
 * GET /api/villages/:characterId
 */
export const getVillageByCharacter = async (req: Request, res: Response) => {
  try {
    const { characterId } = req.params;

    const village = await prisma.village.findUnique({
      where: { characterId },
    });

    if (!village) {
      return res.status(404).json({
        status: 'error',
        message: 'Village not found',
      });
    }

    res.json({
      status: 'success',
      data: { village },
    });
  } catch (err) {
    console.error('Error fetching village:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch village',
    });
  }
};

/**
 * Update village services
 * PATCH /api/villages/:characterId
 */
export const updateVillage = async (req: Request, res: Response) => {
  try {
    const { characterId } = req.params;
    const updates = req.body;

    const village = await prisma.village.update({
      where: { characterId },
      data: updates,
    });

    res.json({
      status: 'success',
      data: { village },
    });
  } catch (err) {
    console.error('Error updating village:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update village',
    });
  }
};

/**
 * Roll for random events (check service availability)
 * POST /api/villages/:characterId/roll-events
 */
export const rollRandomEvents = async (req: Request, res: Response) => {
  try {
    const { characterId } = req.params;

    const village = await prisma.village.findUnique({
      where: { characterId },
    });

    if (!village) {
      return res.status(404).json({
        status: 'error',
        message: 'Village not found',
      });
    }

    if (!village.randomEventsEnabled) {
      return res.json({
        status: 'success',
        message: 'Random events disabled',
        data: { village },
      });
    }

    // Roll for each service availability
    const updates: any = {
      lastEventRoll: new Date(),
      weaponSmithAvailable: rollForAvailability(village.eventDifficulty, village.hasWeaponSmith),
      armorSmithAvailable: rollForAvailability(village.eventDifficulty, village.hasArmorSmith),
      potionShopAvailable: rollForAvailability(village.eventDifficulty, village.hasPotionShop),
      tavernAvailable: rollForAvailability(village.eventDifficulty, village.hasTavern),
      generalMerchantAvailable: rollForAvailability(village.eventDifficulty, village.hasGeneralMerchant),
      templeAvailable: rollForAvailability(village.eventDifficulty, village.hasTemple),
      blacksmithAvailable: rollForAvailability(village.eventDifficulty, village.hasBlacksmith),
      enchanterAvailable: rollForAvailability(village.eventDifficulty, village.hasEnchanter),
      alchemistAvailable: rollForAvailability(village.eventDifficulty, village.hasAlchemist),
      trainingGroundAvailable: rollForAvailability(village.eventDifficulty, village.hasTrainingGround),
    };

    // Add reasons for unavailable services
    if (!updates.weaponSmithAvailable) updates.weaponSmithReason = getRandomReason('weaponSmith');
    if (!updates.armorSmithAvailable) updates.armorSmithReason = getRandomReason('armorSmith');
    if (!updates.potionShopAvailable) updates.potionShopReason = getRandomReason('potionShop');
    if (!updates.tavernAvailable) updates.tavernReason = getRandomReason('tavern');
    if (!updates.generalMerchantAvailable) updates.generalMerchantReason = getRandomReason('generalMerchant');
    if (!updates.templeAvailable) updates.templeReason = getRandomReason('temple');
    if (!updates.blacksmithAvailable) updates.blacksmithReason = getRandomReason('blacksmith');
    if (!updates.enchanterAvailable) updates.enchanterReason = getRandomReason('enchanter');
    if (!updates.alchemistAvailable) updates.alchemistReason = getRandomReason('alchemist');
    if (!updates.trainingGroundAvailable) updates.trainingGroundReason = getRandomReason('trainingGround');

    const updatedVillage = await prisma.village.update({
      where: { characterId },
      data: updates,
    });

    // Count unavailable services for message
    const unavailableServices = [
      !updates.weaponSmithAvailable && village.hasWeaponSmith && 'Weapon Smith',
      !updates.armorSmithAvailable && village.hasArmorSmith && 'Armor Smith',
      !updates.potionShopAvailable && village.hasPotionShop && 'Potion Shop',
      !updates.tavernAvailable && village.hasTavern && 'Tavern',
      !updates.generalMerchantAvailable && village.hasGeneralMerchant && 'General Merchant',
      !updates.templeAvailable && village.hasTemple && 'Temple',
      !updates.blacksmithAvailable && village.hasBlacksmith && 'Blacksmith',
      !updates.enchanterAvailable && village.hasEnchanter && 'Enchanter',
      !updates.alchemistAvailable && village.hasAlchemist && 'Alchemist',
      !updates.trainingGroundAvailable && village.hasTrainingGround && 'Training Ground',
    ].filter(Boolean);

    res.json({
      status: 'success',
      data: {
        village: updatedVillage,
        unavailableServices,
        message: unavailableServices.length > 0
          ? `Some services are unavailable: ${unavailableServices.join(', ')}`
          : 'All services are available!',
      },
    });
  } catch (err) {
    console.error('Error rolling random events:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to roll random events',
    });
  }
};

/**
 * Delete village
 * DELETE /api/villages/:characterId
 */
export const deleteVillage = async (req: Request, res: Response) => {
  try {
    const { characterId } = req.params;

    await prisma.village.delete({
      where: { characterId },
    });

    res.json({
      status: 'success',
      message: 'Village deleted',
    });
  } catch (err) {
    console.error('Error deleting village:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete village',
    });
  }
};

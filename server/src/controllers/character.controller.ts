import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";

// Temporarily inline these until we fix module resolution
const Race = {
  HUMAN: "HUMAN",
  DWARF: "DWARF",
  ELF: "ELF",
  HALFLING: "HALFLING",
} as const;

const CharacterClass = {
  WARRIOR: "WARRIOR",
  ROGUE: "ROGUE",
  MAGE: "MAGE",
  CLERIC: "CLERIC",
  RANGER: "RANGER",
} as const;

const BASE_STARTING_STATS = {
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

const STARTING_HEALTH = 100;
const STARTING_MANA = 50;
const STARTING_GOLD = 100;
const INVENTORY_DEFAULT_SLOTS = 20;

// Simplified for now - we'll load these from shared later
const RACE_DEFINITIONS: any = {
  HUMAN: { name: "Human", statModifiers: { fellowship: 5 } },
  DWARF: { name: "Dwarf", statModifiers: { toughness: 10, strength: 5 } },
  ELF: { name: "Elf", statModifiers: { agility: 10, dexterity: 5 } },
  HALFLING: { name: "Halfling", statModifiers: { agility: 10, dexterity: 10 } },
};

const CLASS_DEFINITIONS: any = {
  WARRIOR: {
    name: "Warrior",
    statModifiers: { weaponSkill: 15, strength: 10 },
  },
  ROGUE: { name: "Rogue", statModifiers: { agility: 15, dexterity: 15 } },
  MAGE: { name: "Mage", statModifiers: { intelligence: 20, willpower: 15 } },
  CLERIC: { name: "Cleric", statModifiers: { willpower: 15, fellowship: 10 } },
  RANGER: {
    name: "Ranger",
    statModifiers: { ballisticSkill: 15, agility: 10 },
  },
};

/**
 * Calculate final stats by applying race and class modifiers to base stats
 */
function calculateStats(race: string, characterClass: string, baseStats?: any) {
  const raceModifiers = RACE_DEFINITIONS[race].statModifiers;
  const classModifiers = CLASS_DEFINITIONS[characterClass].statModifiers;

  const base = baseStats || BASE_STARTING_STATS;

  return {
    weaponSkill:
      base.weaponSkill +
      (classModifiers.weaponSkill || 0) +
      (raceModifiers.weaponSkill || 0),
    ballisticSkill:
      base.ballisticSkill +
      (classModifiers.ballisticSkill || 0) +
      (raceModifiers.ballisticSkill || 0),
    strength:
      base.strength +
      (classModifiers.strength || 0) +
      (raceModifiers.strength || 0),
    toughness:
      base.toughness +
      (classModifiers.toughness || 0) +
      (raceModifiers.toughness || 0),
    initiative:
      base.initiative +
      (classModifiers.initiative || 0) +
      (raceModifiers.initiative || 0),
    agility:
      base.agility +
      (classModifiers.agility || 0) +
      (raceModifiers.agility || 0),
    dexterity:
      base.dexterity +
      (classModifiers.dexterity || 0) +
      (raceModifiers.dexterity || 0),
    intelligence:
      base.intelligence +
      (classModifiers.intelligence || 0) +
      (raceModifiers.intelligence || 0),
    willpower:
      base.willpower +
      (classModifiers.willpower || 0) +
      (raceModifiers.willpower || 0),
    fellowship:
      base.fellowship +
      (classModifiers.fellowship || 0) +
      (raceModifiers.fellowship || 0),
  };
}

/**
 * Get starting skills based on character class
 */
function getStartingSkills(characterClass: string) {
  const baseSkills = {
    // Melee
    swordSkill: 0,
    twoHandedSwordSkill: 0,
    axeSkill: 0,
    twoHandedAxeSkill: 0,
    daggerSkill: 0,
    spearSkill: 0,
    maceSkill: 0,
    // Ranged
    bowSkill: 0,
    crossbowSkill: 0,
    slingSkill: 0,
    throwingSkill: 0,
    // Magic
    fireMagicSkill: 0,
    iceMagicSkill: 0,
    lightningMagicSkill: 0,
    healingMagicSkill: 0,
    darkMagicSkill: 0,
    lightMagicSkill: 0,
    natureMagicSkill: 0,
    // Defense & Utility
    dodgeSkill: 10, // Everyone starts with basic dodge
    blockSkill: 0,
    parrySkill: 0,
    lockpickingSkill: 0,
    stealthSkill: 0,
    perceptionSkill: 5, // Everyone has basic perception
  };

  switch (characterClass) {
    case "WARRIOR":
      return {
        ...baseSkills,
        swordSkill: 20,
        axeSkill: 15,
        twoHandedSwordSkill: 15,
        maceSkill: 10,
        blockSkill: 20,
        parrySkill: 15,
      };
    case "ROGUE":
      return {
        ...baseSkills,
        daggerSkill: 25,
        swordSkill: 15,
        throwingSkill: 15,
        dodgeSkill: 25,
        stealthSkill: 25,
        lockpickingSkill: 20,
        perceptionSkill: 20,
      };
    case "MAGE":
      return {
        ...baseSkills,
        daggerSkill: 10,
        fireMagicSkill: 20,
        iceMagicSkill: 20,
        lightningMagicSkill: 20,
        dodgeSkill: 15,
      };
    case "CLERIC":
      return {
        ...baseSkills,
        maceSkill: 15,
        healingMagicSkill: 30,
        lightMagicSkill: 20,
        blockSkill: 10,
        perceptionSkill: 15,
      };
    case "RANGER":
      return {
        ...baseSkills,
        bowSkill: 30,
        daggerSkill: 15,
        spearSkill: 15,
        natureMagicSkill: 10,
        dodgeSkill: 20,
        perceptionSkill: 25,
        stealthSkill: 15,
      };
    default:
      return baseSkills;
  }
}

/**
 * Create a new character
 * POST /api/characters
 */
export const createCharacter = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, race, class: characterClass, baseStats } = req.body;

    // Validation
    if (!name || !race || !characterClass) {
      throw new AppError(400, "Name, race, and class are required");
    }

    if (!Object.values(Race).includes(race)) {
      throw new AppError(400, "Invalid race");
    }

    if (!Object.values(CharacterClass).includes(characterClass)) {
      throw new AppError(400, "Invalid class");
    }

    // Calculate stats with optional custom base stats
    const stats = calculateStats(race, characterClass, baseStats);

    // Get starting skills based on class
    const skills = getStartingSkills(characterClass);

    // Create character with inventory
    const character = await prisma.character.create({
      data: {
        name,
        race,
        class: characterClass,
        ...stats,
        ...skills,
        health: STARTING_HEALTH,
        maxHealth: STARTING_HEALTH,
        mana: STARTING_MANA,
        maxMana: STARTING_MANA,
        gold: STARTING_GOLD,
        inventory: {
          create: {
            maxSlots: INVENTORY_DEFAULT_SLOTS,
          },
        },
      },
      include: {
        inventory: {
          include: {
            items: {
              include: {
                item: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      status: "success",
      data: {
        character,
        message: `${character.name} the ${RACE_DEFINITIONS[race].name} ${CLASS_DEFINITIONS[characterClass].name} has entered the dungeon!`,
      },
    });
  }
);

/**
 * Get all characters
 * GET /api/characters
 */
export const getAllCharacters = asyncHandler(
  async (req: Request, res: Response) => {
    const characters = await prisma.character.findMany({
      include: {
        inventory: {
          include: {
            items: {
              include: {
                item: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      status: "success",
      data: {
        characters,
        count: characters.length,
      },
    });
  }
);

/**
 * Get character by ID
 * GET /api/characters/:id
 */
export const getCharacterById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const character = await prisma.character.findUnique({
      where: { id },
      include: {
        inventory: {
          include: {
            items: {
              include: {
                item: true,
              },
            },
          },
        },
        equippedWeapon: true,
        equippedArmor: true,
        knownSpells: {
          include: {
            spell: true,
          },
        },
      },
    });

    if (!character) {
      throw new AppError(404, "Character not found");
    }

    res.json({
      status: "success",
      data: { character },
    });
  }
);

/**
 * Update character
 * PUT /api/characters/:id
 */
export const updateCharacter = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    const character = await prisma.character.update({
      where: { id },
      data: updates,
      include: {
        inventory: {
          include: {
            items: {
              include: {
                item: true,
              },
            },
          },
        },
      },
    });

    res.json({
      status: "success",
      data: { character },
    });
  }
);

/**
 * Delete character
 * DELETE /api/characters/:id
 */
export const deleteCharacter = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    await prisma.character.delete({
      where: { id },
    });

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

/**
 * Level up character
 * POST /api/characters/:id/level-up
 */
export const levelUpCharacter = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const character = await prisma.character.findUnique({
      where: { id },
    });

    if (!character) {
      throw new AppError(404, "Character not found");
    }

    // Calculate skill points gained: (Intelligence + Willpower) / 4
    // This rewards smart/disciplined characters with more skill development
    const skillPointsGained = Math.floor(
      (character.intelligence + character.willpower) / 4
    );

    // Simple level up: increase stats and restore resources
    const updatedCharacter = await prisma.character.update({
      where: { id },
      data: {
        level: character.level + 1,
        availableSkillPoints:
          character.availableSkillPoints + skillPointsGained,
        maxHealth: character.maxHealth + 10,
        maxMana: character.maxMana + 5,
        health: character.maxHealth + 10, // Full restore on level up
        mana: character.maxMana + 5,
        // Increase all stats slightly
        weaponSkill: character.weaponSkill + 2,
        ballisticSkill: character.ballisticSkill + 2,
        strength: character.strength + 1,
        toughness: character.toughness + 1,
        initiative: character.initiative + 1,
        agility: character.agility + 1,
        dexterity: character.dexterity + 1,
        intelligence: character.intelligence + 1,
        willpower: character.willpower + 1,
        fellowship: character.fellowship + 1,
      },
    });

    res.json({
      status: "success",
      data: {
        character: updatedCharacter,
        skillPointsGained,
        message: `${updatedCharacter.name} has reached level ${updatedCharacter.level}! Gained ${skillPointsGained} skill points.`,
      },
    });
  }
);

/**
 * Track skill usage for progression system
 * POST /api/characters/:id/use-skill
 */
export const useSkill = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { skill } = req.body;

  if (!skill) {
    throw new AppError(400, "Skill name is required");
  }

  const skillFieldMap: Record<string, string> = {
    weaponSkill: "weaponSkillUses",
    ballisticSkill: "ballisticSkillUses",
    strength: "strengthUses",
    toughness: "toughnessUses",
    initiative: "initiativeUses",
    agility: "agilityUses",
    dexterity: "dexterityUses",
    intelligence: "intelligenceUses",
    willpower: "willpowerUses",
    fellowship: "fellowshipUses",
  };

  const usesField = skillFieldMap[skill];
  if (!usesField) {
    throw new AppError(400, "Invalid skill name");
  }

  const character = await prisma.character.findUnique({
    where: { id },
  });

  if (!character) {
    throw new AppError(404, "Character not found");
  }

  const currentUses = (character as any)[usesField];
  const updatedCharacter = await prisma.character.update({
    where: { id },
    data: {
      [usesField]: currentUses + 1,
    },
  });

  res.json({
    status: "success",
    data: {
      character: updatedCharacter,
      message: `${skill} use recorded`,
    },
  });
});

/**
 * Spend upgrade points to improve stats or skills
 * POST /api/characters/:id/spend-upgrade-points
 */
export const spendUpgradePoints = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { type, name, points } = req.body;

    // Validate input
    if (!type || !name || !points || points < 1) {
      throw new AppError(
        400,
        "Valid type, name, and positive points amount required"
      );
    }

    if (type !== "stat" && type !== "skill") {
      throw new AppError(400, "Type must be 'stat' or 'skill'");
    }

    const character = await prisma.character.findUnique({
      where: { id },
    });

    if (!character) {
      throw new AppError(404, "Character not found");
    }

    // Define valid fields
    const validStats = [
      "weaponSkill",
      "ballisticSkill",
      "strength",
      "toughness",
      "initiative",
      "agility",
      "dexterity",
      "intelligence",
      "willpower",
      "fellowship",
    ];

    const validSkills = [
      "swordSkill",
      "twoHandedSwordSkill",
      "axeSkill",
      "twoHandedAxeSkill",
      "daggerSkill",
      "spearSkill",
      "maceSkill",
      "bowSkill",
      "crossbowSkill",
      "slingSkill",
      "throwingSkill",
      "fireMagicSkill",
      "iceMagicSkill",
      "lightningMagicSkill",
      "healingMagicSkill",
      "darkMagicSkill",
      "lightMagicSkill",
      "natureMagicSkill",
      "dodgeSkill",
      "blockSkill",
      "parrySkill",
      "lockpickingSkill",
      "stealthSkill",
      "perceptionSkill",
    ];

    // Validate name based on type
    const validFields = type === "stat" ? validStats : validSkills;
    if (!validFields.includes(name)) {
      throw new AppError(400, `Invalid ${type} name: ${name}`);
    }

    // Calculate cost (stats cost 3x more than skills)
    const costMultiplier = type === "stat" ? 3 : 1;
    const totalCost = points * costMultiplier;

    if (character.availableSkillPoints < totalCost) {
      throw new AppError(
        400,
        `Not enough upgrade points. Available: ${character.availableSkillPoints}, Required: ${totalCost} (${points} points × ${costMultiplier})`
      );
    }

    // Update the character
    const currentValue = (character as any)[name] || 0;
    const updatedCharacter = await prisma.character.update({
      where: { id },
      data: {
        [name]: currentValue + points,
        availableSkillPoints: character.availableSkillPoints - totalCost,
      },
    });

    const typeName = type === "stat" ? "stat" : "skill";
    res.json({
      status: "success",
      data: {
        character: updatedCharacter,
        message: `Increased ${name} by ${points} (cost: ${totalCost} points). ${updatedCharacter.availableSkillPoints} upgrade points remaining.`,
        upgrade: {
          type: typeName,
          name,
          pointsSpent: points,
          cost: totalCost,
          newValue: currentValue + points,
        },
      },
    });
  }
);

import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

/**
 * Get inventory for a character
 * GET /api/inventory/:characterId
 */
export const getInventory = asyncHandler(async (req: Request, res: Response) => {
  const { characterId } = req.params;

  const inventory = await prisma.inventory.findUnique({
    where: { characterId },
    include: {
      items: {
        include: {
          item: true,
        },
      },
    },
  });

  if (!inventory) {
    throw new AppError(404, 'Inventory not found');
  }

  res.json({
    status: 'success',
    data: { inventory },
  });
});

/**
 * Add item to inventory
 * POST /api/inventory/:characterId/add-item
 */
export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const { characterId } = req.params;
  const { itemId, quantity = 1 } = req.body;

  // TODO: Implement add item logic with slot checking
  
  res.status(501).json({
    status: 'error',
    message: 'Inventory system coming soon!',
  });
});

/**
 * Remove item from inventory
 * POST /api/inventory/:characterId/remove-item
 */
export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  const { characterId } = req.params;
  const { itemId, quantity = 1 } = req.body;

  // TODO: Implement remove item logic
  
  res.status(501).json({
    status: 'error',
    message: 'Inventory system coming soon!',
  });
});

/**
 * Equip an item
 * POST /api/inventory/:characterId/equip
 */
export const equipItem = asyncHandler(async (req: Request, res: Response) => {
  const { characterId } = req.params;
  const { itemId } = req.body;

  // TODO: Implement equip item logic
  
  res.status(501).json({
    status: 'error',
    message: 'Inventory system coming soon!',
  });
});

/**
 * Unequip an item
 * POST /api/inventory/:characterId/unequip
 */
export const unequipItem = asyncHandler(async (req: Request, res: Response) => {
  const { characterId } = req.params;
  const { itemId } = req.body;

  // TODO: Implement unequip item logic
  
  res.status(501).json({
    status: 'error',
    message: 'Inventory system coming soon!',
  });
});

/**
 * Use a consumable item
 * POST /api/inventory/:characterId/use-item
 */
export const useItem = asyncHandler(async (req: Request, res: Response) => {
  const { characterId } = req.params;
  const { itemId } = req.body;

  // TODO: Implement use item logic (potions, scrolls, etc.)
  
  res.status(501).json({
    status: 'error',
    message: 'Inventory system coming soon!',
  });
});

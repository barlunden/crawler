import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller.js';

const router = Router();

// Inventory operations
router.get('/:characterId', inventoryController.getInventory);
router.post('/:characterId/add-item', inventoryController.addItem);
router.post('/:characterId/remove-item', inventoryController.removeItem);
router.post('/:characterId/equip', inventoryController.equipItem);
router.post('/:characterId/unequip', inventoryController.unequipItem);
router.post('/:characterId/use-item', inventoryController.useItem);

export default router;

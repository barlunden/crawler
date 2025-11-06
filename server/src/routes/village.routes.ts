import { Router } from 'express';
import * as villageController from '../controllers/village.controller.js';

const router = Router();

// Village management
router.post('/', villageController.createVillage);
router.get('/:characterId', villageController.getVillageByCharacter);
router.patch('/:characterId', villageController.updateVillage);
router.delete('/:characterId', villageController.deleteVillage);

// Random events
router.post('/:characterId/roll-events', villageController.rollRandomEvents);

export default router;

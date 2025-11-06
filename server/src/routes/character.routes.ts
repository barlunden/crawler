import { Router } from 'express';
import * as characterController from '../controllers/character.controller.js';

const router = Router();

// Character CRUD operations
router.post('/', characterController.createCharacter);
router.get('/', characterController.getAllCharacters);
router.get('/:id', characterController.getCharacterById);
router.put('/:id', characterController.updateCharacter);
router.delete('/:id', characterController.deleteCharacter);

// Character stats and progression
router.post('/:id/level-up', characterController.levelUpCharacter);
router.post('/:id/use-skill', characterController.useSkill);
router.post('/:id/spend-upgrade-points', characterController.spendUpgradePoints);

export default router;

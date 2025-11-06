import { Router } from 'express';
import * as combatController from '../controllers/combat.controller.js';

const router = Router();

// Combat operations
router.post('/start', combatController.startCombat);
router.get('/:id', combatController.getCombatState);
router.post('/:id/action', combatController.performAction);
router.post('/:id/end', combatController.endCombat);

export default router;

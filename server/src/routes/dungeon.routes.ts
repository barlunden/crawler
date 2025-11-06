import { Router } from 'express';
import * as dungeonController from '../controllers/dungeon.controller.js';

const router = Router();

// Dungeon generation and exploration
router.post('/generate', dungeonController.generateDungeon);
router.get('/:id', dungeonController.getDungeonById);
router.post('/:id/move', dungeonController.moveToRoom);
router.get('/:id/current-room', dungeonController.getCurrentRoom);

// Multi-level dungeon navigation
router.post('/:id/descend', dungeonController.descendLevel);
router.post('/:id/ascend', dungeonController.ascendLevel);

export default router;

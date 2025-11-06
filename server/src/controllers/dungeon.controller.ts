import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

// Temporarily inline until we fix module resolution
const DungeonRoomType = {
  EMPTY: 'EMPTY',
  COMBAT: 'COMBAT',
  TREASURE: 'TREASURE',
  MERCHANT: 'MERCHANT',
  BOSS: 'BOSS',
  ENTRANCE: 'ENTRANCE',
  EXIT: 'EXIT',
  TRAP: 'TRAP'
} as const;

/**
 * Generate a new dungeon
 * POST /api/dungeons/generate
 */
export const generateDungeon = async (req: Request, res: Response) => {
  try {
    const { characterId, name, level } = req.body;

    if (!characterId) {
      return res.status(400).json({
        status: 'error',
        message: 'Character ID is required',
      });
    }

    const character = await prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      return res.status(404).json({
        status: 'error',
        message: 'Character not found',
      });
    }

    // Use provided level or default to 1
    const dungeonLevel = level || 1;
    const difficulty = dungeonLevel; // Difficulty scales with depth

    const dungeonWidth = 20;
    const dungeonHeight = 20;

    // Create dungeon
    const dungeon = await prisma.dungeon.create({
      data: {
        name: name || `The Dark Depths - Level ${dungeonLevel}`,
        level: dungeonLevel,
        difficulty,
        width: dungeonWidth,
        height: dungeonHeight,
        characterId,
      },
    });

    // Generate maze-like dungeon using recursive backtracking
    const rooms = generateMazeDungeon(dungeonWidth, dungeonHeight, difficulty);

    // Create all rooms in database
    await prisma.dungeonRoom.createMany({
      data: rooms.map((room) => ({
        dungeonId: dungeon.id,
        x: room.x,
        y: room.y,
        type: room.type,
        isExplored: room.x === 0 && room.y === 0, // Only entrance is explored
        isVisible: room.x === 0 && room.y === 0,
        hasNorthWall: room.hasNorthWall,
        hasSouthWall: room.hasSouthWall,
        hasEastWall: room.hasEastWall,
        hasWestWall: room.hasWestWall,
      })),
    });

    // Update character position to entrance (0, 0)
    await prisma.character.update({
      where: { id: characterId },
      data: {
        currentDungeonId: dungeon.id,
        currentRoomX: 0,
        currentRoomY: 0,
      },
    });

    res.json({
      status: 'success',
      data: {
        dungeon,
      },
    });
  } catch (error) {
    console.error('Error generating dungeon:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate dungeon',
    });
  }
};

// Maze generation using recursive backtracking (DFS)
function generateMazeDungeon(width: number, height: number, difficulty: number = 1) {
  // Initialize grid with all walls
  const grid: any[][] = [];
  for (let y = 0; y < height; y++) {
    grid[y] = [];
    for (let x = 0; x < width; x++) {
      grid[y][x] = {
        x,
        y,
        type: 'CORRIDOR',
        visited: false,
        hasNorthWall: true,
        hasSouthWall: true,
        hasEastWall: true,
        hasWestWall: true,
      };
    }
  }

  // Recursive backtracking to carve passages
  const stack: { x: number; y: number }[] = [];
  const startX = 0;
  const startY = 0;

  grid[startY][startX].visited = true;
  stack.push({ x: startX, y: startY });

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(current.x, current.y, grid, width, height);

    if (neighbors.length > 0) {
      // Choose random neighbor
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      // Remove wall between current and next
      removeWall(grid, current.x, current.y, next.x, next.y);
      
      // Mark next as visited
      grid[next.y][next.x].visited = true;
      stack.push({ x: next.x, y: next.y });
    } else {
      // Backtrack
      stack.pop();
    }
  }

  // Assign room types
  const rooms: any[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = grid[y][x];
      
      // Set entrance
      if (x === 0 && y === 0) {
        cell.type = 'ENTRANCE';
      }
      // Set exit (far corner)
      else if (x === width - 1 && y === height - 1) {
        cell.type = 'EXIT';
      }
      // Randomly assign special rooms (scaled by difficulty)
      else {
        const rand = Math.random();
        const openings = countOpenings(cell);
        
        // Higher difficulty = more combat, fewer merchants
        const combatChance = Math.min(0.6, 0.2 + (difficulty * 0.1));
        const treasureChance = Math.max(0.15, 0.3 - (difficulty * 0.03));
        const merchantChance = Math.max(0.05, 0.15 - (difficulty * 0.02));
        
        // Dead ends are good for treasure/merchants
        if (openings === 1) {
          if (rand < treasureChance) cell.type = 'TREASURE';
          else if (rand < treasureChance + merchantChance) cell.type = 'MERCHANT';
          else if (rand < treasureChance + merchantChance + combatChance) cell.type = 'COMBAT';
        }
        // Intersections are more dangerous
        else if (openings >= 3) {
          if (rand < combatChance) cell.type = 'COMBAT';
          else if (rand < combatChance + 0.2) cell.type = 'TRAP';
        }
        // Regular corridors
        else {
          if (rand < combatChance * 0.5) cell.type = 'COMBAT';
          else if (rand < combatChance * 0.5 + 0.1) cell.type = 'TRAP';
          else if (rand < combatChance * 0.5 + 0.1 + treasureChance) cell.type = 'TREASURE';
        }
      }
      
      rooms.push(cell);
    }
  }

  return rooms;
}

function getUnvisitedNeighbors(x: number, y: number, grid: any[][], width: number, height: number) {
  const neighbors: { x: number; y: number }[] = [];
  
  // North
  if (y > 0 && !grid[y - 1][x].visited) {
    neighbors.push({ x, y: y - 1 });
  }
  // South
  if (y < height - 1 && !grid[y + 1][x].visited) {
    neighbors.push({ x, y: y + 1 });
  }
  // East
  if (x < width - 1 && !grid[y][x + 1].visited) {
    neighbors.push({ x: x + 1, y });
  }
  // West
  if (x > 0 && !grid[y][x - 1].visited) {
    neighbors.push({ x: x - 1, y });
  }
  
  return neighbors;
}

function removeWall(grid: any[][], x1: number, y1: number, x2: number, y2: number) {
  // Remove wall between two cells
  if (x2 === x1 && y2 === y1 - 1) {
    // North
    grid[y1][x1].hasNorthWall = false;
    grid[y2][x2].hasSouthWall = false;
  } else if (x2 === x1 && y2 === y1 + 1) {
    // South
    grid[y1][x1].hasSouthWall = false;
    grid[y2][x2].hasNorthWall = false;
  } else if (x2 === x1 + 1 && y2 === y1) {
    // East
    grid[y1][x1].hasEastWall = false;
    grid[y2][x2].hasWestWall = false;
  } else if (x2 === x1 - 1 && y2 === y1) {
    // West
    grid[y1][x1].hasWestWall = false;
    grid[y2][x2].hasEastWall = false;
  }
}

function countOpenings(cell: any): number {
  let count = 0;
  if (!cell.hasNorthWall) count++;
  if (!cell.hasSouthWall) count++;
  if (!cell.hasEastWall) count++;
  if (!cell.hasWestWall) count++;
  return count;
}

/**
 * Get dungeon by ID
 * GET /api/dungeons/:id
 */
export const getDungeonById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const dungeon = await prisma.dungeon.findUnique({
    where: { id },
    include: {
      rooms: true,
      character: true,
    },
  });

  if (!dungeon) {
    throw new AppError(404, 'Dungeon not found');
  }

  res.json({
    status: 'success',
    data: { dungeon },
  });
});

/**
 * Move to a room in the dungeon
 * POST /api/dungeons/:id/move
 */
export const moveToRoom = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { characterId, x, y } = req.body;

  if (characterId === undefined || x === undefined || y === undefined) {
    throw new AppError(400, 'Character ID, x, and y coordinates are required');
  }

  const dungeon = await prisma.dungeon.findUnique({
    where: { id },
  });

  if (!dungeon) {
    throw new AppError(404, 'Dungeon not found');
  }

  // Validate movement (can only move to adjacent rooms)
  const character = await prisma.character.findUnique({
    where: { id: characterId },
  });

  if (!character) {
    throw new AppError(404, 'Character not found');
  }

  const currentX = character.currentRoomX || 0;
  const currentY = character.currentRoomY || 0;
  const distance = Math.abs(x - currentX) + Math.abs(y - currentY);

  if (distance !== 1) {
    throw new AppError(400, 'Can only move to adjacent rooms');
  }

  // Get current room to check for walls
  const currentRoom = await prisma.dungeonRoom.findUnique({
    where: {
      dungeonId_x_y: {
        dungeonId: id,
        x: currentX,
        y: currentY,
      },
    },
  });

  if (!currentRoom) {
    throw new AppError(404, 'Current room not found');
  }

  // Check if there's a wall blocking the movement
  let blocked = false;
  if (x === currentX && y === currentY - 1 && currentRoom.hasNorthWall) {
    blocked = true; // Moving north
  } else if (x === currentX && y === currentY + 1 && currentRoom.hasSouthWall) {
    blocked = true; // Moving south
  } else if (x === currentX + 1 && y === currentY && currentRoom.hasEastWall) {
    blocked = true; // Moving east
  } else if (x === currentX - 1 && y === currentY && currentRoom.hasWestWall) {
    blocked = true; // Moving west
  }

  if (blocked) {
    throw new AppError(400, 'There is a wall blocking your path');
  }

  // Find the destination room
  const room = await prisma.dungeonRoom.findUnique({
    where: {
      dungeonId_x_y: {
        dungeonId: id,
        x,
        y,
      },
    },
  });

  if (!room) {
    throw new AppError(404, 'Room not found');
  }

  // Update room and character
  await prisma.dungeonRoom.update({
    where: { id: room.id },
    data: {
      isExplored: true,
      isVisible: true,
    },
  });

  await prisma.character.update({
    where: { id: characterId },
    data: {
      currentRoomX: x,
      currentRoomY: y,
    },
  });

  const updatedRoom = await prisma.dungeonRoom.findUnique({
    where: { id: room.id },
  });

  res.json({
    status: 'success',
    data: {
      room: updatedRoom,
      message: `Moved to room (${x}, ${y})`,
    },
  });
});

/**
 * Get current room
 * GET /api/dungeons/:id/current-room
 */
export const getCurrentRoom = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { characterId } = req.query;

  if (!characterId) {
    throw new AppError(400, 'Character ID is required');
  }

  const character = await prisma.character.findUnique({
    where: { id: characterId as string },
  });

  if (!character) {
    throw new AppError(404, 'Character not found');
  }

  const room = await prisma.dungeonRoom.findUnique({
    where: {
      dungeonId_x_y: {
        dungeonId: id,
        x: character.currentRoomX || 0,
        y: character.currentRoomY || 0,
      },
    },
  });

  res.json({
    status: 'success',
    data: { room },
  });
});

/**
 * Descend to next dungeon level (from EXIT room)
 * POST /api/dungeons/:id/descend
 */
export const descendLevel = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { characterId } = req.body;

  if (!characterId) {
    throw new AppError(400, 'Character ID is required');
  }

  const character = await prisma.character.findUnique({
    where: { id: characterId },
  });

  if (!character) {
    throw new AppError(404, 'Character not found');
  }

  // Check if character is at EXIT room
  const currentRoom = await prisma.dungeonRoom.findUnique({
    where: {
      dungeonId_x_y: {
        dungeonId: id,
        x: character.currentRoomX || 0,
        y: character.currentRoomY || 0,
      },
    },
  });

  if (!currentRoom || currentRoom.type !== 'EXIT') {
    throw new AppError(400, 'Must be at EXIT room to descend');
  }

  // Get current dungeon info
  const currentDungeon = await prisma.dungeon.findUnique({
    where: { id },
  });

  if (!currentDungeon) {
    throw new AppError(404, 'Dungeon not found');
  }

  // Create new dungeon at next level
  const nextLevel = currentDungeon.level + 1;
  const dungeonWidth = 20;
  const dungeonHeight = 20;

  const newDungeon = await prisma.dungeon.create({
    data: {
      name: `The Dark Depths - Level ${nextLevel}`,
      level: nextLevel,
      difficulty: nextLevel,
      width: dungeonWidth,
      height: dungeonHeight,
      characterId,
    },
  });

  // Generate new dungeon
  const rooms = generateMazeDungeon(dungeonWidth, dungeonHeight, nextLevel);

  await prisma.dungeonRoom.createMany({
    data: rooms.map((room: any) => ({
      dungeonId: newDungeon.id,
      x: room.x,
      y: room.y,
      type: room.type,
      isExplored: room.x === 0 && room.y === 0, // Start room explored
      hasNorthWall: room.hasNorthWall,
      hasSouthWall: room.hasSouthWall,
      hasEastWall: room.hasEastWall,
      hasWestWall: room.hasWestWall,
    })),
  });

  // Update character position to new dungeon entrance
  await prisma.character.update({
    where: { id: characterId },
    data: {
      currentDungeonId: newDungeon.id,
      currentRoomX: 0,
      currentRoomY: 0,
    },
  });

  res.json({
    status: 'success',
    data: {
      dungeon: newDungeon,
      message: `Descended to Level ${nextLevel}! The darkness grows deeper...`,
    },
  });
});

/**
 * Ascend to previous dungeon level (from ENTRANCE room)
 * POST /api/dungeons/:id/ascend
 */
export const ascendLevel = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { characterId } = req.body;

  if (!characterId) {
    throw new AppError(400, 'Character ID is required');
  }

  const character = await prisma.character.findUnique({
    where: { id: characterId },
  });

  if (!character) {
    throw new AppError(404, 'Character not found');
  }

  // Check if character is at ENTRANCE room
  const currentRoom = await prisma.dungeonRoom.findUnique({
    where: {
      dungeonId_x_y: {
        dungeonId: id,
        x: character.currentRoomX || 0,
        y: character.currentRoomY || 0,
      },
    },
  });

  if (!currentRoom || currentRoom.type !== 'ENTRANCE') {
    throw new AppError(400, 'Must be at ENTRANCE room to ascend');
  }

  // Get current dungeon info
  const currentDungeon = await prisma.dungeon.findUnique({
    where: { id },
  });

  if (!currentDungeon) {
    throw new AppError(404, 'Dungeon not found');
  }

  if (currentDungeon.level <= 1) {
    throw new AppError(400, 'Already at surface level - you can leave the dungeon!');
  }

  // Find previous level dungeon
  const previousDungeon = await prisma.dungeon.findFirst({
    where: {
      characterId,
      level: currentDungeon.level - 1,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!previousDungeon) {
    throw new AppError(404, 'Previous dungeon level not found');
  }

  // Move character to EXIT room of previous level
  await prisma.character.update({
    where: { id: characterId },
    data: {
      currentDungeonId: previousDungeon.id,
      currentRoomX: previousDungeon.width - 1,
      currentRoomY: previousDungeon.height - 1,
    },
  });

  res.json({
    status: 'success',
    data: {
      dungeon: previousDungeon,
      message: `Ascended to Level ${previousDungeon.level}. The light grows brighter...`,
    },
  });
});

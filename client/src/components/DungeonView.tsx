import React, { useState, useEffect } from 'react';

interface Character {
  id: string;
  name: string;
  currentRoomX: number | null;
  currentRoomY: number | null;
}

interface Dungeon {
  id: string;
  name: string;
  width: number;
  height: number;
  level: number;
  difficulty: number;
}

interface DungeonRoom {
  x: number;
  y: number;
  type: string;
  visited: boolean;
  description: string;
  hasNorthWall?: boolean;
  hasSouthWall?: boolean;
  hasEastWall?: boolean;
  hasWestWall?: boolean;
}

interface DungeonViewProps {
  character: Character;
  dungeon: Dungeon;
  onCharacterUpdate: (character: any) => void;
  onDungeonUpdate: (dungeon: any) => void;
}

const DungeonView: React.FC<DungeonViewProps> = ({
  character,
  dungeon,
  onCharacterUpdate,
  onDungeonUpdate,
}) => {
  const [currentRoom, setCurrentRoom] = useState<DungeonRoom | null>(null);
  const [nearbyRooms, setNearbyRooms] = useState<DungeonRoom[]>([]);
  const [minimapRooms, setMinimapRooms] = useState<Map<string, DungeonRoom>>(new Map());
  const [isMoving, setIsMoving] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    loadCurrentRoom();
    loadMinimapRooms();
  }, [character.currentRoomX, character.currentRoomY]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent moving if already moving
      if (isMoving) return;

      // Map arrow keys to directions
      const keyMap: { [key: string]: 'north' | 'south' | 'east' | 'west' } = {
        ArrowUp: 'north',
        ArrowDown: 'south',
        ArrowRight: 'east',
        ArrowLeft: 'west',
        w: 'north',
        s: 'south',
        d: 'east',
        a: 'west',
        W: 'north',
        S: 'south',
        D: 'east',
        A: 'west',
      };

      const direction = keyMap[event.key];
      if (direction) {
        event.preventDefault(); // Prevent page scrolling
        moveToRoom(direction);
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMoving, character.currentRoomX, character.currentRoomY, dungeon]);

  const loadCurrentRoom = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/dungeons/${dungeon.id}/current-room?characterId=${character.id}`
      );
      if (response.ok) {
        const data = await response.json();
        const room = data.data?.room || data.room;
        if (room) {
          // Transform to expected format
          setCurrentRoom({
            x: room.x,
            y: room.y,
            type: room.type,
            visited: room.isExplored,
            description: getRoomDescription(room.type),
            hasNorthWall: room.hasNorthWall,
            hasSouthWall: room.hasSouthWall,
            hasEastWall: room.hasEastWall,
            hasWestWall: room.hasWestWall,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load room:', err);
    }
  };

  const loadMinimapRooms = async () => {
    try {
      const currentX = character.currentRoomX || 0;
      const currentY = character.currentRoomY || 0;
      
      // Load all rooms from dungeon
      const response = await fetch(`http://localhost:3001/api/dungeons/${dungeon.id}`);
      if (response.ok) {
        const data = await response.json();
        const rooms = data.data?.dungeon?.rooms || [];
        
        const roomMap = new Map<string, DungeonRoom>();
        rooms.forEach((room: any) => {
          // Only load visible/explored rooms near current position
          if (room.isExplored && Math.abs(room.x - currentX) <= 2 && Math.abs(room.y - currentY) <= 2) {
            roomMap.set(`${room.x},${room.y}`, {
              x: room.x,
              y: room.y,
              type: room.type,
              visited: room.isExplored,
              description: getRoomDescription(room.type),
              hasNorthWall: room.hasNorthWall,
              hasSouthWall: room.hasSouthWall,
              hasEastWall: room.hasEastWall,
              hasWestWall: room.hasWestWall,
            });
          }
        });
        
        setMinimapRooms(roomMap);
      }
    } catch (err) {
      console.error('Failed to load minimap rooms:', err);
    }
  };

  const getRoomDescription = (type: string): string => {
    switch (type.toUpperCase()) {
      case 'ENTRANCE':
        return 'The entrance to the dungeon. A dark passage stretches before you.';
      case 'EXIT':
        return 'You see light ahead. This must be the exit!';
      case 'COMBAT':
        return 'You hear the sound of creatures lurking in the shadows...';
      case 'TREASURE':
        return 'A glint of gold catches your eye in the corner.';
      case 'MERCHANT':
        return 'A mysterious merchant has set up shop here.';
      case 'TRAP':
        return 'Something feels off about this room...';
      case 'REST':
        return 'A safe haven where you can rest and recover.';
      default:
        return 'An empty room. Nothing of interest here.';
    }
  };

  const moveToRoom = async (direction: 'north' | 'south' | 'east' | 'west') => {
    if (isMoving) return;

    const currentX = character.currentRoomX || 0;
    const currentY = character.currentRoomY || 0;

    const moves = {
      north: { x: currentX, y: currentY - 1 },
      south: { x: currentX, y: currentY + 1 },
      east: { x: currentX + 1, y: currentY },
      west: { x: currentX - 1, y: currentY },
    };

    const newPos = moves[direction];

    // Check if move is valid (within bounds)
    if (
      newPos.x < 0 ||
      newPos.x >= dungeon.width ||
      newPos.y < 0 ||
      newPos.y >= dungeon.height
    ) {
      return;
    }

    setIsMoving(true);

    try {
      const response = await fetch(
        `http://localhost:3001/api/dungeons/${dungeon.id}/move`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            characterId: character.id,
            x: newPos.x,
            y: newPos.y,
          }),
        }
      );

      if (response.ok) {
        // Update character with new position
        const updatedCharacter = { ...character, currentRoomX: newPos.x, currentRoomY: newPos.y };
        onCharacterUpdate(updatedCharacter);
        
        // Reload current room
        await loadCurrentRoom();
      }
    } catch (err) {
      console.error('Failed to move:', err);
    } finally {
      setIsMoving(false);
    }
  };

  const descendLevel = async () => {
    if (isTransitioning || currentRoom?.type.toUpperCase() !== 'EXIT') return;

    setIsTransitioning(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/dungeons/${dungeon.id}/descend`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ characterId: character.id }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const newDungeon = data.data.dungeon;
        const updatedCharacter = { 
          ...character, 
          dungeonId: newDungeon.id,
          currentRoomX: 0, 
          currentRoomY: 0 
        };
        
        onCharacterUpdate(updatedCharacter);
        onDungeonUpdate(newDungeon);
        
        // Reload room data
        await loadCurrentRoom();
        await loadMinimapRooms();
      }
    } catch (err) {
      console.error('Failed to descend:', err);
    } finally {
      setIsTransitioning(false);
    }
  };

  const ascendLevel = async () => {
    if (isTransitioning || currentRoom?.type.toUpperCase() !== 'ENTRANCE') return;

    setIsTransitioning(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/dungeons/${dungeon.id}/ascend`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ characterId: character.id }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const previousDungeon = data.data.dungeon;
        const updatedCharacter = { 
          ...character, 
          dungeonId: previousDungeon.id,
          currentRoomX: previousDungeon.width - 1, 
          currentRoomY: previousDungeon.height - 1 
        };
        
        onCharacterUpdate(updatedCharacter);
        onDungeonUpdate(previousDungeon);
        
        // Reload room data
        await loadCurrentRoom();
        await loadMinimapRooms();
      }
    } catch (err) {
      console.error('Failed to ascend:', err);
    } finally {
      setIsTransitioning(false);
    }
  };

  const getRoomIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'ENTRANCE':
        return '🚪';
      case 'EXIT':
        return '🏁';
      case 'COMBAT':
        return '⚔️';
      case 'TREASURE':
        return '💎';
      case 'MERCHANT':
        return '🛒';
      case 'TRAP':
        return '💀';
      case 'REST':
        return '💤';
      default:
        return '📦';
    }
  };

  const getRoomColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'ENTRANCE':
        return 'bg-green-600';
      case 'EXIT':
        return 'bg-gold';
      case 'COMBAT':
        return 'bg-health';
      case 'TREASURE':
        return 'bg-gold';
      case 'MERCHANT':
        return 'bg-blue-600';
      case 'TRAP':
        return 'bg-purple-600';
      case 'REST':
        return 'bg-mana';
      default:
        return 'bg-surface-light';
    }
  };

  const getBorderColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'ENTRANCE':
        return '#16a34a'; // green-600
      case 'EXIT':
        return '#d4af37'; // gold
      case 'COMBAT':
        return '#dc2626'; // health/red
      case 'TREASURE':
        return '#d4af37'; // gold
      case 'MERCHANT':
        return '#2563eb'; // blue-600
      case 'TRAP':
        return '#9333ea'; // purple-600
      case 'REST':
        return '#3b82f6'; // mana/blue
      default:
        return '#2a2a2a';
    }
  };

  if (!currentRoom) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted">Loading dungeon...</div>
      </div>
    );
  }

  const currentX = character.currentRoomX || 0;
  const currentY = character.currentRoomY || 0;

  // Check walls instead of bounds
  const canMoveNorth = !currentRoom.hasNorthWall;
  const canMoveSouth = !currentRoom.hasSouthWall;
  const canMoveEast = !currentRoom.hasEastWall;
  const canMoveWest = !currentRoom.hasWestWall;

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-background overflow-y-auto">
      {/* Mini Map */}
      <div className="mb-6 bg-accent p-4 rounded-lg border border-surface">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-secondary">{dungeon.name}</h3>
            <div className="text-xs text-text-muted mt-1">
              Level {dungeon.level} • Difficulty {dungeon.difficulty}
            </div>
          </div>
          <span className="text-xs text-text-muted">
            ({currentX}, {currentY})
          </span>
        </div>
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(5, 1fr)` }}>
          {Array.from({ length: 5 }).map((_, y) =>
            Array.from({ length: 5 }).map((_, x) => {
              const actualX = currentX - 2 + x;
              const actualY = currentY - 2 + y;
              const isCurrentRoom = actualX === currentX && actualY === currentY;
              const isOutOfBounds =
                actualX < 0 ||
                actualX >= dungeon.width ||
                actualY < 0 ||
                actualY >= dungeon.height;
              
              const roomData = minimapRooms.get(`${actualX},${actualY}`);
              const isExplored = roomData !== undefined;

              return (
                <div
                  key={`${x}-${y}`}
                  className={`relative w-10 h-10 rounded flex items-center justify-center text-sm ${
                    isCurrentRoom
                      ? 'bg-secondary text-accent'
                      : isOutOfBounds || !isExplored
                      ? 'bg-surface'
                      : 'bg-surface-light text-text-muted'
                  }`}
                >
                  {/* Walls */}
                  {roomData && (
                    <>
                      {/* North Wall */}
                      {roomData.hasNorthWall && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-text"></div>
                      )}
                      {/* South Wall */}
                      {roomData.hasSouthWall && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-text"></div>
                      )}
                      {/* East Wall */}
                      {roomData.hasEastWall && (
                        <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-text"></div>
                      )}
                      {/* West Wall */}
                      {roomData.hasWestWall && (
                        <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-text"></div>
                      )}
                    </>
                  )}
                  {isCurrentRoom && '●'}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Current Room Display */}
      <div className="max-w-md w-full mb-6">
        <div className={`p-5 rounded-lg border-4 ${getRoomColor(currentRoom.type)} bg-opacity-10`}
          style={{ borderColor: getBorderColor(currentRoom.type) }}>
          
          {/* Room Visualization with Walls */}
          <div className="relative w-40 h-40 mx-auto mb-4 bg-surface-light rounded-lg overflow-hidden">
            {/* North Wall */}
            <div className={`absolute top-0 left-0 right-0 h-3 ${currentRoom.hasNorthWall ? 'bg-surface' : 'bg-transparent'}`}>
              {!currentRoom.hasNorthWall && (
                <div className="text-center text-xs text-text-muted leading-3">▲</div>
              )}
            </div>
            
            {/* South Wall */}
            <div className={`absolute bottom-0 left-0 right-0 h-3 ${currentRoom.hasSouthWall ? 'bg-surface' : 'bg-transparent'}`}>
              {!currentRoom.hasSouthWall && (
                <div className="text-center text-xs text-text-muted leading-3">▼</div>
              )}
            </div>
            
            {/* East Wall */}
            <div className={`absolute top-0 bottom-0 right-0 w-3 ${currentRoom.hasEastWall ? 'bg-surface' : 'bg-transparent'}`}>
              {!currentRoom.hasEastWall && (
                <div className="flex items-center justify-center h-full text-xs text-text-muted">▶</div>
              )}
            </div>
            
            {/* West Wall */}
            <div className={`absolute top-0 bottom-0 left-0 w-3 ${currentRoom.hasWestWall ? 'bg-surface' : 'bg-transparent'}`}>
              {!currentRoom.hasWestWall && (
                <div className="flex items-center justify-center h-full text-xs text-text-muted">◀</div>
              )}
            </div>
            
            {/* Room Center - Icon and Type */}
            <div className="absolute inset-3 flex flex-col items-center justify-center">
              <div className="text-4xl mb-2">{getRoomIcon(currentRoom.type)}</div>
              <div className="text-xs font-semibold text-secondary uppercase tracking-wide">
                {currentRoom.type}
              </div>
            </div>
          </div>
          
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-secondary mb-2">
              {currentRoom.type.charAt(0) + currentRoom.type.slice(1).toLowerCase()} Room
            </h2>
            <p className="text-sm text-text">{currentRoom.description}</p>
          </div>

          {/* Room Actions */}
          {currentRoom.type.toUpperCase() === 'EXIT' && (
            <div className="flex justify-center mt-4">
              <button 
                className="btn-primary"
                onClick={descendLevel}
                disabled={isTransitioning}
              >
                🏁 Descend to Level {dungeon.level + 1}
              </button>
            </div>
          )}

          {currentRoom.type.toUpperCase() === 'ENTRANCE' && (
            <div className="flex justify-center mt-4">
              <button 
                className="btn-primary"
                onClick={ascendLevel}
                disabled={isTransitioning || dungeon.level === 1}
              >
                {dungeon.level === 1 ? '🌅 Return to Surface' : `🚪 Ascend to Level ${dungeon.level - 1}`}
              </button>
            </div>
          )}

          {currentRoom.type.toUpperCase() === 'COMBAT' && (
            <div className="flex justify-center mt-4">
              <button className="btn-primary">
                ⚔️ Enter Combat
              </button>
            </div>
          )}

          {currentRoom.type.toUpperCase() === 'TREASURE' && (
            <div className="flex justify-center mt-4">
              <button className="btn-primary">
                💎 Open Chest
              </button>
            </div>
          )}

          {currentRoom.type.toUpperCase() === 'MERCHANT' && (
            <div className="flex justify-center mt-4">
              <button className="btn-primary">
                🛒 Browse Wares
              </button>
            </div>
          )}

          {currentRoom.type.toUpperCase() === 'REST' && (
            <div className="flex justify-center mt-4">
              <button className="btn-primary">
                💤 Rest and Recover
              </button>
            </div>
          )}
        </div>
      </div>

        {/* Movement Controls */}
        <div className="mt-6">
          <p className="text-center text-sm text-text-muted mb-4">Use arrow keys or buttons to navigate</p>
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
            <div></div>
            <button
              onClick={() => moveToRoom('north')}
              disabled={!canMoveNorth || isMoving}
              className="btn-secondary py-2 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-transform"
            >
              <div className="text-xl">↑</div>
              <div className="text-xs">North</div>
            </button>
            <div></div>

            <button
              onClick={() => moveToRoom('west')}
              disabled={!canMoveWest || isMoving}
              className="btn-secondary py-2 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-transform"
            >
              <div className="text-xl">←</div>
              <div className="text-xs">West</div>
            </button>
            <div className="flex items-center justify-center">
              <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center text-accent font-bold text-xl shadow-lg">
                ●
              </div>
            </div>
            <button
              onClick={() => moveToRoom('east')}
              disabled={!canMoveEast || isMoving}
              className="btn-secondary py-2 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-transform"
            >
              <div className="text-xl">→</div>
              <div className="text-xs">East</div>
            </button>

            <div></div>
            <button
              onClick={() => moveToRoom('south')}
              disabled={!canMoveSouth || isMoving}
              className="btn-secondary py-2 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-transform"
            >
              <div className="text-xl">↓</div>
              <div className="text-xs">South</div>
            </button>
            <div></div>
          </div>
          
          {isMoving && (
            <p className="text-center text-secondary mt-4 animate-pulse">Moving...</p>
          )}
        </div>
    </div>
  );
};

export default DungeonView;

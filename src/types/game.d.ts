// src/types/game.d.ts
export interface Player {
  id: string;
  name: string;
  lives: number;
  gold: number;
  score: number;
}

export interface Enemy {
  id: string;
  type: 'basic' | 'fast' | 'tank';
  health: number;
  maxHealth: number;
  x: number;
  y: number;
  speed: number;
  pathIndex: number; // Current segment of the path
  progress: number;  // Progress along current segment (0 to 1)
}

export interface Tower {
  id: string;
  ownerId: string;
  type: 'basic' | 'sniper' | 'aoe';
  level: number;
  x: number;
  y: number;
  range: number;
  damage: number;
  fireRate: number; // Attacks per second
  lastShot: number; // Timestamp of last shot
}

export interface GameState {
  players: Record<string, Player>;
  enemies: Enemy[];
  towers: Tower[];
  gameStatus: 'lobby' | 'playing' | 'gameOver';
  wave: number;
  nexusHealth: number;
  maxNexusHealth: number;
  enemiesRemaining: number;
}

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
  type: 'basic' | 'sniper' | 'pulse';
  level: number;
  x: number;
  y: number;
  range: number;
  damage: number;
  fireRate: number;
  lastShot: number;
  upgradeCost: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number; // 0 to 1
}

export interface GameState {
  players: Record<string, Player>;
  enemies: Enemy[];
  towers: Tower[];
  floatingTexts: FloatingText[];
  gameStatus: 'lobby' | 'playing' | 'gameOver' | 'victory';
  wave: number;
  nexusHealth: number;
  maxNexusHealth: number;
  enemiesRemaining: number;
  screenShake: number; // Intensity 0 to 1
}


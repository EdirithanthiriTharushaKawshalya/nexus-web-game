// src/game/config/gameConfig.ts

export const TILE_SIZE = 40;
export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 600;

export const INITIAL_GOLD = 150;
export const INITIAL_NEXUS_HEALTH = 100;
export const GOLD_PER_KILL = 20;
export const SCORE_PER_KILL = 100;

export const TOWERS = {
  basic: {
    cost: 50,
    range: 150,
    damage: 15,
    fireRate: 1.5,
    upgradeMultiplier: {
      cost: 1.5,
      damage: 1.4,
      range: 1.1,
      fireRate: 1.1,
    }
  },
  sniper: {
    cost: 120,
    range: 300,
    damage: 60,
    fireRate: 0.5,
    upgradeMultiplier: {
      cost: 1.8,
      damage: 1.4,
      range: 1.1,
      fireRate: 1.1,
    }
  },
  pulse: {
    cost: 100,
    range: 100,
    damage: 25,
    fireRate: 1.0,
    upgradeMultiplier: {
      cost: 1.6,
      damage: 1.4,
      range: 1.1,
      fireRate: 1.1,
    }
  }
};

export const ENEMIES = {
  basic: {
    healthBase: 40,
    healthStep: 12,
    speedBase: 60,
    speedStep: 2,
    weight: 1.0,
  },
  fast: {
    healthBase: 16, // 0.4x basic
    healthStep: 4.8,
    speedBase: 120, // 2.0x basic
    speedStep: 4,
    weight: 0.15, // probability 0.85 to 1.0 is 0.15
  },
  tank: {
    healthBase: 140, // 3.5x basic
    healthStep: 42,
    speedBase: 33, // 0.55x basic
    speedStep: 1.1,
    weight: 0.15, // probability 0.7 to 0.85 is 0.15
  },
  boss: {
    health: 3000,
    speed: 25,
    damageToNexus: 100,
  }
};

export const GAME_PATH = [
  { x: 0, y: 320 },
  { x: 240, y: 320 },
  { x: 240, y: 80 },
  { x: 720, y: 80 },
  { x: 720, y: 480 },
  { x: 880, y: 480 }
];

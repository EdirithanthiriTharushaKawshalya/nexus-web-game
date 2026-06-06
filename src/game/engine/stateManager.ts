// src/game/engine/stateManager.ts
import { GameState, Player, Enemy, Tower } from "@/types/game";

export const GAME_PATH = [
  { x: 0, y: 300 },
  { x: 200, y: 300 },
  { x: 200, y: 100 },
  { x: 600, y: 100 },
  { x: 600, y: 500 },
  { x: 800, y: 500 }
];

export class StateManager {
  private state: GameState;
  private spawnTimer: number = 0;
  private waveDelay: number = 5; // Seconds between waves
  private enemiesToSpawn: number = 0;

  constructor() {
    this.state = {
      players: {},
      enemies: [],
      towers: [],
      gameStatus: 'lobby',
      wave: 0,
      nexusHealth: 100,
      maxNexusHealth: 100,
      enemiesRemaining: 0
    };
  }

  public getState(): GameState {
    return this.state;
  }

  public addPlayer(id: string, name: string) {
    this.state.players[id] = {
      id,
      name,
      lives: 20,
      gold: 150, // Starting gold
      score: 0
    };
  }

  public removePlayer(id: string) {
    delete this.state.players[id];
  }

  public startGame() {
    this.state.gameStatus = 'playing';
    this.state.wave = 0;
    this.state.nexusHealth = 100;
    this.startNextWave();
  }

  private startNextWave() {
    this.state.wave++;
    this.enemiesToSpawn = 5 + (this.state.wave * 3);
    this.state.enemiesRemaining = this.enemiesToSpawn;
    this.spawnTimer = 0;
    console.log(`Starting Wave ${this.state.wave}: ${this.enemiesToSpawn} enemies`);
  }

  public update(dt: number) {
    if (this.state.gameStatus !== 'playing') return;

    // 1. Spawning
    if (this.enemiesToSpawn > 0) {
      this.spawnTimer += dt;
      if (this.spawnTimer >= 1.5) { // Spawn every 1.5s
        this.spawnEnemy();
        this.enemiesToSpawn--;
        this.spawnTimer = 0;
      }
    } else if (this.state.enemies.length === 0 && this.state.enemiesRemaining === 0) {
      // Wave clear logic
      this.waveDelay -= dt;
      if (this.waveDelay <= 0) {
        this.startNextWave();
        this.waveDelay = 5;
      }
    }

    // 2. Update Enemies (Pathfinding)
    this.state.enemies.forEach(enemy => {
      const targetNode = GAME_PATH[enemy.pathIndex + 1];
      if (!targetNode) return;

      const startNode = GAME_PATH[enemy.pathIndex];
      const dx = targetNode.x - startNode.x;
      const dy = targetNode.y - startNode.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      enemy.progress += (enemy.speed * dt) / distance;

      if (enemy.progress >= 1) {
        enemy.pathIndex++;
        enemy.progress = 0;
        if (enemy.pathIndex >= GAME_PATH.length - 1) {
          // Reached Nexus!
          this.state.nexusHealth -= 10;
          enemy.health = 0; // Mark for removal
          console.log(`Nexus hit! Health: ${this.state.nexusHealth}`);
          if (this.state.nexusHealth <= 0) {
            this.state.gameStatus = 'gameOver';
            console.log("GAME OVER: Nexus destroyed");
          }
          return;
        }
      }

      const currentStart = GAME_PATH[enemy.pathIndex];
      const currentTarget = GAME_PATH[enemy.pathIndex + 1];
      enemy.x = currentStart.x + (currentTarget.x - currentStart.x) * enemy.progress;
      enemy.y = currentStart.y + (currentTarget.y - currentStart.y) * enemy.progress;
    });

    // 3. Remove dead enemies
    this.state.enemies = this.state.enemies.filter(e => {
      if (e.health <= 0) {
        this.state.enemiesRemaining--;
        return false;
      }
      return true;
    });

    // 4. Tower Targeting & Firing
    const now = Date.now();
    this.state.towers.forEach(tower => {
      if (now - tower.lastShot < (1000 / tower.fireRate)) return;

      // Find closest enemy in range
      let closestEnemy: Enemy | null = null;
      let minDistance = tower.range;

      this.state.enemies.forEach(enemy => {
        const dist = Math.sqrt(Math.pow(enemy.x - tower.x, 2) + Math.pow(enemy.y - tower.y, 2));
        if (dist < minDistance) {
          minDistance = dist;
          closestEnemy = enemy;
        }
      });

      if (closestEnemy) {
        (closestEnemy as Enemy).health -= tower.damage;
        tower.lastShot = now;

        // If enemy died, reward the owner
        if ((closestEnemy as Enemy).health <= 0) {
          const owner = this.state.players[tower.ownerId];
          if (owner) {
            owner.gold += 20;
            owner.score += 100;
          }
        }
      }
    });
  }

  private spawnEnemy() {
    const rand = Math.random();
    let type: Enemy['type'] = 'basic';
    let health = 40 + (this.state.wave * 12);
    let speed = 60 + (this.state.wave * 2);

    if (rand > 0.8) {
      type = 'tank';
      health *= 3;
      speed *= 0.6;
    } else if (rand > 0.6) {
      type = 'fast';
      health *= 0.5;
      speed *= 1.8;
    }

    const enemy: Enemy = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      health: health,
      maxHealth: health,
      x: GAME_PATH[0].x,
      y: GAME_PATH[0].y,
      speed: speed,
      pathIndex: 0,
      progress: 0
    };
    this.state.enemies.push(enemy);
  }

  public placeTower(playerId: string, type: string, x: number, y: number) {
    const player = this.state.players[playerId];
    
    let cost = 50;
    let range = 150;
    let damage = 15;
    let fireRate = 1.5;

    if (type === 'sniper') {
      cost = 120;
      range = 300;
      damage = 60;
      fireRate = 0.5;
    } else if (type === 'pulse') {
      cost = 100;
      range = 100;
      damage = 25;
      fireRate = 1.0;
    }

    if (!player || player.gold < cost) return;

    // Grid snapping (40px)
    const gridX = Math.floor(x / 40) * 40;
    const gridY = Math.floor(y / 40) * 40;

    // Check if tower already exists there
    if (this.state.towers.some(t => t.x === gridX && t.y === gridY)) return;

    const newTower: Tower = {
      id: Math.random().toString(36).substring(2, 9),
      ownerId: playerId,
      type: type as 'basic' | 'sniper' | 'pulse',
      level: 1,
      x: gridX,
      y: gridY,
      range,
      damage,
      fireRate,
      lastShot: 0
    };

    this.state.towers.push(newTower);
    player.gold -= cost;
  }
}

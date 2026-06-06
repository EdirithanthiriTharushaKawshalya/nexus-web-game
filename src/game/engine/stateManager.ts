// src/game/engine/stateManager.ts
import { GameState, Player, Enemy, Tower } from "@/types/game";

export const GAME_PATH = [
  { x: 0, y: 320 },
  { x: 240, y: 320 },
  { x: 240, y: 80 },
  { x: 720, y: 80 },
  { x: 720, y: 480 },
  { x: 880, y: 480 }
];

export class StateManager {
  private state: GameState;
  private spawnTimer: number = 0;
  private waveDelay: number = 2; 
  private enemiesToSpawn: number = 0;

  constructor() {
    this.state = {
      players: {},
      enemies: [],
      towers: [],
      floatingTexts: [],
      gameStatus: 'lobby',
      wave: 0,
      nexusHealth: 100,
      maxNexusHealth: 100,
      enemiesRemaining: 0,
      screenShake: 0
    };
  }

  public getState(): GameState {
    return this.state;
  }

  public syncState(newState: GameState) {
    this.state = {
      ...newState,
      players: newState.players || {},
      enemies: newState.enemies || [],
      towers: newState.towers || [],
      floatingTexts: newState.floatingTexts || []
    };
  }

  public addPlayer(id: string, name: string) {
    this.state.players[id] = { id, name, lives: 20, gold: 150, score: 0 };
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
    if (this.state.wave >= 10) {
      this.state.gameStatus = 'victory';
      return;
    }
    this.state.wave++;
    
    // FINAL BOSS WAVE
    if (this.state.wave === 10) {
      this.enemiesToSpawn = 1;
      this.state.enemiesRemaining = 1;
    } else {
      this.enemiesToSpawn = 5 + (this.state.wave * 3);
      this.state.enemiesRemaining = this.enemiesToSpawn;
    }
    this.spawnTimer = 0;
  }

  public update(dt: number) {
    if (this.state.gameStatus !== 'playing') return;

    if (this.state.screenShake > 0) {
      this.state.screenShake -= dt * 3;
      if (this.state.screenShake < 0) this.state.screenShake = 0;
    }

    this.state.floatingTexts = this.state.floatingTexts.filter(ft => {
      ft.life -= dt * 1.5;
      ft.y -= dt * 25;
      return ft.life > 0;
    });

    // 1. Spawning
    if (this.enemiesToSpawn > 0) {
      this.spawnTimer += dt;
      if (this.state.wave === 10 || this.spawnTimer >= 0.6) { 
        this.spawnEnemy();
        this.enemiesToSpawn--;
        this.spawnTimer = 0;
      }
    } else if (this.state.enemies.length === 0 && this.state.enemiesRemaining === 0) {
      this.waveDelay -= dt;
      if (this.waveDelay <= 0) {
        this.startNextWave();
        this.waveDelay = 2; 
      }
    }

    // 2. Enemies
    this.state.enemies.forEach(enemy => {
      const targetNode = GAME_PATH[enemy.pathIndex + 1];
      if (!targetNode) return;
      const startNode = GAME_PATH[enemy.pathIndex];
      const dx = targetNode.x - startNode.x, dy = targetNode.y - startNode.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      enemy.progress += (enemy.speed * dt) / distance;
      if (enemy.progress >= 1) {
        enemy.pathIndex++; enemy.progress = 0;
        if (enemy.pathIndex >= GAME_PATH.length - 1) {
          this.state.nexusHealth -= (enemy.type === 'tank' && this.state.wave === 10) ? 100 : 10;
          enemy.health = 0;
          this.state.screenShake = 0.6;
          this.addFloatingText("BREACHED", enemy.x, enemy.y, "#ef4444");
          if (this.state.nexusHealth <= 0) this.state.gameStatus = 'gameOver';
          return;
        }
      }
      enemy.x = startNode.x + (targetNode.x - startNode.x) * enemy.progress;
      enemy.y = startNode.y + (targetNode.y - startNode.y) * enemy.progress;
    });

    this.state.enemies = this.state.enemies.filter(e => {
      if (e.health <= 0) { this.state.enemiesRemaining--; return false; }
      return true;
    });

    // 3. Towers
    const now = Date.now();
    this.state.towers.forEach(tower => {
      if (now - tower.lastShot < (1000 / tower.fireRate)) return;
      let closestEnemy: Enemy | null = null, minDistance = tower.range;
      this.state.enemies.forEach(enemy => {
        const dist = Math.sqrt(Math.pow(enemy.x - tower.x, 2) + Math.pow(enemy.y - tower.y, 2));
        if (dist < minDistance) { minDistance = dist; closestEnemy = enemy; }
      });
      if (closestEnemy) {
        const target = closestEnemy as Enemy;
        target.health -= tower.damage;
        tower.lastShot = now;
        if (target.health <= 0) {
          const owner = this.state.players[tower.ownerId];
          if (owner) { owner.gold += 20; owner.score += 100; this.addFloatingText("+20", target.x, target.y, "#facc15"); }
        }
      }
    });
  }

  private addFloatingText(text: string, x: number, y: number, color: string) {
    this.state.floatingTexts.push({ id: Math.random().toString(36).substr(2, 5), text, x, y, color, life: 1.0 });
  }

  public placeTower(playerId: string, type: string, x: number, y: number) {
    const player = this.state.players[playerId];
    let cost = 50, range = 150, damage = 15, fireRate = 1.5;
    if (type === 'sniper') { cost = 120; range = 300; damage = 60; fireRate = 0.5; }
    else if (type === 'pulse') { cost = 100; range = 100; damage = 25; fireRate = 1.0; }
    if (!player || player.gold < cost) return;
    const gridX = Math.floor(x / 40) * 40, gridY = Math.floor(y / 40) * 40;
    
    // STRICT BLOCKING ON ROAD
    if (this.isPointOnPath(gridX, gridY)) return;

    // Block placing on Town Hall (Nexus)
    const nexus = GAME_PATH[GAME_PATH.length - 1];
    if (Math.abs(gridX - nexus.x) <= 40 && Math.abs(gridY - nexus.y) <= 40) return;
    
    if (this.state.towers.some(t => t.x === gridX && t.y === gridY)) return;
    const newTower: Tower = { id: Math.random().toString(36).substring(2, 9), ownerId: playerId, type: type as any, level: 1, x: gridX, y: gridY, range, damage, fireRate, lastShot: 0, upgradeCost: Math.floor(cost * 1.5) };
    this.state.towers.push(newTower);
    player.gold -= cost;
    this.addFloatingText(`-${cost}`, gridX, gridY, "#ef4444");
  }

  public upgradeTower(playerId: string, towerId: string) {
    const tower = this.state.towers.find(t => t.id === towerId);
    const player = this.state.players[playerId];
    if (!tower || !player || player.gold < tower.upgradeCost) return;
    player.gold -= tower.upgradeCost;
    tower.level++; tower.damage *= 1.4; tower.range *= 1.1; tower.fireRate *= 1.1;
    const oldCost = tower.upgradeCost; tower.upgradeCost = Math.floor(oldCost * 1.8);
    this.addFloatingText(`LVL ${tower.level}`, tower.x, tower.y, "#3b82f6");
    this.addFloatingText(`-${oldCost}`, tower.x, tower.y + 20, "#ef4444");
  }

  private isPointOnPath(gridX: number, gridY: number): boolean {
    // Exact tile matching for grid-aligned path
    for (let i = 0; i < GAME_PATH.length - 1; i++) {
      const s = GAME_PATH[i];
      const e = GAME_PATH[i + 1];
      const minX = Math.min(s.x, e.x);
      const maxX = Math.max(s.x, e.x);
      const minY = Math.min(s.y, e.y);
      const maxY = Math.max(s.y, e.y);
      
      if (gridX >= minX && gridX <= maxX && gridY >= minY && gridY <= maxY) {
        return true;
      }
    }
    return false;
  }

  private spawnEnemy() {
    const r = Math.random();
    let type: Enemy['type'] = 'basic', h = 40 + (this.state.wave * 12), s = 60 + (this.state.wave * 2);
    if (this.state.wave === 10) {
      type = 'tank'; h = 3000; s = 25;
      this.addFloatingText("FINAL BOSS INBOUND", 100, 320, "#facc15");
    } else {
      if (r > 0.85) { type = 'tank'; h *= 3.5; s *= 0.55; }
      else if (r > 0.7) { type = 'fast'; h *= 0.4; s *= 2.0; }
    }
    this.state.enemies.push({ id: Math.random().toString(36).substr(2, 7), type, health: h, maxHealth: h, x: GAME_PATH[0].x, y: GAME_PATH[0].y, speed: s, pathIndex: 0, progress: 0 });
  }
}

// src/game/engine/stateManager.ts
import { GameState, Tower } from "@/types/game";
import { 
  GAME_PATH, 
  INITIAL_NEXUS_HEALTH, 
  TOWERS, 
  TILE_SIZE,
  ENEMIES
} from "@/game/config/gameConfig";
import { generateId, snapToGrid } from "@/game/utils/math";
import { WaveSystem } from "./systems/WaveSystem";
import { MovementSystem } from "./systems/MovementSystem";
import { CombatSystem } from "./systems/CombatSystem";

export { GAME_PATH };

export class StateManager {
  private state: GameState;
  
  // Systems
  private waveSystem: WaveSystem;
  private movementSystem: MovementSystem;
  private combatSystem: CombatSystem;

  constructor() {
    this.state = this.createInitialState();
    this.waveSystem = new WaveSystem();
    this.movementSystem = new MovementSystem();
    this.combatSystem = new CombatSystem();
  }

  public createInitialState(): GameState {
    return {
      players: {},
      enemies: [],
      towers: [],
      floatingTexts: [],
      gameStatus: 'lobby',
      wave: 0,
      nexusHealth: INITIAL_NEXUS_HEALTH,
      maxNexusHealth: INITIAL_NEXUS_HEALTH,
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
    this.state.nexusHealth = INITIAL_NEXUS_HEALTH;
    this.waveSystem.startNextWave(this.state);
  }

  public update(dt: number) {
    if (this.state.gameStatus !== 'playing') return;

    // 1. Update Screen Shake
    if (this.state.screenShake > 0) {
      this.state.screenShake -= dt * 3;
      if (this.state.screenShake < 0) this.state.screenShake = 0;
    }

    // 2. Update Floating Texts
    this.state.floatingTexts = this.state.floatingTexts.filter(ft => {
      ft.life -= dt * 1.5;
      ft.y -= dt * 25;
      return ft.life > 0;
    });

    // 3. Wave & Spawning
    this.waveSystem.update(this.state, dt);

    // 4. Movement & Pathing
    this.movementSystem.update(this.state, dt, (enemy) => {
      // Handle Nexus Breach
      const damage = (enemy.type === 'tank' && this.state.wave === 10) ? ENEMIES.boss.damageToNexus : 10;
      this.state.nexusHealth -= damage;
      this.state.screenShake = 0.6;
      this.addFloatingText("BREACHED", enemy.x, enemy.y, "#ef4444");
      
      if (this.state.nexusHealth <= 0) {
        this.state.nexusHealth = 0;
        this.state.gameStatus = 'gameOver';
      }
    });

    // 5. Combat & Targeting
    this.combatSystem.update(this.state, dt, (text, x, y, color) => {
      this.addFloatingText(text, x, y, color);
    });
  }

  public addFloatingText(text: string, x: number, y: number, color: string) {
    this.state.floatingTexts.push({ 
      id: generateId(5), 
      text, 
      x, 
      y, 
      color, 
      life: 1.0 
    });
  }

  public placeTower(playerId: string, type: string, x: number, y: number) {
    const player = this.state.players[playerId];
    const towerConfig = TOWERS[type as keyof typeof TOWERS];
    
    if (!player || !towerConfig || player.gold < towerConfig.cost) return;

    const gridX = snapToGrid(x, TILE_SIZE);
    const gridY = snapToGrid(y, TILE_SIZE);
    
    // Check path collision
    if (this.isPointOnPath(gridX, gridY)) return;

    // Block placing on Town Hall (Nexus)
    const nexus = GAME_PATH[GAME_PATH.length - 1];
    if (Math.abs(gridX - nexus.x) <= TILE_SIZE && Math.abs(gridY - nexus.y) <= TILE_SIZE) return;
    
    // Check tower collision
    if (this.state.towers.some(t => t.x === gridX && t.y === gridY)) return;

    const newTower: Tower = { 
      id: generateId(7), 
      ownerId: playerId, 
      type: type as any, 
      level: 1, 
      x: gridX, 
      y: gridY, 
      range: towerConfig.range, 
      damage: towerConfig.damage, 
      fireRate: towerConfig.fireRate, 
      lastShot: 0, 
      upgradeCost: Math.floor(towerConfig.cost * towerConfig.upgradeMultiplier.cost) 
    };

    this.state.towers.push(newTower);
    player.gold -= towerConfig.cost;
    this.addFloatingText(`-${towerConfig.cost}`, gridX, gridY, "#ef4444");
  }

  public upgradeTower(playerId: string, towerId: string) {
    const tower = this.state.towers.find(t => t.id === towerId);
    const player = this.state.players[playerId];
    
    if (!tower || !player || player.gold < tower.upgradeCost) return;

    const towerConfig = TOWERS[tower.type as keyof typeof TOWERS];
    const multipliers = towerConfig.upgradeMultiplier;

    player.gold -= tower.upgradeCost;
    tower.level++; 
    tower.damage *= multipliers.damage; 
    tower.range *= multipliers.range; 
    tower.fireRate *= multipliers.fireRate;
    
    const oldCost = tower.upgradeCost; 
    tower.upgradeCost = Math.floor(oldCost * 1.8);

    this.addFloatingText(`LVL ${tower.level}`, tower.x, tower.y, "#3b82f6");
    this.addFloatingText(`-${oldCost}`, tower.x, tower.y + 20, "#ef4444");
  }

  private isPointOnPath(gridX: number, gridY: number): boolean {
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
}

// src/game/engine/systems/WaveSystem.ts
import { GameState, Enemy } from "@/types/game";
import { GAME_PATH, ENEMIES } from "@/game/config/gameConfig";
import { generateId } from "@/game/utils/math";

export class WaveSystem {
  private spawnTimer: number = 0;
  private waveDelay: number = 2;
  private enemiesToSpawn: number = 0;

  public update(state: GameState, dt: number) {
    if (state.gameStatus !== 'playing') return;

    if (this.enemiesToSpawn > 0) {
      this.spawnTimer += dt;
      // Spawn interval: 0.6s or instant for boss
      const spawnInterval = state.wave === 10 ? 0 : 0.6;
      
      if (this.spawnTimer >= spawnInterval) {
        this.spawnEnemy(state);
        this.enemiesToSpawn--;
        this.spawnTimer = 0;
      }
    } else if (state.enemies.length === 0 && state.enemiesRemaining === 0) {
      this.waveDelay -= dt;
      if (this.waveDelay <= 0) {
        this.startNextWave(state);
        this.waveDelay = 2;
      }
    }
  }

  public startNextWave(state: GameState) {
    if (state.wave >= 10) {
      state.gameStatus = 'victory';
      return;
    }
    state.wave++;

    if (state.wave === 10) {
      this.enemiesToSpawn = 1; // Boss
      state.enemiesRemaining = 1;
    } else {
      this.enemiesToSpawn = 5 + (state.wave * 3);
      state.enemiesRemaining = this.enemiesToSpawn;
    }
    this.spawnTimer = 0;
  }

  private spawnEnemy(state: GameState) {
    const r = Math.random();
    let type: Enemy['type'] = 'basic';
    let health = ENEMIES.basic.healthBase + (state.wave * ENEMIES.basic.healthStep);
    let speed = ENEMIES.basic.speedBase + (state.wave * ENEMIES.basic.speedStep);

    if (state.wave === 10) {
      type = 'tank';
      health = ENEMIES.boss.health;
      speed = ENEMIES.boss.speed;
    } else {
      if (r > 0.85) {
        type = 'tank';
        health = ENEMIES.tank.healthBase + (state.wave * ENEMIES.tank.healthStep);
        speed = ENEMIES.tank.speedBase + (state.wave * ENEMIES.tank.speedStep);
      } else if (r > 0.7) {
        type = 'fast';
        health = ENEMIES.fast.healthBase + (state.wave * ENEMIES.fast.healthStep);
        speed = ENEMIES.fast.speedBase + (state.wave * ENEMIES.fast.speedStep);
      }
    }

    state.enemies.push({
      id: generateId(),
      type,
      health,
      maxHealth: health,
      x: GAME_PATH[0].x,
      y: GAME_PATH[0].y,
      speed,
      pathIndex: 0,
      progress: 0
    });
  }
}

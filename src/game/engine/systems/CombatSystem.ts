// src/game/engine/systems/CombatSystem.ts
import { GameState, Enemy, Tower } from "@/types/game";
import { GOLD_PER_KILL, SCORE_PER_KILL } from "@/game/config/gameConfig";
import { getDistance } from "@/game/utils/math";

export class CombatSystem {
  public update(state: GameState, dt: number, addFloatingText: (text: string, x: number, y: number, color: string) => void) {
    const now = Date.now();

    state.towers.forEach(tower => {
      // Fire rate check
      if (now - tower.lastShot < (1000 / tower.fireRate)) return;

      // Find target
      let closestEnemy: Enemy | null = null;
      let minDistance = tower.range;

      state.enemies.forEach(enemy => {
        const dist = getDistance(tower, enemy);
        if (dist < minDistance) {
          minDistance = dist;
          closestEnemy = enemy;
        }
      });

      if (closestEnemy) {
        this.fireAtTarget(tower, closestEnemy, state, addFloatingText);
        tower.lastShot = now;
      }
    });
  }

  private fireAtTarget(tower: Tower, target: Enemy, state: GameState, addFloatingText: (text: string, x: number, y: number, color: string) => void) {
    target.health -= tower.damage;

    if (target.health <= 0) {
      const owner = state.players[tower.ownerId];
      if (owner) {
        owner.gold += GOLD_PER_KILL;
        owner.score += SCORE_PER_KILL;
        addFloatingText(`+${GOLD_PER_KILL}`, target.x, target.y, "#facc15");
      }
    }
  }
}

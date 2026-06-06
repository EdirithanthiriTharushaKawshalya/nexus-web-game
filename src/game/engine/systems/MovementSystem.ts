// src/game/engine/systems/MovementSystem.ts
import { Enemy, GameState } from "@/types/game";
import { GAME_PATH, INITIAL_NEXUS_HEALTH } from "@/game/config/gameConfig";
import { getDistance } from "@/game/utils/math";

export class MovementSystem {
  public update(state: GameState, dt: number, onBreach: (enemy: Enemy) => void) {
    state.enemies.forEach(enemy => {
      const targetNode = GAME_PATH[enemy.pathIndex + 1];
      if (!targetNode) return;

      const startNode = GAME_PATH[enemy.pathIndex];
      const segmentDistance = getDistance(startNode, targetNode);
      
      // Update progress along current segment
      enemy.progress += (enemy.speed * dt) / segmentDistance;

      if (enemy.progress >= 1) {
        enemy.pathIndex++;
        enemy.progress = 0;

        // Check if reached the end of path (Nexus)
        if (enemy.pathIndex >= GAME_PATH.length - 1) {
          onBreach(enemy);
          enemy.health = 0; // Mark for removal
          return;
        }
      }

      // Update world coordinates
      enemy.x = startNode.x + (targetNode.x - startNode.x) * enemy.progress;
      enemy.y = startNode.y + (targetNode.y - startNode.y) * enemy.progress;
    });

    // Remove dead/breached enemies
    state.enemies = state.enemies.filter(e => {
      if (e.health <= 0) {
        state.enemiesRemaining--;
        return false;
      }
      return true;
    });
  }
}

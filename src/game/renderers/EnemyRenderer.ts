// src/game/renderers/EnemyRenderer.ts
import { Enemy } from "@/types/game";
import { GAME_PATH } from "@/game/config/gameConfig";

export class EnemyRenderer {
  public static draw(ctx: CanvasRenderingContext2D, enemy: Enemy) {
    const ex = enemy.x;
    const ey = enemy.y;

    const currentSeg = GAME_PATH[enemy.pathIndex];
    const nextSeg = GAME_PATH[enemy.pathIndex + 1];
    const isMovingLeft = nextSeg ? nextSeg.x < currentSeg.x : false;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath(); ctx.ellipse(ex + 20, ey + 28, 12, 6, 0, 0, Math.PI * 2); ctx.fill();

    const bob = Math.sin(Date.now() / 110 + enemy.id.charCodeAt(0)) * 3.5;

    if (enemy.type === 'tank') {
      this.drawGiant(ctx, enemy, isMovingLeft, bob);
    } else if (enemy.type === 'fast') {
      this.drawBarbarian(ctx, enemy, isMovingLeft, bob);
    } else {
      this.drawGoblin(ctx, enemy, isMovingLeft, bob);
    }

    this.drawHealthBar(ctx, enemy);
  }

  private static drawGiant(ctx: CanvasRenderingContext2D, enemy: Enemy, isMovingLeft: boolean, bob: number) {
    const { x: ex, y: ey } = enemy;
    const facing = isMovingLeft ? -1 : 1;
    ctx.save();
    ctx.translate(ex + 20, ey + 18 + bob);
    ctx.scale(facing, 1);

    ctx.fillStyle = "#78350f";
    ctx.beginPath(); ctx.arc(0, 5, 12, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#3f1a04"; ctx.lineWidth = 1.5; ctx.stroke();

    ctx.fillStyle = "#fed7aa";
    ctx.beginPath(); ctx.arc(0, -4, 7.5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#ea580c";
    ctx.beginPath(); ctx.arc(-3, 1, 5, 0, Math.PI * 2); ctx.arc(3, 1, 5, 0, Math.PI * 2); ctx.arc(0, 3, 6, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#fed7aa";
    ctx.beginPath(); ctx.arc(-11, 8, 4.5, 0, Math.PI * 2); ctx.arc(11, 8, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();

    if (Math.abs(bob) > 2.8 && Math.random() > 0.4) {
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.beginPath(); ctx.arc(ex + 20 + (Math.random() - 0.5) * 10, ey + 28, 3.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  private static drawBarbarian(ctx: CanvasRenderingContext2D, enemy: Enemy, isMovingLeft: boolean, bob: number) {
    const { x: ex, y: ey } = enemy;
    const facing = isMovingLeft ? -1 : 1;
    ctx.save();
    ctx.translate(ex + 20, ey + 20 + bob);
    ctx.scale(facing, 1);

    ctx.fillStyle = "#9a3412"; ctx.fillRect(-6, 3, 12, 6);
    ctx.strokeStyle = "#451a03"; ctx.strokeRect(-6, 3, 12, 6);

    ctx.fillStyle = "#451a03"; ctx.fillRect(-1.5, -4, 3, 7);

    ctx.fillStyle = "#fed7aa";
    ctx.beginPath(); ctx.arc(0, -4, 5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#facc15";
    ctx.beginPath(); ctx.arc(0, -8, 4.5, 0, Math.PI * 2); ctx.arc(-3, -7, 3, 0, Math.PI * 2); ctx.arc(3, -7, 3, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = "#eab308"; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(-3, -2); ctx.lineTo(-1, -1); ctx.moveTo(3, -2); ctx.lineTo(1, -1); ctx.stroke();

    ctx.save();
    ctx.translate(8, -4);
    ctx.rotate(-Math.PI / 4 + Math.sin(Date.now() / 70) * 0.35);
    ctx.fillStyle = "#e2e8f0"; ctx.fillRect(-1.8, -9, 3.6, 9);
    ctx.fillStyle = "#9a3412"; ctx.fillRect(-3, 0, 6, 2);
    ctx.restore();

    ctx.restore();
  }

  private static drawGoblin(ctx: CanvasRenderingContext2D, enemy: Enemy, isMovingLeft: boolean, bob: number) {
    const { x: ex, y: ey } = enemy;
    const facing = isMovingLeft ? -1 : 1;
    ctx.save();
    ctx.translate(ex + 20, ey + 20 + bob);
    ctx.scale(facing, 1);

    ctx.fillStyle = "#b45309"; ctx.fillRect(-5, 0, 10, 6);

    ctx.fillStyle = "#22c55e";
    ctx.beginPath(); ctx.moveTo(-4, -3); ctx.lineTo(-11, -5.5); ctx.lineTo(-5, -0.8); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(4, -3); ctx.lineTo(11, -5.5); ctx.lineTo(5, -0.8); ctx.closePath(); ctx.fill();

    ctx.fillStyle = "#22c55e";
    ctx.beginPath(); ctx.arc(0, -4, 4.5, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = "#16a34a"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(4, -3.2); ctx.stroke();

    ctx.fillStyle = "#ca8a04";
    ctx.beginPath(); ctx.arc(-8, 3, 4.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#451a03"; ctx.lineWidth = 1; ctx.stroke();

    ctx.restore();
  }

  private static drawHealthBar(ctx: CanvasRenderingContext2D, enemy: Enemy) {
    const hbW = 24, hbH = 4.2;
    ctx.fillStyle = "#782221";
    ctx.fillRect(enemy.x + 20 - hbW / 2, enemy.y - 7, hbW, hbH);
    ctx.fillStyle = "#22c55e";
    const ratio = Math.max(0, enemy.health / enemy.maxHealth);
    ctx.fillRect(enemy.x + 20 - hbW / 2, enemy.y - 7, hbW * ratio, hbH);
    ctx.strokeStyle = "#1c1917"; ctx.lineWidth = 1.2;
    ctx.strokeRect(enemy.x + 20 - hbW / 2, enemy.y - 7, hbW, hbH);
  }
}

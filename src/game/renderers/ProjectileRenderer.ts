// src/game/renderers/ProjectileRenderer.ts
import { Tower, Enemy } from "@/types/game";
import { getAngle } from "@/game/utils/math";

export class ProjectileRenderer {
  public static draw(ctx: CanvasRenderingContext2D, tower: Tower, enemies: Enemy[]) {
    const now = Date.now();
    const shotDuration = 180;
    const timeSinceShot = now - tower.lastShot;
    if (timeSinceShot >= shotDuration) return;

    const target = this.findTarget(tower, enemies);
    if (!target) return;

    const t = timeSinceShot / shotDuration;
    const sx = tower.x + 20, sy = tower.y + 20;
    const ex = target.x + 20, ey = target.y + 20;
    const px = sx + (ex - sx) * t, py = sy + (ey - sy) * t;

    if (tower.type === 'sniper') {
      this.drawLightning(ctx, sx, sy - 12, ex, ey);
    } else if (tower.type === 'pulse') {
      this.drawCannonball(ctx, px, py, t, ex - sx, ey - sy);
    } else {
      this.drawArrow(ctx, px, py, ex - sx, ey - sy);
    }
  }

  private static drawLightning(ctx: CanvasRenderingContext2D, sx: number, sy: number, ex: number, ey: number) {
    ctx.strokeStyle = "#e9d5ff"; ctx.lineWidth = 3;
    ctx.shadowBlur = 15; ctx.shadowColor = "#c084fc";
    ctx.beginPath(); ctx.moveTo(sx, sy);
    const zx1 = sx + (ex - sx) * 0.3 + (Math.random() - 0.5) * 16;
    const zy1 = sy + (ey - sy) * 0.3 + (Math.random() - 0.5) * 16;
    const zx2 = sx + (ex - sx) * 0.6 + (Math.random() - 0.5) * 16;
    const zy2 = sy + (ey - sy) * 0.6 + (Math.random() - 0.5) * 16;
    ctx.lineTo(zx1, zy1); ctx.lineTo(zx2, zy2); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.shadowBlur = 0;
  }

  private static drawCannonball(ctx: CanvasRenderingContext2D, px: number, py: number, t: number, dx: number, dy: number) {
    const arc = -42 * Math.sin(t * Math.PI);
    ctx.fillStyle = "#1e293b"; ctx.beginPath(); ctx.arc(px, py + arc, 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#000000"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = "rgba(241, 245, 249, 0.45)";
    ctx.beginPath(); ctx.arc(px - dx * 0.06, py + arc - dy * 0.06 + 2, 4, 0, Math.PI * 2); ctx.fill();
  }

  private static drawArrow(ctx: CanvasRenderingContext2D, px: number, py: number, dx: number, dy: number) {
    const angle = Math.atan2(dy, dx);
    ctx.save();
    ctx.translate(px, py); ctx.rotate(angle);
    ctx.strokeStyle = "#78350f"; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.stroke();
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-9, -2.5); ctx.moveTo(-6, 0); ctx.lineTo(-9, 2.5); ctx.stroke();
    ctx.fillStyle = "#94a3b8"; ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(2, -2.5); ctx.lineTo(2, 2.5); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  private static findTarget(tower: Tower, enemies: Enemy[]): Enemy | null {
    let closest: Enemy | null = null;
    let minD = tower.range;
    enemies.forEach(e => {
      const d = Math.sqrt(Math.pow(e.x - tower.x, 2) + Math.pow(e.y - tower.y, 2));
      if (d < minD) { minD = d; closest = e; }
    });
    return closest;
  }
}

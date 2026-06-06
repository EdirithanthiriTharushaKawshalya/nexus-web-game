// src/game/renderers/TowerRenderer.ts
import { Tower, Enemy } from "@/types/game";
import { getAngle } from "@/game/utils/math";

export class TowerRenderer {
  public static draw(ctx: CanvasRenderingContext2D, tower: Tower, isSelected: boolean, enemies: Enemy[]) {
    const tx = tower.x;
    const ty = tower.y;

    // Selection circle & range indicator
    if (isSelected) {
      ctx.strokeStyle = "rgba(234, 179, 8, 0.5)";
      ctx.fillStyle = "rgba(234, 179, 8, 0.08)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(tx + 20, ty + 20, tower.range, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = "#eab308";
      ctx.strokeRect(tx - 2, ty - 2, 44, 44);
    }

    // Tower Shadows
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(tx + 20, ty + 30, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    if (tower.type === 'sniper') {
      this.drawWizardTower(ctx, tower, enemies);
    } else if (tower.type === 'pulse') {
      this.drawCannon(ctx, tower, enemies);
    } else {
      this.drawArcherTower(ctx, tower, enemies);
    }

    // Level badge
    this.drawLevelBadge(ctx, tower);
  }

  private static drawWizardTower(ctx: CanvasRenderingContext2D, tower: Tower, enemies: Enemy[]) {
    const { x: tx, y: ty } = tower;
    ctx.fillStyle = "#6b21a8";
    ctx.fillRect(tx + 6, ty + 12, 28, 26);
    ctx.fillStyle = "#4a044e";
    ctx.fillRect(tx + 4, ty + 34, 32, 4);

    ctx.strokeStyle = "#1e1b4b";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(tx + 6, ty + 12, 28, 26);

    ctx.fillStyle = "#a855f7";
    ctx.fillRect(tx + 10, ty + 6, 20, 6);
    ctx.strokeRect(tx + 10, ty + 6, 20, 6);

    const target = this.findTarget(tower, enemies);
    const angle = target ? getAngle({ x: tx + 20, y: ty + 4 }, { x: target.x + 20, y: target.y + 20 }) : 0;

    ctx.save();
    ctx.translate(tx + 20, ty + 4);
    ctx.rotate(angle);

    ctx.fillStyle = "#2563eb";
    ctx.beginPath();
    ctx.moveTo(0, 4); ctx.lineTo(6, 12); ctx.lineTo(-6, 12); ctx.closePath(); ctx.fill();
    
    ctx.fillStyle = "#fed7aa";
    ctx.beginPath(); ctx.arc(0, 1, 3.5, 0, Math.PI * 2); ctx.fill();
    
    ctx.fillStyle = "#1d4ed8";
    ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(4, -2); ctx.lineTo(-4, -2); ctx.closePath(); ctx.fill();

    ctx.strokeStyle = "#b45309";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(4, 8); ctx.lineTo(7, -2); ctx.stroke();
    
    ctx.fillStyle = "#facc15";
    ctx.beginPath(); ctx.arc(7, -2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    const float = Math.sin(Date.now() / 120) * 2;
    ctx.fillStyle = "#d8b4fe";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#d8b4fe";
    ctx.beginPath(); ctx.arc(tx + 20, ty - 12 + float, 4, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  private static drawCannon(ctx: CanvasRenderingContext2D, tower: Tower, enemies: Enemy[]) {
    const { x: tx, y: ty } = tower;
    ctx.fillStyle = "#78716c";
    ctx.beginPath(); ctx.arc(tx + 20, ty + 20, 17, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#1c1917"; ctx.lineWidth = 2.5; ctx.stroke();

    ctx.fillStyle = "#9a3412";
    ctx.fillRect(tx + 10, ty + 10, 20, 20);
    ctx.strokeRect(tx + 10, ty + 10, 20, 20);

    const target = this.findTarget(tower, enemies);
    const angle = target ? getAngle({ x: tx + 20, y: ty + 20 }, { x: target.x + 20, y: target.y + 20 }) : 0;

    ctx.save();
    ctx.translate(tx + 20, ty + 20);
    ctx.rotate(angle);

    const recoilTime = 120;
    const timePassed = Date.now() - tower.lastShot;
    let recoil = timePassed < recoilTime ? -9 * (1 - (timePassed / recoilTime)) : 0;

    ctx.fillStyle = "#374151";
    ctx.fillRect(-8 + recoil, -6, 22, 12);
    ctx.strokeStyle = "#111827";
    ctx.strokeRect(-8 + recoil, -6, 22, 12);

    ctx.fillStyle = "#111827";
    ctx.fillRect(14 + recoil, -7, 4, 14);
    ctx.restore();
  }

  private static drawArcherTower(ctx: CanvasRenderingContext2D, tower: Tower, enemies: Enemy[]) {
    const { x: tx, y: ty } = tower;
    ctx.strokeStyle = "#854d0e";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(tx + 5, ty + 34); ctx.lineTo(tx + 12, ty + 10);
    ctx.moveTo(tx + 35, ty + 34); ctx.lineTo(tx + 28, ty + 10);
    ctx.stroke();

    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(tx + 7, ty + 22); ctx.lineTo(tx + 33, ty + 22);
    ctx.moveTo(tx + 8, ty + 28); ctx.lineTo(tx + 32, ty + 14);
    ctx.moveTo(tx + 32, ty + 28); ctx.lineTo(tx + 8, ty + 14);
    ctx.stroke();

    ctx.fillStyle = "#b45309";
    ctx.fillRect(tx + 5, ty + 4, 30, 8);
    ctx.strokeStyle = "#451a03";
    ctx.strokeRect(tx + 5, ty + 4, 30, 8);

    const target = this.findTarget(tower, enemies);
    const lookAngle = target ? getAngle({ x: tx + 20, y: ty + 4 }, { x: target.x + 20, y: target.y + 20 }) : 0;

    ctx.save();
    ctx.translate(tx + 20, ty + 4);
    ctx.fillStyle = "#22c55e";
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(5, 8); ctx.lineTo(-5, 8); ctx.closePath(); ctx.fill();
    
    ctx.fillStyle = "#fed7aa";
    ctx.beginPath(); ctx.arc(0, -3, 3, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#ec4899";
    ctx.beginPath();
    ctx.arc(-2, -4, 2.5, 0, Math.PI * 2); ctx.arc(2, -4, 2.5, 0, Math.PI * 2); ctx.arc(0, -5, 2.5, 0, Math.PI * 2);
    ctx.arc(-3, -7, 1.5, 0, Math.PI * 2); ctx.arc(3, -7, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#7c2d12";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.rotate(lookAngle); ctx.arc(5, 0, 4.5, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    ctx.restore();
  }

  private static drawLevelBadge(ctx: CanvasRenderingContext2D, tower: Tower) {
    ctx.fillStyle = "#fbbf24";
    ctx.font = "900 10px 'Lilita One', sans-serif";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeText(`LVL ${tower.level}`, tower.x + 7, tower.y + 38);
    ctx.fillText(`LVL ${tower.level}`, tower.x + 7, tower.y + 38);
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

// src/game/renderers/BackgroundRenderer.ts
import { GAME_PATH, CANVAS_WIDTH, CANVAS_HEIGHT } from "@/game/config/gameConfig";

export class BackgroundRenderer {
  private static cachedCanvas: HTMLCanvasElement | null = null;

  public static getCanvas(): HTMLCanvasElement {
    if (this.cachedCanvas) return this.cachedCanvas;

    const bgCanvas = document.createElement("canvas");
    bgCanvas.width = CANVAS_WIDTH;
    bgCanvas.height = CANVAS_HEIGHT;
    const ctx = bgCanvas.getContext("2d");
    if (!ctx) return bgCanvas;

    this.drawGrass(ctx);
    this.drawRoad(ctx);
    this.drawStones(ctx);
    this.drawTrees(ctx);

    this.cachedCanvas = bgCanvas;
    return bgCanvas;
  }

  private static drawGrass(ctx: CanvasRenderingContext2D) {
    for (let tx = 0; tx < 24; tx++) {
      for (let ty = 0; ty < 15; ty++) {
        const x = tx * 40, y = ty * 40;
        const seed = (tx * 37 + ty * 13) % 100;
        ctx.fillStyle = seed % 7 === 0 ? "#22c55e" : seed % 11 === 0 ? "#4ade80" : "#15803d";
        ctx.fillRect(x, y, 40, 40);

        if (seed === 42) {
          ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(x + 20, y + 20, 2.5, 0, Math.PI * 2); ctx.arc(x + 16, y + 18, 1.8, 0, Math.PI * 2); ctx.arc(x + 24, y + 22, 1.8, 0, Math.PI * 2); ctx.arc(x + 22, y + 16, 1.8, 0, Math.PI * 2); ctx.arc(x + 18, y + 24, 1.8, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#eab308"; ctx.beginPath(); ctx.arc(x + 20, y + 20, 1.2, 0, Math.PI * 2); ctx.fill();
        } else if (seed === 88) {
          ctx.fillStyle = "#e2e8f0"; ctx.fillRect(x + 18, y + 22, 4, 6);
          ctx.fillStyle = "#ec4899"; ctx.beginPath(); ctx.arc(x + 20, y + 22, 6, Math.PI, 0); ctx.fill();
          ctx.fillStyle = "#ffffff"; ctx.fillRect(x + 17, y + 18, 1.2, 1.2); ctx.fillRect(x + 21, y + 19, 1.2, 1.2);
        }
      }
    }
  }

  private static drawRoad(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "#451a03"; ctx.lineWidth = 46; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(GAME_PATH[0].x + 20, GAME_PATH[0].y + 20);
    GAME_PATH.slice(1).forEach(p => ctx.lineTo(p.x + 20, p.y + 20)); ctx.stroke();
    ctx.strokeStyle = "#854d0e"; ctx.lineWidth = 36;
    ctx.beginPath(); ctx.moveTo(GAME_PATH[0].x + 20, GAME_PATH[0].y + 20);
    GAME_PATH.slice(1).forEach(p => ctx.lineTo(p.x + 20, p.y + 20)); ctx.stroke();
  }

  private static drawStones(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < GAME_PATH.length - 1; i++) {
      const p1 = GAME_PATH[i], p2 = GAME_PATH[i + 1];
      const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      const steps = Math.floor(dist / 32);
      for (let s = 0; s <= steps; s++) {
        const ratio = s / steps;
        const px = p1.x + 20 + (p2.x - p1.x) * ratio, py = p1.y + 20 + (p2.y - p1.y) * ratio;
        const seed = (Math.floor(px) * 17 + Math.floor(py) * 13) % 100;
        if (seed % 3 === 0) {
          ctx.fillStyle = seed % 2 === 0 ? "#78716c" : "#57534e";
          ctx.beginPath(); ctx.arc(px + (seed % 6 - 3), py + (seed % 8 - 4), 4 + (seed % 4), 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = "#292524"; ctx.lineWidth = 0.8; ctx.stroke();
        }
      }
    }
  }

  private static drawTrees(ctx: CanvasRenderingContext2D) {
    const drawTree = (tx: number, ty: number) => {
      ctx.fillStyle = "#451a03"; ctx.fillRect(tx - 3, ty + 10, 6, 12);
      ctx.fillStyle = "#15803d"; ctx.beginPath(); ctx.moveTo(tx, ty - 24); ctx.lineTo(tx + 18, ty - 6); ctx.lineTo(tx - 18, ty - 6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#166534"; ctx.beginPath(); ctx.moveTo(tx, ty - 12); ctx.lineTo(tx + 22, ty + 6); ctx.lineTo(tx - 22, ty + 6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#14532d"; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + 26, ty + 14); ctx.lineTo(tx - 26, ty + 14); ctx.closePath(); ctx.fill();
    };
    const trees = [{ x: 60, y: 50 }, { x: 144, y: 40 }, { x: 408, y: 50 }, { x: 504, y: 45 }, { x: 576, y: 50 }, { x: 680, y: 45 }, { x: 800, y: 50 }, { x: 890, y: 40 }, { x: 60, y: 540 }, { x: 132, y: 535 }, { x: 324, y: 550 }, { x: 396, y: 540 }, { x: 576, y: 535 }, { x: 680, y: 540 }, { x: 800, y: 550 }, { x: 890, y: 535 }];
    trees.forEach(t => drawTree(t.x, t.y));
  }
}

// src/game/renderers/UIRenderer.ts
import { FloatingText, GameState } from "@/types/game";
import { GAME_PATH } from "@/game/config/gameConfig";

export class UIRenderer {
  public static drawNexus(ctx: CanvasRenderingContext2D) {
    const nexus = GAME_PATH[GAME_PATH.length - 1];
    const nx = nexus.x - 20;
    const ny = nexus.y - 20;

    // Castle Shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath(); ctx.ellipse(nx + 40, ny + 56, 46, 26, 0, 0, Math.PI * 2); ctx.fill();

    // Stone Wall base
    ctx.fillStyle = "#8b5a2b"; ctx.fillRect(nx + 6, ny + 10, 8, 50); ctx.fillRect(nx + 66, ny + 10, 8, 50);
    ctx.fillStyle = "#d6d3d1"; ctx.fillRect(nx + 10, ny + 10, 60, 50);
    ctx.strokeStyle = "#44403c"; ctx.lineWidth = 3; ctx.strokeRect(nx + 10, ny + 10, 60, 50);

    // Wooden Archway
    ctx.fillStyle = "#78350f"; ctx.beginPath(); ctx.arc(nx + 40, ny + 60, 15, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = "#451a03"; ctx.lineWidth = 2.5; ctx.stroke();

    // Golden rivets
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath(); ctx.arc(nx + 32, ny + 50, 1.8, 0, Math.PI * 2); ctx.arc(nx + 48, ny + 50, 1.8, 0, Math.PI * 2); ctx.arc(nx + 40, ny + 46, 1.8, 0, Math.PI * 2); ctx.fill();

    // Red Tiled Roof
    ctx.fillStyle = "#dc2626"; ctx.beginPath(); ctx.moveTo(nx + 40, ny - 24); ctx.lineTo(nx + 78, ny + 12); ctx.lineTo(nx + 2, ny + 12); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#7f1d1d"; ctx.lineWidth = 3; ctx.stroke();

    // Banner
    const flagWave = Math.sin(Date.now() / 150) * 3.5;
    ctx.fillStyle = "#3b82f6"; ctx.beginPath(); ctx.moveTo(nx + 40, ny - 24); ctx.lineTo(nx + 60 + flagWave, ny - 32 + flagWave / 2); ctx.lineTo(nx + 40, ny - 40); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#d97706"; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(nx + 40, ny - 24); ctx.lineTo(nx + 40, ny - 40); ctx.stroke();

    // Label
    ctx.fillStyle = "#ffffff"; ctx.font = "900 12px 'Lilita One', sans-serif";
    ctx.strokeStyle = "#000000"; ctx.lineWidth = 3.5;
    ctx.strokeText("TOWN HALL", nx + 10, ny - 8); ctx.fillText("TOWN HALL", nx + 10, ny - 8);
  }

  public static drawFloatingText(ctx: CanvasRenderingContext2D, ft: FloatingText) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, ft.life);
    const scale = 1.0 + (1.0 - ft.life) * 0.4;
    ctx.translate(ft.x + 20, ft.y);
    ctx.scale(scale, scale);

    ctx.font = "900 13px 'Lilita One', sans-serif";
    ctx.fillStyle = ft.color;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4.5;
    ctx.textAlign = "center";
    ctx.strokeText(ft.text, 0, 0); ctx.fillText(ft.text, 0, 0);
    ctx.restore();
  }
}

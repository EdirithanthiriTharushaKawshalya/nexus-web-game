"use client";
 
import { useEffect, useRef } from "react";
import { GameState } from "@/types/game";
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE } from "@/game/config/gameConfig";
import { BackgroundRenderer } from "@/game/renderers/BackgroundRenderer";
import { TowerRenderer } from "@/game/renderers/TowerRenderer";
import { EnemyRenderer } from "@/game/renderers/EnemyRenderer";
import { ProjectileRenderer } from "@/game/renderers/ProjectileRenderer";
import { UIRenderer } from "@/game/renderers/UIRenderer";

interface GameCanvasProps {
  gameState: GameState;
  selectedTowerId: string | null;
  onTileClick: (x: number, y: number) => void;
  gold: number;
}

export default function GameCanvas({ gameState, selectedTowerId, onTileClick, gold }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(gameState);
  const selectedTowerIdRef = useRef(selectedTowerId);

  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    selectedTowerIdRef.current = selectedTowerId;
  }, [selectedTowerId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let active = true;

    const render = () => {
      if (!active) return;

      const currentGameState = stateRef.current;
      const currentSelectedTowerId = selectedTowerIdRef.current;

      ctx.save();

      // Screen Shake
      if (currentGameState.screenShake && currentGameState.screenShake > 0) {
        const shake = currentGameState.screenShake * 16;
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      }

      // 1. Draw Background
      const bgCanvas = BackgroundRenderer.getCanvas();
      ctx.drawImage(bgCanvas, 0, 0);

      // 2. Draw Nexus
      UIRenderer.drawNexus(ctx);

      // 3. Draw Towers
      currentGameState.towers?.forEach(tower => {
        TowerRenderer.draw(ctx, tower, currentSelectedTowerId === tower.id, currentGameState.enemies);
      });

      // 4. Draw Projectiles
      currentGameState.towers?.forEach(tower => {
        ProjectileRenderer.draw(ctx, tower, currentGameState.enemies);
      });

      // 5. Draw Enemies
      currentGameState.enemies?.forEach(enemy => {
        EnemyRenderer.draw(ctx, enemy);
      });

      // 6. Draw UI Elements (Floating Text)
      currentGameState.floatingTexts?.forEach(ft => {
        UIRenderer.drawFloatingText(ctx, ft);
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      active = false;
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    
    const x = Math.floor(((e.clientX - rect.left) * scaleX) / TILE_SIZE) * TILE_SIZE;
    const y = Math.floor(((e.clientY - rect.top) * scaleY) / TILE_SIZE) * TILE_SIZE;
    
    onTileClick(x, y);
  };

  return (
    <div className="relative w-full h-full border-4 md:border-[6px] border-amber-950 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl bg-emerald-950">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleClick}
        className="w-full h-full cursor-crosshair"
      />
      <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-amber-950/95 border-2 border-amber-800 px-2.5 py-0.5 rounded-lg md:rounded-xl flex items-center gap-1 shadow-md z-30 font-cartoon text-[10px] md:text-xs text-yellow-400 select-none">
        <span>🪙</span>
        <span>{gold}</span>
      </div>
    </div>
  );
}

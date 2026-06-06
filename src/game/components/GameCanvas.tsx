"use client";

import { useEffect, useRef } from "react";
import { GameState, Enemy } from "@/types/game";
import { GAME_PATH } from "@/game/engine/stateManager";

interface GameCanvasProps {
  gameState: GameState;
  onTileClick: (x: number, y: number) => void;
}

export default function GameCanvas({ gameState, onTileClick }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      ctx.save();
      
      // 1. Arcane Screen Shake
      if (gameState.screenShake > 0) {
        const intensity = gameState.screenShake * 15;
        ctx.translate((Math.random() - 0.5) * intensity, (Math.random() - 0.5) * intensity);
      }

      // 2. Styled Battlefield Background
      const gradient = ctx.createRadialGradient(400, 300, 0, 400, 300, 600);
      gradient.addColorStop(0, "#051923");
      gradient.addColorStop(1, "#010a13");
      ctx.fillStyle = gradient;
      ctx.fillRect(-100, -100, 1000, 800);
      
      // Crystalline Grid
      ctx.strokeStyle = "rgba(10, 200, 185, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= 800; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 600); ctx.stroke();
      }
      for (let y = 0; y <= 600; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(800, y); ctx.stroke();
      }

      // 3. Hand-Painted Path Effect
      ctx.strokeStyle = "#1e2328";
      ctx.lineWidth = 42;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(GAME_PATH[0].x + 20, GAME_PATH[0].y + 20);
      for (let i = 1; i < GAME_PATH.length; i++) {
        ctx.lineTo(GAME_PATH[i].x + 20, GAME_PATH[i].y + 20);
      }
      ctx.stroke();

      // Inner Glowing Energy Path
      ctx.strokeStyle = "rgba(10, 200, 185, 0.15)";
      ctx.lineWidth = 36;
      ctx.stroke();

      // 4. Hex-Core (Nexus) Rendering
      const nexus = GAME_PATH[GAME_PATH.length - 1];
      const pulse = Math.sin(Date.now() / 300) * 10;
      
      // Outer Halo
      ctx.fillStyle = "rgba(10, 200, 185, 0.1)";
      ctx.beginPath();
      ctx.arc(nexus.x + 20, nexus.y + 20, 60 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // Core Crystal
      ctx.save();
      ctx.translate(nexus.x + 20, nexus.y + 20);
      ctx.rotate(Date.now() / 1000);
      ctx.fillStyle = "#0ac8b9";
      ctx.shadowBlur = 20 + pulse;
      ctx.shadowColor = "#0ac8b9";
      ctx.fillRect(-25, -25, 50, 50);
      ctx.strokeStyle = "#c89b3c";
      ctx.lineWidth = 3;
      ctx.strokeRect(-25, -25, 50, 50);
      ctx.restore();

      // 5. Hextech Towers
      gameState.towers.forEach((tower) => {
        // Base Filigree
        ctx.strokeStyle = "#c89b3c";
        ctx.lineWidth = 2;
        ctx.strokeRect(tower.x + 4, tower.y + 4, 32, 32);
        
        // Body
        ctx.fillStyle = tower.type === 'sniper' ? '#4c1d95' : tower.type === 'pulse' ? '#713f12' : '#0a323c';
        ctx.fillRect(tower.x + 6, tower.y + 6, 28, 28);

        // Glowing Crystal
        const gemColor = tower.type === 'sniper' ? '#a78bfa' : tower.type === 'pulse' ? '#facc15' : '#0ac8b9';
        ctx.fillStyle = gemColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = gemColor;
        ctx.beginPath();
        ctx.arc(tower.x + 20, tower.y + 20, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Level indicator
        ctx.fillStyle = "#f0e6d2";
        ctx.font = "bold 9px Monospace";
        ctx.fillText(`V${tower.level}`, tower.x + 15, tower.y + 15);

        // Firing Effects (Magical Lasers)
        if (Date.now() - tower.lastShot < 100) {
          ctx.strokeStyle = gemColor;
          ctx.lineWidth = tower.type === 'pulse' ? 8 : 3;
          const target = gameState.enemies.find(e => 
            Math.sqrt(Math.pow(e.x - tower.x, 2) + Math.pow(e.y - tower.y, 2)) < tower.range
          );
          if (target) {
            ctx.beginPath();
            ctx.moveTo(tower.x + 20, tower.y + 20);
            ctx.lineTo(target.x + 20, target.y + 20);
            ctx.stroke();
            // Impact Flare
            ctx.fillStyle = "#fff";
            ctx.beginPath(); ctx.arc(target.x + 20, target.y + 20, 5, 0, Math.PI * 2); ctx.fill();
          }
        }
      });

      // 6. Styled Enemies
      gameState.enemies.forEach((enemy) => {
        const color = enemy.type === 'fast' ? '#fb923c' : enemy.type === 'tank' ? '#7f1d1d' : '#ef4444';
        const size = enemy.type === 'fast' ? 10 : enemy.type === 'tank' ? 18 : 12;
        
        ctx.fillStyle = color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        // Diamond shape for stylized look
        ctx.save();
        ctx.translate(enemy.x + 20, enemy.y + 20);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-size/2, -size/2, size, size);
        ctx.restore();
        ctx.shadowBlur = 0;
        
        // Health bar (Arcane Style)
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(enemy.x + 5, enemy.y - 12, 30, 3);
        ctx.fillStyle = "#0ac8b9";
        ctx.fillRect(enemy.x + 5, enemy.y - 12, (enemy.health / enemy.maxHealth) * 30, 3);
      });

      // 7. Floating Combat Text
      gameState.floatingTexts.forEach(ft => {
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.life;
        ctx.font = `bold ${12 + (1 - ft.life) * 15}px "Segoe UI"`;
        ctx.shadowBlur = 5;
        ctx.shadowColor = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      });

      ctx.restore();
      requestAnimationFrame(render);
    };

    const animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 600 / rect.height;
    const x = Math.floor(((e.clientX - rect.left) * scaleX) / 40) * 40;
    const y = Math.floor(((e.clientY - rect.top) * scaleY) / 40) * 40;
    onTileClick(x, y);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-[800px] aspect-[4/3] border-[3px] border-[#c89b3c] shadow-[0_0_40px_rgba(0,0,0,0.7)] bg-[#010a13] overflow-hidden group">
      {/* Decorative Corner Filigree */}
      <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-[#c89b3c] m-1 opacity-40 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-[#c89b3c] m-1 opacity-40 group-hover:opacity-100 transition-opacity" />
      
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleClick}
        className="w-full h-full cursor-crosshair"
      />
      
      {/* HUD Overlays */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none">
        {Object.values(gameState.players).map(player => (
          <div key={player.id} className="bg-[#0a1428]/90 border-l-4 border-l-[#0ac8b9] p-2 md:p-3 shadow-xl backdrop-blur-sm min-w-[120px]">
            <span className="text-[10px] font-black text-[#c89b3c] uppercase tracking-widest block mb-1 italic">{player.name}</span>
            <div className="flex justify-between font-mono">
              <span className="text-[#0ac8b9] text-[10px]">RESONANCE: {player.gold}</span>
            </div>
          </div>
        ))}
      </div>

      {/* WAVE INDICATOR */}
      <div className="absolute top-3 right-3 bg-[#0a1428]/80 border border-[#c89b3c]/20 p-2 md:p-3 text-right">
        <span className="text-[8px] font-black text-[#c89b3c] uppercase tracking-[0.3em] block">Incursion Wave</span>
        <div className="text-xl md:text-3xl font-black text-[#f0e6d2] italic leading-none">{gameState.wave}</div>
      </div>

      {/* NEXUS INTEGRITY BAR */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 md:w-80">
         <div className="flex justify-between text-[8px] font-black text-[#c89b3c] uppercase tracking-[0.2em] mb-1 italic">
            <span>Core Integrity</span>
            <span>{gameState.nexusHealth}%</span>
         </div>
         <div className="h-1.5 bg-[#010a13] border border-[#c89b3c]/30 rounded-full overflow-hidden p-[1px]">
            <div 
              className="h-full bg-gradient-to-r from-[#0ac8b9] to-[#005a82] shadow-[0_0_10px_#0ac8b9]"
              style={{ width: `${gameState.nexusHealth}%` }}
            />
         </div>
      </div>
    </div>
  );
}

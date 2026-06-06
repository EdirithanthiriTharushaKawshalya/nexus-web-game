"use client";

import { useEffect, useRef } from "react";
import { GameState } from "@/types/game";
import { GAME_PATH } from "@/game/engine/stateManager";

interface GameCanvasProps {
  gameState: GameState;
  onTileClick: (x: number, y: number) => void;
}

export default function GameCanvas({ gameState, onTileClick }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      // Clear canvas
      ctx.fillStyle = "#020617"; // slate-950
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Path
      ctx.strokeStyle = "#1e293b"; // slate-800
      ctx.lineWidth = 40;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(GAME_PATH[0].x + 20, GAME_PATH[0].y + 20);
      for (let i = 1; i < GAME_PATH.length; i++) {
        ctx.lineTo(GAME_PATH[i].x + 20, GAME_PATH[i].y + 20);
      }
      ctx.stroke();

      // 2. Draw Grid
      ctx.strokeStyle = "rgba(30, 41, 59, 0.3)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // 3. Draw Nexus
      const nexus = GAME_PATH[GAME_PATH.length - 1];
      const pulse = Math.sin(Date.now() / 200) * 5;
      ctx.fillStyle = "#3b82f6";
      ctx.shadowBlur = 20 + pulse;
      ctx.shadowColor = "#3b82f6";
      ctx.fillRect(nexus.x - 20, nexus.y - 20, 80, 80);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(nexus.x - 20, nexus.y - 20, 80, 80);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px Inter";
      ctx.fillText("NEXUS CORE", nexus.x - 10, nexus.y - 30);

      // 4. Draw Towers
      gameState.towers.forEach((tower) => {
        // Base
        ctx.fillStyle = tower.type === 'sniper' ? '#4c1d95' : tower.type === 'pulse' ? '#713f12' : '#1e40af';
        ctx.fillRect(tower.x + 5, tower.y + 5, 30, 30);
        
        // Turret
        ctx.fillStyle = tower.type === 'sniper' ? '#a78bfa' : tower.type === 'pulse' ? '#facc15' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(tower.x + 20, tower.y + 20, tower.type === 'sniper' ? 8 : 10, 0, Math.PI * 2);
        ctx.fill();

        if (tower.type === 'sniper') {
          ctx.strokeStyle = '#a78bfa';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(tower.x + 20, tower.y + 20);
          ctx.lineTo(tower.x + 20, tower.y + 5);
          ctx.stroke();
        }

        // Laser if firing
        if (Date.now() - tower.lastShot < 100) {
          ctx.strokeStyle = tower.type === 'sniper' ? '#c084fc' : tower.type === 'pulse' ? '#fde047' : '#60a5fa';
          ctx.lineWidth = tower.type === 'sniper' ? 3 : tower.type === 'pulse' ? 10 : 2;
          
          const target = gameState.enemies.find(e => 
            Math.sqrt(Math.pow(e.x - tower.x, 2) + Math.pow(e.y - tower.y, 2)) < tower.range
          );
          if (target) {
            ctx.beginPath();
            ctx.moveTo(tower.x + 20, tower.y + 20);
            ctx.lineTo(target.x + 20, target.y + 20);
            ctx.stroke();
          }
        }
      });

      // 5. Draw Enemies
      gameState.enemies.forEach((enemy) => {
        const color = enemy.type === 'fast' ? '#fb923c' : enemy.type === 'tank' ? '#7f1d1d' : '#ef4444';
        const size = enemy.type === 'fast' ? 10 : enemy.type === 'tank' ? 18 : 12;

        ctx.fillStyle = color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(enemy.x + 20, enemy.y + 20, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Health bar
        ctx.fillStyle = "#000";
        ctx.fillRect(enemy.x + 5, enemy.y - 10, 30, 4);
        ctx.fillStyle = enemy.type === 'tank' ? '#16a34a' : '#22c55e';
        ctx.fillRect(enemy.x + 5, enemy.y - 10, (enemy.health / enemy.maxHealth) * 30, 4);
      });

      requestAnimationFrame(render);
    };

    const animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.floor((e.clientX - rect.left) / 40) * 40;
    const y = Math.floor((e.clientY - rect.top) / 40) * 40;
    onTileClick(x, y);
  };

  return (
    <div className="relative border-4 border-slate-800 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleClick}
        className="cursor-crosshair bg-slate-950"
      />
      
      {/* HUD Overlays */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        {Object.values(gameState.players).map(player => (
          <div key={player.id} className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 p-3 rounded-xl flex flex-col min-w-[140px] shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_#3b82f6]" />
              <span className="text-xs font-black text-slate-200 uppercase tracking-tighter truncate">{player.name}</span>
            </div>
            <div className="flex justify-between mt-2 font-mono">
              <span className="text-yellow-500 text-xs">💰 {player.gold}</span>
              <span className="text-blue-400 text-xs">★ {player.score}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Nexus Health Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-64 h-4 bg-slate-900/80 border border-slate-700 rounded-full overflow-hidden backdrop-blur">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
          style={{ width: `${(gameState.nexusHealth / gameState.maxNexusHealth) * 100}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black tracking-widest text-white uppercase drop-shadow-md">
          Nexus Integrity: {gameState.nexusHealth}%
        </div>
      </div>

      {/* Wave Counter */}
      <div className="absolute top-4 right-4 bg-blue-600/20 backdrop-blur border border-blue-500/50 px-4 py-2 rounded-xl">
        <span className="text-blue-400 text-xs font-black uppercase tracking-widest">Incursion Wave</span>
        <div className="text-2xl font-black text-white leading-none">{gameState.wave}</div>
      </div>
    </div>
  );
}

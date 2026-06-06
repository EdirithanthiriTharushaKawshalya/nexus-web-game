"use client";
 
import { useEffect, useRef } from "react";
import { GameState, Tower, Enemy } from "@/types/game";
import { GAME_PATH } from "@/game/engine/stateManager";

interface GameCanvasProps {
  gameState: GameState;
  selectedTowerId: string | null;
  onTileClick: (x: number, y: number) => void;
  gold: number;
}

export default function GameCanvas({ gameState, selectedTowerId, onTileClick, gold }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const stateRef = useRef(gameState);
  const selectedTowerIdRef = useRef(selectedTowerId);

  // Keep refs synchronized with the latest props without triggering layout rerenders
  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    selectedTowerIdRef.current = selectedTowerId;
  }, [selectedTowerId]);

  // Pre-render static grass, road, stones, and trees onto an offscreen canvas once
  const preRenderBackground = () => {
    const bgCanvas = document.createElement("canvas");
    bgCanvas.width = 960;
    bgCanvas.height = 600;
    const bgCtx = bgCanvas.getContext("2d");
    if (!bgCtx) return null;

    // 1. Lush Grassy Jungle Background
    for (let tx = 0; tx < 24; tx++) {
      for (let ty = 0; ty < 15; ty++) {
        const x = tx * 40;
        const y = ty * 40;
        const seed = (tx * 37 + ty * 13) % 100;
        
        if (seed % 7 === 0) {
          bgCtx.fillStyle = "#22c55e"; // darker grass green
        } else if (seed % 11 === 0) {
          bgCtx.fillStyle = "#4ade80"; // lighter grass green
        } else {
          bgCtx.fillStyle = "#15803d"; // main forest green
        }
        bgCtx.fillRect(x, y, 40, 40);

        // Flowers
        if (seed === 42) {
          bgCtx.fillStyle = "#ffffff";
          bgCtx.beginPath();
          bgCtx.arc(x + 20, y + 20, 2.5, 0, Math.PI * 2);
          bgCtx.arc(x + 16, y + 18, 1.8, 0, Math.PI * 2);
          bgCtx.arc(x + 24, y + 22, 1.8, 0, Math.PI * 2);
          bgCtx.arc(x + 22, y + 16, 1.8, 0, Math.PI * 2);
          bgCtx.arc(x + 18, y + 24, 1.8, 0, Math.PI * 2);
          bgCtx.fill();
          bgCtx.fillStyle = "#eab308";
          bgCtx.beginPath();
          bgCtx.arc(x + 20, y + 20, 1.2, 0, Math.PI * 2);
          bgCtx.fill();
        } else if (seed === 88) {
          // Mushroom
          bgCtx.fillStyle = "#e2e8f0";
          bgCtx.fillRect(x + 18, y + 22, 4, 6);
          bgCtx.fillStyle = "#ec4899"; // elixir-pink cap
          bgCtx.beginPath();
          bgCtx.arc(x + 20, y + 22, 6, Math.PI, 0);
          bgCtx.fill();
          bgCtx.fillStyle = "#ffffff";
          bgCtx.fillRect(x + 17, y + 18, 1.2, 1.2);
          bgCtx.fillRect(x + 21, y + 19, 1.2, 1.2);
        }
      }
    }

    // 2. Dirt Road
    bgCtx.strokeStyle = "#451a03";
    bgCtx.lineWidth = 46;
    bgCtx.lineCap = "round";
    bgCtx.lineJoin = "round";
    bgCtx.beginPath();
    bgCtx.moveTo(GAME_PATH[0].x + 20, GAME_PATH[0].y + 20);
    for (let i = 1; i < GAME_PATH.length; i++) {
      bgCtx.lineTo(GAME_PATH[i].x + 20, GAME_PATH[i].y + 20);
    }
    bgCtx.stroke();

    bgCtx.strokeStyle = "#854d0e";
    bgCtx.lineWidth = 36;
    bgCtx.beginPath();
    bgCtx.moveTo(GAME_PATH[0].x + 20, GAME_PATH[0].y + 20);
    for (let i = 1; i < GAME_PATH.length; i++) {
      bgCtx.lineTo(GAME_PATH[i].x + 20, GAME_PATH[i].y + 20);
    }
    bgCtx.stroke();

    // Stepping stones
    bgCtx.fillStyle = "#78716c";
    for (let i = 0; i < GAME_PATH.length - 1; i++) {
      const p1 = GAME_PATH[i];
      const p2 = GAME_PATH[i + 1];
      const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      const steps = Math.floor(dist / 32);
      for (let s = 0; s <= steps; s++) {
        const ratio = s / steps;
        const px = p1.x + 20 + (p2.x - p1.x) * ratio;
        const py = p1.y + 20 + (p2.y - p1.y) * ratio;
        const stoneSeed = (Math.floor(px) * 17 + Math.floor(py) * 13) % 100;
        if (stoneSeed % 3 === 0) {
          bgCtx.fillStyle = stoneSeed % 2 === 0 ? "#78716c" : "#57534e";
          bgCtx.beginPath();
          bgCtx.arc(px + (stoneSeed % 6 - 3), py + (stoneSeed % 8 - 4), 4 + (stoneSeed % 4), 0, Math.PI * 2);
          bgCtx.fill();
          bgCtx.strokeStyle = "#292524";
          bgCtx.lineWidth = 0.8;
          bgCtx.stroke();
        }
      }
    }

    // 3. Border Pine Trees
    const drawTree = (tx: number, ty: number) => {
      bgCtx.fillStyle = "#451a03";
      bgCtx.fillRect(tx - 3, ty + 10, 6, 12);
      bgCtx.fillStyle = "#15803d";
      bgCtx.beginPath();
      bgCtx.moveTo(tx, ty - 24);
      bgCtx.lineTo(tx + 18, ty - 6);
      bgCtx.lineTo(tx - 18, ty - 6);
      bgCtx.closePath();
      bgCtx.fill();

      bgCtx.fillStyle = "#166534";
      bgCtx.beginPath();
      bgCtx.moveTo(tx, ty - 12);
      bgCtx.lineTo(tx + 22, ty + 6);
      bgCtx.lineTo(tx - 22, ty + 6);
      bgCtx.closePath();
      bgCtx.fill();

      bgCtx.fillStyle = "#14532d";
      bgCtx.beginPath();
      bgCtx.moveTo(tx, ty);
      bgCtx.lineTo(tx + 26, ty + 14);
      bgCtx.lineTo(tx - 26, ty + 14);
      bgCtx.closePath();
      bgCtx.fill();
    };

    const trees = [
      { x: 60, y: 50 }, { x: 144, y: 40 }, { x: 408, y: 50 }, { x: 504, y: 45 }, { x: 576, y: 50 },
      { x: 680, y: 45 }, { x: 800, y: 50 }, { x: 890, y: 40 },
      { x: 60, y: 540 }, { x: 132, y: 535 }, { x: 324, y: 550 }, { x: 396, y: 540 }, { x: 576, y: 535 },
      { x: 680, y: 540 }, { x: 800, y: 550 }, { x: 890, y: 535 }
    ];
    trees.forEach(t => drawTree(t.x, t.y));

    return bgCanvas;
  };

  // Helper to find closest enemy in range for orientation
  const findTargetEnemy = (tower: Tower, enemies: Enemy[]): Enemy | null => {
    let closestEnemy: Enemy | null = null;
    let minDistance = tower.range;
    if (enemies) {
      enemies.forEach(enemy => {
        const dist = Math.sqrt(Math.pow(enemy.x - tower.x, 2) + Math.pow(enemy.y - tower.y, 2));
        if (dist < minDistance) {
          minDistance = dist;
          closestEnemy = enemy;
        }
      });
    }
    return closestEnemy;
  };

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
        const dx = (Math.random() - 0.5) * shake;
        const dy = (Math.random() - 0.5) * shake;
        ctx.translate(dx, dy);
      }

      // 1. Draw cached static background (grass, path, cobblestones, border trees)
      if (!bgCanvasRef.current) {
        bgCanvasRef.current = preRenderBackground();
      }
      if (bgCanvasRef.current) {
        ctx.drawImage(bgCanvasRef.current, 0, 0);
      }

      // 4. Draw Town Hall (Clan Castle Core)
      const nexus = GAME_PATH[GAME_PATH.length - 1];
      const nx = nexus.x - 20;
      const ny = nexus.y - 20;

      // Castle Shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(nx + 40, ny + 56, 46, 26, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stone Wall base
      ctx.fillStyle = "#8b5a2b"; // wooden corner poles
      ctx.fillRect(nx + 6, ny + 10, 8, 50);
      ctx.fillRect(nx + 66, ny + 10, 8, 50);
      
      ctx.fillStyle = "#d6d3d1"; // grey stone hall
      ctx.fillRect(nx + 10, ny + 10, 60, 50);
      ctx.strokeStyle = "#44403c";
      ctx.lineWidth = 3;
      ctx.strokeRect(nx + 10, ny + 10, 60, 50);

      // Wooden Archway gate door
      ctx.fillStyle = "#78350f";
      ctx.beginPath();
      ctx.arc(nx + 40, ny + 60, 15, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = "#451a03";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Golden rivets
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(nx + 32, ny + 50, 1.8, 0, Math.PI * 2);
      ctx.arc(nx + 48, ny + 50, 1.8, 0, Math.PI * 2);
      ctx.arc(nx + 40, ny + 46, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Red Tiled Roof
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.moveTo(nx + 40, ny - 24); // peak
      ctx.lineTo(nx + 78, ny + 12);
      ctx.lineTo(nx + 2, ny + 12);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#7f1d1d";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Waving Clan Banner Flag
      const flagWave = Math.sin(Date.now() / 150) * 3.5;
      ctx.fillStyle = "#3b82f6"; // Blue flag
      ctx.beginPath();
      ctx.moveTo(nx + 40, ny - 24);
      ctx.lineTo(nx + 60 + flagWave, ny - 32 + flagWave / 2);
      ctx.lineTo(nx + 40, ny - 40);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#d97706"; // flagpole
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(nx + 40, ny - 24);
      ctx.lineTo(nx + 40, ny - 40);
      ctx.stroke();

      // Label Town Hall
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 12px 'Lilita One', sans-serif";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3.5;
      ctx.strokeText("TOWN HALL", nx + 10, ny - 8);
      ctx.fillText("TOWN HALL", nx + 10, ny - 8);

      // 5. Draw Towers
      if (currentGameState.towers) {
        currentGameState.towers.forEach((tower) => {
          const tx = tower.x;
          const ty = tower.y;
          const isSelected = currentSelectedTowerId === tower.id;

          // Selection circle & range indicator
          if (isSelected) {
            ctx.strokeStyle = "rgba(234, 179, 8, 0.5)"; // Golden rings
            ctx.fillStyle = "rgba(234, 179, 8, 0.08)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(tx + 20, ty + 20, tower.range, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Gold selection box
            ctx.strokeStyle = "#eab308";
            ctx.strokeRect(tx - 2, ty - 2, 44, 44);
          }

          // Tower Shadows
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.beginPath();
          ctx.ellipse(tx + 20, ty + 30, 18, 8, 0, 0, Math.PI * 2);
          ctx.fill();

          if (tower.type === 'sniper') {
            // WIZARD TOWER (Stone/Magical Spire)
            ctx.fillStyle = "#6b21a8"; // Purple stone
            ctx.fillRect(tx + 6, ty + 12, 28, 26);
            ctx.fillStyle = "#4a044e"; // Base rim
            ctx.fillRect(tx + 4, ty + 34, 32, 4);

            // Outlines
            ctx.strokeStyle = "#1e1b4b";
            ctx.lineWidth = 2.5;
            ctx.strokeRect(tx + 6, ty + 12, 28, 26);

            // Magical crystal steps
            ctx.fillStyle = "#a855f7";
            ctx.fillRect(tx + 10, ty + 6, 20, 6);
            ctx.strokeRect(tx + 10, ty + 6, 20, 6);

            // Little Wizard
            const target = findTargetEnemy(tower, currentGameState.enemies || []);
            let angle = 0;
            if (target) {
              angle = Math.atan2((target.y + 20) - (ty + 4), (target.x + 20) - (tx + 20));
            }

            ctx.save();
            ctx.translate(tx + 20, ty + 4);
            ctx.rotate(angle);

            // Blue wizard robe
            ctx.fillStyle = "#2563eb";
            ctx.beginPath();
            ctx.moveTo(0, 4);
            ctx.lineTo(6, 12);
            ctx.lineTo(-6, 12);
            ctx.closePath();
            ctx.fill();
            // face
            ctx.fillStyle = "#fed7aa";
            ctx.beginPath();
            ctx.arc(0, 1, 3.5, 0, Math.PI * 2);
            ctx.fill();
            // cap
            ctx.fillStyle = "#1d4ed8";
            ctx.beginPath();
            ctx.moveTo(0, -6);
            ctx.lineTo(4, -2);
            ctx.lineTo(-4, -2);
            ctx.closePath();
            ctx.fill();

            // Staff
            ctx.strokeStyle = "#b45309";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(4, 8);
            ctx.lineTo(7, -2);
            ctx.stroke();
            // staff orb
            ctx.fillStyle = "#facc15";
            ctx.beginPath();
            ctx.arc(7, -2, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            // Hovering crystal glow
            const float = Math.sin(Date.now() / 120) * 2;
            ctx.fillStyle = "#d8b4fe";
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#d8b4fe";
            ctx.beginPath();
            ctx.arc(tx + 20, ty - 12 + float, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

          } else if (tower.type === 'pulse') {
            // CANNON (Wooden Platform + heavy turning Turret)
            ctx.fillStyle = "#78716c"; // Circular stone base
            ctx.beginPath();
            ctx.arc(tx + 20, ty + 20, 17, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#1c1917";
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Heavy wood support planks
            ctx.fillStyle = "#9a3412";
            ctx.fillRect(tx + 10, ty + 10, 20, 20);
            ctx.strokeRect(tx + 10, ty + 10, 20, 20);

            // Turret barrel direction rotation
            const target = findTargetEnemy(tower, currentGameState.enemies || []);
            let angle = 0;
            if (target) {
              angle = Math.atan2((target.y + 20) - (ty + 20), (target.x + 20) - (tx + 20));
            }

            ctx.save();
            ctx.translate(tx + 20, ty + 20);
            ctx.rotate(angle);

            // Recoil
            const recoilTime = 120;
            const timePassed = Date.now() - tower.lastShot;
            let recoil = 0;
            if (timePassed < recoilTime) {
              recoil = -9 * (1 - (timePassed / recoilTime));
            }

            // Draw iron cannon barrel
            ctx.fillStyle = "#374151";
            ctx.fillRect(-8 + recoil, -6, 22, 12);
            ctx.strokeStyle = "#111827";
            ctx.strokeRect(-8 + recoil, -6, 22, 12);

            // Barrel mouth ring
            ctx.fillStyle = "#111827";
            ctx.fillRect(14 + recoil, -7, 4, 14);

            ctx.restore();

          } else {
            // ARCHER TOWER (Wood scaffold with Archer character)
            // 4 logs legs
            ctx.strokeStyle = "#854d0e";
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(tx + 5, ty + 34); ctx.lineTo(tx + 12, ty + 10);
            ctx.moveTo(tx + 35, ty + 34); ctx.lineTo(tx + 28, ty + 10);
            ctx.stroke();

            // Diagonal support crossbeams
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(tx + 7, ty + 22); ctx.lineTo(tx + 33, ty + 22);
            ctx.moveTo(tx + 8, ty + 28); ctx.lineTo(tx + 32, ty + 14);
            ctx.moveTo(tx + 32, ty + 28); ctx.lineTo(tx + 8, ty + 14);
            ctx.stroke();

            // Platform top
            ctx.fillStyle = "#b45309";
            ctx.fillRect(tx + 5, ty + 4, 30, 8);
            ctx.strokeStyle = "#451a03";
            ctx.strokeRect(tx + 5, ty + 4, 30, 8);

            // Little pink archer on top platform
            const target = findTargetEnemy(tower, currentGameState.enemies || []);
            let lookAngle = 0;
            if (target) {
              lookAngle = Math.atan2((target.y + 20) - (ty + 8), (target.x + 20) - (tx + 20));
            }

            ctx.save();
            ctx.translate(tx + 20, ty + 4);

            // Body green dress
            ctx.fillStyle = "#22c55e";
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(5, 8);
            ctx.lineTo(-5, 8);
            ctx.closePath();
            ctx.fill();
            
            // Face skin
            ctx.fillStyle = "#fed7aa";
            ctx.beginPath();
            ctx.arc(0, -3, 3, 0, Math.PI * 2);
            ctx.fill();

            // Cute pink hair
            ctx.fillStyle = "#ec4899";
            ctx.beginPath();
            ctx.arc(-2, -4, 2.5, 0, Math.PI * 2);
            ctx.arc(2, -4, 2.5, 0, Math.PI * 2);
            ctx.arc(0, -5, 2.5, 0, Math.PI * 2);
            // hair buns
            ctx.arc(-3, -7, 1.5, 0, Math.PI * 2);
            ctx.arc(3, -7, 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Draw small brown wooden bow
            ctx.strokeStyle = "#7c2d12";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.rotate(lookAngle);
            ctx.arc(5, 0, 4.5, -Math.PI / 2, Math.PI / 2);
            ctx.stroke();

            ctx.restore();
          }

          // Level badge star
          ctx.fillStyle = "#fbbf24";
          ctx.font = "900 10px 'Lilita One', sans-serif";
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 3;
          ctx.strokeText(`LVL ${tower.level}`, tx + 7, ty + 38);
          ctx.fillText(`LVL ${tower.level}`, tx + 7, ty + 38);
        });
      }

      // 6. Draw Projectiles
      if (currentGameState.towers) {
        const now = Date.now();
        const shotDuration = 180; // ms to hit
        currentGameState.towers.forEach((tower) => {
          const timeSinceShot = now - tower.lastShot;
          if (timeSinceShot < shotDuration) {
            const target = findTargetEnemy(tower, currentGameState.enemies || []);
            if (target) {
              const t = timeSinceShot / shotDuration;
              const sx = tower.x + 20;
              const sy = tower.y + 20;
              const ex = target.x + 20;
              const ey = target.y + 20;
              
              // Projectile interpolation coords
              const px = sx + (ex - sx) * t;
              const py = sy + (ey - sy) * t;

              if (tower.type === 'sniper') {
                // Wizard Lightning shock
                ctx.strokeStyle = "#e9d5ff";
                ctx.lineWidth = 3;
                ctx.shadowBlur = 15;
                ctx.shadowColor = "#c084fc";
                ctx.beginPath();
                ctx.moveTo(sx, sy - 12);
                
                // Random zigzag joints
                const zx1 = sx + (ex - sx) * 0.3 + (Math.random() - 0.5) * 16;
                const zy1 = sy + (ey - sy) * 0.3 + (Math.random() - 0.5) * 16;
                const zx2 = sx + (ex - sx) * 0.6 + (Math.random() - 0.5) * 16;
                const zy2 = sy + (ey - sy) * 0.6 + (Math.random() - 0.5) * 16;
                
                ctx.lineTo(zx1, zy1);
                ctx.lineTo(zx2, zy2);
                ctx.lineTo(ex, ey);
                ctx.stroke();
                ctx.shadowBlur = 0;
              } else if (tower.type === 'pulse') {
                // Cannonball: black sphere with Y parabola arc height
                const arc = -42 * Math.sin(t * Math.PI);
                ctx.fillStyle = "#1e293b";
                ctx.beginPath();
                ctx.arc(px, py + arc, 5.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Smoke trail
                ctx.fillStyle = "rgba(241, 245, 249, 0.45)";
                ctx.beginPath();
                ctx.arc(px - (ex - sx) * 0.06, py + arc - (ey - sy) * 0.06 + 2, 4, 0, Math.PI * 2);
                ctx.fill();
              } else {
                // Archer tower arrow flying in rotation angle
                const angle = Math.atan2(ey - sy, ex - sx);
                ctx.save();
                ctx.translate(px, py);
                ctx.rotate(angle);
                
                // Arrow wood shaft
                ctx.strokeStyle = "#78350f";
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.moveTo(-6, 0); ctx.lineTo(6, 0);
                ctx.stroke();

                // Fletchings feathers
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(-6, 0); ctx.lineTo(-9, -2.5);
                ctx.moveTo(-6, 0); ctx.lineTo(-9, 2.5);
                ctx.stroke();

                // Metal arrowhead tip
                ctx.fillStyle = "#94a3b8";
                ctx.beginPath();
                ctx.moveTo(6, 0); ctx.lineTo(2, -2.5); ctx.lineTo(2, 2.5);
                ctx.closePath();
                ctx.fill();

                ctx.restore();
              }
            }
          }
        });
      }

      // 7. Draw Cute Soldiers (Enemies)
      if (currentGameState.enemies) {
        currentGameState.enemies.forEach((enemy) => {
          const ex = enemy.x;
          const ey = enemy.y;

          // Determine heading direction based on current path nodes
          const currentSeg = GAME_PATH[enemy.pathIndex];
          const nextSeg = GAME_PATH[enemy.pathIndex + 1];
          let isMovingLeft = false;
          if (nextSeg) {
            isMovingLeft = nextSeg.x < currentSeg.x;
          }

          // Enemy Shadow
          ctx.fillStyle = "rgba(0,0,0,0.22)";
          ctx.beginPath();
          ctx.ellipse(ex + 20, ey + 28, 12, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Bobbing walking/run motion
          const bob = Math.sin(Date.now() / 110 + enemy.id.charCodeAt(0)) * 3.5;

          if (enemy.type === 'tank') {
            // GIANT (Fist-clenching orange-bearded giant)
            const facing = isMovingLeft ? -1 : 1;
            ctx.save();
            ctx.translate(ex + 20, ey + 18 + bob);
            ctx.scale(facing, 1);

            // Heavy brown leather jacket
            ctx.fillStyle = "#78350f";
            ctx.beginPath();
            ctx.arc(0, 5, 12, 0, Math.PI * 2);
            ctx.fill();
            // outline
            ctx.strokeStyle = "#3f1a04";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Face peach
            ctx.fillStyle = "#fed7aa";
            ctx.beginPath();
            ctx.arc(0, -4, 7.5, 0, Math.PI * 2);
            ctx.fill();

            // Bushy orange beard
            ctx.fillStyle = "#ea580c";
            ctx.beginPath();
            ctx.arc(-3, 1, 5, 0, Math.PI * 2);
            ctx.arc(3, 1, 5, 0, Math.PI * 2);
            ctx.arc(0, 3, 6, 0, Math.PI * 2);
            ctx.fill();

            // Big clenching peach hands
            ctx.fillStyle = "#fed7aa";
            ctx.beginPath();
            ctx.arc(-11, 8, 4.5, 0, Math.PI * 2);
            ctx.arc(11, 8, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.restore();

            // Giant heavy footstamp dust trails
            if (Math.abs(bob) > 2.8 && Math.random() > 0.4) {
              ctx.fillStyle = "rgba(255,255,255,0.45)";
              ctx.beginPath();
              ctx.arc(ex + 20 + (Math.random() - 0.5) * 10, ey + 28, 3.5, 0, Math.PI * 2);
              ctx.fill();
            }

          } else if (enemy.type === 'fast') {
            // BARBARIAN (Yellow-haired warriors with sword)
            const facing = isMovingLeft ? -1 : 1;
            ctx.save();
            ctx.translate(ex + 20, ey + 20 + bob);
            ctx.scale(facing, 1);

            // Brown kilt
            ctx.fillStyle = "#9a3412";
            ctx.fillRect(-6, 3, 12, 6);
            ctx.strokeStyle = "#451a03";
            ctx.strokeRect(-6, 3, 12, 6);

            // Leather cross chest straps
            ctx.fillStyle = "#451a03";
            ctx.fillRect(-1.5, -4, 3, 7);

            // Peach skin head
            ctx.fillStyle = "#fed7aa";
            ctx.beginPath();
            ctx.arc(0, -4, 5, 0, Math.PI * 2);
            ctx.fill();

            // Spiky yellow barbarian hair
            ctx.fillStyle = "#facc15";
            ctx.beginPath();
            ctx.arc(0, -8, 4.5, 0, Math.PI * 2);
            ctx.arc(-3, -7, 3, 0, Math.PI * 2);
            ctx.arc(3, -7, 3, 0, Math.PI * 2);
            ctx.fill();

            // Giant yellow mustache
            ctx.strokeStyle = "#eab308";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(-3, -2); ctx.lineTo(-1, -1);
            ctx.moveTo(3, -2); ctx.lineTo(1, -1);
            ctx.stroke();

            // Waving metal sword
            ctx.save();
            ctx.translate(8, -4);
            ctx.rotate(-Math.PI / 4 + Math.sin(Date.now() / 70) * 0.35);
            ctx.fillStyle = "#e2e8f0"; // steel sword blade
            ctx.fillRect(-1.8, -9, 3.6, 9);
            ctx.fillStyle = "#9a3412"; // hilt
            ctx.fillRect(-3, 0, 6, 2);
            ctx.restore();

            ctx.restore();

          } else {
            // GOBLIN (Green skin, long pointy ears, loot sack)
            const facing = isMovingLeft ? -1 : 1;
            ctx.save();
            ctx.translate(ex + 20, ey + 20 + bob);
            ctx.scale(facing, 1);

            // Brown loin rags
            ctx.fillStyle = "#b45309";
            ctx.fillRect(-5, 0, 10, 6);

            // Green ears
            ctx.fillStyle = "#22c55e";
            ctx.beginPath();
            ctx.moveTo(-4, -3); ctx.lineTo(-11, -5.5); ctx.lineTo(-5, -0.8);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(4, -3); ctx.lineTo(11, -5.5); ctx.lineTo(5, -0.8);
            ctx.closePath();
            ctx.fill();

            // Head green
            ctx.fillStyle = "#22c55e";
            ctx.beginPath();
            ctx.arc(0, -4, 4.5, 0, Math.PI * 2);
            ctx.fill();

            // Long nose
            ctx.strokeStyle = "#16a34a";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, -4); ctx.lineTo(4, -3.2);
            ctx.stroke();

            // Loot bag sack
            ctx.fillStyle = "#ca8a04";
            ctx.beginPath();
            ctx.arc(-8, 3, 4.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#451a03";
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
          }

          // Cartoony Health bar (dark frame, red fluid, green fill)
          const hbW = 24;
          const hbH = 4.2;
          ctx.fillStyle = "#782221"; // dark blood red empty
          ctx.fillRect(ex + 20 - hbW / 2, ey - 7, hbW, hbH);

          ctx.fillStyle = "#22c55e"; // bright green filled
          const ratio = Math.max(0, enemy.health / enemy.maxHealth);
          ctx.fillRect(ex + 20 - hbW / 2, ey - 7, hbW * ratio, hbH);

          ctx.strokeStyle = "#1c1917";
          ctx.lineWidth = 1.2;
          ctx.strokeRect(ex + 20 - hbW / 2, ey - 7, hbW, hbH);
        });
      }

      // 8. Draw Floating Texts (LVL UP, Gold, etc.)
      if (currentGameState.floatingTexts) {
        currentGameState.floatingTexts.forEach((ft) => {
          ctx.save();
          ctx.globalAlpha = Math.max(0, ft.life);
          
          // Bouncy scaling
          const scale = 1.0 + (1.0 - ft.life) * 0.4;
          ctx.translate(ft.x + 20, ft.y);
          ctx.scale(scale, scale);

          ctx.font = "900 13px 'Lilita One', sans-serif";
          ctx.fillStyle = ft.color;
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 4.5;
          ctx.textAlign = "center";
          ctx.strokeText(ft.text, 0, 0);
          ctx.fillText(ft.text, 0, 0);

          ctx.restore();
        });
      }

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
    
    // Scale coords from display container down to internal 960x600 units
    const scaleX = 960 / rect.width;
    const scaleY = 600 / rect.height;
    
    const x = Math.floor(((e.clientX - rect.left) * scaleX) / 40) * 40;
    const y = Math.floor(((e.clientY - rect.top) * scaleY) / 40) * 40;
    
    onTileClick(x, y);
  };

  return (
    <div ref={containerRef} className="relative w-full landscape:w-auto landscape:h-full max-w-[960px] border-4 md:border-[6px] border-amber-950 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl bg-emerald-950" style={{ aspectRatio: '16/10' }}>
      <canvas
        ref={canvasRef}
        width={960}
        height={600}
        onClick={handleClick}
        className="w-full h-full cursor-crosshair"
      />
      {/* COIN AMOUNT OVERLAY */}
      <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-amber-950/95 border-2 border-amber-800 px-2.5 py-0.5 rounded-lg md:rounded-xl flex items-center gap-1 shadow-md z-30 font-cartoon text-[10px] md:text-xs text-yellow-400 select-none">
        <span>🪙</span>
        <span>{gold}</span>
      </div>
    </div>
  );
}

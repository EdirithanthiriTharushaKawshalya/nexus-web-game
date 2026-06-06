"use client";
 
import { useAuth } from "@/game/hooks/useAuth";
import { useGame } from "@/game/hooks/useGame";
import { useState, useEffect, useRef } from "react";
import GameCanvas from "@/game/components/GameCanvas";
import GameLoadingScreen from "@/game/components/GameLoadingScreen";
import AuthPortal from "@/game/components/AuthPortal";

export default function LandingPage() {
  const { user, loading, logout } = useAuth();
  const { roomCode, gameState, error: gameError, createRoom, joinRoom, startGame, placeTower, upgradeTower, isHost } = useGame(user);
  
  const [inputRoomCode, setInputRoomCode] = useState("");
  const [selectedTowerType, setSelectedTowerType] = useState<string>("basic");
  const [selectedTowerId, setSelectedTowerId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showWaveNotification, setShowWaveNotification] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const lastWaveRef = useRef(0);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('room');
    if (code && user && !roomCode) {
      joinRoom(code);
    }
  }, [user, roomCode, joinRoom]);

  useEffect(() => {
    if (gameState && gameState.gameStatus === 'playing') {
      if (gameState.wave > lastWaveRef.current) {
        lastWaveRef.current = gameState.wave;
        setShowWaveNotification(true);
        
        // Wave 1 stays until click, Waves 2+ auto-dismiss after 3s
        if (gameState.wave > 1) {
          const timer = setTimeout(() => {
            setShowWaveNotification(false);
          }, 3000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [gameState?.wave, gameState?.gameStatus]);

  const handleJoin = async () => {
    if (!inputRoomCode) return;
    setIsJoining(true);
    await joinRoom(inputRoomCode);
    setIsJoining(false);
  };

  const handleTileClick = (x: number, y: number) => {
    // Dismiss Wave 1 notification on first interaction
    if (showWaveNotification && gameState?.wave === 1) {
      setShowWaveNotification(false);
    }

    const clickedTower = gameState?.towers.find(t => t.x === x && t.y === y);
    if (clickedTower) {
      setSelectedTowerId(clickedTower.id);
      return;
    }
    placeTower(selectedTowerType, x, y);
    setSelectedTowerId(null);
  };

  const currentSelectedTower = gameState?.towers.find(t => t.id === selectedTowerId);

  if (loading || isConnecting) {
    return <GameLoadingScreen message={isConnecting ? "Entering Village Gates..." : "Gathering Elixir..."} />;
  }

  // 1. AUTH SCREEN
  if (!user) {
    return <AuthPortal />;
  }

  // 2. VICTORY VIEW
  if (gameState && gameState.gameStatus === 'victory') {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] max-h-[100dvh] w-screen overflow-hidden bg-emerald-950 text-white p-4 relative bg-jungle">
        <button 
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 md:top-6 md:right-6 bg-amber-950/90 p-1.5 md:p-2.5 rounded-2xl border-3 border-amber-700 shadow-xl z-20 hover:bg-amber-900 transition-all cursor-pointer group/fs"
          title="Toggle Fullscreen"
        >
           <svg className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 group-hover/fs:fill-yellow-300 transition-colors" viewBox="0 0 24 24">
            {isFullscreen ? (
              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
            ) : (
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            )}
          </svg>
        </button>
        <div className="text-center w-full max-w-lg landscape:max-w-2xl animate-in fade-in zoom-in duration-700 panel-wood p-5 md:p-10 border-8 border-yellow-400 shadow-[0_0_80px_rgba(251,191,36,0.6)] relative overflow-hidden flex flex-col landscape:flex-row lg:flex-col items-center justify-between gap-4 md:gap-6">
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
          
          <div className="flex flex-col items-center landscape:items-start text-center landscape:text-left flex-1">
            <h1 className="text-5xl md:text-8xl font-cartoon text-yellow-400 tracking-tighter mb-2 md:mb-4 leading-none font-cartoon rotate-[-2deg]">
              VICTORY!
            </h1>
            <p className="text-xs md:text-xl text-yellow-100 mb-2 md:mb-10 uppercase tracking-[0.2em] md:tracking-[0.3em] font-black italic">Sector Secured. Nexus Defended.</p>
          </div>
          
          <div className="w-full max-w-sm flex flex-col gap-4 flex-1 z-10">
            <div className="space-y-2 md:space-y-3">
              <h2 className="text-center font-cartoon-sm text-emerald-300 text-xs md:text-sm mb-1 md:mb-2 tracking-widest">🏆 COMMANDERS 🏆</h2>
              <div className="space-y-1.5 max-h-[150px] landscape:max-h-[100px] overflow-y-auto scrollbar-thin">
                {Object.values(gameState.players).sort((a,b) => b.score - a.score).map((p, i) => (
                  <div key={p.id} className="bg-amber-950 border-3 border-yellow-600/50 p-2.5 md:p-4 rounded-3xl flex justify-between items-center shadow-lg">
                    <div className="flex items-center gap-4">
                      <span className="text-yellow-500 font-cartoon text-base md:text-xl">#0{i+1}</span>
                      <span className="font-black text-amber-100 text-sm md:text-lg font-cartoon-flat">{p.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[8px] md:text-[10px] text-amber-500 font-black tracking-widest uppercase">Final Score</span>
                      <span className="text-yellow-400 font-cartoon text-lg md:text-2xl">{p.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="w-full btn-cartoon btn-gold py-3 md:py-6 rounded-2xl md:rounded-[2.5rem] text-lg md:text-2xl font-cartoon"
            >
              RETURN TO COUNCIL
            </button>
          </div>
        </div>
      </div>
    );
  }


  // 3. GAME OVER VIEW
  if (gameState && gameState.gameStatus === 'gameOver') {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] max-h-[100dvh] w-screen overflow-hidden bg-emerald-950/90 text-white p-4 relative bg-jungle">
        <button 
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 md:top-6 md:right-6 bg-amber-950/90 p-1.5 md:p-2.5 rounded-2xl border-3 border-amber-700 shadow-xl z-20 hover:bg-amber-900 transition-all cursor-pointer group/fs"
          title="Toggle Fullscreen"
        >
           <svg className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 group-hover/fs:fill-yellow-300 transition-colors" viewBox="0 0 24 24">
            {isFullscreen ? (
              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
            ) : (
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            )}
          </svg>
        </button>
        <div className="text-center w-full max-w-md landscape:max-w-2xl animate-in fade-in zoom-in duration-500 panel-wood p-4 md:p-8 border-4 border-amber-950 flex flex-col landscape:flex-row lg:flex-col items-center justify-between gap-4 md:gap-6">
          <div className="flex flex-col items-center landscape:items-start text-center landscape:text-left flex-1">
            <h1 className="text-4xl md:text-6xl font-black text-red-500 tracking-tight mb-2 md:mb-4 leading-none font-cartoon">
              WAR ROOM BREACHED
            </h1>
            <p className="text-xs md:text-sm text-yellow-100 mb-2 md:mb-8 uppercase tracking-widest font-bold">The Elixir Core has been destroyed!</p>
          </div>
          
          <div className="w-full max-w-sm flex flex-col gap-4 flex-1">
            <div className="space-y-2">
              <h2 className="text-left font-cartoon-sm text-yellow-400 text-xs md:text-sm mb-1">🛡️ LEADERBOARD</h2>
              {Object.values(gameState.players).sort((a,b) => b.score - a.score).map((p, i) => (
                <div key={p.id} className="bg-amber-950/80 border-2 border-amber-700 p-2 md:p-3.5 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-500 font-cartoon-sm text-xs">#0{i+1}</span>
                    <span className="font-bold text-amber-100 text-xs md:text-sm font-cartoon-flat">{p.name}</span>
                  </div>
                  <span className="text-yellow-400 font-cartoon-sm text-xs md:text-sm">🏆 {p.score}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="w-full btn-cartoon btn-gold py-3 md:py-5 rounded-2xl text-base md:text-xl font-cartoon"
            >
              RETURN TO VILLAGE
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. GAME VIEW (Active Raid)
  if (gameState && gameState.gameStatus === 'playing') {
    return (
      <div className="flex flex-col landscape:flex-row lg:flex-row items-center justify-center h-[100dvh] max-h-[100dvh] w-screen bg-emerald-900 text-white p-3 landscape:p-2 lg:p-4 select-none overflow-hidden bg-jungle gap-4 landscape:gap-4 lg:gap-6">
        
        {/* Left column: Canvas Board */}
        <div className="flex flex-col items-center justify-center h-full landscape:h-full lg:h-full w-full max-w-[960px] landscape:w-auto relative">
          
          {/* Header (hidden in landscape mobile / desktop sidepanel to save space) */}
          <div className="mb-2.5 flex flex-row w-full justify-between items-center gap-2 px-2.5 landscape:hidden lg:hidden">
            {/* Wave Info */}
            <div className="bg-amber-950 border-2 border-amber-700 px-2.5 py-1 rounded-xl text-xs font-cartoon-flat flex items-center gap-1 shadow-md">
              <span className="text-amber-500 text-[8px] font-black uppercase tracking-wider block">WAVE</span>
              <span className="text-sm font-cartoon text-yellow-400 leading-none">{gameState.wave}</span>
            </div>

            {/* Elixir Core Bar */}
            <div className="flex-1 max-w-[140px] bg-amber-950 border-2 border-amber-700 px-2 py-1 rounded-xl flex flex-col gap-0.5 shadow-md">
              <div className="flex justify-between items-center text-[7px] font-bold text-amber-200 font-cartoon-flat leading-none">
                <span>ELIXIR CORE</span>
                <span>{gameState.nexusHealth}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-950 border border-amber-900 rounded-full overflow-hidden p-[1px]">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 to-fuchsia-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(0, (gameState.nexusHealth / gameState.maxNexusHealth) * 100)}%` }}
                />
              </div>
            </div>

            {/* Room Code Info */}
            <div className="bg-amber-950 border-2 border-amber-600 px-2.5 py-1 rounded-xl text-xs font-cartoon flex items-center gap-1.5 shadow-md">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-yellow-400 font-cartoon-sm text-[10px] tracking-wide">{roomCode}</span>
            </div>
          </div>

          <div className="relative w-full h-auto group max-h-[72dvh] landscape:max-h-[82dvh] lg:max-h-[82dvh]" style={{ aspectRatio: '16/10' }}>
            {/* FULLSCREEN TOGGLE */}
            <button 
              onClick={toggleFullscreen}
              className="absolute top-2 left-2 md:top-3 md:left-3 bg-amber-950/90 border-2 border-amber-800 p-1.5 md:p-2 rounded-xl shadow-md z-50 cursor-pointer hover:bg-amber-900 transition-all active:scale-95 group/fs"
              title="Toggle Fullscreen"
            >
              <svg className="w-3 h-3 md:w-5 md:h-5 fill-yellow-400 group-hover/fs:fill-yellow-300 transition-colors" viewBox="0 0 24 24">
                {isFullscreen ? (
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                ) : (
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                )}
              </svg>
            </button>

            <GameCanvas 
              gameState={gameState} 
              selectedTowerId={selectedTowerId}
              onTileClick={handleTileClick} 
              gold={gameState.players[user?.uid]?.gold ?? 0}
            />

            {/* WAVE NOTIFICATION OVERLAY */}
            {showWaveNotification && (
              <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none overflow-hidden">
                <div className="animate-in fade-in zoom-in slide-in-from-top-20 duration-500 flex flex-col items-center">
                   <div className="bg-yellow-400 text-amber-950 font-cartoon text-5xl md:text-7xl px-12 py-6 rounded-3xl border-8 border-amber-950 shadow-[0_0_50px_rgba(251,191,36,0.5)] rotate-[-2deg]">
                      WAVE {gameState.wave}
                   </div>
                   <div className="mt-4 bg-amber-950 text-yellow-400 font-cartoon-sm text-xl px-8 py-2 rounded-full border-4 border-amber-600 animate-pulse uppercase tracking-[0.2em]">
                      Sector Status: Contained
                   </div>
                </div>
              </div>
            )}

            {/* UPGRADE SCREEN OVERLAY */}
            {currentSelectedTower && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 panel-wood p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in duration-200 z-30 min-w-[240px] border-4 border-amber-950">
                 <div className="text-center mb-4">
                    <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center text-2xl mb-3 shadow-lg border-2 border-amber-900 ${
                      currentSelectedTower.type === 'sniper' ? 'bg-purple-700' : currentSelectedTower.type === 'pulse' ? 'bg-zinc-700' : 'bg-amber-700'
                    }`}>
                      {currentSelectedTower.type === 'sniper' ? '🧙‍♂️' : currentSelectedTower.type === 'pulse' ? '💣' : '🏹'}
                    </div>
                    <h3 className="font-cartoon uppercase text-sm text-yellow-400">Unit LVL {currentSelectedTower.level}</h3>
                    <p className="text-[9px] text-amber-300 font-bold mt-0.5 uppercase tracking-wider">UPGRADE STATION</p>
                 </div>
                 
                 <div className="space-y-1.5 mb-5 font-cartoon-sm text-[10px]">
                    <div className="flex justify-between items-center bg-amber-950/80 px-3 py-2 rounded-xl border border-amber-800">
                       <span className="text-amber-500 uppercase">DAMAGE</span>
                       <span className="text-red-400">💥 {Math.floor(currentSelectedTower.damage)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-amber-950/80 px-3 py-2 rounded-xl border border-amber-800">
                       <span className="text-amber-500 uppercase">RANGE</span>
                       <span className="text-blue-400">📏 {Math.floor(currentSelectedTower.range)}</span>
                    </div>
                 </div>

                 <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => {
                        upgradeTower(currentSelectedTower.id);
                        setSelectedTowerId(null);
                      }}
                      disabled={(gameState.players[user.uid]?.gold || 0) < currentSelectedTower.upgradeCost}
                      className="w-full btn-cartoon btn-gold py-3 rounded-xl text-xs font-cartoon uppercase tracking-wider"
                    >
                      Upgrade // 🪙{currentSelectedTower.upgradeCost}
                    </button>
                    <button 
                      onClick={() => setSelectedTowerId(null)}
                      className="w-full py-1 text-amber-300 hover:text-white transition-colors text-[10px] font-cartoon-sm uppercase"
                    >
                      Cancel
                    </button>
                 </div>
              </div>
            )}
            
            {gameState.towers.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 z-20">
                <div className="bg-amber-950/95 border-3 border-amber-600 text-yellow-400 px-6 py-4 rounded-2xl font-cartoon text-sm animate-bounce shadow-2xl tracking-wider text-center">
                  👉 TAP GRASS TO BUILD DEFENSES
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Wooden Sidebar (Shop & Status Dashboard) */}
        <div className="w-full landscape:w-[220px] lg:w-[260px] flex flex-row landscape:flex-col lg:flex-col justify-between items-center panel-wood border-4 border-amber-950 p-2.5 landscape:p-3 lg:p-4 rounded-3xl h-auto landscape:h-full landscape:max-h-[88dvh] lg:h-full lg:max-h-[88dvh] gap-3 landscape:gap-1.5 lg:gap-4">
          
          {/* Header info (only visible in desktop sidebar) */}
          <div className="hidden lg:block text-center mb-2 lg:mb-3 w-full">
            <h1 className="text-md lg:text-2xl font-cartoon leading-none text-yellow-400 uppercase italic text-shadow-none">VILLAGE DEFENSE</h1>
            <div className="text-[9px] font-black text-amber-300 uppercase tracking-widest mt-1 font-cartoon-flat">CODE: {roomCode}</div>
          </div>

          {/* Wave Counter & Elixir Core (only on landscape / desktop sidebar) */}
          <div className="hidden landscape:flex lg:flex flex-row lg:flex-col gap-1.5 lg:gap-2 mb-2 lg:mb-3 w-full">
            {/* Wave Counter */}
            <div className="bg-amber-950 border-2 border-amber-800 p-1.5 lg:p-2 rounded-xl flex items-center justify-center lg:justify-between gap-1 font-cartoon-flat leading-none shadow-inner flex-1 w-full">
              <span className="text-[7px] lg:text-[9px] text-amber-500 uppercase tracking-widest font-bold">WAVE</span>
              <span className="text-xs lg:text-sm font-cartoon text-yellow-400">⚔️ {gameState.wave}</span>
            </div>

            {/* Elixir Core Integrity Bar */}
            <div className="bg-amber-950 border-2 border-amber-800 p-1.5 lg:p-2.5 rounded-xl flex flex-col gap-1 lg:gap-1.5 font-cartoon-flat shadow-inner flex-[1.4] lg:flex-none w-full">
              <div className="flex justify-between items-center text-[8px] lg:text-[9px] font-bold text-amber-100">
                <span className="text-[7px] lg:text-[8px] text-pink-400 uppercase tracking-widest">CORE</span>
                <span>{gameState.nexusHealth}%</span>
              </div>
              <div className="w-full h-2 lg:h-3 bg-zinc-950 border border-amber-900 rounded-full overflow-hidden p-[1px] lg:p-[2px]">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 via-pink-400 to-fuchsia-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(0, (gameState.nexusHealth / gameState.maxNexusHealth) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Clan Members list (only on desktop sidebar) */}
          <div className="hidden lg:flex flex-col gap-1.5 w-full max-h-[140px] overflow-y-auto mb-3 border-b-2 border-amber-900/40 pb-3 scrollbar-thin">
            <div className="text-[8px] font-black text-amber-300 uppercase tracking-widest mb-1 text-center font-cartoon-flat">CLAN MEMBERS</div>
            {gameState.players && Object.values(gameState.players).map(player => (
              <div 
                key={player.id} 
                className={`bg-amber-950/90 border-2 ${player.id === user.uid ? 'border-yellow-400 shadow-[inset_0_0_8px_rgba(234,179,8,0.2)]' : 'border-amber-900/60'} p-2 rounded-xl flex flex-col font-cartoon-flat`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-100 truncate pr-2 max-w-[100px] lg:max-w-[130px]">{player.name}</span>
                  {player.id === user.uid && (
                    <span className="text-[7px] font-cartoon bg-green-600 border border-green-400 px-1 rounded uppercase tracking-wider text-white">YOU</span>
                  )}
                </div>
                <div className="flex justify-between items-center mt-1 text-[9px] font-bold">
                  <span className="text-yellow-400">🪙 {player.gold}</span>
                  <span className="text-blue-400">🏆 {player.score}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar shop items */}
          <div className="flex flex-row landscape:flex-col lg:flex-col gap-1.5 md:gap-2 flex-grow landscape:flex-none w-full justify-center landscape:justify-start">
            {[
              { id: 'basic', name: 'ARCHER TOWER', cost: 50, color: 'bg-green-700 border-green-800 text-green-100', icon: '🏹' },
              { id: 'sniper', name: 'WIZARD TOWER', cost: 120, color: 'bg-purple-700 border-purple-800 text-purple-100', icon: '🧙‍♂️' },
              { id: 'pulse', name: 'CANNON', cost: 100, color: 'bg-zinc-700 border-zinc-800 text-zinc-100', icon: '💣' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTowerType(t.id);
                  setSelectedTowerId(null);
                }}
                className={`flex flex-1 landscape:flex-none landscape:w-full items-center justify-center landscape:justify-start gap-1 md:gap-1.5 lg:gap-3 p-1 md:p-1.5 lg:p-2 rounded-xl border-2 transition-all btn-cartoon ${
                  selectedTowerType === t.id && !selectedTowerId
                    ? 'bg-amber-950 border-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.4)]' 
                    : 'bg-amber-900 border-amber-950'
                }`}
              >
                <div className={`w-6 h-6 md:w-7 md:h-7 lg:w-9 lg:h-9 rounded-lg ${t.color} border flex items-center justify-center text-xs md:text-sm lg:text-base shrink-0`}>
                  {t.icon}
                </div>
                <div className="text-left font-cartoon-flat leading-tight">
                  <div className="text-[7px] md:text-[8px] lg:text-[10px] font-black text-amber-100 uppercase truncate max-w-[60px] md:max-w-[80px] lg:max-w-[120px]">{t.name.split(' ')[0]}</div>
                  <div className="text-[7px] md:text-[8px] lg:text-[9px] text-yellow-400 font-bold">🪙 {t.cost}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Abort button */}
          <div className="flex-none w-20 md:w-24 landscape:mt-2 lg:mt-4 landscape:w-full flex items-center">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full btn-cartoon btn-red py-1.5 md:py-2.5 rounded-xl text-[8px] md:text-xs font-cartoon"
            >
              ABORT
            </button>
          </div>
        </div>

      </div>
    );
  }

  // 4. WAR ROOM LOBBY
  if (roomCode) {
    return (
      <div className="flex flex-col landscape:flex-row lg:flex-col lg:landscape:flex-col items-center justify-center h-[100dvh] max-h-[100dvh] w-screen overflow-hidden bg-emerald-950 text-white p-4 bg-jungle outline-none gap-4 md:gap-8 lg:gap-8">
        <button 
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 md:top-6 md:right-6 bg-amber-950/90 p-1.5 md:p-2.5 rounded-2xl border-3 border-amber-700 shadow-xl z-20 hover:bg-amber-900 transition-all cursor-pointer group/fs"
          title="Toggle Fullscreen"
        >
           <svg className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 group-hover/fs:fill-yellow-300 transition-colors" viewBox="0 0 24 24">
            {isFullscreen ? (
              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
            ) : (
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            )}
          </svg>
        </button>
        <div className="text-center landscape:text-left lg:text-center lg:landscape:text-center flex flex-col items-center landscape:items-start lg:items-center lg:landscape:items-center mb-2 landscape:mb-0 lg:mb-6">
          <h1 className="text-3xl md:text-4xl font-cartoon mb-1 md:mb-2 tracking-tight uppercase italic text-yellow-400">WAR ROOM LOBBY</h1>
          <p className="text-yellow-100/60 text-[10px] md:text-xs uppercase tracking-widest font-cartoon-flat mb-2 md:mb-4">WAR PATH ENVELOPE: <span className="text-yellow-400 font-cartoon-sm">{roomCode}</span></p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-cartoon btn-red py-2 px-6 rounded-xl text-xs font-cartoon hidden landscape:block lg:hidden lg:landscape:hidden"
          >
            ABORT MISSION
          </button>
        </div>
        
        <div className="panel-wood p-4 landscape:p-3 lg:p-8 lg:landscape:p-8 md:p-8 shadow-2xl relative overflow-hidden border-4 border-amber-950 outline-none w-full max-w-md landscape:max-w-sm lg:max-w-md lg:landscape:max-w-md landscape:max-h-[90dvh] lg:max-h-none lg:landscape:max-h-none lg:overflow-y-visible lg:landscape:overflow-y-visible scrollbar-thin">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-600/10 rounded-full blur-[60px]" />
          
          <h2 className="text-xs md:text-base font-cartoon-sm mb-3 landscape:mb-1.5 lg:mb-6 lg:landscape:mb-6 md:mb-6 flex items-center gap-3 text-yellow-400">
            <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-yellow-500 animate-pulse" />
            SOLDIERS ALIGNING:
          </h2>
          
          <div className="space-y-1.5 landscape:space-y-1 lg:space-y-3 lg:landscape:space-y-3 md:space-y-3 mb-4 landscape:mb-2.5 lg:mb-10 lg:landscape:mb-10 md:mb-10 font-cartoon-flat max-h-[140px] lg:max-h-none lg:landscape:max-h-none md:max-h-none overflow-y-auto lg:overflow-y-visible lg:landscape:overflow-y-visible scrollbar-thin">
            {gameState && Object.values(gameState.players).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2.5 landscape:p-1.5 lg:p-4 lg:landscape:p-4 md:p-4 bg-amber-950/80 rounded-2xl border-2 border-amber-800">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-amber-900 flex items-center justify-center text-[10px] md:text-[12px] border-2 border-amber-600 text-yellow-400">
                    🛡️
                  </div>
                  <span className="font-bold text-amber-100 text-xs landscape:text-[11px] lg:text-base lg:landscape:text-base md:text-base">{p.name}</span>
                </div>
                <span className={`text-[8px] md:text-[10px] font-cartoon px-2 md:px-3 py-0.5 md:py-1 rounded-full uppercase tracking-wider ${p.id === user.uid ? 'bg-green-600 text-white border border-green-400' : 'bg-amber-900 text-amber-400 border border-amber-700'}`}>
                  {p.id === user.uid ? "YOU" : "READY"}
                </span>
              </div>
            ))}
            {[...Array(Math.max(0, 4 - (gameState ? Object.keys(gameState.players).length : 0)))].map((_, i) => (
               <div key={i} className="p-2 landscape:p-1 lg:p-4 lg:landscape:p-4 md:p-4 rounded-2xl border-2 border-dashed border-amber-900/60 flex items-center justify-center text-amber-800/80 text-[8px] md:text-[10px] font-cartoon uppercase tracking-[0.2em] h-8 landscape:h-6 lg:h-12 lg:landscape:h-12 md:h-auto">
                  OPEN SLOT
               </div>
            ))}
          </div>

          {isHost ? (
            <button 
              onClick={startGame}
              className="w-full btn-cartoon btn-red py-2.5 landscape:py-1.5 lg:py-5 lg:landscape:py-5 md:py-5 rounded-2xl md:rounded-3xl text-lg landscape:text-xs lg:text-2xl lg:landscape:text-2xl md:text-2xl font-cartoon"
            >
              START BATTLE!
              <span className="block text-[8px] md:text-[10px] text-red-200 mt-0.5 font-cartoon-flat tracking-wider uppercase opacity-80">ENGAGE PROTOCOL</span>
            </button>
          ) : (
            <div className="text-center p-3 landscape:p-1.5 lg:p-6 lg:landscape:p-6 md:p-6 bg-amber-950/60 rounded-2xl border-2 border-dashed border-amber-800 text-amber-400 font-cartoon-sm text-[10px] landscape:text-[9px] lg:text-xs lg:landscape:text-xs md:text-xs">
              WAITING FOR VILLAGE CHIEF TO START DEPLOYMENT...
            </div>
          )}
        </div>
        
        <button 
          onClick={() => window.location.reload()} 
          className="w-full mt-4 text-amber-600 hover:text-amber-400 text-xs font-cartoon uppercase tracking-[0.2em] transition-colors landscape:hidden lg:block lg:landscape:block"
        >
          ABORT MISSION
        </button>
      </div>
    );
  }

  // 5. COMMAND DASHBOARD
  return (
    <div className="flex flex-col landscape:flex-row lg:flex-col lg:landscape:flex-col items-center justify-center h-[100dvh] max-h-[100dvh] w-screen overflow-hidden bg-emerald-950 text-white p-4 relative bg-jungle gap-4 md:gap-8 lg:gap-8">
      <div className="absolute top-4 right-4 md:top-6 md:right-6 flex landscape:hidden lg:flex lg:landscape:flex items-center gap-2 md:gap-4 lg:gap-4 bg-amber-950/90 p-1.5 md:p-2.5 lg:p-2.5 rounded-2xl border-3 border-amber-700 shadow-xl z-20">
        <div className="flex flex-col items-end pr-1 md:pr-1.5 font-cartoon-flat">
           <span className="text-[7px] md:text-[9px] text-amber-500 uppercase tracking-widest font-bold">ACTIVE CHIEF</span>
           <span className="font-bold text-amber-100 text-xs md:text-sm tracking-tight">{user?.displayName}</span>
        </div>
        <button 
          onClick={toggleFullscreen}
          className="bg-amber-900 hover:bg-amber-800 text-yellow-400 p-1 md:p-2 rounded-xl border-2 border-amber-600 transition-all cursor-pointer group/fs"
          title="Toggle Fullscreen"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 group-hover/fs:fill-yellow-300 transition-colors" viewBox="0 0 24 24">
            {isFullscreen ? (
              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
            ) : (
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            )}
          </svg>
        </button>
        <button onClick={logout} className="bg-amber-900 hover:bg-red-900/20 text-yellow-400 hover:text-red-400 p-1 md:p-2 rounded-xl border-2 border-amber-600 transition-all cursor-pointer text-xs md:text-base">
          🚪
        </button>
      </div>

      <div className="text-center mb-2 landscape:mb-0 lg:mb-14 md:mb-14 relative flex flex-col items-center landscape:items-start lg:items-center lg:landscape:items-center">
        <h1 className="text-5xl md:text-8xl text-yellow-400 tracking-tight leading-none font-cartoon animate-bounce-slow">
          NEXUS
        </h1>
        <p className="text-emerald-300 font-cartoon text-xs md:text-sm tracking-wider mt-1 md:mt-2 uppercase">VILLAGE TOWER DEFENSE</p>
        <div className="h-1 w-16 md:h-1.5 md:w-24 bg-yellow-500 mx-auto landscape:mx-0 lg:mx-auto lg:landscape:mx-auto mt-2 md:mt-3 rounded-full shadow-[0_0_12px_#fbbf24]" />
        
        {/* Render Active Chief here in landscape orientation */}
        <div className="hidden landscape:flex lg:hidden lg:landscape:hidden items-center gap-2 bg-amber-950/90 p-1.5 rounded-xl border-2 border-amber-700 shadow-lg mt-4 z-20 font-cartoon-flat text-left">
          <div className="flex flex-col items-start pr-1 font-cartoon-flat">
             <span className="text-[7px] text-amber-500 uppercase tracking-widest font-bold">ACTIVE CHIEF</span>
             <span className="font-bold text-amber-100 text-xs tracking-tight">{user?.displayName}</span>
          </div>
          <button onClick={logout} className="bg-amber-900 hover:bg-red-900/20 text-yellow-400 hover:text-red-400 p-1 rounded-lg border border-amber-600 transition-all cursor-pointer text-xs">
            🚪
          </button>
        </div>
      </div>

      {gameError && (
        <div className="bg-red-500/10 border-2 border-red-500/50 text-red-400 px-6 py-2 rounded-2xl mb-4 md:mb-8 text-[10px] md:text-xs font-cartoon uppercase tracking-wider">
          ⚠️ {gameError}
        </div>
      )}

      <div className="flex flex-col landscape:grid landscape:grid-cols-2 gap-4 md:gap-6 lg:gap-6 w-full max-w-sm landscape:max-w-xl lg:max-w-4xl lg:landscape:max-w-4xl">
        <div className="panel-wood p-4 landscape:p-3 lg:p-9 lg:landscape:p-9 md:p-9 rounded-[2rem] border-4 border-amber-950 shadow-2xl flex flex-col justify-between outline-none landscape:max-h-[85dvh] lg:max-h-none lg:landscape:max-h-none landscape:overflow-y-auto lg:overflow-y-visible lg:landscape:overflow-y-visible scrollbar-thin">
          <div>
            <h2 className="text-lg md:text-3xl font-cartoon mb-1 md:mb-2 text-yellow-400 uppercase italic">Host Village</h2>
            <p className="text-yellow-100/70 text-[10px] md:text-sm mb-4 md:mb-8 leading-relaxed font-cartoon-flat landscape:hidden lg:block">Establish a new clan battlefield post and deploy defensive towers.</p>
          </div>
          <button 
            onClick={createRoom}
            className="w-full btn-cartoon btn-green py-2 landscape:py-1.5 lg:py-5 lg:landscape:py-5 md:py-5 rounded-2xl md:rounded-3xl text-base landscape:text-xs lg:text-xl lg:landscape:text-xl md:text-xl font-cartoon outline-none"
          >
            CREATE WAR ROOM
          </button>
        </div>

        <div className="panel-stone p-4 landscape:p-3 lg:p-9 lg:landscape:p-9 md:p-9 rounded-[2rem] border-4 border-zinc-950 shadow-2xl flex flex-col justify-between text-center md:text-left outline-none landscape:max-h-[85dvh] lg:max-h-none lg:landscape:max-h-none landscape:overflow-y-auto lg:overflow-y-visible lg:landscape:overflow-y-visible scrollbar-thin">
          <div>
            <h2 className="text-lg md:text-3xl font-cartoon mb-1 md:mb-2 text-yellow-400 uppercase italic">Join War</h2>
            <p className="text-stone-300 text-[10px] md:text-sm mb-3 md:mb-6 leading-relaxed font-cartoon-flat landscape:hidden lg:block">Enter a war room code to intercept an active operation.</p>
            
            <div className="relative mb-3 md:mb-6">
              <input
                type="text"
                placeholder="XXXXXX"
                maxLength={6}
                value={inputRoomCode}
                onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                className="w-full bg-zinc-950 border-3 border-zinc-700 rounded-xl md:rounded-2xl p-2.5 landscape:p-1.5 lg:p-4.5 lg:landscape:p-4.5 md:p-4.5 text-center text-xl landscape:text-lg lg:text-3xl lg:landscape:text-3xl md:text-3xl tracking-[0.4em] font-cartoon uppercase focus:border-yellow-500 focus:outline-none transition-all placeholder:text-zinc-800 text-yellow-400 font-cartoon-flat outline-none"
              />
            </div>
          </div>
          
          <button 
            onClick={handleJoin}
            disabled={inputRoomCode.length < 4 || isJoining}
            className="w-full btn-cartoon btn-gold py-2 landscape:py-1.5 lg:py-5 lg:landscape:py-5 md:py-5 rounded-2xl md:rounded-3xl text-base landscape:text-xs lg:text-xl lg:landscape:text-xl md:text-xl font-cartoon outline-none"
          >
            {isJoining ? "JOINING WAR..." : "JOIN CLAN WAR"}
          </button>
        </div>
      </div>
    </div>
  );
}

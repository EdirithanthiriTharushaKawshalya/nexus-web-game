"use client";
 
import { useAuth } from "@/game/hooks/useAuth";
import { useGame } from "@/game/hooks/useGame";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('room');
    if (code && user && !roomCode) {
      joinRoom(code);
    }
  }, [user]);

  const handleTileClick = (x: number, y: number) => {
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

  // 2. GAME OVER VIEW
  if (gameState && gameState.gameStatus === 'gameOver') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-950/90 text-white p-4 relative bg-jungle">
        <div className="text-center w-full max-w-md animate-in fade-in zoom-in duration-500 panel-wood p-8 border-4 border-amber-950">
          <h1 className="text-5xl md:text-6xl font-black text-red-500 tracking-tight mb-4 leading-none font-cartoon">
            WAR ROOM BREACHED
          </h1>
          <p className="text-sm text-yellow-100 mb-8 uppercase tracking-widest font-bold">The Elixir Core has been destroyed!</p>
          
          <div className="space-y-2.5 mb-8">
            <h2 className="text-left font-cartoon-sm text-yellow-400 text-sm mb-3">🛡️ LEADERBOARD</h2>
            {Object.values(gameState.players).sort((a,b) => b.score - a.score).map((p, i) => (
              <div key={p.id} className="bg-amber-950/80 border-2 border-amber-700 p-3.5 rounded-2xl flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-yellow-500 font-cartoon-sm text-xs">#0{i+1}</span>
                  <span className="font-bold text-amber-100 text-sm font-cartoon-flat">{p.name}</span>
                </div>
                <span className="text-yellow-400 font-cartoon-sm text-sm">🏆 {p.score}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="w-full btn-cartoon btn-gold py-5 rounded-2xl text-xl font-cartoon"
          >
            RETURN TO VILLAGE
          </button>
        </div>
      </div>
    );
  }

  // 3. GAME VIEW (Active Raid)
  if (gameState && gameState.gameStatus === 'playing') {
    return (
      <div className="flex flex-col landscape:flex-row lg:flex-row items-center justify-center min-h-screen landscape:h-screen landscape:max-h-screen lg:h-screen lg:max-h-screen w-full bg-emerald-900 text-white p-3 landscape:p-2 lg:p-4 select-none overflow-hidden bg-jungle gap-4 landscape:gap-4 lg:gap-6">
        
        {/* Left column: Canvas Board */}
        <div className="flex flex-col items-center justify-center h-full landscape:h-full lg:h-full w-full max-w-[800px] landscape:w-auto relative">
          
          {/* Header (hidden in landscape mobile / desktop sidepanel to save space) */}
          <div className="mb-3 flex justify-between w-full items-center px-2 landscape:hidden lg:hidden">
            <div>
              <h1 className="text-2xl font-cartoon leading-none text-yellow-400 uppercase italic">VILLAGE RAID</h1>
            </div>
            <div className="bg-amber-950 border-2 border-amber-600 px-3 py-1.5 rounded-xl text-xs font-cartoon flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-yellow-400 tracking-wider font-cartoon-sm">{roomCode}</span>
            </div>
          </div>

          <div className="relative w-full h-full landscape:w-auto landscape:h-full aspect-[4/3] group max-h-[70vh] landscape:max-h-[88vh] lg:max-h-[88vh]">
            <GameCanvas 
              gameState={gameState} 
              selectedTowerId={selectedTowerId}
              onTileClick={handleTileClick} 
            />

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
        <div className="w-full landscape:w-[220px] lg:w-[260px] flex flex-row landscape:flex-col lg:flex-col justify-between panel-wood border-4 border-amber-950 p-3 landscape:p-3 lg:p-4 rounded-3xl h-auto landscape:h-full landscape:max-h-[88vh] lg:h-full lg:max-h-[88vh] gap-3 landscape:gap-0">
          
          {/* Header info (only visible in landscape / desktop sidebar) */}
          <div className="hidden landscape:block text-center mb-2 lg:mb-4 w-full">
            <h1 className="text-md lg:text-2xl font-cartoon leading-none text-yellow-400 uppercase italic">VILLAGE DEFENSE</h1>
            <div className="text-[9px] font-black text-amber-300 uppercase tracking-widest mt-1 font-cartoon-flat">CODE: {roomCode}</div>
          </div>

          <div className="hidden lg:block border-b-2 border-amber-900/40 pb-2 mb-3 text-center w-full">
            <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest font-cartoon-flat">CHIEF</div>
            <div className="text-[11px] font-bold text-amber-100 truncate">{user.displayName}</div>
          </div>

          {/* Gold Reserves Dashboard */}
          <div className="bg-amber-950 border-2 border-amber-800 p-2.5 rounded-xl flex items-center justify-center gap-2 mb-0 landscape:mb-4 lg:mb-4 shadow-inner flex-1 landscape:flex-none">
            <span className="text-sm lg:text-lg">🪙</span>
            <div className="flex flex-col items-center justify-center font-cartoon-flat leading-none">
              <span className="text-[8px] text-amber-500 uppercase tracking-widest font-bold hidden lg:block">GOLD RESERVES</span>
              <span className="text-sm lg:text-lg font-cartoon text-yellow-400">
                {gameState.players[user?.uid]?.gold || 0}
              </span>
            </div>
          </div>

          {/* Sidebar shop items */}
          <div className="flex flex-row landscape:flex-col lg:flex-col gap-2 flex-[2] landscape:flex-none justify-center landscape:justify-start">
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
                className={`flex flex-1 landscape:flex-none items-center gap-1.5 lg:gap-3 p-1.5 lg:p-2 rounded-xl border-2 transition-all btn-cartoon ${
                  selectedTowerType === t.id && !selectedTowerId
                    ? 'bg-amber-950 border-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.4)]' 
                    : 'bg-amber-900 border-amber-950'
                }`}
              >
                <div className={`w-7 h-7 lg:w-9 lg:h-9 rounded-lg ${t.color} border flex items-center justify-center text-sm lg:text-base shrink-0`}>
                  {t.icon}
                </div>
                <div className="text-left font-cartoon-flat leading-tight font-cartoon-flat">
                  <div className="text-[8px] lg:text-[10px] font-black text-amber-100 uppercase truncate max-w-[80px] lg:max-w-[120px]">{t.name.split(' ')[0]}</div>
                  <div className="text-[8px] lg:text-[9px] text-yellow-400 font-bold font-cartoon-flat">🪙 {t.cost}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Abort button */}
          <div className="mt-0 landscape:mt-4 lg:mt-4 w-full flex-1 landscape:flex-none flex items-center">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full btn-cartoon btn-red py-2 lg:py-2.5 rounded-xl text-[9px] lg:text-xs font-cartoon"
            >
              ABORT RAID
            </button>
          </div>
        </div>

      </div>
    );
  }

  // 4. WAR ROOM LOBBY
  if (roomCode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-950 text-white p-4 bg-jungle">
        <div className="max-w-md w-full animate-in slide-in-from-bottom-8 duration-500">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-cartoon mb-2 tracking-tight uppercase italic text-yellow-400">WAR ROOM LOBBY</h1>
            <p className="text-yellow-100/60 text-xs uppercase tracking-widest font-cartoon-flat">WAR PATH ENVELOPE: <span className="text-yellow-400 font-cartoon-sm">{roomCode}</span></p>
          </div>
          
          <div className="panel-wood p-8 md:p-10 shadow-2xl relative overflow-hidden border-4 border-amber-950">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-600/10 rounded-full blur-[60px]" />
            
            <h2 className="text-base font-cartoon-sm mb-6 flex items-center gap-3 text-yellow-400">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" />
              SOLDIERS ALIGNING:
            </h2>
            
            <div className="space-y-3 mb-10">
              {gameState && Object.values(gameState.players).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-amber-950/80 rounded-2xl border-2 border-amber-800">
                  <div className="flex items-center gap-3 font-cartoon-flat">
                    <div className="w-8 h-8 rounded-full bg-amber-900 flex items-center justify-center text-[12px] border-2 border-amber-600 text-yellow-400">
                      🛡️
                    </div>
                    <span className="font-bold text-amber-100 text-base">{p.name}</span>
                  </div>
                  <span className={`text-[10px] font-cartoon px-3 py-1 rounded-full uppercase tracking-wider ${p.id === user.uid ? 'bg-green-600 text-white border border-green-400' : 'bg-amber-900 text-amber-400 border border-amber-700'}`}>
                    {p.id === user.uid ? "YOU" : "READY"}
                  </span>
                </div>
              ))}
              {[...Array(Math.max(0, 4 - (gameState ? Object.keys(gameState.players).length : 0)))].map((_, i) => (
                 <div key={i} className="p-4 rounded-2xl border-2 border-dashed border-amber-900/60 flex items-center justify-center text-amber-800/80 text-[10px] font-cartoon uppercase tracking-[0.2em]">
                    OPEN SLOT
                 </div>
              ))}
            </div>

            {isHost ? (
              <button 
                onClick={startGame}
                className="w-full btn-cartoon btn-red py-5 rounded-3xl text-2xl font-cartoon"
              >
                START BATTLE!
                <span className="block text-[10px] text-red-200 mt-0.5 font-cartoon-flat tracking-wider uppercase opacity-80">ENGAGE PROTOCOL</span>
              </button>
            ) : (
              <div className="text-center p-6 bg-amber-950/60 rounded-2xl border-2 border-dashed border-amber-800 text-amber-400 font-cartoon-sm text-xs">
                WAITING FOR VILLAGE CHIEF TO START DEPLOYMENT...
              </div>
            )}
          </div>
          
          <button 
            onClick={() => window.location.reload()} 
            className="w-full mt-8 text-amber-600 hover:text-amber-400 text-xs font-cartoon uppercase tracking-[0.2em] transition-colors"
          >
            ABORT MISSION
          </button>
        </div>
      </div>
    );
  }

  // 5. COMMAND DASHBOARD
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-950 text-white p-4 relative bg-jungle">
      <div className="absolute top-6 right-6 flex items-center gap-4 bg-amber-950/90 p-2.5 rounded-2xl border-3 border-amber-700 shadow-xl z-20">
        <div className="flex flex-col items-end pr-1.5 font-cartoon-flat">
           <span className="text-[9px] text-amber-500 uppercase tracking-widest">ACTIVE CHIEF</span>
           <span className="font-bold text-amber-100 text-sm tracking-tight">{user?.displayName}</span>
        </div>
        <button onClick={logout} className="bg-amber-900 hover:bg-red-900/20 text-yellow-400 hover:text-red-400 p-2 rounded-xl border-2 border-amber-600 transition-all cursor-pointer">
          🚪
        </button>
      </div>

      <div className="text-center mb-14 relative">
        <h1 className="text-7xl md:text-8xl text-yellow-400 tracking-tight leading-none font-cartoon animate-bounce-slow">
          NEXUS
        </h1>
        <p className="text-emerald-300 font-cartoon text-sm tracking-wider mt-2">VILLAGE TOWER DEFENSE</p>
        <div className="h-1.5 w-24 bg-yellow-500 mx-auto mt-3 rounded-full shadow-[0_0_12px_#fbbf24]" />
      </div>

      {gameError && (
        <div className="bg-red-500/10 border-2 border-red-500/50 text-red-400 px-6 py-3.5 rounded-2xl mb-8 text-xs font-cartoon uppercase tracking-wider">
          ⚠️ {gameError}
        </div>
      )}

      <div className="flex flex-col gap-6 w-full max-w-sm md:max-w-4xl md:grid md:grid-cols-2">
        <div className="panel-wood p-9 rounded-[2rem] border-4 border-amber-950 shadow-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-cartoon mb-2 text-yellow-400 uppercase italic">Host Village</h2>
            <p className="text-yellow-100/70 text-sm mb-8 leading-relaxed font-cartoon-flat">Establish a new clan battlefield post and deploy defensive towers.</p>
          </div>
          <button 
            onClick={createRoom}
            className="w-full btn-cartoon btn-green py-5 rounded-3xl text-xl font-cartoon"
          >
            CREATE WAR ROOM
          </button>
        </div>

        <div className="panel-stone p-9 rounded-[2rem] border-4 border-zinc-950 shadow-2xl flex flex-col justify-between text-center md:text-left">
          <div>
            <h2 className="text-3xl font-cartoon mb-2 text-yellow-400 uppercase italic">Join War</h2>
            <p className="text-stone-300 text-sm mb-6 leading-relaxed font-cartoon-flat">Enter a war room code to intercept an active operation.</p>
            
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="XXXXXX"
                maxLength={6}
                value={inputRoomCode}
                onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                className="w-full bg-zinc-950 border-3 border-zinc-700 rounded-2xl p-4.5 text-center text-3xl tracking-[0.4em] font-cartoon uppercase focus:border-yellow-500 focus:outline-none transition-all placeholder:text-zinc-800 text-yellow-400 font-cartoon-flat"
              />
            </div>
          </div>
          
          <button 
            onClick={() => joinRoom(inputRoomCode)}
            className="w-full btn-cartoon btn-gold py-5 rounded-3xl text-xl font-cartoon"
            disabled={inputRoomCode.length < 4}
          >
            JOIN CLAN WAR
          </button>
        </div>
      </div>
    </div>
  );
}

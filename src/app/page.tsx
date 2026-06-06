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
      <div className="flex flex-col items-center justify-start lg:justify-center min-h-screen bg-emerald-900 text-white p-2 md:p-6 select-none overflow-hidden bg-jungle">
        <div className="mb-3 flex justify-between w-full max-w-[800px] items-center px-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-cartoon leading-none text-yellow-400 uppercase italic">VILLAGE UNDER RAID</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden md:block text-right">
                <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest font-cartoon-flat">CHIEF COMMANDER</div>
                <div className="text-xs font-bold text-white">{user.displayName}</div>
             </div>
             <div className="bg-amber-950 border-2 border-amber-600 px-3 py-1.5 rounded-xl text-xs font-cartoon flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-yellow-400 tracking-wider font-cartoon-sm">{roomCode}</span>
             </div>
          </div>
        </div>
        
        <div className="relative w-full max-w-[800px] group">
          <GameCanvas 
            gameState={gameState} 
            selectedTowerId={selectedTowerId}
            onTileClick={handleTileClick} 
          />

          {/* UPGRADE SCREEN OVERLAY */}
          {currentSelectedTower && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 panel-wood p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in duration-200 z-30 min-w-[280px] border-4 border-amber-950">
               <div className="text-center mb-6">
                  <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center font-cartoon text-3xl mb-4 shadow-lg border-2 border-amber-900 ${
                    currentSelectedTower.type === 'sniper' ? 'bg-purple-700 text-purple-100' : currentSelectedTower.type === 'pulse' ? 'bg-zinc-700 text-zinc-100' : 'bg-amber-700 text-amber-100'
                  }`}>
                    {currentSelectedTower.type === 'sniper' ? '🧙‍♂️' : currentSelectedTower.type === 'pulse' ? '💣' : '🏹'}
                  </div>
                  <h3 className="font-cartoon uppercase tracking-widest text-base text-yellow-400">Unit LVL {currentSelectedTower.level}</h3>
                  <p className="text-[10px] text-amber-300 font-bold mt-1 uppercase tracking-tighter">BLACKSMITH UPGRADE WINDOW</p>
               </div>
               
               <div className="space-y-2 mb-8 font-cartoon-sm">
                  <div className="flex justify-between items-center bg-amber-950/80 p-3 rounded-xl border border-amber-800">
                     <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-2">DAMAGE</span>
                     <span className="text-red-400 px-2">💥 {Math.floor(currentSelectedTower.damage)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-amber-950/80 p-3 rounded-xl border border-amber-800">
                     <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-2">RANGE</span>
                     <span className="text-blue-400 px-2">📏 {Math.floor(currentSelectedTower.range)}</span>
                  </div>
               </div>

               <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      upgradeTower(currentSelectedTower.id);
                      setSelectedTowerId(null);
                    }}
                    disabled={(gameState.players[user.uid]?.gold || 0) < currentSelectedTower.upgradeCost}
                    className="w-full btn-cartoon btn-gold py-4 rounded-xl text-sm font-cartoon uppercase tracking-wider"
                  >
                    Upgrade // 🪙{currentSelectedTower.upgradeCost}
                  </button>
                  <button 
                    onClick={() => setSelectedTowerId(null)}
                    className="w-full py-2 text-amber-300 hover:text-white transition-colors text-xs font-cartoon-sm uppercase tracking-widest"
                  >
                    Cancel
                  </button>
               </div>
            </div>
          )}
          
          {gameState.towers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
              <div className="bg-amber-950/95 border-3 border-amber-600 text-yellow-400 px-6 py-4 rounded-2xl font-cartoon text-sm animate-bounce shadow-2xl tracking-wider text-center">
                👉 TAP GRASS TO BUILD DEFENSES
              </div>
            </div>
          )}
        </div>

        {/* SHOP MENUS */}
        <div className="mt-4 w-full max-w-[800px] flex flex-col md:flex-row gap-3 md:gap-5">
          <div className="grid grid-cols-3 gap-2 flex-1">
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
                className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4 p-3.5 rounded-2xl border-3 transition-all ${
                  selectedTowerType === t.id && !selectedTowerId
                    ? 'bg-amber-950 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)]' 
                    : 'bg-amber-950/80 border-amber-800 hover:border-amber-700'
                }`}
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 ${t.color} border-2 rounded-xl flex items-center justify-center text-xl shadow-md`}>
                  {t.icon}
                </div>
                <div className="text-center md:text-left font-cartoon-flat">
                  <div className="text-[10px] md:text-xs font-black tracking-wide text-amber-100">{t.name}</div>
                  <div className="text-[10px] text-yellow-400 font-bold tracking-wide mt-0.5">🪙 {t.cost}</div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="bg-amber-950 border-3 border-amber-600 p-4 rounded-2xl flex md:flex-col justify-between md:justify-center items-center md:min-w-[140px] shadow-xl">
            <div className="text-[10px] text-amber-500 uppercase tracking-widest md:mb-1 px-2 text-center font-cartoon-flat">GOLD RESERVES</div>
            <div className="text-2xl font-cartoon text-yellow-400 flex items-center gap-1.5">
              🪙 {gameState.players[user?.uid]?.gold || 0}
            </div>
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

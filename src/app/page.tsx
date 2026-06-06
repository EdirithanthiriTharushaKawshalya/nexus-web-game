"use client";

import { useAuth } from "@/game/hooks/useAuth";
import { useGame } from "@/game/hooks/useGame";
import { useState, useEffect } from "react";
import GameCanvas from "@/game/components/GameCanvas";
import GameLoadingScreen from "@/game/components/GameLoadingScreen";
import AuthPortal from "@/game/components/AuthPortal";

export default function LandingPage() {
  const { user, loading, logout, loginWithGoogle, authError } = useAuth();
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
    return <GameLoadingScreen message={isConnecting ? "Establishing Secure Link..." : "Synchronizing Credentials..."} />;
  }

  // 1. AUTH SCREEN
  if (!user) {
    return <AuthPortal />;
  }

  // 2. GAME OVER VIEW
  if (gameState && gameState.gameStatus === 'gameOver') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
        <div className="text-center w-full max-w-md animate-in fade-in zoom-in duration-500">
          <h1 className="text-6xl md:text-8xl font-black text-red-600 tracking-tighter mb-4 drop-shadow-2xl leading-none italic uppercase">
            Nexus Breached
          </h1>
          <p className="text-lg md:text-2xl text-slate-400 mb-8 md:mb-12 font-light">Operation terminated. Sector lost.</p>
          
          <div className="grid grid-cols-1 gap-2 md:gap-3 mb-10">
            {Object.values(gameState.players).sort((a,b) => b.score - a.score).map((p, i) => (
              <div key={p.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center group hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <span className="text-slate-600 font-black font-mono text-sm">#0{i+1}</span>
                  <span className="font-bold text-slate-200">{p.name}</span>
                </div>
                <span className="text-blue-500 font-mono font-black">{p.score} <span className="text-[10px] text-slate-600">PTS</span></span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-white text-black py-5 rounded-2xl font-black text-xl hover:bg-blue-600 hover:text-white transition-all transform active:scale-95 shadow-xl"
          >
            RETURN TO COMMAND
          </button>
        </div>
      </div>
    );
  }

  // 3. GAME VIEW (Active Mission)
  if (gameState && gameState.gameStatus === 'playing') {
    return (
      <div className="flex flex-col items-center justify-start lg:justify-center min-h-screen bg-slate-950 text-white p-2 md:p-6 font-sans selection:bg-blue-500 overflow-hidden">
        <div className="mb-4 flex justify-between w-full max-w-[800px] items-center px-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter leading-none text-blue-500 uppercase italic">Sector Active</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden md:block text-right">
                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active Commander</div>
                <div className="text-[10px] font-bold text-blue-400">{user.displayName}</div>
             </div>
             <div className="bg-blue-600/10 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-white font-bold tracking-widest">{roomCode}</span>
             </div>
          </div>
        </div>
        
        <div className="relative w-full max-w-[800px] group">
          <GameCanvas 
            gameState={gameState} 
            onTileClick={handleTileClick} 
          />

          {/* UPGRADE OVERLAY */}
          {currentSelectedTower && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/95 backdrop-blur-xl border-2 border-blue-500 p-8 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in duration-200 z-30 min-w-[280px]">
               <div className="text-center mb-6">
                  <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center font-black text-2xl mb-4 shadow-lg ${
                    currentSelectedTower.type === 'sniper' ? 'bg-purple-600' : currentSelectedTower.type === 'pulse' ? 'bg-yellow-600' : 'bg-blue-600'
                  }`}>
                    {currentSelectedTower.type[0].toUpperCase()}
                  </div>
                  <h3 className="font-black uppercase tracking-widest text-sm italic italic">Unit LVL {currentSelectedTower.level}</h3>
                  <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">Command Profile: Synchronized</p>
               </div>
               
               <div className="space-y-2 mb-8">
                  <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Damage</span>
                     <span className="font-mono font-bold text-red-400 px-2">{Math.floor(currentSelectedTower.damage)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Range</span>
                     <span className="font-mono font-bold text-blue-400 px-2">{Math.floor(currentSelectedTower.range)}</span>
                  </div>
               </div>

               <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      upgradeTower(currentSelectedTower.id);
                      setSelectedTowerId(null);
                    }}
                    disabled={(gameState.players[user.uid]?.gold || 0) < currentSelectedTower.upgradeCost}
                    className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-xs transition-all uppercase tracking-[0.2em] shadow-lg shadow-blue-900/40 active:scale-95 disabled:opacity-50"
                  >
                    Upgrade // 💰{currentSelectedTower.upgradeCost}
                  </button>
                  <button 
                    onClick={() => setSelectedTowerId(null)}
                    className="w-full py-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                  >
                    Close Terminal
                  </button>
               </div>
            </div>
          )}
          
          {gameState.towers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
              <div className="bg-blue-600/90 text-white px-8 py-4 rounded-2xl font-black text-sm animate-bounce shadow-2xl border-2 border-white/20 uppercase tracking-[0.2em] text-center">
                Tap Tactical Grid to Deploy
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 md:mt-8 w-full max-w-[800px] flex flex-col md:flex-row gap-3 md:gap-6">
          <div className="grid grid-cols-3 gap-2 flex-1">
            {[
              { id: 'basic', name: 'SENTRY', cost: 50, color: 'bg-blue-600', icon: 'S' },
              { id: 'sniper', name: 'SNIPER', cost: 120, color: 'bg-purple-600', icon: 'N' },
              { id: 'pulse', name: 'PULSE', cost: 100, color: 'bg-yellow-600', icon: 'P' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTowerType(t.id);
                  setSelectedTowerId(null);
                }}
                className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4 p-3 md:p-4 rounded-2xl border-2 transition-all transform active:scale-95 ${
                  selectedTowerType === t.id && !selectedTowerId
                    ? 'bg-slate-800 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 ${t.color} rounded-xl flex items-center justify-center font-black shadow-lg text-lg`}>
                  {t.icon}
                </div>
                <div className="text-center md:text-left">
                  <div className="text-[10px] md:text-xs font-black tracking-widest">{t.name}</div>
                  <div className="text-[10px] text-yellow-500 font-bold uppercase font-mono tracking-tight mt-0.5">💰{t.cost}</div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="bg-slate-900/80 border-2 border-slate-800 p-4 rounded-2xl flex md:flex-col justify-between md:justify-center items-center md:min-w-[140px] shadow-xl">
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest md:mb-1 px-2 text-center">Combat Credits</div>
            <div className="text-2xl font-black text-yellow-500 font-mono flex items-center gap-2">
              <span className="text-lg opacity-50">💰</span>
              {gameState.players[user?.uid]?.gold || 0}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. LOBBY VIEW
  if (roomCode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
        <div className="max-w-md w-full animate-in slide-in-from-bottom-8 duration-500">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-2 tracking-tighter uppercase italic text-blue-500">Nexus Lobby</h1>
            <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">Secure Connection: <span className="text-blue-400 font-mono">{roomCode}</span></p>
          </div>
          
          <div className="bg-slate-800/80 backdrop-blur border-2 border-slate-700 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-[60px]" />
            
            <h2 className="text-lg font-black mb-6 flex items-center gap-3 text-slate-200">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              DEPLOYMENT LIST
            </h2>
            
            <div className="space-y-3 mb-12">
              {gameState && Object.values(gameState.players).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-slate-900/60 rounded-2xl border border-slate-700/50 group hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black border border-slate-700 text-slate-500">
                      {p.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-200 text-base">{p.name}</span>
                  </div>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${p.id === user.uid ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                    {p.id === user.uid ? "You" : "Ready"}
                  </span>
                </div>
              ))}
              {[...Array(Math.max(0, 4 - (gameState ? Object.keys(gameState.players).length : 0)))].map((_, i) => (
                 <div key={i} className="p-4 rounded-2xl border border-dashed border-slate-800 flex items-center justify-center text-slate-700 text-[10px] font-black uppercase tracking-[0.3em]">
                    Empty Slot
                 </div>
              ))}
            </div>

            {isHost ? (
              <button 
                onClick={startGame}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 py-6 rounded-3xl font-black text-2xl transition-all shadow-[0_15px_40px_-10px_rgba(37,99,235,0.5)] active:scale-95 group"
              >
                LAUNCH MISSION
                <span className="block text-[10px] text-blue-200 mt-1 font-black tracking-widest uppercase opacity-60 group-hover:opacity-100">Initiate Drop Sequence</span>
              </button>
            ) : (
              <div className="text-center p-6 bg-slate-900/50 rounded-2xl border border-dashed border-slate-700 text-slate-500 font-bold uppercase tracking-widest text-xs">
                Waiting for Lead Commander to Deploy...
              </div>
            )}
          </div>
          
          <button 
            onClick={() => window.location.reload()} 
            className="w-full mt-8 text-slate-600 hover:text-slate-400 text-xs font-black uppercase tracking-[0.3em] transition-colors"
          >
            Abort Connection
          </button>
        </div>
      </div>
    );
  }

  // 5. COMMAND DASHBOARD
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4 relative">
      <div className="absolute top-6 right-6 flex items-center gap-4 bg-slate-800/50 p-2 rounded-2xl border border-slate-700/50 backdrop-blur">
        <div className="flex flex-col items-end pr-2">
           <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Active Commander</span>
           <span className="font-bold text-slate-200 text-sm tracking-tight">{user?.displayName}</span>
        </div>
        <button onClick={logout} className="bg-slate-900 hover:bg-red-900/20 text-slate-500 hover:text-red-400 p-2.5 rounded-xl border border-slate-700 transition-all group">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      <div className="text-center mb-16 relative">
        <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-100 to-blue-400 tracking-tighter italic drop-shadow-2xl uppercase">
          NEXUS
        </h1>
        <div className="h-1 w-24 bg-blue-600 mx-auto mt-2 rounded-full shadow-[0_0_15px_#3b82f6]" />
      </div>

      {gameError && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-3 rounded-2xl mb-8 text-xs font-black uppercase tracking-widest animate-shake">
          ⚠️ {gameError}
        </div>
      )}

      <div className="flex flex-col gap-6 w-full max-w-sm md:max-w-4xl md:grid md:grid-cols-2">
        <div className="bg-slate-800/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-slate-700 group hover:border-blue-500/50 transition-all shadow-2xl relative overflow-hidden">
          <h2 className="text-3xl font-black mb-3 tracking-tight italic uppercase">Host Mission</h2>
          <p className="text-slate-400 text-sm mb-10 leading-relaxed max-w-[200px]">Establish a new command post and deploy in any sector.</p>
          <button 
            onClick={createRoom}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-3xl font-black text-xl transition-all active:scale-95 shadow-[0_15px_30px_-5px_rgba(37,99,235,0.4)]"
          >
            Deploy Room
          </button>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-slate-700 group hover:border-green-500/50 transition-all shadow-2xl relative overflow-hidden text-center md:text-left">
          <h2 className="text-3xl font-black mb-3 tracking-tight italic uppercase">Join Sector</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">Enter an encrypted code to intercept an active operation.</p>
          
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="XXXXXX"
              maxLength={6}
              value={inputRoomCode}
              onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
              className="w-full bg-slate-950/80 border-2 border-slate-700 rounded-2xl p-5 text-center text-3xl tracking-[0.5em] font-black font-mono uppercase focus:border-green-500 focus:outline-none transition-all placeholder:text-slate-800 text-green-500"
            />
          </div>
          
          <button 
            onClick={() => joinRoom(inputRoomCode)}
            className="w-full bg-slate-700 hover:bg-green-600 text-white py-5 rounded-3xl font-black text-xl transition-all active:scale-95 disabled:opacity-30 shadow-xl"
            disabled={inputRoomCode.length < 4}
          >
            Intercept Code
          </button>
        </div>
      </div>
    </div>
  );
}

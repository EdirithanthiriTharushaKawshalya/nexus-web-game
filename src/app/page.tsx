"use client";

import { useAuth } from "@/game/hooks/useAuth";
import { useGame } from "@/game/hooks/useGame";
import { useState } from "react";

import GameCanvas from "@/game/components/GameCanvas";

export default function LandingPage() {
  const { user, loading, logout, loginWithGoogle } = useAuth();
  const { roomCode, gameState, error, createRoom, joinRoom, startGame, placeTower, isHost } = useGame(user);
  const [inputRoomCode, setInputRoomCode] = useState("");
  const [selectedTower, setSelectedTower] = useState<string>("basic");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-blue-400 font-mono tracking-widest animate-pulse uppercase">Synchronizing Auth...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4 overflow-hidden">
        <h1 className="text-5xl md:text-6xl font-black mb-6 md:mb-8 text-center text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-700 tracking-tighter">
          NEXUS
        </h1>
        <p className="text-lg md:text-xl mb-8 text-slate-300 max-w-xs md:max-w-md text-center font-light leading-tight">
          Defend the core with up to 8 commanders in real-time tactical combat.
        </p>
        <button
          onClick={loginWithGoogle}
          className="w-full max-w-[280px] bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-blue-900/40 active:scale-95"
        >
          Initialize Command
        </button>
      </div>
    );
  }

  // GAME OVER VIEW
  if (gameState && gameState.gameStatus === 'gameOver') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
        <div className="text-center w-full max-w-md animate-in fade-in zoom-in duration-500">
          <h1 className="text-5xl md:text-8xl font-black text-red-600 tracking-tighter mb-4 drop-shadow-2xl leading-none">
            NEXUS BREACHED
          </h1>
          <p className="text-lg md:text-2xl text-slate-400 mb-8 md:mb-12 font-light">The core has been compromised.</p>
          
          <div className="grid grid-cols-1 gap-2 md:gap-4 mb-8 md:mb-12">
            {Object.values(gameState.players).sort((a,b) => b.score - a.score).map((p, i) => (
              <div key={p.id} className="bg-slate-900 border border-slate-800 p-3 md:p-4 rounded-xl flex justify-between items-center">
                <div className="flex items-center gap-3 md:gap-4">
                  <span className="text-slate-500 font-mono text-xs md:text-sm">#0{i+1}</span>
                  <span className="font-bold text-sm md:text-base">{p.name}</span>
                </div>
                <span className="text-blue-400 font-mono font-bold text-sm md:text-base">{p.score} PTS</span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-white text-black py-4 rounded-full font-black text-lg md:text-xl hover:bg-blue-500 hover:text-white transition-all transform active:scale-95"
          >
            RETURN TO COMMAND
          </button>
        </div>
      </div>
    );
  }

  // GAME VIEW
  if (gameState && gameState.gameStatus === 'playing') {
    return (
      <div className="flex flex-col items-center justify-start md:justify-center min-h-screen bg-slate-950 text-white p-2 md:p-4 font-sans selection:bg-blue-500">
        <div className="mb-2 md:mb-4 flex justify-between w-full max-w-[800px] items-center px-2">
          <div>
            <h1 className="text-xl md:text-3xl font-black tracking-tighter leading-none text-blue-500 uppercase italic">Nexus Defense</h1>
          </div>
          <div className="bg-blue-600/10 border border-blue-500/20 px-2 md:px-3 py-1 rounded-lg text-[10px] md:text-xs font-mono">
            ID: <span className="text-white font-bold">{roomCode}</span>
          </div>
        </div>
        
        <div className="relative w-full max-w-[800px]">
          <GameCanvas 
            gameState={gameState} 
            onTileClick={(x, y) => placeTower(selectedTower, x, y)} 
          />
          
          {gameState.towers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
              <div className="bg-blue-600/90 text-white px-4 md:px-6 py-2 md:py-3 rounded-full font-black text-[10px] md:text-sm animate-bounce shadow-2xl border-2 border-white/20 uppercase tracking-widest text-center">
                Tap grid to deploy defenses
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 md:mt-6 w-full max-w-[800px] flex flex-wrap md:flex-nowrap gap-2 md:gap-4">
          <div className="grid grid-cols-3 gap-2 w-full md:flex-1">
            {[
              { id: 'basic', name: 'SENTRY', cost: 50, color: 'bg-blue-600' },
              { id: 'sniper', name: 'SNIPER', cost: 120, color: 'bg-purple-600' },
              { id: 'pulse', name: 'PULSE', cost: 100, color: 'bg-yellow-600' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTower(t.id)}
                className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-4 p-2 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all ${
                  selectedTower === t.id 
                    ? 'bg-slate-800 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                    : 'bg-slate-900/50 border-slate-800'
                }`}
              >
                <div className={`w-8 h-8 md:w-10 md:h-10 ${t.color} rounded-lg md:rounded-xl flex items-center justify-center font-black shadow-lg text-xs md:text-base`}>
                  {t.name[0]}
                </div>
                <div className="text-center md:text-left">
                  <div className="text-[8px] md:text-xs font-black tracking-tight">{t.name}</div>
                  <div className="text-[8px] md:text-[10px] text-yellow-500 font-bold uppercase font-mono tracking-tighter">💰{t.cost}</div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="w-full md:w-auto bg-slate-900/50 border-2 border-slate-800 p-3 md:p-4 rounded-xl md:rounded-2xl flex md:flex-col justify-between md:justify-center items-center md:min-w-[120px]">
            <div className="text-[8px] md:text-[10px] text-slate-500 uppercase font-bold md:mb-1">Credits</div>
            <div className="text-lg md:text-xl font-black text-yellow-500 font-mono">
              💰 {gameState.players[user?.uid]?.gold || 0}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (roomCode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tighter uppercase italic text-blue-500">Nexus Lobby</h1>
            <p className="text-slate-500 text-xs md:text-sm uppercase tracking-widest font-bold">Sector: <span className="text-blue-400 font-mono">{roomCode}</span></p>
          </div>
          
          <div className="bg-slate-800 border-2 border-slate-700 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <h2 className="text-base md:text-lg font-black mb-4 md:mb-6 flex items-center gap-2 text-slate-200">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              DEPLOYMENT LIST
            </h2>
            
            <div className="space-y-2 md:space-y-3 mb-8 md:mb-10">
              {gameState && Object.values(gameState.players).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                  <span className="font-bold text-blue-300 text-sm md:text-base truncate mr-2">{p.name}</span>
                  <span className="text-[8px] md:text-10px font-black bg-blue-500 px-2 py-0.5 rounded text-white uppercase tracking-widest shrink-0">
                    {p.id === user.uid ? "You" : "Ready"}
                  </span>
                </div>
              ))}
            </div>

            {isHost ? (
              <button 
                onClick={startGame}
                className="w-full bg-blue-600 hover:bg-blue-500 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-xl md:text-2xl transition-all shadow-xl active:scale-95 shadow-blue-900/40"
              >
                LAUNCH MISSION
              </button>
            ) : (
              <div className="text-center p-4 bg-slate-900/50 rounded-xl border border-dashed border-slate-700 text-slate-500 font-bold uppercase tracking-widest text-xs md:text-sm">
                Waiting for Lead Commander...
              </div>
            )}
          </div>
          
          <button 
            onClick={() => window.location.reload()} 
            className="w-full mt-6 text-slate-600 hover:text-slate-400 text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            Abort Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <div className="absolute top-4 right-4 flex items-center gap-2 md:gap-4">
        <span className="font-bold text-blue-400 tracking-tight text-xs md:text-base truncate max-w-[100px] md:max-w-none">{user?.displayName}</span>
        <button onClick={logout} className="text-[8px] md:text-[10px] text-slate-500 border border-slate-700 px-2 py-1 rounded hover:bg-slate-800 uppercase tracking-tighter">
          Out
        </button>
      </div>

      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-100 to-blue-400 tracking-tighter">
          NEXUS
        </h1>
        <div className="h-1 w-16 md:w-24 bg-blue-600 mx-auto mt-2 rounded-full" />
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded mb-6 text-xs md:text-sm uppercase font-black tracking-widest">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 w-full max-w-sm md:max-w-3xl md:grid md:grid-cols-2">
        <div className="bg-slate-800/50 backdrop-blur p-6 md:p-8 rounded-2xl border border-slate-700 hover:border-blue-500/50 shadow-xl">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Host Mission</h2>
          <p className="text-slate-400 text-sm mb-6 md:mb-8 leading-tight">Start a new post and invite allies.</p>
          <button 
            onClick={createRoom}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-900/40"
          >
            Deploy Room
          </button>
        </div>

        <div className="bg-slate-800/50 backdrop-blur p-6 md:p-8 rounded-2xl border border-slate-700 hover:border-green-500/50 shadow-xl text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Join Operation</h2>
          <p className="text-slate-400 text-sm mb-4 md:mb-6">Enter code to join deployment.</p>
          <input
            type="text"
            placeholder="XXXXXX"
            value={inputRoomCode}
            onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 md:p-4 mb-4 text-center text-xl md:text-2xl tracking-[0.4em] font-mono uppercase focus:border-green-500 transition-colors placeholder:text-slate-700"
          />
          <button 
            onClick={() => joinRoom(inputRoomCode)}
            className="w-full bg-slate-700 hover:bg-green-600 py-4 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-30"
            disabled={!inputRoomCode || inputRoomCode.length < 4}
          >
            Intercept Code
          </button>
        </div>
      </div>
    </div>
  );
}

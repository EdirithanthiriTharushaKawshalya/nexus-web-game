"use client";

import { useAuth } from "@/game/hooks/useAuth";
import { useSocket } from "@/game/hooks/useSocket";
import { useState } from "react";

import GameCanvas from "@/game/components/GameCanvas";

export default function LandingPage() {
  const { user, loading, logout, loginWithGoogle } = useAuth();
  const { isConnected, roomCode, error, players, gameState, createRoom, joinRoom, startGame, placeTower } = useSocket();
  const [inputRoomCode, setInputRoomCode] = useState("");
  const [selectedTower, setSelectedTower] = useState<string>("basic");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-blue-400 font-mono tracking-widest animate-pulse">SYNCHRONIZING AUTH...</p>
      </div>
    );
  }

  if (!user) {
    // ... (unchanged)
  }

  // GAME OVER VIEW
  if (gameState && gameState.gameStatus === 'gameOver') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
        <div className="text-center animate-in fade-in zoom-in duration-500">
          <h1 className="text-8xl font-black text-red-600 tracking-tighter mb-4 shadow-red-900/50 drop-shadow-2xl">
            NEXUS BREACHED
          </h1>
          <p className="text-2xl text-slate-400 mb-12 font-light">The core has been compromised. Operation terminated.</p>
          
          <div className="grid grid-cols-1 gap-4 max-w-md mx-auto mb-12">
            {Object.values(gameState.players).sort((a,b) => b.score - a.score).map((p, i) => (
              <div key={p.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-slate-500 font-mono">#0{i+1}</span>
                  <span className="font-bold">{p.name}</span>
                </div>
                <span className="text-blue-400 font-mono font-bold">{p.score} PTS</span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="bg-white text-black px-12 py-4 rounded-full font-black text-xl hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105 active:scale-95"
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4 font-sans selection:bg-blue-500">
        <div className="mb-4 flex justify-between w-full max-w-[800px] items-end px-2">
          <div>
            <h1 className="text-3xl font-black tracking-tighter leading-none text-blue-500">NEXUS DEFENSE</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Wave {gameState.wave} In Progress</p>
          </div>
          <div className="bg-blue-600/10 border border-blue-500/20 px-3 py-1 rounded-lg text-xs font-mono">
            Sector: <span className="text-white font-bold">{roomCode}</span>
          </div>
        </div>
        
        <div className="relative">
          <GameCanvas 
            gameState={gameState} 
            onTileClick={(x, y) => placeTower(selectedTower, x, y)} 
          />
          
          {gameState.towers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-blue-600/90 text-white px-6 py-3 rounded-full font-black text-sm animate-bounce shadow-2xl border-2 border-white/20 uppercase tracking-widest">
                Click a tile to place your first Sentry!
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 w-full max-w-[800px] flex gap-4">
          {[
            { id: 'basic', name: 'SENTRY', cost: 50, color: 'bg-blue-600' },
            { id: 'sniper', name: 'SNIPER', cost: 120, color: 'bg-purple-600' },
            { id: 'pulse', name: 'PULSE', cost: 100, color: 'bg-yellow-600' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTower(t.id)}
              className={`flex-1 flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                selectedTower === t.id 
                  ? 'bg-slate-800 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className={`w-10 h-10 ${t.color} rounded-xl flex items-center justify-center font-black shadow-lg`}>
                {t.name[0]}
              </div>
              <div className="text-left">
                <div className="text-xs font-black tracking-tight">{t.name}</div>
                <div className="text-[10px] text-yellow-500 font-bold uppercase font-mono">💰 {t.cost}</div>
              </div>
            </button>
          ))}
          
          <div className="bg-slate-900/50 border-2 border-slate-800 p-4 rounded-2xl flex flex-col justify-center min-w-[120px]">
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Resources</div>
            <div className="text-xl font-black text-yellow-500 font-mono">
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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-2 tracking-tighter">PREPARE FOR DROP</h1>
            <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">Room Code: <span className="text-blue-400">{roomCode}</span></p>
          </div>
          
          <div className="bg-slate-800 border-2 border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 bg-blue-600/20 rounded-bl-xl border-l border-b border-blue-500/30 text-[10px] font-black text-blue-400 uppercase tracking-tighter">Secure Link</div>
            
            <h2 className="text-lg font-black mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              COMMANDERS IN SECTOR
            </h2>
            
            <div className="space-y-3 mb-10">
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                <span className="font-bold text-blue-300">{user.displayName}</span>
                <span className="text-[10px] font-black bg-blue-500 px-2 py-0.5 rounded text-white uppercase tracking-widest">Lead</span>
              </div>
              {players.map((id) => (
                <div key={id} className="flex items-center justify-between p-3 bg-slate-900/20 rounded-xl border border-dashed border-slate-700/50">
                  <span className="text-slate-400 italic">Commander_{id.substring(0, 4)}</span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ready</span>
                </div>
              ))}
              {[...Array(Math.max(0, 3 - players.length))].map((_, i) => (
                <div key={i} className="flex items-center justify-center p-3 rounded-xl border border-dashed border-slate-800/50 text-slate-800 font-black text-[10px] tracking-widest uppercase">
                  Open Deployment Slot
                </div>
              ))}
            </div>

            <button 
              onClick={startGame}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 py-5 rounded-2xl font-black text-2xl transition-all shadow-xl shadow-blue-900/50 transform active:scale-95 group"
            >
              LAUNCH MISSION
              <span className="block text-[10px] text-blue-200 mt-1 font-bold tracking-widest uppercase group-hover:animate-pulse">Engage Defensive Protocol</span>
            </button>
          </div>
          
          <button 
            onClick={() => window.location.reload()} 
            className="w-full mt-6 text-slate-600 hover:text-slate-400 text-xs font-black uppercase tracking-widest transition-colors"
          >
            Abort Connection
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <span className="text-slate-500 text-xs font-mono">STATUS: <span className={isConnected ? "text-green-500" : "text-red-500"}>{isConnected ? "ONLINE" : "OFFLINE"}</span></span>
        <span className="font-bold text-blue-400 tracking-tight">{user.displayName}</span>
        <button onClick={logout} className="text-[10px] text-slate-500 hover:text-white border border-slate-700 px-2 py-1 rounded hover:bg-slate-800 transition-all uppercase tracking-tighter">
          Sign Out
        </button>
      </div>

      <div className="text-center mb-16">
        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-100 to-blue-400 tracking-tighter animate-gradient-x">
          NEXUS
        </h1>
        <div className="h-1 w-24 bg-blue-600 mx-auto mt-2 rounded-full" />
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded mb-8">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        {/* Create Room */}
        <div className="bg-slate-800/50 backdrop-blur p-8 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-all group shadow-xl">
          <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">Host Mission</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">Establish a new command post and invite up to 7 allies.</p>
          <button 
            onClick={createRoom}
            className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 shadow-lg shadow-blue-900/40"
          >
            Deploy New Room
          </button>
        </div>

        {/* Join Room */}
        <div className="bg-slate-800/50 backdrop-blur p-8 rounded-2xl border border-slate-700 hover:border-green-500/50 transition-all group shadow-xl">
          <h2 className="text-2xl font-bold mb-2 group-hover:text-green-400 transition-colors">Join Operation</h2>
          <p className="text-slate-400 mb-6">Enter a room code to join an existing deployment.</p>
          <input
            type="text"
            placeholder="XXXXXX"
            value={inputRoomCode}
            onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-4 mb-4 text-center text-2xl tracking-[0.5em] font-mono uppercase focus:outline-none focus:border-green-500 transition-colors placeholder:text-slate-700"
          />
          <button 
            onClick={() => joinRoom(inputRoomCode)}
            className="w-full bg-slate-700 hover:bg-green-600 py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 disabled:opacity-30 disabled:hover:bg-slate-700"
            disabled={!inputRoomCode || inputRoomCode.length < 4}
          >
            Intercept Code
          </button>
        </div>
      </div>
    </div>
  );
}


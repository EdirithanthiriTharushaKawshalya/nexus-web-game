"use client";

import { useState, useEffect, useRef } from "react";
import { rtdb } from "@/lib/firebase/firebaseConfig";
import { ref, onValue, set, update, onDisconnect, remove, get } from "firebase/database";
import { GameState, Player, Tower } from "@/types/game";
import { StateManager } from "@/game/engine/stateManager";

export const useGame = (user: any) => {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const stateManagerRef = useRef<StateManager>(new StateManager());
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Create Room (Become Host)
  const createRoom = async () => {
    if (!rtdb) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const roomRef = ref(rtdb, `rooms/${code}`);
    
    const initialPlayer: Player = {
      id: user.uid,
      name: user.displayName || "Commander",
      lives: 20,
      gold: 150,
      score: 0
    };

    const initialState: GameState = {
      players: { [user.uid]: initialPlayer },
      enemies: [],
      towers: [],
      gameStatus: 'lobby',
      wave: 0,
      nexusHealth: 100,
      maxNexusHealth: 100,
      enemiesRemaining: 0
    };

    await set(roomRef, {
      state: initialState,
      hostId: user.uid,
      createdAt: Date.now()
    });

    onDisconnect(roomRef).remove();
    setRoomCode(code);
    setIsHost(true);
  };

  // 2. Join Room
  const joinRoom = async (code: string) => {
    if (!rtdb) return;
    const roomRef = ref(rtdb, `rooms/${code}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) {
      setError("Sector not found");
      return;
    }

    const roomData = snapshot.val();
    if (Object.keys(roomData.state.players).length >= 8) {
      setError("Sector full");
      return;
    }

    const newPlayer: Player = {
      id: user.uid,
      name: user.displayName || "Commander",
      lives: 20,
      gold: 150,
      score: 0
    };

    await update(ref(rtdb, `rooms/${code}/state/players`), {
      [user.uid]: newPlayer
    });

    onDisconnect(ref(rtdb, `rooms/${code}/state/players/${user.uid}`)).remove();
    setRoomCode(code);
    setIsHost(roomData.hostId === user.uid);
  };

  // 3. Listen for Updates
  useEffect(() => {
    if (!roomCode || !rtdb) return;

    const stateRef = ref(rtdb, `rooms/${roomCode}/state`);
    const unsubscribe = onValue(stateRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameState(data);
        // Sync local state manager if we are the host
        if (isHost) {
          // Note: In a real app, we'd want more fine-grained sync
        }
      }
    });

    return () => unsubscribe();
  }, [roomCode, isHost]);

  // 4. Authoritative Host Loop
  useEffect(() => {
    if (!isHost || !roomCode || !gameState || gameState.gameStatus !== 'playing') {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }

    // Initialize StateManager with current data once
    stateManagerRef.current.startGame(); // This resets some things, careful

    gameLoopRef.current = setInterval(() => {
      const sm = stateManagerRef.current;
      sm.update(1/30); // 30 FPS for sync efficiency
      const newState = sm.getState();
      
      // Push to Firebase
      if (rtdb) {
        update(ref(rtdb, `rooms/${roomCode}/state`), newState);
      }
    }, 1000 / 30);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isHost, roomCode, gameState?.gameStatus === 'playing']);

  const startGame = async () => {
    if (!roomCode || !rtdb || !isHost) return;
    await update(ref(rtdb, `rooms/${roomCode}/state`), { gameStatus: 'playing' });
  };

  const placeTower = async (type: string, x: number, y: number) => {
    if (!roomCode || !rtdb || !gameState) return;
    
    // We send a request by updating the towers array (simplified)
    // In a more robust version, the host would validate this
    const sm = stateManagerRef.current;
    sm.placeTower(user.uid, type, x, y);
    const newState = sm.getState();
    
    await update(ref(rtdb, `rooms/${roomCode}/state`), newState);
  };

  return {
    roomCode,
    gameState,
    isHost,
    error,
    createRoom,
    joinRoom,
    startGame,
    placeTower,
    players: gameState ? Object.keys(gameState.players) : []
  };
};

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { rtdb } from "@/lib/firebase/firebaseConfig";
import { ref, onValue, set, update, onDisconnect, remove, get, push, onChildAdded } from "firebase/database";
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
  const createRoom = useCallback(async () => {
    if (!rtdb || !user) return;
    try {
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
        floatingTexts: [],
        gameStatus: 'lobby',
        wave: 0,
        nexusHealth: 100,
        maxNexusHealth: 100,
        enemiesRemaining: 0,
        screenShake: 0
      };

      await set(roomRef, {
        state: initialState,
        hostId: user.uid,
        createdAt: Date.now()
      });

      onDisconnect(roomRef).remove();
      setRoomCode(code);
      setIsHost(true);
    } catch (e) {
      console.error("Create room error:", e);
      setError("Failed to initialize sector.");
    }
  }, [user]);

  // 2. Join Room
  const joinRoom = useCallback(async (code: string) => {
    if (!rtdb || !user) return;
    try {
      const roomRef = ref(rtdb, `rooms/${code}`);
      const snapshot = await get(roomRef);
      
      if (!snapshot.exists()) {
        setError("Sector not found");
        return;
      }

      const roomData = snapshot.val();
      if (!roomData || !roomData.state || Object.keys(roomData.state.players || {}).length >= 8) {
        setError("Sector full or invalid");
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
    } catch (e) {
      console.error("Join room error:", e);
      setError("Failed to intercept sector link.");
    }
  }, [user]);

  // 3. Listen for Updates & Commands (For Host)
  useEffect(() => {
    if (!roomCode || !rtdb) return;

    const stateRef = ref(rtdb, `rooms/${roomCode}/state`);
    const unsubscribeState = onValue(stateRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const sanitizedState: GameState = {
            ...data,
            players: data.players || {},
            enemies: data.enemies || [],
            towers: data.towers || [],
            floatingTexts: data.floatingTexts || []
          };
          setGameState(sanitizedState);
          // Lead Commander's engine must stay in sync with player list/gold
          if (isHost) {
             stateManagerRef.current.syncState(sanitizedState);
          }
        }
      } catch (e) {
        console.error("Sync error:", e);
      }
    });

    // Lead Commander specifically listens for player actions
    let unsubscribeActions = () => {};
    if (isHost) {
      const actionsRef = ref(rtdb, `rooms/${roomCode}/actions`);
      unsubscribeActions = onChildAdded(actionsRef, (snapshot) => {
        const action = snapshot.val();
        if (action) {
          const sm = stateManagerRef.current;
          if (action.type === 'placeTower') {
            sm.placeTower(action.playerId, action.towerType, action.x, action.y);
          } else if (action.type === 'upgradeTower') {
            sm.upgradeTower(action.playerId, action.towerId);
          }
          // Remove the action once processed
          remove(ref(rtdb!, `rooms/${roomCode}/actions/${snapshot.key}`));
        }
      });
    }

    return () => {
      unsubscribeState();
      unsubscribeActions();
    };
  }, [roomCode, isHost]);

  // 4. Authoritative Host Loop
  useEffect(() => {
    if (!isHost || !roomCode || !rtdb || !gameState || gameState.gameStatus !== 'playing') {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }

    let lastSync = 0;

    gameLoopRef.current = setInterval(async () => {
      try {
        const now = Date.now();
        const sm = stateManagerRef.current;
        sm.update(1/30);
        
        // THROTTLED SYNC: Only push to Firebase every 165ms (approx 6 FPS)
        // This dramatically reduces lag while keeping the engine logic smooth.
        if (now - lastSync > 165) {
           const newState = sm.getState();
           await update(ref(rtdb!, `rooms/${roomCode}/state`), newState);
           lastSync = now;
        }
      } catch (e) {
        console.error("Host loop error:", e);
      }
    }, 1000 / 30);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isHost, roomCode, gameState?.gameStatus === 'playing']);

  const startGame = useCallback(async () => {
    try {
      if (!roomCode || !rtdb || !isHost) return;
      await update(ref(rtdb, `rooms/${roomCode}/state`), { gameStatus: 'playing' });
      stateManagerRef.current.startGame();
    } catch (e) {
      console.error("Start game error:", e);
      setError("Failed to launch mission.");
    }
  }, [roomCode, isHost]);

  const placeTower = useCallback(async (type: string, x: number, y: number) => {
    try {
      if (!roomCode || !rtdb || !gameState || !user) return;
      
      if (isHost) {
        const sm = stateManagerRef.current;
        sm.placeTower(user.uid, type, x, y);
        await update(ref(rtdb, `rooms/${roomCode}/state`), sm.getState());
      } else {
        const actionsRef = ref(rtdb, `rooms/${roomCode}/actions`);
        await push(actionsRef, {
          type: 'placeTower',
          playerId: user.uid,
          towerType: type,
          x,
          y,
          timestamp: Date.now()
        });
      }
    } catch (e) {
      console.error("Place tower error:", e);
    }
  }, [roomCode, isHost, gameState, user]);

  const upgradeTower = useCallback(async (towerId: string) => {
    try {
      if (!roomCode || !rtdb || !gameState || !user) return;
      
      if (isHost) {
        const sm = stateManagerRef.current;
        sm.upgradeTower(user.uid, towerId);
        await update(ref(rtdb, `rooms/${roomCode}/state`), sm.getState());
      } else {
        const actionsRef = ref(rtdb, `rooms/${roomCode}/actions`);
        await push(actionsRef, {
          type: 'upgradeTower',
          playerId: user.uid,
          towerId,
          timestamp: Date.now()
        });
      }
    } catch (e) {
      console.error("Upgrade tower error:", e);
    }
  }, [roomCode, isHost, gameState, user]);

  return {
    roomCode,
    gameState,
    isHost,
    error,
    createRoom,
    joinRoom,
    startGame,
    placeTower,
    upgradeTower,
    players: gameState ? Object.keys(gameState.players || {}) : []
  };
};

"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGame = void 0;
const react_1 = require("react");
const firebaseConfig_1 = require("@/lib/firebase/firebaseConfig");
const database_1 = require("firebase/database");
const stateManager_1 = require("@/game/engine/stateManager");
const useGame = (user) => {
    const [roomCode, setRoomCode] = (0, react_1.useState)(null);
    const [gameState, setGameState] = (0, react_1.useState)(null);
    const [isHost, setIsHost] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const stateManagerRef = (0, react_1.useRef)(new stateManager_1.StateManager());
    const gameLoopRef = (0, react_1.useRef)(null);
    // 1. Create Room (Become Host)
    const createRoom = async () => {
        if (!firebaseConfig_1.rtdb)
            return;
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const roomRef = (0, database_1.ref)(firebaseConfig_1.rtdb, `rooms/${code}`);
        const initialPlayer = {
            id: user.uid,
            name: user.displayName || "Commander",
            lives: 20,
            gold: 150,
            score: 0
        };
        const initialState = {
            players: { [user.uid]: initialPlayer },
            enemies: [],
            towers: [],
            gameStatus: 'lobby',
            wave: 0,
            nexusHealth: 100,
            maxNexusHealth: 100,
            enemiesRemaining: 0
        };
        await (0, database_1.set)(roomRef, {
            state: initialState,
            hostId: user.uid,
            createdAt: Date.now()
        });
        (0, database_1.onDisconnect)(roomRef).remove();
        setRoomCode(code);
        setIsHost(true);
    };
    // 2. Join Room
    const joinRoom = async (code) => {
        if (!firebaseConfig_1.rtdb)
            return;
        const roomRef = (0, database_1.ref)(firebaseConfig_1.rtdb, `rooms/${code}`);
        const snapshot = await (0, database_1.get)(roomRef);
        if (!snapshot.exists()) {
            setError("Sector not found");
            return;
        }
        const roomData = snapshot.val();
        if (Object.keys(roomData.state.players).length >= 8) {
            setError("Sector full");
            return;
        }
        const newPlayer = {
            id: user.uid,
            name: user.displayName || "Commander",
            lives: 20,
            gold: 150,
            score: 0
        };
        await (0, database_1.update)((0, database_1.ref)(firebaseConfig_1.rtdb, `rooms/${code}/state/players`), {
            [user.uid]: newPlayer
        });
        (0, database_1.onDisconnect)((0, database_1.ref)(firebaseConfig_1.rtdb, `rooms/${code}/state/players/${user.uid}`)).remove();
        setRoomCode(code);
        setIsHost(roomData.hostId === user.uid);
    };
    // 3. Listen for Updates
    (0, react_1.useEffect)(() => {
        if (!roomCode || !firebaseConfig_1.rtdb)
            return;
        const stateRef = (0, database_1.ref)(firebaseConfig_1.rtdb, `rooms/${roomCode}/state`);
        const unsubscribe = (0, database_1.onValue)(stateRef, (snapshot) => {
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
    (0, react_1.useEffect)(() => {
        if (!isHost || !roomCode || !gameState || gameState.gameStatus !== 'playing') {
            if (gameLoopRef.current)
                clearInterval(gameLoopRef.current);
            return;
        }
        // Initialize StateManager with current data once
        stateManagerRef.current.startGame(); // This resets some things, careful
        gameLoopRef.current = setInterval(() => {
            const sm = stateManagerRef.current;
            sm.update(1 / 30); // 30 FPS for sync efficiency
            const newState = sm.getState();
            // Push to Firebase
            if (firebaseConfig_1.rtdb) {
                (0, database_1.update)((0, database_1.ref)(firebaseConfig_1.rtdb, `rooms/${roomCode}/state`), newState);
            }
        }, 1000 / 30);
        return () => {
            if (gameLoopRef.current)
                clearInterval(gameLoopRef.current);
        };
    }, [isHost, roomCode, (gameState === null || gameState === void 0 ? void 0 : gameState.gameStatus) === 'playing']);
    const startGame = async () => {
        if (!roomCode || !firebaseConfig_1.rtdb || !isHost)
            return;
        await (0, database_1.update)((0, database_1.ref)(firebaseConfig_1.rtdb, `rooms/${roomCode}/state`), { gameStatus: 'playing' });
    };
    const placeTower = async (type, x, y) => {
        if (!roomCode || !firebaseConfig_1.rtdb || !gameState)
            return;
        // We send a request by updating the towers array (simplified)
        // In a more robust version, the host would validate this
        const sm = stateManagerRef.current;
        sm.placeTower(user.uid, type, x, y);
        const newState = sm.getState();
        await (0, database_1.update)((0, database_1.ref)(firebaseConfig_1.rtdb, `rooms/${roomCode}/state`), newState);
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
exports.useGame = useGame;

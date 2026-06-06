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
        if (!firebaseConfig_1.rtdb || !user)
            return;
        try {
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
                floatingTexts: [],
                gameStatus: 'lobby',
                wave: 0,
                nexusHealth: 100,
                maxNexusHealth: 100,
                enemiesRemaining: 0,
                screenShake: 0
            };
            await (0, database_1.set)(roomRef, {
                state: initialState,
                hostId: user.uid,
                createdAt: Date.now()
            });
            (0, database_1.onDisconnect)(roomRef).remove();
            setRoomCode(code);
            setIsHost(true);
        }
        catch (e) {
            console.error("Create room error:", e);
            setError("Failed to initialize sector.");
        }
    };
    // 2. Join Room
    const joinRoom = async (code) => {
        if (!firebaseConfig_1.rtdb || !user)
            return;
        try {
            const roomRef = (0, database_1.ref)(firebaseConfig_1.rtdb, `rooms/${code}`);
            const snapshot = await (0, database_1.get)(roomRef);
            if (!snapshot.exists()) {
                setError("Sector not found");
                return;
            }
            const roomData = snapshot.val();
            if (!roomData || !roomData.state || Object.keys(roomData.state.players || {}).length >= 8) {
                setError("Sector full or invalid");
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
        }
        catch (e) {
            console.error("Join room error:", e);
            setError("Failed to intercept sector link.");
        }
    };
    // 3. Listen for Updates & Commands (For Host)
    (0, react_1.useEffect)(() => {
        if (!roomCode || !firebaseConfig_1.rtdb)
            return;
        const stateRef = (0, database_1.ref)(firebaseConfig_1.rtdb, `rooms/${roomCode}/state`);
        const unsubscribeState = (0, database_1.onValue)(stateRef, (snapshot) => {
            try {
                const data = snapshot.val();
                if (data) {
                    const sanitizedState = Object.assign(Object.assign({}, data), { players: data.players || {}, enemies: data.enemies || [], towers: data.towers || [], floatingTexts: data.floatingTexts || [] });
                    setGameState(sanitizedState);
                    // Lead Commander's engine must stay in sync with player list/gold
                    if (isHost) {
                        stateManagerRef.current.syncState(sanitizedState);
                    }
                }
            }
            catch (e) {
                console.error("Sync error:", e);
            }
        });
        // Lead Commander specifically listens for player actions
        let unsubscribeActions = () => { };
        if (isHost) {
            const actionsRef = (0, database_1.ref)(firebaseConfig_1.rtdb, `rooms/${roomCode}/actions`);
            unsubscribeActions = (0, database_1.onChildAdded)(actionsRef, (snapshot) => {
                const action = snapshot.val();
                if (action) {
                    const sm = stateManagerRef.current;
                    if (action.type === 'placeTower') {
                        sm.placeTower(action.playerId, action.towerType, action.x, action.y);
                    }
                    else if (action.type === 'upgradeTower') {
                        sm.upgradeTower(action.playerId, action.towerId);
                    }
                    // Remove the action once processed
                    (0, database_1.remove)((0, database_1.ref)(firebaseConfig_1.rtdb, `rooms/${roomCode}/actions/${snapshot.key}`));
                }
            });
        }
        return () => {
            unsubscribeState();
            unsubscribeActions();
        };
    }, [roomCode, isHost]);
    // 4. Authoritative Host Loop
    (0, react_1.useEffect)(() => {
        if (!isHost || !roomCode || !firebaseConfig_1.rtdb || !gameState || gameState.gameStatus !== 'playing') {
            if (gameLoopRef.current)
                clearInterval(gameLoopRef.current);
            return;
        }
        gameLoopRef.current = setInterval(async () => {
            try {
                const sm = stateManagerRef.current;
                sm.update(1 / 30);
                const newState = sm.getState();
                await (0, database_1.update)((0, database_1.ref)(firebaseConfig_1.rtdb, `rooms/${roomCode}/state`), newState);
            }
            catch (e) {
                console.error("Host loop error:", e);
            }
        }, 1000 / 30);
        return () => {
            if (gameLoopRef.current)
                clearInterval(gameLoopRef.current);
        };
    }, [isHost, roomCode, (gameState === null || gameState === void 0 ? void 0 : gameState.gameStatus) === 'playing']);
    const startGame = async () => {
        try {
            if (!roomCode || !firebaseConfig_1.rtdb || !isHost)
                return;
            await (0, database_1.update)((0, database_1.ref)(firebaseConfig_1.rtdb, `rooms/${roomCode}/state`), { gameStatus: 'playing' });
            stateManagerRef.current.startGame();
        }
        catch (e) {
            console.error("Start game error:", e);
            setError("Failed to launch mission.");
        }
    };
    const placeTower = async (type, x, y) => {
        try {
            if (!roomCode || !firebaseConfig_1.rtdb || !gameState || !user)
                return;
            if (isHost) {
                const sm = stateManagerRef.current;
                sm.placeTower(user.uid, type, x, y);
                await (0, database_1.update)((0, database_1.ref)(firebaseConfig_1.rtdb, `rooms/${roomCode}/state`), sm.getState());
            }
            else {
                const actionsRef = (0, database_1.ref)(firebaseConfig_1.rtdb, `rooms/${roomCode}/actions`);
                await (0, database_1.push)(actionsRef, {
                    type: 'placeTower',
                    playerId: user.uid,
                    towerType: type,
                    x,
                    y,
                    timestamp: Date.now()
                });
            }
        }
        catch (e) {
            console.error("Place tower error:", e);
        }
    };
    const upgradeTower = async (towerId) => {
        try {
            if (!roomCode || !firebaseConfig_1.rtdb || !gameState || !user)
                return;
            if (isHost) {
                const sm = stateManagerRef.current;
                sm.upgradeTower(user.uid, towerId);
                await (0, database_1.update)((0, database_1.ref)(firebaseConfig_1.rtdb, `rooms/${roomCode}/state`), sm.getState());
            }
            else {
                const actionsRef = (0, database_1.ref)(firebaseConfig_1.rtdb, `rooms/${roomCode}/actions`);
                await (0, database_1.push)(actionsRef, {
                    type: 'upgradeTower',
                    playerId: user.uid,
                    towerId,
                    timestamp: Date.now()
                });
            }
        }
        catch (e) {
            console.error("Upgrade tower error:", e);
        }
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
        upgradeTower,
        players: gameState ? Object.keys(gameState.players || {}) : []
    };
};
exports.useGame = useGame;

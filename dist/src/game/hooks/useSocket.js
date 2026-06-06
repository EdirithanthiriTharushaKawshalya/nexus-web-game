"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSocket = void 0;
const react_1 = require("react");
const socket_io_client_1 = require("socket.io-client");
const useSocket = () => {
    const socketRef = (0, react_1.useRef)(null);
    const [isConnected, setIsConnected] = (0, react_1.useState)(false);
    const [roomCode, setRoomCode] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)(null);
    const [players, setPlayers] = (0, react_1.useState)([]);
    const [gameState, setGameState] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const socket = (0, socket_io_client_1.io)();
        socketRef.current = socket;
        socket.on("connect", () => {
            setIsConnected(true);
            setError(null);
        });
        socket.on("gameStateUpdate", (state) => {
            setGameState(state);
        });
        socket.on("roomCreated", (code) => {
            setRoomCode(code);
        });
        socket.on("playerJoined", (id) => {
            setPlayers((prev) => [...prev, id]);
        });
        socket.on("error", (msg) => {
            setError(msg);
        });
        return () => {
            socket.disconnect();
        };
    }, []);
    const createRoom = () => {
        var _a;
        (_a = socketRef.current) === null || _a === void 0 ? void 0 : _a.emit("createRoom");
    };
    const joinRoom = (code) => {
        var _a;
        (_a = socketRef.current) === null || _a === void 0 ? void 0 : _a.emit("joinRoom", code);
        setRoomCode(code);
    };
    const startGame = () => {
        var _a;
        (_a = socketRef.current) === null || _a === void 0 ? void 0 : _a.emit("startGame");
    };
    const placeTower = (type, x, y) => {
        var _a;
        (_a = socketRef.current) === null || _a === void 0 ? void 0 : _a.emit("placeTower", type, x, y);
    };
    return {
        isConnected,
        roomCode,
        error,
        players,
        gameState,
        createRoom,
        joinRoom,
        startGame,
        placeTower
    };
};
exports.useSocket = useSocket;

"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "@/types/socket";

import { GameState } from "@/types/game";

export const useSocket = () => {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    const socket = io();
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
    socketRef.current?.emit("createRoom");
  };

  const joinRoom = (code: string) => {
    socketRef.current?.emit("joinRoom", code);
    setRoomCode(code);
  };

  const startGame = () => {
    socketRef.current?.emit("startGame");
  };

  const placeTower = (type: string, x: number, y: number) => {
    socketRef.current?.emit("placeTower", type, x, y);
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

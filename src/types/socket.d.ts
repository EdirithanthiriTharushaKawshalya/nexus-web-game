// src/types/socket.d.ts
import { GameState } from "./game";

export interface ServerToClientEvents {
  gameStateUpdate: (state: GameState) => void;
  playerJoined: (playerId: string) => void;
  playerLeft: (playerId: string) => void;
  roomCreated: (roomCode: string) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  joinGame: (playerName: string) => void;
  createRoom: () => void;
  joinRoom: (roomCode: string) => void;
  startGame: () => void;
  placeTower: (type: string, x: number, y: number) => void;
  upgradeTower: (towerId: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  username: string;
}

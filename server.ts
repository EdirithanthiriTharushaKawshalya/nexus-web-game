import express from 'express';
import next from 'next';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from './src/types/socket';
import { StateManager } from './src/game/engine/stateManager';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

app.prepare().then(() => {
  const expressApp = express();
  const httpServer = createServer(expressApp);

  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer);

  // Game management
  const rooms = new Map<string, { 
    players: { id: string, name: string }[],
    stateManager: StateManager 
  }>();

  // Authoritative Server Loop (60 ticks per second)
  setInterval(() => {
    rooms.forEach((room, roomCode) => {
      if (room.stateManager.getState().gameStatus === 'playing') {
        room.stateManager.update(1/60);
        io.to(roomCode).emit('gameStateUpdate', room.stateManager.getState());
      }
    });
  }, 1000 / 60);

  // Socket.io logic
  io.on('connection', (socket) => {
    console.log('Commander connected:', socket.id);

    socket.on('disconnect', () => {
      rooms.forEach((room, roomCode) => {
        const index = room.players.findIndex(p => p.id === socket.id);
        if (index !== -1) {
          room.players.splice(index, 1);
          room.stateManager.removePlayer(socket.id);
          io.to(roomCode).emit('playerLeft', socket.id);
        }
      });
    });

    socket.on('createRoom', () => {
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const stateManager = new StateManager();
      const playerName = `Commander_${socket.id.substring(0, 4)}`;
      
      rooms.set(roomCode, { 
        players: [{ id: socket.id, name: playerName }], 
        stateManager 
      });
      stateManager.addPlayer(socket.id, playerName);
      
      socket.join(roomCode);
      socket.emit('roomCreated', roomCode);
      socket.emit('gameStateUpdate', stateManager.getState());
      console.log(`Room created: ${roomCode} by ${playerName}`);
    });

    socket.on('joinRoom', (roomCode) => {
      const room = rooms.get(roomCode);
      if (room && room.players.length < 8) {
        const playerName = `Commander_${socket.id.substring(0, 4)}`;
        room.players.push({ id: socket.id, name: playerName });
        room.stateManager.addPlayer(socket.id, playerName);
        
        socket.join(roomCode);
        io.to(roomCode).emit('playerJoined', socket.id);
        socket.emit('gameStateUpdate', room.stateManager.getState());
      } else {
        socket.emit('error', room ? 'Sector Full' : 'Sector Not Found');
      }
    });

    socket.on('startGame', () => {
      rooms.forEach((room, roomCode) => {
        if (socket.rooms.has(roomCode)) {
          room.stateManager.startGame();
          io.to(roomCode).emit('gameStateUpdate', room.stateManager.getState());
        }
      });
    });

    socket.on('placeTower', (type, x, y) => {
      rooms.forEach((room, roomCode) => {
        if (socket.rooms.has(roomCode)) {
          room.stateManager.placeTower(socket.id, type, x, y);
        }
      });
    });
  });

  // Handle all other requests via Next.js
  expressApp.use((req, res) => {
    return handle(req, res);
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});

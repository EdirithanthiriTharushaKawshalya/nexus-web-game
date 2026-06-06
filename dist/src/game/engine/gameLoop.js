"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameLoop = void 0;
// src/game/engine/gameLoop.ts
class GameLoop {
    constructor(updateCallback) {
        this.lastTime = 0;
        this.isRunning = false;
        this.updateCallback = updateCallback;
    }
    start() {
        this.isRunning = true;
        this.lastTime = Date.now();
        this.loop();
    }
    stop() {
        this.isRunning = false;
    }
    loop() {
        if (!this.isRunning)
            return;
        const now = Date.now();
        const dt = (now - this.lastTime) / 1000; // Delta time in seconds
        this.lastTime = now;
        this.updateCallback(dt);
        // On server, we might use setTimeout or setImmediate for more control
        // On client, we would use requestAnimationFrame
        if (typeof window !== "undefined") {
            requestAnimationFrame(() => this.loop());
        }
        else {
            setTimeout(() => this.loop(), 1000 / 60); // Target 60 FPS
        }
    }
}
exports.GameLoop = GameLoop;

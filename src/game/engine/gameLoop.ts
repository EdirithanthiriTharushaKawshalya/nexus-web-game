// src/game/engine/gameLoop.ts
export class GameLoop {
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private updateCallback: (dt: number) => void;

  constructor(updateCallback: (dt: number) => void) {
    this.updateCallback = updateCallback;
  }

  public start() {
    this.isRunning = true;
    this.lastTime = Date.now();
    this.loop();
  }

  public stop() {
    this.isRunning = false;
  }

  private loop() {
    if (!this.isRunning) return;

    const now = Date.now();
    const dt = (now - this.lastTime) / 1000; // Delta time in seconds
    this.lastTime = now;

    this.updateCallback(dt);

    // On server, we might use setTimeout or setImmediate for more control
    // On client, we would use requestAnimationFrame
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => this.loop());
    } else {
      setTimeout(() => this.loop(), 1000 / 60); // Target 60 FPS
    }
  }
}

// src/game/engine/gameLoop.ts
/**
 * A standard Game Loop class that provides a consistent update timing.
 * Can be used both on the client (via requestAnimationFrame) and 
 * on the server (via setTimeout/setImmediate).
 */
export class GameLoop {
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private updateCallback: (dt: number) => void;

  /**
   * @param updateCallback - Function to call on every tick, receiving delta time (dt) in seconds.
   */
  constructor(updateCallback: (dt: number) => void) {
    this.updateCallback = updateCallback;
  }

  /**
   * Starts the game loop.
   */
  public start() {
    this.isRunning = true;
    this.lastTime = Date.now();
    this.loop();
  }

  /**
   * Stops the game loop.
   */
  public stop() {
    this.isRunning = false;
  }

  private loop() {
    if (!this.isRunning) return;

    const now = Date.now();
    const dt = (now - this.lastTime) / 1000; // Delta time in seconds
    this.lastTime = now;

    this.updateCallback(dt);

    // Use requestAnimationFrame on client for smooth rendering
    // Use setTimeout on server for authoritative logic
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => this.loop());
    } else {
      // Server-side fallback (approx 60 FPS)
      setTimeout(() => this.loop(), 1000 / 60);
    }
  }
}

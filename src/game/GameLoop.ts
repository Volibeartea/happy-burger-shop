/**
 * requestAnimationFrame loop with a clamped delta time. Owns no game logic —
 * it just calls the provided per-frame callback.
 */
export class GameLoop {
  private rafId = 0;
  private last = 0;
  private running = false;

  constructor(private readonly onFrame: (dt: number) => void) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  private readonly tick = (now: number): void => {
    if (!this.running) return;
    // Clamp dt so a backgrounded tab doesn't produce a huge jump.
    const dt = Math.min((now - this.last) / 1000, 0.1);
    this.last = now;
    this.onFrame(dt);
    this.rafId = requestAnimationFrame(this.tick);
  };
}

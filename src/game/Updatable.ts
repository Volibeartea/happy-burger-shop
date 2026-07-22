/** Anything that advances with the game loop. */
export interface Updatable {
  update(dt: number): void;
}

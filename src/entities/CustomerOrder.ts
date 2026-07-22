import type { RecipeDefinition } from '@/data/types';

/** A single customer order: a target recipe with a draining patience timer. */
export class CustomerOrder {
  remaining: number;
  age = 0;

  constructor(
    readonly id: number,
    readonly recipe: RecipeDefinition,
    readonly maxPatience: number,
  ) {
    this.remaining = maxPatience;
  }

  tick(dt: number): void {
    this.remaining -= dt;
    this.age += dt;
  }

  get expired(): boolean {
    return this.remaining <= 0;
  }

  /** Remaining patience as 0..1 (for the bar and the speed bonus). */
  get patience01(): number {
    const p = this.remaining / this.maxPatience;
    return p < 0 ? 0 : p > 1 ? 1 : p;
  }
}

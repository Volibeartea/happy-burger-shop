import type { CookState } from '@/data/types';

/** How a station applies heat to an item. */
export type CookMode = 'grill' | 'fryer';

/**
 * Implemented by items that can be cooked. A cooking station calls
 * begin/endCooking when the item enters/leaves it; the item advances its own
 * cook timers in its per-frame update.
 */
export interface Cookable {
  readonly cookState: CookState;
  beginCooking(mode: CookMode): void;
  endCooking(): void;
}

export function isCookable(value: unknown): value is Cookable {
  return typeof (value as Partial<Cookable> | null)?.beginCooking === 'function';
}

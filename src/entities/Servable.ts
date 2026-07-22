/** What a servable item contributes when dropped on the serving station. */
export interface Serving {
  /** Ingredient ids that make up the dish (multiset). */
  ids: string[];
  /** All cookable components are perfectly cooked (nothing raw/burnt). */
  allReady: boolean;
}

/** Implemented by anything that can be handed over at the serving station. */
export interface Servable {
  getServing(): Serving;
}

export function isServable(value: unknown): value is Servable {
  return typeof (value as Partial<Servable> | null)?.getServing === 'function';
}

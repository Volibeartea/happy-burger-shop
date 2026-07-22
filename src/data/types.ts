/**
 * Data-driven type definitions.
 *
 * All gameplay content (ingredients, recipes, tuning) is described as plain data
 * that conforms to these interfaces. Adding a new ingredient or recipe should be
 * a matter of adding a data entry — never editing core logic. See docs/GDD.md.
 */

/** Identifiers of the fixed work stations in the kitchen. */
export type StationId =
  | 'storage'
  | 'grill'
  | 'fryer'
  | 'assembly'
  | 'serving'
  | 'trash';

/** Cooking lifecycle state of a cookable ingredient (used from Phase 2 on). */
export type CookState = 'raw' | 'cooking' | 'perfect' | 'burnt';

/** Placeholder visual archetypes used to build low-poly meshes procedurally. */
export type IngredientShape =
  | 'patty' // burger patty / disc
  | 'bunBottom' // flat-topped disc
  | 'bunTop' // domed disc
  | 'slice' // thin square (cheese)
  | 'leaf' // thin ruffled disc (lettuce)
  | 'round' // thin round slice (tomato)
  | 'stick' // fries
  | 'nugget'; // fried chicken chunk

export interface IngredientDefinition {
  readonly id: string;
  readonly displayName: string;
  /** Emoji used in order cards / breakdown icons. */
  readonly icon: string;
  /** Whether the ingredient must be cooked before it counts as prepared. */
  readonly cookable: boolean;
  /** Stations onto which this ingredient may be placed. */
  readonly validStations: StationId[];

  // --- Cooking parameters (only meaningful when cookable === true) ---
  /** Seconds to reach perfect doneness (per side for grill items). */
  readonly cookDuration?: number;
  /** Seconds the item stays perfect before it starts to burn. */
  readonly perfectWindow?: number;
  /** Seconds of over-cooking after the perfect window before it is fully burnt. */
  readonly burnDuration?: number;
  /** Grill items that must be flipped to cook the second side. */
  readonly needsFlip?: boolean;

  /** Base score contribution when used correctly. */
  readonly scoreValue: number;

  /** Offered as a clickable spawn bin in the storage station (default true). */
  readonly spawnable?: boolean;

  // --- Placeholder art hints ---
  /** Raw / default colour. */
  readonly color: number;
  /** Colour at perfect doneness (cookable items). */
  readonly cookedColor?: number;
  /** Colour when fully burnt (cookable items). */
  readonly burntColor?: number;
  readonly shape: IngredientShape;
  /** Vertical thickness (world units) when stacked in a burger. */
  readonly stackHeight: number;
}

export interface RecipeDefinition {
  readonly id: string;
  readonly displayName: string;
  /** Required ingredient ids as a multiset (order is NOT enforced in v1). */
  readonly ingredients: string[];
  readonly baseScore: number;
  readonly baseReward: number;
}

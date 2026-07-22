import type * as THREE from 'three';
import type { Draggable } from '@/input/InteractionTypes';
import type { IngredientEntity } from '@/entities/IngredientEntity';

/**
 * Narrow surface that stations use to talk back to the game (spawn / remove
 * items) without depending on the whole Game class. Keeps station modules
 * decoupled and avoids circular imports.
 */
export interface GameContext {
  readonly scene: THREE.Scene;
  /** Create a loose ingredient at the spawn point; null if the item cap is hit. */
  spawnIngredient(defId: string): IngredientEntity | null;
  /** Remove a draggable from the world (trash / serve). */
  removeItem(item: Draggable): void;
}

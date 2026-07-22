import type { IngredientDefinition } from '@/data/types';

/**
 * Ingredient catalogue (v1).
 *
 * To add a new ingredient (鱈魚排 / 培根 / 洋蔥圈 …) just append an entry here and,
 * if needed, reference its id in a recipe. No core logic changes required.
 */
export const INGREDIENTS: readonly IngredientDefinition[] = [
  // --- Cookable ---
  {
    id: 'patty',
    displayName: '漢堡肉',
    cookable: true,
    validStations: ['grill', 'assembly'],
    cookDuration: 4, // per side
    perfectWindow: 3,
    burnDuration: 4,
    needsFlip: true,
    scoreValue: 30,
    color: 0x7a4a2b,
    shape: 'patty',
    stackHeight: 0.22,
  },
  {
    id: 'friedChicken',
    displayName: '炸雞',
    cookable: true,
    validStations: ['fryer', 'assembly'],
    cookDuration: 6,
    perfectWindow: 3,
    burnDuration: 4,
    needsFlip: false,
    scoreValue: 35,
    color: 0xc9862f,
    shape: 'nugget',
    stackHeight: 0.44,
  },
  {
    id: 'fries',
    displayName: '薯條',
    cookable: true,
    validStations: ['fryer'],
    cookDuration: 5,
    perfectWindow: 3,
    burnDuration: 4,
    needsFlip: false,
    scoreValue: 20,
    color: 0xe8c15a,
    shape: 'stick',
    stackHeight: 0.4,
  },

  // --- Ready-to-use (no cooking) ---
  {
    id: 'bunBottom',
    displayName: '麵包底',
    cookable: false,
    validStations: ['assembly'],
    scoreValue: 5,
    color: 0xcf9b52,
    shape: 'bunBottom',
    stackHeight: 0.18,
  },
  {
    id: 'bunTop',
    displayName: '麵包頂',
    cookable: false,
    validStations: ['assembly'],
    scoreValue: 5,
    color: 0xd89a4e,
    shape: 'bunTop',
    stackHeight: 0.26,
  },
  {
    id: 'cheese',
    displayName: '起司片',
    cookable: false,
    validStations: ['assembly'],
    scoreValue: 10,
    color: 0xf2b12e,
    shape: 'slice',
    stackHeight: 0.06,
  },
  {
    id: 'lettuce',
    displayName: '生菜',
    cookable: false,
    validStations: ['assembly'],
    scoreValue: 8,
    color: 0x6fbf4a,
    shape: 'leaf',
    stackHeight: 0.1,
  },
  {
    id: 'tomato',
    displayName: '番茄片',
    cookable: false,
    validStations: ['assembly'],
    scoreValue: 8,
    color: 0xe1442f,
    shape: 'round',
    stackHeight: 0.08,
  },
];

/** Fast lookup by id. */
export const INGREDIENTS_BY_ID: ReadonlyMap<string, IngredientDefinition> = new Map(
  INGREDIENTS.map((def) => [def.id, def]),
);

export function getIngredient(id: string): IngredientDefinition {
  const def = INGREDIENTS_BY_ID.get(id);
  if (!def) {
    throw new Error(`Unknown ingredient id: ${id}`);
  }
  return def;
}

/**
 * Ids offered as clickable storage bins, derived from the data (default: every
 * ingredient unless it sets `spawnable: false`). Adding a new ingredient makes it
 * appear as a bin with no code change — keeping content fully data-driven.
 */
export const SPAWNABLE_INGREDIENT_IDS: readonly string[] = INGREDIENTS.filter(
  (def) => def.spawnable !== false,
).map((def) => def.id);

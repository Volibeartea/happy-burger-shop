import type { RecipeDefinition } from '@/data/types';

/**
 * Recipe catalogue (v1).
 *
 * Order matching (Phase 3/4) compares the multiset of ingredient ids only —
 * stacking order is NOT enforced in v1. Adding a recipe never requires touching
 * the order-matching logic.
 */
export const RECIPES: readonly RecipeDefinition[] = [
  {
    id: 'cheeseBurger',
    displayName: '經典起司漢堡',
    ingredients: ['bunBottom', 'patty', 'cheese', 'bunTop'],
    baseScore: 100,
    baseReward: 50,
  },
  {
    id: 'lettuceTomatoBurger',
    displayName: '生菜番茄漢堡',
    ingredients: ['bunBottom', 'lettuce', 'patty', 'tomato', 'bunTop'],
    baseScore: 140,
    baseReward: 70,
  },
  {
    id: 'chickenBurger',
    displayName: '炸雞漢堡',
    ingredients: ['bunBottom', 'lettuce', 'friedChicken', 'bunTop'],
    baseScore: 130,
    baseReward: 65,
  },
  {
    id: 'friesServing',
    displayName: '薯條',
    ingredients: ['fries'],
    baseScore: 60,
    baseReward: 30,
  },
];

export const RECIPES_BY_ID: ReadonlyMap<string, RecipeDefinition> = new Map(
  RECIPES.map((r) => [r.id, r]),
);

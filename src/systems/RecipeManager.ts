import type { RecipeDefinition } from '@/data/types';
import { RECIPES } from '@/data/recipes';

/** Sorted, order-independent key for a multiset of ingredient ids. */
function multisetKey(ids: readonly string[]): string {
  return [...ids].sort().join('|');
}

/**
 * Matches a served multiset of ingredient ids against the recipe catalogue.
 * v1 compares ingredient TYPE and COUNT only — stacking order is not enforced.
 * Adding a recipe never requires touching this logic (data-driven).
 */
export class RecipeManager {
  private readonly byKey = new Map<string, RecipeDefinition>();

  constructor(recipes: readonly RecipeDefinition[] = RECIPES) {
    for (const recipe of recipes) {
      this.byKey.set(multisetKey(recipe.ingredients), recipe);
    }
  }

  /** Returns the recipe whose ingredient multiset equals `ids`, or null. */
  match(ids: readonly string[]): RecipeDefinition | null {
    return this.byKey.get(multisetKey(ids)) ?? null;
  }
}

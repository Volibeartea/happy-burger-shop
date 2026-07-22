import type { Draggable } from '@/input/InteractionTypes';
import type { StationLayout } from '@/game/GameConfig';
import type { GameContext } from '@/game/GameContext';
import type { RecipeManager } from '@/systems/RecipeManager';
import { isServable } from '@/entities/Servable';
import { Station } from '@/stations/Station';

export interface ServeResult {
  ok: boolean;
  message: string;
}

/**
 * 出餐區 — a served item is matched against the recipe catalogue (type + count,
 * order-independent) and must be fully cooked. Phase 3 reports pass/fail via a
 * callback (HUD toast); Phase 4 will tie this to specific orders and scoring.
 */
export class ServingStation extends Station {
  constructor(
    layout: StationLayout,
    private readonly context: GameContext,
    private readonly recipes: RecipeManager,
    private readonly onServe: (result: ServeResult) => void,
  ) {
    super('serving', layout, {
      color: 0x4a8f5a,
      label: '出餐區',
      hoverHint: '出餐區 · 送出餐點',
      bodyHeight: 0.5,
    });
  }

  canAccept(_item: Draggable): boolean {
    return true;
  }

  accept(item: Draggable): void {
    this.onServe(this.evaluate(item));
    this.context.removeItem(item);
  }

  private evaluate(item: Draggable): ServeResult {
    if (!isServable(item)) {
      return { ok: false, message: '✗ 無法出餐' };
    }
    const { ids, allReady } = item.getServing();
    const recipe = this.recipes.match(ids);
    if (!recipe) {
      return { ok: false, message: '✗ 不符合任何食譜' };
    }
    if (!allReady) {
      return { ok: false, message: `✗ ${recipe.displayName}：食材未完成` };
    }
    return { ok: true, message: `✓ ${recipe.displayName}` };
  }
}

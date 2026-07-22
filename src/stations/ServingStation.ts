import type { Draggable } from '@/input/InteractionTypes';
import type { StationLayout } from '@/game/GameConfig';
import type { GameContext } from '@/game/GameContext';
import { Station } from '@/stations/Station';

/**
 * 出餐區 — completed dishes are dropped here to be served. Order validation and
 * scoring arrive in Phase 4; for now it simply accepts and removes the item.
 */
export class ServingStation extends Station {
  constructor(
    layout: StationLayout,
    private readonly context: GameContext,
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
    console.info(`[Serving] Served: ${item.definitionId}`);
    this.context.removeItem(item);
  }
}

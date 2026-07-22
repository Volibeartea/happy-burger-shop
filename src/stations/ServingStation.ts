import type { Draggable } from '@/input/InteractionTypes';
import type { StationLayout } from '@/game/GameConfig';
import type { GameContext } from '@/game/GameContext';
import type { Serving } from '@/entities/Servable';
import { isServable } from '@/entities/Servable';
import { Station } from '@/stations/Station';

/**
 * 出餐區 — a served item's contents are forwarded to the order system for
 * matching / scoring; the item is then removed from the world.
 */
export class ServingStation extends Station {
  constructor(
    layout: StationLayout,
    private readonly context: GameContext,
    private readonly onServe: (serving: Serving) => void,
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
    if (isServable(item)) this.onServe(item.getServing());
    this.context.removeItem(item);
  }
}

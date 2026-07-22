import type { Draggable } from '@/input/InteractionTypes';
import type { StationLayout } from '@/game/GameConfig';
import type { GameContext } from '@/game/GameContext';
import { Station } from '@/stations/Station';

/** 垃圾桶 — discards any dropped item (wrong / burnt food). */
export class TrashStation extends Station {
  constructor(
    layout: StationLayout,
    private readonly context: GameContext,
  ) {
    super('trash', layout, {
      color: 0x454a52,
      label: '垃圾桶',
      hoverHint: '垃圾桶 · 丟棄食材',
      bodyHeight: 0.7,
      candidateColor: 0xe0503a,
    });
  }

  canAccept(_item: Draggable): boolean {
    return true;
  }

  accept(item: Draggable): void {
    this.context.removeItem(item);
  }
}

import * as THREE from 'three';
import type { StationId } from '@/data/types';
import type { Draggable, ItemContainer } from '@/input/InteractionTypes';
import type { StationLayout } from '@/game/GameConfig';
import { INGREDIENTS_BY_ID } from '@/data/ingredients';
import { Station } from '@/stations/Station';
import type { StationOptions } from '@/stations/Station';

/**
 * A station that holds a limited number of items in a grid of slots (油鍋 / 煎台).
 * Items placed here rest in a free slot. Cooking progression is added in Phase 2;
 * for now the station manages placement, capacity and slot release.
 */
export abstract class CookingStation extends Station implements ItemContainer {
  protected readonly capacity: number;
  protected readonly slots: (Draggable | null)[];
  private readonly cols: number;
  private readonly rows: number;

  constructor(id: StationId, layout: StationLayout, opts: StationOptions, capacity: number) {
    super(id, layout, opts);
    this.capacity = capacity;
    this.slots = new Array<Draggable | null>(capacity).fill(null);
    this.cols = Math.ceil(Math.sqrt(capacity));
    this.rows = Math.ceil(capacity / this.cols);
  }

  private freeSlotIndex(): number {
    return this.slots.indexOf(null);
  }

  canAccept(item: Draggable): boolean {
    const def = INGREDIENTS_BY_ID.get(item.definitionId);
    if (!def) return false;
    if (!def.validStations.includes(this.id)) return false;
    return this.freeSlotIndex() >= 0;
  }

  accept(item: Draggable): void {
    const idx = this.freeSlotIndex();
    if (idx < 0) {
      item.returnToOrigin();
      return;
    }
    this.slots[idx] = item;
    item.container = this;
    item.snapTo(this.slotWorldPosition(idx));
  }

  release(item: Draggable): void {
    const idx = this.slots.indexOf(item);
    if (idx >= 0) this.slots[idx] = null;
  }

  private slotWorldPosition(index: number, out = new THREE.Vector3()): THREE.Vector3 {
    const col = index % this.cols;
    const row = Math.floor(index / this.cols);
    const cellW = this.width / this.cols;
    const cellD = this.depth / this.rows;
    const dx = (col + 0.5) * cellW - this.width / 2;
    const dz = (row + 0.5) * cellD - this.depth / 2;
    return this.surfaceWorldPosition(dx, dz, out);
  }
}

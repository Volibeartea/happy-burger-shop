import * as THREE from 'three';
import type { StationLayout } from '@/game/GameConfig';
import type { Draggable, ItemContainer } from '@/input/InteractionTypes';
import { INGREDIENTS_BY_ID } from '@/data/ingredients';
import { Station } from '@/stations/Station';

/**
 * 組裝台 — ingredients are stacked vertically to form a burger. v1 order-matching
 * (Phase 3+) compares the multiset of ingredient ids, so stacking order is not
 * enforced. Exposes the current stack for recipe comparison later.
 */
export class AssemblyStation extends Station implements ItemContainer {
  private readonly stack: Draggable[] = [];
  private readonly tmp = new THREE.Vector3();

  constructor(layout: StationLayout) {
    super('assembly', layout, {
      color: 0xcaa06a,
      label: '組裝台',
      hoverHint: '組裝台 · 堆疊材料',
      bodyHeight: 0.5,
    });
  }

  canAccept(item: Draggable): boolean {
    const def = INGREDIENTS_BY_ID.get(item.definitionId);
    return !!def && def.validStations.includes('assembly');
  }

  accept(item: Draggable): void {
    this.stack.push(item);
    item.container = this;
    this.relayout();
  }

  release(item: Draggable): void {
    const idx = this.stack.indexOf(item);
    if (idx >= 0) this.stack.splice(idx, 1);
    this.relayout();
  }

  /** Ingredient ids currently stacked (bottom → top). */
  getStackIds(): string[] {
    return this.stack.map((item) => item.definitionId);
  }

  private relayout(): void {
    let y = this.topY;
    for (const item of this.stack) {
      const def = INGREDIENTS_BY_ID.get(item.definitionId);
      const height = def?.stackHeight ?? 0.2;
      this.tmp.set(this.root.position.x, y, this.root.position.z);
      item.snapTo(this.tmp);
      y += height;
    }
  }
}

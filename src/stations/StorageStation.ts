import * as THREE from 'three';
import type { IngredientDefinition } from '@/data/types';
import type { Draggable, Interactive } from '@/input/InteractionTypes';
import type { StationLayout } from '@/game/GameConfig';
import { INGREDIENTS_BY_ID } from '@/data/ingredients';
import { createTextSprite } from '@/scene/TextSprite';
import { Station } from '@/stations/Station';

/** A clickable bin that spawns a fresh ingredient of its type. */
class IngredientBin implements Interactive {
  readonly root = new THREE.Group();
  readonly hoverHint: string;
  private readonly material: THREE.MeshStandardMaterial;

  constructor(def: IngredientDefinition, private readonly spawn: () => void) {
    this.hoverHint = `點擊拿取 ${def.displayName}`;
    this.root.name = `bin:${def.id}`;

    this.material = new THREE.MeshStandardMaterial({
      color: def.color,
      roughness: 0.6,
      metalness: 0.05,
      emissive: new THREE.Color(def.color),
      emissiveIntensity: 0,
    });
    const tray = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.3, 1.0), this.material);
    tray.position.y = 0.15;
    tray.castShadow = true;
    tray.receiveShadow = true;
    this.root.add(tray);

    const label = createTextSprite(def.displayName, { worldHeight: 0.34, fontSize: 40 });
    label.position.set(0, 0.78, 0);
    this.root.add(label);
  }

  onHoverEnter(): void {
    this.material.emissiveIntensity = 0.45;
  }

  onHoverLeave(): void {
    this.material.emissiveIntensity = 0;
  }

  onClick(): void {
    this.spawn();
  }
}

/**
 * 食材區 — holds ingredient bins. Clicking a bin spawns a loose ingredient at the
 * spawn point. Storage is not a drop target (dropped items over it return home).
 */
export class StorageStation extends Station {
  private readonly bins: IngredientBin[] = [];

  constructor(layout: StationLayout, ingredientIds: string[], onSpawn: (id: string) => void) {
    super('storage', layout, {
      color: 0x7f8794,
      label: '食材區',
      hoverHint: '食材區',
      bodyHeight: 0.5,
    });
    this.buildBins(layout, ingredientIds, onSpawn);
  }

  canAccept(_item: Draggable): boolean {
    return false;
  }

  accept(_item: Draggable): void {
    // Storage never receives drops.
  }

  getBins(): Interactive[] {
    return this.bins;
  }

  private buildBins(
    layout: StationLayout,
    ids: string[],
    onSpawn: (id: string) => void,
  ): void {
    const cols = 2;
    const rows = Math.ceil(ids.length / cols);
    const cellW = layout.width / cols;
    const cellD = layout.depth / rows;

    ids.forEach((id, i) => {
      const def = INGREDIENTS_BY_ID.get(id);
      if (!def) return;
      const bin = new IngredientBin(def, () => onSpawn(id));
      const col = i % cols;
      const row = Math.floor(i / cols);
      const dx = (col + 0.5) * cellW - layout.width / 2;
      const dz = (row + 0.5) * cellD - layout.depth / 2;
      bin.root.position.set(dx, this.topY - layout.position.y, dz);
      this.root.add(bin.root);
      this.bins.push(bin);
    });
  }
}

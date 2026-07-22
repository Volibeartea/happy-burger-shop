import * as THREE from 'three';
import type { StationLayout } from '@/game/GameConfig';
import type { Draggable, Interactive, ItemContainer } from '@/input/InteractionTypes';
import { INGREDIENTS_BY_ID } from '@/data/ingredients';
import { createTextSprite } from '@/scene/TextSprite';
import { Station } from '@/stations/Station';

/** A clickable pad that packages the current assembly stack into a burger. */
class AssemblyPlate implements Interactive {
  readonly root = new THREE.Group();
  readonly hoverHint = '打包出餐 · 點擊完成餐點';
  private readonly material: THREE.MeshStandardMaterial;

  constructor(private readonly onPack: () => void) {
    this.root.name = 'assembly-plate';
    this.material = new THREE.MeshStandardMaterial({
      color: 0x4a8f5a,
      roughness: 0.5,
      metalness: 0.1,
      emissive: new THREE.Color(0x4a8f5a),
      emissiveIntensity: 0,
    });
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.08, 20), this.material);
    disc.position.y = 0.04;
    disc.castShadow = true;
    disc.receiveShadow = true;
    this.root.add(disc);

    const label = createTextSprite('打包', {
      worldHeight: 0.3,
      fontSize: 40,
      bg: 'rgba(46, 160, 80, 0.94)',
      color: '#ffffff',
    });
    label.position.set(0, 0.55, 0);
    this.root.add(label);
  }

  onHoverEnter(): void {
    this.material.emissiveIntensity = 0.5;
  }

  onHoverLeave(): void {
    this.material.emissiveIntensity = 0;
  }

  onClick(): void {
    this.onPack();
  }
}

/**
 * 組裝台 — ingredients are stacked vertically. Clicking the 打包 pad packages the
 * current stack into a single Burger (handled by the Game). v1 order matching
 * (RecipeManager) compares the multiset of ids, so stacking order is not enforced.
 */
export class AssemblyStation extends Station implements ItemContainer {
  private readonly stack: Draggable[] = [];
  private readonly tmp = new THREE.Vector3();
  private readonly plate: AssemblyPlate;

  constructor(layout: StationLayout, onPlateUp: () => void) {
    super('assembly', layout, {
      color: 0xcaa06a,
      label: '組裝台',
      hoverHint: '組裝台 · 堆疊材料',
      bodyHeight: 0.5,
    });

    this.plate = new AssemblyPlate(onPlateUp);
    // Sit the pad near the front edge, clear of the centred stack so clicking an
    // ingredient never lands on the (nearer-camera) plate.
    this.plate.root.position.set(0, this.topY - layout.position.y, layout.depth / 2 - 0.35);
    this.root.add(this.plate.root);
  }

  /** The clickable 打包 pad (registered as its own interactive by the Game). */
  getPlate(): Interactive {
    return this.plate;
  }

  hasItems(): boolean {
    return this.stack.length > 0;
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

  /** Detaches and returns the whole stack (used when packaging into a burger). */
  takeAll(): Draggable[] {
    const items = [...this.stack];
    for (const item of items) item.container = null;
    this.stack.length = 0;
    return items;
  }

  /** Clears the stack (items themselves are disposed by the Game on restart). */
  reset(): void {
    this.stack.length = 0;
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

import * as THREE from 'three';
import type { Draggable, ItemHolder } from '@/input/InteractionTypes';
import type { Updatable } from '@/game/Updatable';
import type { Servable, Serving } from '@/entities/Servable';
import { INGREDIENTS_BY_ID } from '@/data/ingredients';
import { buildShape, isFlatShaded } from '@/entities/shapes';
import { CARRY_HEIGHT } from '@/game/GameConfig';

const HOVER_EMISSIVE = 0.3;
const PICKUP_EMISSIVE = 0.45;
const HOVER_SCALE = 1.08;
const PICKUP_SCALE = 1.14;

/**
 * A finished dish assembled from a stack of ingredients. Rendered as one object
 * and dragged as a whole to the serving station or trash. Created by packaging
 * the assembly stack; carries the ingredient multiset for recipe matching.
 */
export class Burger implements Draggable, Updatable, Servable {
  readonly isDraggable = true;
  readonly root = new THREE.Group();
  readonly definitionId = 'burger';
  readonly cookable = false;
  readonly hoverHint = '完成餐點 · 拖到出餐區';
  readonly ingredientIds: string[];

  container: ItemHolder | null = null;

  private readonly allReady: boolean;
  private readonly meshes: THREE.Mesh[] = [];
  private readonly materials: THREE.MeshStandardMaterial[] = [];
  private readonly origin = new THREE.Vector3();
  private readonly target = new THREE.Vector3();
  private dragging = false;
  private targetScale = 1;
  private targetEmissive = 0;

  constructor(ids: string[], allReady: boolean) {
    this.ingredientIds = [...ids];
    this.allReady = allReady;
    this.root.name = 'burger';

    let y = 0;
    for (const id of ids) {
      const def = INGREDIENTS_BY_ID.get(id);
      if (!def) continue;
      const { geometry, baseOffset } = buildShape(def.shape);
      const color =
        def.cookable && def.cookedColor !== undefined ? def.cookedColor : def.color;
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.6,
        metalness: 0.05,
        flatShading: isFlatShaded(def.shape),
        emissive: new THREE.Color(color),
        emissiveIntensity: 0,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = y + baseOffset;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.root.add(mesh);
      this.meshes.push(mesh);
      this.materials.push(material);
      y += def.stackHeight;
    }
  }

  getServing(): Serving {
    return { ids: [...this.ingredientIds], allReady: this.allReady };
  }

  setPosition(position: THREE.Vector3): void {
    this.root.position.copy(position);
    this.target.copy(position);
    this.origin.copy(position);
    this.dragging = false;
  }

  onHoverEnter(): void {
    this.targetScale = HOVER_SCALE;
    this.targetEmissive = HOVER_EMISSIVE;
  }

  onHoverLeave(): void {
    this.targetScale = 1;
    this.targetEmissive = 0;
  }

  onPickup(): void {
    this.origin.copy(this.target);
    this.dragging = true;
    this.targetScale = PICKUP_SCALE;
    this.targetEmissive = PICKUP_EMISSIVE;
  }

  dragTo(worldX: number, worldZ: number): void {
    this.root.position.set(worldX, CARRY_HEIGHT, worldZ);
  }

  snapTo(position: THREE.Vector3): void {
    this.dragging = false;
    this.root.position.copy(position);
    this.target.copy(position);
    this.origin.copy(position);
    this.targetScale = 1;
    this.targetEmissive = 0;
  }

  returnToOrigin(): void {
    this.dragging = false;
    this.target.copy(this.origin);
    this.targetScale = 1;
    this.targetEmissive = 0;
  }

  update(dt: number): void {
    const posK = Math.min(1, dt * 14);
    if (!this.dragging) {
      this.root.position.x += (this.target.x - this.root.position.x) * posK;
      this.root.position.y += (this.target.y - this.root.position.y) * posK;
      this.root.position.z += (this.target.z - this.root.position.z) * posK;
    }
    const scaleK = Math.min(1, dt * 16);
    const s = this.root.scale.x + (this.targetScale - this.root.scale.x) * scaleK;
    this.root.scale.setScalar(s);
    for (const material of this.materials) {
      material.emissiveIntensity += (this.targetEmissive - material.emissiveIntensity) * scaleK;
    }
  }

  dispose(): void {
    this.root.parent?.remove(this.root);
    for (const mesh of this.meshes) mesh.geometry.dispose();
    for (const material of this.materials) material.dispose();
  }
}

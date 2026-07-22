import * as THREE from 'three';
import type { IngredientDefinition, IngredientShape } from '@/data/types';
import type { Draggable, ItemContainer } from '@/input/InteractionTypes';
import type { Updatable } from '@/game/Updatable';
import { CARRY_HEIGHT } from '@/game/GameConfig';

const HOVER_EMISSIVE = 0.35;
const PICKUP_EMISSIVE = 0.5;
const HOVER_SCALE = 1.1;
const PICKUP_SCALE = 1.16;

interface ShapeBuild {
  geometry: THREE.BufferGeometry;
  /** Half the item's vertical extent — mesh is raised so its base sits at y=0. */
  baseOffset: number;
}

function buildShape(shape: IngredientShape): ShapeBuild {
  switch (shape) {
    case 'patty':
      return { geometry: new THREE.CylinderGeometry(0.42, 0.42, 0.22, 20), baseOffset: 0.11 };
    case 'bunBottom':
      return { geometry: new THREE.CylinderGeometry(0.46, 0.42, 0.24, 20), baseOffset: 0.12 };
    case 'bunTop': {
      const geo = new THREE.SphereGeometry(0.48, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
      geo.scale(1, 0.62, 1);
      return { geometry: geo, baseOffset: 0 };
    }
    case 'slice':
      return { geometry: new THREE.BoxGeometry(0.72, 0.06, 0.72), baseOffset: 0.03 };
    case 'leaf':
      return { geometry: new THREE.CylinderGeometry(0.52, 0.52, 0.1, 8), baseOffset: 0.05 };
    case 'round':
      return { geometry: new THREE.CylinderGeometry(0.4, 0.4, 0.08, 16), baseOffset: 0.04 };
    case 'stick':
      return { geometry: new THREE.BoxGeometry(0.5, 0.42, 0.42), baseOffset: 0.21 };
    case 'nugget':
      return { geometry: new THREE.IcosahedronGeometry(0.4, 0), baseOffset: 0.32 };
    default:
      return { geometry: new THREE.BoxGeometry(0.5, 0.5, 0.5), baseOffset: 0.25 };
  }
}

function hintFor(def: IngredientDefinition): string {
  if (def.validStations.includes('grill')) return `${def.displayName} · 拖到煎台`;
  if (def.validStations.includes('fryer')) return `${def.displayName} · 拖到油鍋`;
  return `${def.displayName} · 拖到組裝台`;
}

/**
 * A single loose ingredient in the world. Built procedurally from its data
 * definition. Implements Draggable (pick up / carry / drop) and Updatable
 * (smooth motion + hover/pickup pop). Cooking behaviour arrives in Phase 2.
 */
export class IngredientEntity implements Draggable, Updatable {
  readonly isDraggable = true;
  readonly root = new THREE.Group();
  readonly definitionId: string;
  readonly cookable: boolean;
  readonly hoverHint: string;
  readonly def: IngredientDefinition;

  container: ItemContainer | null = null;

  private readonly mesh: THREE.Mesh;
  private readonly material: THREE.MeshStandardMaterial;
  private readonly origin = new THREE.Vector3();
  private readonly target = new THREE.Vector3();
  private dragging = false;
  private targetScale = 1;
  private targetEmissive = 0;

  constructor(def: IngredientDefinition) {
    this.def = def;
    this.definitionId = def.id;
    this.cookable = def.cookable;
    this.hoverHint = hintFor(def);
    this.root.name = `ingredient:${def.id}`;

    const { geometry, baseOffset } = buildShape(def.shape);
    this.material = new THREE.MeshStandardMaterial({
      color: def.color,
      roughness: 0.6,
      metalness: 0.05,
      flatShading: def.shape === 'nugget' || def.shape === 'leaf',
      // Highlight brightens the item's own hue (not a white wash).
      emissive: new THREE.Color(def.color),
      emissiveIntensity: 0,
    });
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.y = baseOffset;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.root.add(this.mesh);
  }

  /** Places the item at a resting position (spawn or forced move). */
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

    const em = this.material.emissiveIntensity;
    this.material.emissiveIntensity = em + (this.targetEmissive - em) * scaleK;
  }

  dispose(): void {
    this.root.parent?.remove(this.root);
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}

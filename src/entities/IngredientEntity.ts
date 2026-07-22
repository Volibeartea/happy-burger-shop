import * as THREE from 'three';
import type { CookState, IngredientDefinition, IngredientShape } from '@/data/types';
import type { Draggable, ItemContainer } from '@/input/InteractionTypes';
import type { Updatable } from '@/game/Updatable';
import type { Cookable, CookMode } from '@/entities/Cookable';
import { CARRY_HEIGHT } from '@/game/GameConfig';
import { createTextSprite } from '@/scene/TextSprite';

const HOVER_EMISSIVE = 0.35;
const PICKUP_EMISSIVE = 0.5;
const HOVER_SCALE = 1.1;
const PICKUP_SCALE = 1.16;
const BOUNCE_DUR = 0.5;

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

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
  if (def.validStations.includes('grill')) return `${def.displayName} · 拖到煎台（點擊翻面）`;
  if (def.validStations.includes('fryer')) return `${def.displayName} · 拖到油鍋`;
  return `${def.displayName} · 拖到組裝台`;
}

/**
 * A single ingredient in the world, built procedurally from its data definition.
 * Implements Draggable (pick up / carry / drop), Updatable (smooth motion + cook
 * advance) and Cookable (raw → cooking → perfect → burnt).
 *
 * Cooking is driven here in update() and gated by `heat`, which a CookingStation
 * sets via begin/endCooking. Grill items cook one side at a time and are flipped
 * by clicking them; fryer items cook in a single phase.
 */
export class IngredientEntity implements Draggable, Updatable, Cookable {
  readonly isDraggable = true;
  readonly root = new THREE.Group();
  readonly definitionId: string;
  readonly cookable: boolean;
  readonly hoverHint: string;
  readonly def: IngredientDefinition;

  container: ItemContainer | null = null;

  private readonly mesh: THREE.Mesh;
  private readonly material: THREE.MeshStandardMaterial;
  private readonly baseOffsetY: number;
  private readonly origin = new THREE.Vector3();
  private readonly target = new THREE.Vector3();
  private dragging = false;
  private targetScale = 1;
  private targetEmissive = 0;

  // --- Cooking ---
  private readonly rawColor: THREE.Color;
  private readonly cookedColor: THREE.Color;
  private readonly burntColor: THREE.Color;
  private readonly tmpColor = new THREE.Color();
  private heat: CookMode | null = null;
  private cookTime = 0; // fryer: single accumulator
  private readonly sideTimes: [number, number] = [0, 0]; // grill: per-side
  private downSide = 0;
  private cookStateInternal: CookState = 'raw';
  private perfectMark: THREE.Sprite | null = null;
  private burntMark: THREE.Sprite | null = null;

  // --- Juice ---
  private targetRotX = 0;
  private bounceTime = 0;

  constructor(def: IngredientDefinition) {
    this.def = def;
    this.definitionId = def.id;
    this.cookable = def.cookable;
    this.hoverHint = hintFor(def);
    this.root.name = `ingredient:${def.id}`;

    const { geometry, baseOffset } = buildShape(def.shape);
    this.baseOffsetY = baseOffset;
    this.rawColor = new THREE.Color(def.color);
    this.cookedColor = new THREE.Color(def.cookedColor ?? def.color);
    this.burntColor = new THREE.Color(def.burntColor ?? def.color);

    this.material = new THREE.MeshStandardMaterial({
      color: def.color,
      roughness: 0.6,
      metalness: 0.05,
      flatShading: def.shape === 'nugget' || def.shape === 'leaf',
      emissive: new THREE.Color(def.color),
      emissiveIntensity: 0,
    });
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.y = baseOffset;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.root.add(this.mesh);

    if (def.cookable) {
      this.perfectMark = createTextSprite('✓ 完美', {
        worldHeight: 0.32,
        fontSize: 40,
        bg: 'rgba(46, 160, 80, 0.94)',
        color: '#ffffff',
      });
      this.perfectMark.position.set(0, 0.85, 0);
      this.perfectMark.visible = false;
      this.root.add(this.perfectMark);

      this.burntMark = createTextSprite('燒焦', {
        worldHeight: 0.32,
        fontSize: 40,
        bg: 'rgba(38, 38, 42, 0.94)',
        color: '#ff7a5a',
      });
      this.burntMark.position.set(0, 0.85, 0);
      this.burntMark.visible = false;
      this.root.add(this.burntMark);
    }
  }

  get cookState(): CookState {
    return this.cookStateInternal;
  }

  /** Whether this item may be used in a correct order (cooked ones must be perfect). */
  get isReady(): boolean {
    return !this.cookable || this.cookStateInternal === 'perfect';
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

  /** Click a grill patty to flip it (cook the other side). */
  onClick(): void {
    if (!this.cookable || !this.def.needsFlip || this.heat !== 'grill') return;
    this.downSide = this.downSide === 0 ? 1 : 0;
    this.targetRotX += Math.PI;
    this.bounceTime = 0.25;
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

  // --- Cookable ---
  beginCooking(mode: CookMode): void {
    // Safety: non-cookable items (buns, toppings) never heat up, even if mis-wired.
    if (!this.cookable) return;
    this.heat = mode;
  }

  endCooking(): void {
    this.heat = null;
  }

  private updateCook(dt: number): void {
    if (this.heat === null) return;
    const cd = this.def.cookDuration ?? 5;
    const pw = this.def.perfectWindow ?? 3;
    const bd = this.def.burnDuration ?? 4;

    let cookedness: number;
    let burntness: number;
    let next: CookState;

    if (this.heat === 'fryer') {
      this.cookTime += dt;
      const t = this.cookTime;
      cookedness = clamp01(t / cd);
      burntness = clamp01((t - (cd + pw)) / bd);
      next = t <= 0 ? 'raw' : t < cd ? 'cooking' : t < cd + pw ? 'perfect' : 'burnt';
    } else {
      this.sideTimes[this.downSide] += dt;
      const s0 = this.sideTimes[0];
      const s1 = this.sideTimes[1];
      cookedness = (clamp01(s0 / cd) + clamp01(s1 / cd)) / 2;
      burntness = Math.max(clamp01((s0 - (cd + pw)) / bd), clamp01((s1 - (cd + pw)) / bd));
      const burnt = s0 >= cd + pw || s1 >= cd + pw;
      const perfect = s0 >= cd && s1 >= cd;
      next = burnt ? 'burnt' : perfect ? 'perfect' : s0 > 0 || s1 > 0 ? 'cooking' : 'raw';
    }

    this.tmpColor.copy(this.rawColor).lerp(this.cookedColor, cookedness).lerp(this.burntColor, burntness);
    this.material.color.copy(this.tmpColor);

    if (next !== this.cookStateInternal) {
      this.onCookStateChange(next);
      this.cookStateInternal = next;
    }
  }

  private onCookStateChange(next: CookState): void {
    if (next === 'perfect') {
      this.bounceTime = BOUNCE_DUR;
      if (this.perfectMark) this.perfectMark.visible = true;
      if (this.burntMark) this.burntMark.visible = false;
    } else if (next === 'burnt') {
      if (this.burntMark) this.burntMark.visible = true;
      if (this.perfectMark) this.perfectMark.visible = false;
    } else {
      if (this.perfectMark) this.perfectMark.visible = false;
      if (this.burntMark) this.burntMark.visible = false;
    }
  }

  update(dt: number): void {
    this.updateCook(dt);

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

    // Flip rotation + cook/flip bounce.
    this.mesh.rotation.x += (this.targetRotX - this.mesh.rotation.x) * Math.min(1, dt * 12);
    if (this.bounceTime > 0) this.bounceTime = Math.max(0, this.bounceTime - dt);
    const hop = Math.sin(clamp01(this.bounceTime / BOUNCE_DUR) * Math.PI) * 0.18;
    this.mesh.position.y = this.baseOffsetY + hop;
  }

  dispose(): void {
    this.root.parent?.remove(this.root);
    this.mesh.geometry.dispose();
    this.material.dispose();
    for (const sprite of [this.perfectMark, this.burntMark]) {
      if (!sprite) continue;
      sprite.material.map?.dispose();
      sprite.material.dispose();
    }
  }
}

import * as THREE from 'three';
import type { StationId } from '@/data/types';
import type { Draggable, DropTarget, Footprint, Interactive } from '@/input/InteractionTypes';
import type { StationLayout } from '@/game/GameConfig';
import { COLORS } from '@/game/GameConfig';
import { createTextSprite } from '@/scene/TextSprite';

export interface StationOptions {
  color: number;
  label: string;
  hoverHint: string;
  bodyHeight?: number;
  /** Emissive colour used for the drop-candidate highlight (default green). */
  candidateColor?: number;
}

/**
 * Base class for a fixed work station. Provides the body mesh, name plate,
 * drop footprint and highlight behaviour. Subclasses implement canAccept/accept.
 */
export abstract class Station implements DropTarget, Interactive {
  readonly id: StationId;
  readonly root = new THREE.Group();
  readonly footprint: Footprint;
  readonly hoverHint: string;

  protected readonly width: number;
  protected readonly depth: number;
  /** World Y of the station's working surface (top of the body). */
  protected readonly topY: number;

  private readonly bodyMat: THREE.MeshStandardMaterial;
  private candidateActive = false;

  constructor(id: StationId, layout: StationLayout, opts: StationOptions) {
    this.id = id;
    this.hoverHint = opts.hoverHint;
    this.width = layout.width;
    this.depth = layout.depth;

    const { position } = layout;
    this.root.position.copy(position);
    this.root.name = `station:${id}`;

    const bodyHeight = opts.bodyHeight ?? 0.5;
    this.topY = position.y + bodyHeight;

    const bodyGeo = new THREE.BoxGeometry(layout.width, bodyHeight, layout.depth);
    this.bodyMat = new THREE.MeshStandardMaterial({
      color: opts.color,
      roughness: 0.7,
      metalness: 0.1,
      emissive: new THREE.Color(opts.candidateColor ?? COLORS.dropOk),
      emissiveIntensity: 0,
    });
    const body = new THREE.Mesh(bodyGeo, this.bodyMat);
    body.position.y = bodyHeight / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    this.root.add(body);

    const label = createTextSprite(opts.label, { worldHeight: 0.5 });
    label.position.set(0, bodyHeight + 0.85, 0);
    this.root.add(label);

    this.footprint = {
      cx: position.x,
      cz: position.z,
      halfX: layout.width / 2 + 0.15,
      halfZ: layout.depth / 2 + 0.15,
    };
  }

  abstract canAccept(item: Draggable): boolean;
  abstract accept(item: Draggable): void;

  onHoverEnter(): void {
    if (!this.candidateActive) this.bodyMat.emissiveIntensity = 0.12;
  }

  onHoverLeave(): void {
    if (!this.candidateActive) this.bodyMat.emissiveIntensity = 0;
  }

  setDropCandidate(active: boolean): void {
    this.candidateActive = active;
    this.bodyMat.emissiveIntensity = active ? 0.55 : 0;
  }

  /** World position on the top surface, offset by (dx,dz) from the centre. */
  protected surfaceWorldPosition(dx: number, dz: number, out = new THREE.Vector3()): THREE.Vector3 {
    return out.set(this.root.position.x + dx, this.topY, this.root.position.z + dz);
  }
}

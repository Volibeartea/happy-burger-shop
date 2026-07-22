import type * as THREE from 'three';

/**
 * Interaction contracts shared by entities, stations and the input controllers.
 * Kept deliberately small: hover, click, drag, and drop-target acceptance.
 */

/** Anything the pointer can hover / click. */
export interface Interactive {
  /** Root Object3D used for raycast picking. */
  readonly root: THREE.Object3D;
  /** Short hint shown near the cursor on hover (e.g. "拖曳到煎台"). */
  readonly hoverHint: string;
  onHoverEnter(): void;
  onHoverLeave(): void;
  /** Optional click handler (used e.g. by storage bins to spawn ingredients). */
  onClick?(): void;
}

/** A container that currently holds a draggable (a station slot, an assembly stack). */
export interface ItemContainer {
  /** Release an item that is being picked up out of this container. */
  release(item: Draggable): void;
}

/** An interactive object that can be picked up and dropped. */
export interface Draggable extends Interactive {
  readonly isDraggable: true;
  readonly definitionId: string;
  readonly cookable: boolean;
  /** The container currently holding this item, if any. */
  container: ItemContainer | null;

  /** Called when the item is lifted off its resting place. */
  onPickup(): void;
  /** Called every pointer-move while dragging (target position on carry plane). */
  dragTo(worldX: number, worldZ: number): void;
  /** Snap to a resting position (valid drop). Updates the item's origin. */
  snapTo(position: THREE.Vector3): void;
  /** Return to the position it was at before pickup (invalid drop). */
  returnToOrigin(): void;
  /** Remove from the world and free GPU resources. */
  dispose(): void;
}

export interface Footprint {
  readonly cx: number;
  readonly cz: number;
  readonly halfX: number;
  readonly halfZ: number;
}

/** A station area that can accept dropped draggables. */
export interface DropTarget {
  readonly id: string;
  readonly root: THREE.Object3D;
  readonly footprint: Footprint;
  canAccept(item: Draggable): boolean;
  accept(item: Draggable): void;
  /** Toggle the "you can drop here" highlight while an item is dragged over it. */
  setDropCandidate(active: boolean): void;
}

export function footprintContains(fp: Footprint, x: number, z: number): boolean {
  return Math.abs(x - fp.cx) <= fp.halfX && Math.abs(z - fp.cz) <= fp.halfZ;
}

export function isDraggable(item: Interactive): item is Draggable {
  return (item as Partial<Draggable>).isDraggable === true;
}

import type * as THREE from 'three';
import type { Draggable, DropTarget, Interactive } from '@/input/InteractionTypes';
import { footprintContains } from '@/input/InteractionTypes';

/**
 * Registry of pointer-interactive objects and drop targets.
 *
 * Hover picking uses raycasting against each interactive's root (recursive);
 * `resolve()` walks a hit's parent chain back to the owning Interactive.
 * Drop resolution uses station footprints on the XZ plane.
 */
export class InteractionRegistry {
  private readonly interactives = new Set<Interactive>();
  private readonly dropTargets: DropTarget[] = [];
  private readonly rootToInteractive = new Map<THREE.Object3D, Interactive>();

  addInteractive(item: Interactive): void {
    this.interactives.add(item);
    this.rootToInteractive.set(item.root, item);
  }

  removeInteractive(item: Interactive): void {
    this.interactives.delete(item);
    this.rootToInteractive.delete(item.root);
  }

  addDropTarget(target: DropTarget): void {
    this.dropTargets.push(target);
  }

  /** Roots to feed into a raycaster (recursive intersect). */
  get pickRoots(): THREE.Object3D[] {
    const roots: THREE.Object3D[] = [];
    for (const item of this.interactives) roots.push(item.root);
    return roots;
  }

  /** Map a raycast hit (possibly a descendant mesh) back to its Interactive. */
  resolve(object: THREE.Object3D): Interactive | undefined {
    let cur: THREE.Object3D | null = object;
    while (cur) {
      const found = this.rootToInteractive.get(cur);
      if (found) return found;
      cur = cur.parent;
    }
    return undefined;
  }

  /** First drop target whose footprint contains (x,z) and that accepts the item. */
  dropTargetAt(x: number, z: number, item: Draggable): DropTarget | undefined {
    for (const target of this.dropTargets) {
      if (footprintContains(target.footprint, x, z) && target.canAccept(item)) {
        return target;
      }
    }
    return undefined;
  }

  get allDropTargets(): readonly DropTarget[] {
    return this.dropTargets;
  }
}

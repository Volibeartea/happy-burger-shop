import type { InputManager } from '@/input/InputManager';
import type { InteractionRegistry } from '@/input/InteractionRegistry';
import type { PointerController } from '@/input/PointerController';
import type { Draggable, DropTarget, Interactive } from '@/input/InteractionTypes';
import { isDraggable } from '@/input/InteractionTypes';
import { DROP_PLANE_Y } from '@/game/GameConfig';

const CLICK_SLOP_PX = 6;

/**
 * Drives the pick / drag / drop / click lifecycle from pointer events.
 *
 * - pointer down over a draggable → armed (not yet lifted)
 * - first move beyond the click slop → begins the drag (lifts the item)
 * - move → item follows the cursor on the carry plane; valid drop zones highlight
 * - pointer up over a valid drop target → target.accept(item); otherwise the
 *   item returns to its origin
 * - pointer up without moving over a clickable → fires its onClick
 */
export class DragController {
  private pending: Draggable | null = null;
  private dragging: Draggable | null = null;
  private downInteractive: Interactive | null = null;
  private downX = 0;
  private downY = 0;
  private candidate: DropTarget | null = null;

  constructor(
    private readonly input: InputManager,
    private readonly registry: InteractionRegistry,
    private readonly pointer: PointerController,
    private readonly canvas: HTMLCanvasElement,
  ) {
    this.input.onDown = this.handleDown;
    this.input.onMove = this.handleMove;
    this.input.onUp = this.handleUp;
    this.input.onCancel = this.handleCancel;
  }

  private pick(): Interactive | undefined {
    const hits = this.input.raycast(this.registry.pickRoots, true);
    return hits.length > 0 ? this.registry.resolve(hits[0].object) : undefined;
  }

  private movedBeyondSlop(e: PointerEvent): boolean {
    return (
      Math.abs(e.clientX - this.downX) > CLICK_SLOP_PX ||
      Math.abs(e.clientY - this.downY) > CLICK_SLOP_PX
    );
  }

  private readonly handleDown = (e: PointerEvent): void => {
    // Only the primary (left) button arms a pick / drag.
    if (e.button !== 0) return;
    this.downX = e.clientX;
    this.downY = e.clientY;
    const top = this.pick();
    this.downInteractive = top ?? null;
    this.pending = top && isDraggable(top) ? top : null;
  };

  private readonly handleMove = (e: PointerEvent): void => {
    if (this.dragging) {
      this.updateDrag();
      return;
    }
    if (this.pending && this.movedBeyondSlop(e)) {
      this.startDrag(this.pending);
      this.updateDrag();
      return;
    }
    if (!this.pending) {
      this.pointer.updateHover();
    }
  };

  private readonly handleUp = (e: PointerEvent): void => {
    // Ignore non-primary button releases so a mid-drag right-click can't drop.
    if (e.button !== 0) return;
    if (this.dragging) {
      this.finishDrop();
    } else if (
      this.downInteractive &&
      !this.movedBeyondSlop(e) &&
      this.downInteractive.onClick
    ) {
      this.downInteractive.onClick();
    }
    this.pending = null;
    this.downInteractive = null;
    if (!this.dragging) this.pointer.updateHover();
  };

  private startDrag(item: Draggable): void {
    this.dragging = item;
    this.pending = null;
    item.container?.release(item);
    item.container = null;
    // Clear hover FIRST (its onHoverLeave resets scale/emissive), then apply the
    // pickup emphasis so it actually sticks.
    this.pointer.suspend(true);
    item.onPickup();
    this.canvas.style.cursor = 'grabbing';
  }

  private updateDrag(): void {
    if (!this.dragging) return;
    const p = this.input.projectToPlaneY(DROP_PLANE_Y);
    if (!p) return;
    this.dragging.dragTo(p.x, p.z);
    const next = this.registry.dropTargetAt(p.x, p.z, this.dragging) ?? null;
    if (next !== this.candidate) {
      this.candidate?.setDropCandidate(false);
      this.candidate = next;
      this.candidate?.setDropCandidate(true);
    }
  }

  private finishDrop(): void {
    const item = this.dragging;
    if (!item) return;
    const p = this.input.projectToPlaneY(DROP_PLANE_Y);
    const target = p ? this.registry.dropTargetAt(p.x, p.z, item) : undefined;
    this.candidate?.setDropCandidate(false);
    this.candidate = null;
    if (target) {
      target.accept(item);
    } else {
      item.returnToOrigin();
    }
    this.dragging = null;
    this.pointer.suspend(false);
  }

  /** Abort an in-flight interaction (pointercancel / window blur). */
  private readonly handleCancel = (): void => {
    if (this.dragging) {
      this.candidate?.setDropCandidate(false);
      this.candidate = null;
      this.dragging.returnToOrigin();
      this.dragging = null;
      this.pointer.suspend(false);
    }
    this.pending = null;
    this.downInteractive = null;
  };
}

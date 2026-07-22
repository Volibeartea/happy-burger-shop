import type { InputManager } from '@/input/InputManager';
import type { InteractionRegistry } from '@/input/InteractionRegistry';
import type { Interactive } from '@/input/InteractionTypes';
import { isDraggable } from '@/input/InteractionTypes';

/** Anything that can display a hover hint near the cursor (implemented by HUD). */
export interface TooltipHost {
  showTooltip(text: string, clientX: number, clientY: number): void;
  hideTooltip(): void;
}

/**
 * Manages hover state: raycasts under the (idle) pointer, drives hover
 * enter/leave on the topmost interactive, updates the cursor and tooltip.
 * Hover is suspended by the DragController while an item is being dragged.
 */
export class PointerController {
  private hovered: Interactive | null = null;
  private suspended = false;

  constructor(
    private readonly input: InputManager,
    private readonly registry: InteractionRegistry,
    private readonly tooltip: TooltipHost,
    private readonly canvas: HTMLCanvasElement,
  ) {}

  updateHover(): void {
    if (this.suspended) return;
    const hits = this.input.raycast(this.registry.pickRoots, true);
    const top = hits.length > 0 ? this.registry.resolve(hits[0].object) : undefined;
    this.setHovered(top ?? null);

    if (this.hovered) {
      this.tooltip.showTooltip(this.hovered.hoverHint, this.input.clientX, this.input.clientY);
      this.canvas.style.cursor = isDraggable(this.hovered)
        ? 'grab'
        : this.hovered.onClick
          ? 'pointer'
          : 'default';
    } else {
      this.tooltip.hideTooltip();
      this.canvas.style.cursor = 'default';
    }
  }

  private setHovered(next: Interactive | null): void {
    if (next === this.hovered) return;
    this.hovered?.onHoverLeave();
    this.hovered = next;
    this.hovered?.onHoverEnter();
  }

  clear(): void {
    this.setHovered(null);
    this.tooltip.hideTooltip();
    this.canvas.style.cursor = 'default';
  }

  /** Suspend/resume hover. Suspending clears any current hover state. */
  suspend(value: boolean): void {
    this.suspended = value;
    if (value) this.clear();
  }
}

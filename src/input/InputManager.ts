import * as THREE from 'three';

/**
 * Normalises DOM pointer events into NDC coordinates and provides raycasting
 * helpers (against objects, and onto a horizontal plane). Owns a single set of
 * down/move/up callbacks — the DragController is the sole subscriber.
 */
export class InputManager {
  readonly pointer = new THREE.Vector2();
  clientX = 0;
  clientY = 0;

  onDown: ((e: PointerEvent) => void) | null = null;
  onMove: ((e: PointerEvent) => void) | null = null;
  onUp: ((e: PointerEvent) => void) | null = null;
  /** Fired when an in-flight interaction must abort (pointercancel / window blur). */
  onCancel: (() => void) | null = null;

  private readonly raycaster = new THREE.Raycaster();
  private readonly plane = new THREE.Plane();
  private readonly planeNormal = new THREE.Vector3(0, 1, 0);
  private readonly coplanar = new THREE.Vector3();
  private readonly hitPoint = new THREE.Vector3();

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly camera: THREE.Camera,
  ) {
    this.canvas.addEventListener('pointerdown', this.handleDown);
    window.addEventListener('pointermove', this.handleMove);
    window.addEventListener('pointerup', this.handleUp);
    this.canvas.addEventListener('pointercancel', this.handleCancel);
    window.addEventListener('blur', this.handleBlur);
  }

  private updateFromEvent(e: PointerEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.clientX = e.clientX;
    this.clientY = e.clientY;
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private readonly handleDown = (e: PointerEvent): void => {
    this.updateFromEvent(e);
    // Capture so move/up keep arriving even if the cursor leaves the canvas.
    try {
      this.canvas.setPointerCapture(e.pointerId);
    } catch {
      /* capture is best-effort */
    }
    this.onDown?.(e);
  };

  private readonly handleMove = (e: PointerEvent): void => {
    this.updateFromEvent(e);
    this.onMove?.(e);
  };

  private readonly handleUp = (e: PointerEvent): void => {
    this.updateFromEvent(e);
    try {
      this.canvas.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    this.onUp?.(e);
  };

  private readonly handleCancel = (): void => {
    this.onCancel?.();
  };

  private readonly handleBlur = (): void => {
    this.onCancel?.();
  };

  /** Raycast against the given objects using the current pointer position. */
  raycast(objects: THREE.Object3D[], recursive = true): THREE.Intersection[] {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    return this.raycaster.intersectObjects(objects, recursive);
  }

  /** Project the current pointer ray onto the horizontal plane y = `y`. */
  projectToPlaneY(y: number): THREE.Vector3 | null {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    this.coplanar.set(0, y, 0);
    this.plane.setFromNormalAndCoplanarPoint(this.planeNormal, this.coplanar);
    const hit = this.raycaster.ray.intersectPlane(this.plane, this.hitPoint);
    return hit ? this.hitPoint.clone() : null;
  }

  dispose(): void {
    this.canvas.removeEventListener('pointerdown', this.handleDown);
    window.removeEventListener('pointermove', this.handleMove);
    window.removeEventListener('pointerup', this.handleUp);
    this.canvas.removeEventListener('pointercancel', this.handleCancel);
    window.removeEventListener('blur', this.handleBlur);
  }
}

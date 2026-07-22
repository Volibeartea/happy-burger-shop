import * as THREE from 'three';
import { CAMERA } from '@/game/GameConfig';

/**
 * Fixed oblique top-down camera. No orbit/zoom in v1 — the framing is chosen so
 * every station is visible at once. Only the aspect ratio reacts to resizes.
 */
export class CameraController {
  readonly camera: THREE.PerspectiveCamera;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, CAMERA.near, CAMERA.far);
    this.camera.position.copy(CAMERA.position);
    this.camera.lookAt(CAMERA.lookAt);
  }

  setAspect(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }
}

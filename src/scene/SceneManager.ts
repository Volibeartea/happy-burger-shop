import * as THREE from 'three';
import { COLORS } from '@/game/GameConfig';
import { CameraController } from '@/scene/CameraController';
import { Lighting } from '@/scene/Lighting';
import { KitchenScene } from '@/scene/KitchenScene';

/**
 * Owns the renderer, scene graph, camera, lighting and static kitchen. Provides
 * a single `render()` and handles window resizes. Gameplay objects are added to
 * `scene` by the Game.
 */
export class SceneManager {
  readonly scene = new THREE.Scene();
  readonly renderer: THREE.WebGLRenderer;
  readonly cameraController: CameraController;
  private readonly lighting: Lighting;
  readonly kitchen: KitchenScene;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene.background = new THREE.Color(COLORS.sky);
    this.scene.fog = new THREE.Fog(COLORS.sky, 22, 46);

    this.cameraController = new CameraController();
    this.lighting = new Lighting(this.scene);
    this.kitchen = new KitchenScene(this.scene);

    this.resize();
    window.addEventListener('resize', this.resize);
  }

  get camera(): THREE.PerspectiveCamera {
    return this.cameraController.camera;
  }

  private readonly resize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    this.cameraController.setAspect(width / height);
  };

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    window.removeEventListener('resize', this.resize);
    this.lighting.dispose(this.scene);
    this.renderer.dispose();
  }
}

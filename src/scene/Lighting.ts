import * as THREE from 'three';

/**
 * Bright, soft cartoon lighting: a hemisphere fill + ambient for flat colours,
 * plus one shadow-casting key light for gentle grounding.
 */
export class Lighting {
  private readonly objects: THREE.Object3D[] = [];

  constructor(scene: THREE.Scene) {
    const hemi = new THREE.HemisphereLight(0xffffff, 0x4a5064, 0.9);
    scene.add(hemi);
    this.objects.push(hemi);

    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);
    this.objects.push(ambient);

    const key = new THREE.DirectionalLight(0xfff4e0, 2.2);
    key.position.set(6, 14, 8);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 40;
    const s = 14;
    key.shadow.camera.left = -s;
    key.shadow.camera.right = s;
    key.shadow.camera.top = s;
    key.shadow.camera.bottom = -s;
    key.shadow.bias = -0.0005;
    key.shadow.normalBias = 0.02;
    scene.add(key);
    scene.add(key.target);
    this.objects.push(key, key.target);

    const rim = new THREE.DirectionalLight(0x99bbff, 0.5);
    rim.position.set(-8, 6, -6);
    scene.add(rim);
    this.objects.push(rim);
  }

  dispose(scene: THREE.Scene): void {
    for (const obj of this.objects) scene.remove(obj);
    this.objects.length = 0;
  }
}

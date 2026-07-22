import * as THREE from 'three';
import { COLORS, COUNTER_TOP_Y, STATION_LAYOUT } from '@/game/GameConfig';
import { createTextSprite } from '@/scene/TextSprite';

/**
 * Static kitchen environment: floor, counter slab, back wall and signage.
 * Purely decorative — no interaction logic lives here.
 */
export class KitchenScene {
  readonly root = new THREE.Group();

  constructor(scene: THREE.Scene) {
    this.root.name = 'KitchenScene';
    this.buildFloor();
    this.buildCounter();
    this.buildBackWall();
    this.buildSign();
    this.buildGlassShield();
    scene.add(this.root);
  }

  private buildFloor(): void {
    const geo = new THREE.PlaneGeometry(60, 60);
    const mat = new THREE.MeshStandardMaterial({ color: COLORS.floor, roughness: 1 });
    const floor = new THREE.Mesh(geo, mat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    this.root.add(floor);
  }

  private buildCounter(): void {
    const geo = new THREE.BoxGeometry(15.5, COUNTER_TOP_Y, 11.5);
    const mat = new THREE.MeshStandardMaterial({ color: COLORS.counter, roughness: 0.75 });
    const counter = new THREE.Mesh(geo, mat);
    counter.position.set(0, COUNTER_TOP_Y / 2, 0.4);
    counter.castShadow = true;
    counter.receiveShadow = true;
    this.root.add(counter);

    // A slightly inset darker trim on top for visual definition.
    const trimGeo = new THREE.BoxGeometry(15.5, 0.06, 11.5);
    const trimMat = new THREE.MeshStandardMaterial({ color: COLORS.counterEdge, roughness: 0.8 });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(0, COUNTER_TOP_Y + 0.005, 0.4);
    trim.receiveShadow = true;
    this.root.add(trim);
  }

  private buildBackWall(): void {
    const geo = new THREE.BoxGeometry(20, 7, 0.6);
    const mat = new THREE.MeshStandardMaterial({ color: COLORS.wall, roughness: 1 });
    const wall = new THREE.Mesh(geo, mat);
    wall.position.set(0, 3.5, -5.6);
    wall.receiveShadow = true;
    this.root.add(wall);
  }

  private buildSign(): void {
    const sign = createTextSprite('🍔 Happy Burger Shop', {
      fontSize: 54,
      worldHeight: 0.9,
      bg: 'rgba(255, 196, 61, 0.95)',
      color: '#3a2a12',
    });
    sign.position.set(0, 5.2, -5.2);
    this.root.add(sign);
  }

  /**
   * A curved glass wind-guard over the left ingredient area — like a convertible
   * car's half windshield. Purely decorative: raycast is disabled on every piece
   * so it never blocks clicks on the bins, and the glass doesn't write depth so
   * the ingredients stay clickable and visible through it.
   */
  private buildGlassShield(): void {
    const storage = STATION_LAYOUT.storage;
    const group = new THREE.Group();
    group.name = 'glassShield';

    const R = 3.4; // curvature radius
    const arc = 0.92; // ~53° wrap
    const height = 1.3;
    const t0 = Math.PI / 2 - arc / 2; // arc centred on +Z (facing the player)

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xcfeaff,
      metalness: 0,
      roughness: 0.06,
      transparent: true,
      opacity: 0.24,
      side: THREE.DoubleSide,
      depthWrite: false,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
    });
    const glass = new THREE.Mesh(
      new THREE.CylinderGeometry(R, R, height, 40, 1, true, t0, arc),
      glassMat,
    );
    glass.renderOrder = 5;
    glass.raycast = () => {};
    group.add(glass);

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x2a2e36,
      metalness: 0.6,
      roughness: 0.4,
    });
    const rail = (y: number): THREE.Mesh => {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(R, R, 0.09, 40, 1, true, t0 - 0.02, arc + 0.04),
        frameMat,
      );
      mesh.position.y = y;
      mesh.raycast = () => {};
      return mesh;
    };
    const post = (theta: number): THREE.Mesh => {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(R, R, height, 4, 1, true, theta - 0.02, 0.04),
        frameMat,
      );
      mesh.raycast = () => {};
      return mesh;
    };
    group.add(rail(height / 2), rail(-height / 2), post(t0), post(t0 + arc));

    // Stand it just in front of the storage, tilted back like a windshield.
    const front = storage.position.z + storage.depth / 2 - 0.1;
    group.position.set(storage.position.x, COUNTER_TOP_Y + 0.95, front - R);
    group.rotation.x = -0.12;
    this.root.add(group);
  }
}

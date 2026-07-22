import * as THREE from 'three';
import { COLORS, COUNTER_TOP_Y } from '@/game/GameConfig';
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
}

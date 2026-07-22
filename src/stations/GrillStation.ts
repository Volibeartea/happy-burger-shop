import * as THREE from 'three';
import type { StationLayout } from '@/game/GameConfig';
import { GAME_BALANCE } from '@/data/gameBalance';
import { CookingStation } from '@/stations/CookingStation';

/** 煎台 — accepts grill items (漢堡肉). */
export class GrillStation extends CookingStation {
  constructor(layout: StationLayout) {
    super(
      'grill',
      layout,
      {
        color: 0x40444d,
        label: '煎台',
        hoverHint: '煎台 · 放上漢堡肉',
        bodyHeight: 0.5,
      },
      GAME_BALANCE.grill.capacity,
    );
    this.addGriddleSurface(layout);
  }

  private addGriddleSurface(layout: StationLayout): void {
    const geo = new THREE.BoxGeometry(layout.width - 0.3, 0.06, layout.depth - 0.3);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x1e1f24,
      roughness: 0.5,
      metalness: 0.4,
    });
    const griddle = new THREE.Mesh(geo, mat);
    griddle.position.set(0, this.topY - layout.position.y + 0.02, 0);
    griddle.receiveShadow = true;
    this.root.add(griddle);
  }
}

import * as THREE from 'three';
import type { StationLayout } from '@/game/GameConfig';
import { GAME_BALANCE } from '@/data/gameBalance';
import { CookingStation } from '@/stations/CookingStation';

/** 油鍋 — accepts fried items (薯條 / 炸雞). */
export class FryerStation extends CookingStation {
  constructor(layout: StationLayout) {
    super(
      'fryer',
      layout,
      {
        color: 0x6b7078,
        label: '油鍋',
        hoverHint: '油鍋 · 放入炸物',
        bodyHeight: 0.55,
      },
      GAME_BALANCE.fryer.capacity,
    );
    this.addOilSurface(layout);
  }

  private addOilSurface(layout: StationLayout): void {
    const oilGeo = new THREE.BoxGeometry(layout.width - 0.4, 0.06, layout.depth - 0.4);
    const oilMat = new THREE.MeshStandardMaterial({
      color: 0xc98a2b,
      roughness: 0.35,
      metalness: 0.2,
    });
    const oil = new THREE.Mesh(oilGeo, oilMat);
    oil.position.set(0, this.topY - layout.position.y + 0.02, 0);
    oil.receiveShadow = true;
    this.root.add(oil);
  }
}

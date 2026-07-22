import * as THREE from 'three';
import type { IngredientShape } from '@/data/types';

export interface ShapeBuild {
  geometry: THREE.BufferGeometry;
  /** Half the item's vertical extent — mesh is raised so its base sits at y=0. */
  baseOffset: number;
}

/** Builds the placeholder low-poly geometry for an ingredient shape. */
export function buildShape(shape: IngredientShape): ShapeBuild {
  switch (shape) {
    case 'patty':
      return { geometry: new THREE.CylinderGeometry(0.42, 0.42, 0.22, 20), baseOffset: 0.11 };
    case 'bunBottom':
      return { geometry: new THREE.CylinderGeometry(0.46, 0.42, 0.24, 20), baseOffset: 0.12 };
    case 'bunTop': {
      const geo = new THREE.SphereGeometry(0.48, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
      geo.scale(1, 0.62, 1);
      return { geometry: geo, baseOffset: 0 };
    }
    case 'slice':
      return { geometry: new THREE.BoxGeometry(0.72, 0.06, 0.72), baseOffset: 0.03 };
    case 'leaf':
      return { geometry: new THREE.CylinderGeometry(0.52, 0.52, 0.1, 8), baseOffset: 0.05 };
    case 'round':
      return { geometry: new THREE.CylinderGeometry(0.4, 0.4, 0.08, 16), baseOffset: 0.04 };
    case 'stick':
      return { geometry: new THREE.BoxGeometry(0.5, 0.42, 0.42), baseOffset: 0.21 };
    case 'nugget':
      return { geometry: new THREE.IcosahedronGeometry(0.4, 0), baseOffset: 0.32 };
    default:
      return { geometry: new THREE.BoxGeometry(0.5, 0.5, 0.5), baseOffset: 0.25 };
  }
}

/** True for shapes that look better with faceted (low-poly) shading. */
export function isFlatShaded(shape: IngredientShape): boolean {
  return shape === 'nugget' || shape === 'leaf';
}

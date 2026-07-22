import * as THREE from 'three';
import type { StationId } from '@/data/types';

/**
 * Technical / scene configuration: DOM ids, palette, camera framing and the
 * fixed kitchen layout. (Gameplay tuning lives in data/gameBalance.ts.)
 */

export const CANVAS_ID = 'game-canvas';
export const UI_ROOT_ID = 'ui-root';

export const COLORS = {
  sky: 0x2b3140,
  floor: 0x39404e,
  counter: 0xd9e0ea,
  counterEdge: 0xb7c0cd,
  wall: 0x323a49,
  hover: 0x6cf0ff,
  dropOk: 0x62d96b,
} as const;

export const CAMERA = {
  fov: 42,
  near: 0.1,
  far: 100,
  position: new THREE.Vector3(0, 13.5, 13.5),
  lookAt: new THREE.Vector3(0, 0.4, -0.4),
} as const;

/** Height (world units) at which a dragged item is carried under the cursor. */
export const CARRY_HEIGHT = 1.9;

/** Y of the counter top surface — where stations and items rest. */
export const COUNTER_TOP_Y = 1.0;

/**
 * Plane used for drop hit-testing. Roughly the station tops so the cursor's
 * projection lands where a station *visually* is (the item still renders higher,
 * at CARRY_HEIGHT). Testing on the carry plane instead would create a parallax
 * dead-zone along the camera-side edge of every station.
 */
export const DROP_PLANE_Y = COUNTER_TOP_Y + 0.5;

export interface StationLayout {
  readonly position: THREE.Vector3;
  readonly width: number;
  readonly depth: number;
}

/** Fixed positions of each station on the counter (XZ plane, y at counter top). */
export const STATION_LAYOUT: Readonly<Record<StationId, StationLayout>> = {
  storage: { position: new THREE.Vector3(-5.6, COUNTER_TOP_Y, 0.4), width: 2.8, depth: 5.6 },
  grill: { position: new THREE.Vector3(-2.3, COUNTER_TOP_Y, -2.8), width: 3.0, depth: 2.2 },
  fryer: { position: new THREE.Vector3(2.3, COUNTER_TOP_Y, -2.8), width: 3.0, depth: 2.2 },
  assembly: { position: new THREE.Vector3(0.0, COUNTER_TOP_Y, 1.6), width: 3.2, depth: 2.6 },
  serving: { position: new THREE.Vector3(5.4, COUNTER_TOP_Y, -0.6), width: 2.4, depth: 2.4 },
  trash: { position: new THREE.Vector3(5.4, COUNTER_TOP_Y, 3.2), width: 1.8, depth: 1.8 },
} as const;

/** Where freshly spawned ingredients appear (in front of the storage bins). */
export const SPAWN_POINT = new THREE.Vector3(-5.6, COUNTER_TOP_Y, 3.4);

/** Safety cap on simultaneously spawned loose items. */
export const MAX_LOOSE_ITEMS = 24;

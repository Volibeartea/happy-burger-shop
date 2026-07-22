import type * as THREE from 'three';
import { SceneManager } from '@/scene/SceneManager';
import { InputManager } from '@/input/InputManager';
import { InteractionRegistry } from '@/input/InteractionRegistry';
import { PointerController } from '@/input/PointerController';
import { DragController } from '@/input/DragController';
import { GameLoop } from '@/game/GameLoop';
import { GameState } from '@/game/GameState';
import { HUD } from '@/ui/HUD';
import { BrowserPlatform } from '@/platform/BrowserPlatform';
import { SaveService } from '@/platform/SaveService';
import { IngredientEntity } from '@/entities/IngredientEntity';
import { getIngredient, SPAWNABLE_INGREDIENT_IDS } from '@/data/ingredients';
import { MAX_LOOSE_ITEMS, SPAWN_POINT, STATION_LAYOUT } from '@/game/GameConfig';
import type { GameContext } from '@/game/GameContext';
import type { Draggable } from '@/input/InteractionTypes';
import type { Station } from '@/stations/Station';
import { FryerStation } from '@/stations/FryerStation';
import { GrillStation } from '@/stations/GrillStation';
import { AssemblyStation } from '@/stations/AssemblyStation';
import { StorageStation } from '@/stations/StorageStation';
import { ServingStation } from '@/stations/ServingStation';
import { TrashStation } from '@/stations/TrashStation';

/**
 * Top-level orchestrator. Wires the scene, input, stations, HUD and loop, and
 * implements GameContext so stations can spawn / remove items.
 */
export class Game implements GameContext {
  private readonly sceneManager: SceneManager;
  private readonly input: InputManager;
  private readonly registry = new InteractionRegistry();
  private readonly pointer: PointerController;
  private readonly hud: HUD;
  private readonly loop: GameLoop;
  private readonly state: GameState;
  private readonly platform: BrowserPlatform;
  private readonly save: SaveService;
  private readonly entities = new Set<IngredientEntity>();
  private spawnCounter = 0;

  constructor(canvas: HTMLCanvasElement, uiRoot: HTMLElement) {
    this.platform = new BrowserPlatform();
    this.save = new SaveService(this.platform);
    this.state = new GameState(this.save.load());

    this.sceneManager = new SceneManager(canvas);
    this.input = new InputManager(canvas, this.sceneManager.camera);
    this.hud = new HUD(uiRoot, this.state, this.platform);
    this.pointer = new PointerController(this.input, this.registry, this.hud, canvas);
    // Self-wires onto InputManager's pointer callbacks; no stored reference needed.
    new DragController(this.input, this.registry, this.pointer, canvas);

    this.buildStations();
    this.loop = new GameLoop(this.update);
  }

  get scene(): THREE.Scene {
    return this.sceneManager.scene;
  }

  start(): void {
    this.loop.start();
  }

  private readonly update = (dt: number): void => {
    for (const entity of this.entities) entity.update(dt);
    this.sceneManager.render();
  };

  // --- GameContext ---

  spawnIngredient(defId: string): IngredientEntity | null {
    if (this.entities.size >= MAX_LOOSE_ITEMS) {
      console.warn('[Game] Loose-item cap reached — ignoring spawn.');
      return null;
    }
    const entity = new IngredientEntity(getIngredient(defId));
    // Lay spawns out on a small non-overlapping grid in front of the storage.
    const slot = this.spawnCounter % 12;
    const col = slot % 3;
    const row = Math.floor(slot / 3);
    this.spawnCounter += 1;
    const position = SPAWN_POINT.clone();
    position.x += (col - 1) * 0.85;
    position.z += row * 0.6;
    entity.setPosition(position);

    this.scene.add(entity.root);
    this.registry.addInteractive(entity);
    this.entities.add(entity);
    return entity;
  }

  removeItem(item: Draggable): void {
    this.registry.removeInteractive(item);
    this.entities.delete(item as IngredientEntity);
    item.dispose();
  }

  // --- Setup ---

  private addStation(station: Station): void {
    this.scene.add(station.root);
    this.registry.addInteractive(station);
    this.registry.addDropTarget(station);
  }

  private buildStations(): void {
    this.addStation(new GrillStation(STATION_LAYOUT.grill));
    this.addStation(new FryerStation(STATION_LAYOUT.fryer));
    this.addStation(new AssemblyStation(STATION_LAYOUT.assembly));
    this.addStation(new ServingStation(STATION_LAYOUT.serving, this));
    this.addStation(new TrashStation(STATION_LAYOUT.trash, this));

    // Storage is decor + clickable bins, not a drop target.
    const storage = new StorageStation(STATION_LAYOUT.storage, [...SPAWNABLE_INGREDIENT_IDS], (id) => {
      this.spawnIngredient(id);
    });
    this.scene.add(storage.root);
    for (const bin of storage.getBins()) this.registry.addInteractive(bin);
  }
}

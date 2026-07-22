import * as THREE from 'three';
import { SceneManager } from '@/scene/SceneManager';
import { InputManager } from '@/input/InputManager';
import { InteractionRegistry } from '@/input/InteractionRegistry';
import { PointerController } from '@/input/PointerController';
import { DragController } from '@/input/DragController';
import { GameLoop } from '@/game/GameLoop';
import { GameState } from '@/game/GameState';
import { HUD } from '@/ui/HUD';
import { StartScreen } from '@/ui/StartScreen';
import { ResultScreen } from '@/ui/ResultScreen';
import { Overlay } from '@/ui/Overlay';
import { BrowserPlatform } from '@/platform/BrowserPlatform';
import { SaveService } from '@/platform/SaveService';
import { IngredientEntity } from '@/entities/IngredientEntity';
import { Burger } from '@/entities/Burger';
import { isCookable } from '@/entities/Cookable';
import type { Serving } from '@/entities/Servable';
import type { CustomerOrder } from '@/entities/CustomerOrder';
import type { CookState } from '@/data/types';
import { getIngredient, SPAWNABLE_INGREDIENT_IDS } from '@/data/ingredients';
import { RecipeManager } from '@/systems/RecipeManager';
import { ScoreManager } from '@/systems/ScoreManager';
import { OrderManager } from '@/systems/OrderManager';
import { COUNTER_TOP_Y, MAX_LOOSE_ITEMS, SPAWN_POINT, STATION_LAYOUT } from '@/game/GameConfig';
import type { GameContext } from '@/game/GameContext';
import type { Draggable } from '@/input/InteractionTypes';
import type { Updatable } from '@/game/Updatable';
import type { Station } from '@/stations/Station';
import { FryerStation } from '@/stations/FryerStation';
import { GrillStation } from '@/stations/GrillStation';
import { AssemblyStation } from '@/stations/AssemblyStation';
import { StorageStation } from '@/stations/StorageStation';
import { ServingStation } from '@/stations/ServingStation';
import { TrashStation } from '@/stations/TrashStation';

/** A live, updatable, draggable world object (loose ingredient or burger). */
type WorldItem = Draggable & Updatable;

/**
 * Top-level orchestrator. Owns the scene/input/UI and the game flow
 * (menu → playing ⇄ paused → result), and implements GameContext so stations
 * can spawn / remove items.
 */
export class Game implements GameContext {
  private readonly sceneManager: SceneManager;
  private readonly input: InputManager;
  private readonly registry = new InteractionRegistry();
  private readonly pointer: PointerController;
  private readonly hud: HUD;
  private readonly startScreen: StartScreen;
  private readonly resultScreen: ResultScreen;
  private readonly pauseOverlay: Overlay;
  private readonly loop: GameLoop;
  private readonly state: GameState;
  private readonly platform: BrowserPlatform;
  private readonly save: SaveService;
  private readonly recipes = new RecipeManager();
  private readonly scoreManager: ScoreManager;
  private readonly orderManager: OrderManager;
  private readonly entities = new Set<WorldItem>();

  private grill!: GrillStation;
  private fryer!: FryerStation;
  private assembly!: AssemblyStation;
  private spawnCounter = 0;

  constructor(canvas: HTMLCanvasElement, uiRoot: HTMLElement) {
    this.platform = new BrowserPlatform();
    this.save = new SaveService(this.platform);
    this.state = new GameState(this.save.load());
    this.scoreManager = new ScoreManager(this.state);

    this.sceneManager = new SceneManager(canvas);
    this.input = new InputManager(canvas, this.sceneManager.camera);
    this.hud = new HUD(uiRoot, this.state, this.platform, { onPause: () => this.togglePause() });
    this.pointer = new PointerController(this.input, this.registry, this.hud, canvas);
    // Self-wires onto InputManager's pointer callbacks; no stored reference needed.
    new DragController(this.input, this.registry, this.pointer, canvas);

    this.orderManager = new OrderManager(this.recipes, {
      onComplete: (order) => this.onOrderComplete(order),
      onWrong: () => this.onWrongServe(),
      onTimeout: (order) => this.onOrderTimeout(order),
      onChange: (view) => this.hud.renderOrders(view),
    });

    this.startScreen = new StartScreen(uiRoot, () => this.startGame());
    this.resultScreen = new ResultScreen(uiRoot, () => this.startGame());
    this.pauseOverlay = this.buildPauseOverlay(uiRoot);

    this.buildStations();
    this.loop = new GameLoop(this.update);
    this.startScreen.show();
  }

  get scene(): THREE.Scene {
    return this.sceneManager.scene;
  }

  start(): void {
    this.loop.start();
  }

  private readonly update = (dt: number): void => {
    if (this.state.phase === 'playing') {
      for (const entity of this.entities) entity.update(dt);

      this.state.timeLeftSec -= dt;
      if (this.state.timeLeftSec <= 0) {
        this.state.timeLeftSec = 0;
        this.hud.update(this.state);
        this.endGame();
      } else {
        this.orderManager.update(dt);
        this.hud.update(this.state);
        this.hud.updateOrderPatience(this.orderManager.patienceById());
        if (this.state.lives <= 0) this.endGame();
      }
    }
    this.sceneManager.render();
  };

  // --- Flow ---

  private startGame(): void {
    this.resetWorld();
    this.hud.clearOrders();
    this.state.reset();
    this.orderManager.reset();
    this.hud.update(this.state);
    this.hud.setPaused(false);
    this.startScreen.hide();
    this.resultScreen.hide();
    this.pauseOverlay.hide();
  }

  private endGame(): void {
    if (this.state.phase !== 'playing') return;
    this.state.phase = 'result';
    this.hud.clearOrders();
    const isNewBest = this.state.score > this.state.bestScore;
    this.state.bestScore = this.save.updateHighScore(this.state.score);
    this.resultScreen.show({
      score: this.state.score,
      money: this.state.money,
      completed: this.state.completed,
      wrong: this.state.wrong,
      timeout: this.state.timeout,
      maxCombo: this.state.maxCombo,
      avgServeSec: this.state.averageServeTimeSec,
      bestScore: this.state.bestScore,
      isNewBest,
    });
  }

  private togglePause(): void {
    if (this.state.phase === 'playing') {
      this.state.phase = 'paused';
      this.pauseOverlay.show();
      this.hud.setPaused(true);
    } else if (this.state.phase === 'paused') {
      this.state.phase = 'playing';
      this.pauseOverlay.hide();
      this.hud.setPaused(false);
    }
  }

  // --- Order hooks ---

  private onOrderComplete(order: CustomerOrder): void {
    const gained = this.scoreManager.serveCorrect(order.recipe, order.patience01, order.age);
    this.hud.update(this.state);
    this.hud.showToast(`✓ ${order.recipe.displayName}  +${gained}`, true);
  }

  private onWrongServe(): void {
    this.scoreManager.serveWrong();
    this.hud.update(this.state);
    this.hud.showToast('✗ 沒有對應的訂單', false);
  }

  private onOrderTimeout(order: CustomerOrder): void {
    // endGame is checked in the update loop after orderManager.update returns,
    // so a life-ending timeout can't spawn a stray order mid-update.
    this.scoreManager.orderTimeout();
    this.hud.update(this.state);
    this.hud.showToast(`⌛ ${order.recipe.displayName} 顧客離開了`, false);
  }

  private submitServing(serving: Serving): void {
    if (this.state.phase !== 'playing') return;
    this.orderManager.submit(serving);
  }

  // --- GameContext ---

  spawnIngredient(defId: string): IngredientEntity | null {
    if (this.entities.size >= MAX_LOOSE_ITEMS) {
      console.warn('[Game] Loose-item cap reached — ignoring spawn.');
      return null;
    }
    const entity = new IngredientEntity(getIngredient(defId));
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
    this.entities.delete(item as WorldItem);
    item.dispose();
  }

  // --- Assembly → Burger ---

  private packageAssembly(): void {
    if (!this.assembly.hasItems()) return;
    const items = this.assembly.takeAll();
    const components = items.map((item) => ({
      id: item.definitionId,
      cookState: isCookable(item) ? item.cookState : ('raw' as CookState),
    }));
    for (const item of items) this.removeItem(item);

    const burger = new Burger(components);
    const p = STATION_LAYOUT.assembly.position;
    burger.setPosition(new THREE.Vector3(p.x, COUNTER_TOP_Y, p.z + 2.4));
    this.scene.add(burger.root);
    this.registry.addInteractive(burger);
    this.entities.add(burger);
  }

  private resetWorld(): void {
    for (const entity of [...this.entities]) {
      this.registry.removeInteractive(entity);
      entity.dispose();
    }
    this.entities.clear();
    this.grill.reset();
    this.fryer.reset();
    this.assembly.reset();
    this.spawnCounter = 0;
  }

  // --- Setup ---

  private addStation(station: Station): void {
    this.scene.add(station.root);
    this.registry.addInteractive(station);
    this.registry.addDropTarget(station);
  }

  private buildStations(): void {
    this.grill = new GrillStation(STATION_LAYOUT.grill);
    this.fryer = new FryerStation(STATION_LAYOUT.fryer);
    this.assembly = new AssemblyStation(STATION_LAYOUT.assembly, () => this.packageAssembly());
    this.addStation(this.grill);
    this.addStation(this.fryer);
    this.addStation(this.assembly);
    this.registry.addInteractive(this.assembly.getPlate());

    this.addStation(new ServingStation(STATION_LAYOUT.serving, this, (serving) => this.submitServing(serving)));
    this.addStation(new TrashStation(STATION_LAYOUT.trash, this));

    // Storage is decor + clickable bins, not a drop target.
    const storage = new StorageStation(STATION_LAYOUT.storage, [...SPAWNABLE_INGREDIENT_IDS], (id) => {
      this.spawnIngredient(id);
    });
    this.scene.add(storage.root);
    for (const bin of storage.getBins()) this.registry.addInteractive(bin);
  }

  private buildPauseOverlay(uiRoot: HTMLElement): Overlay {
    const overlay = new Overlay(uiRoot, 'pause-screen');
    const title = document.createElement('h2');
    title.className = 'screen-title';
    title.textContent = '⏸ 已暫停';
    const btn = document.createElement('button');
    btn.className = 'screen-btn';
    btn.type = 'button';
    btn.textContent = '繼續遊戲';
    btn.addEventListener('click', () => this.togglePause());
    overlay.panel.append(title, btn);
    return overlay;
  }
}

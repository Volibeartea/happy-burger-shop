import type { RecipeDefinition } from '@/data/types';
import type { RecipeManager } from '@/systems/RecipeManager';
import type { Serving } from '@/entities/Servable';
import { RECIPES } from '@/data/recipes';
import { GAME_BALANCE } from '@/data/gameBalance';
import { CustomerOrder } from '@/entities/CustomerOrder';

/** Immutable snapshot of an order for the UI. */
export interface OrderView {
  id: number;
  recipeId: string;
  displayName: string;
  ingredientIds: string[];
  patience01: number;
  baseScore: number;
  baseReward: number;
}

export interface OrderHooks {
  onComplete(order: CustomerOrder): void;
  onWrong(): void;
  onTimeout(order: CustomerOrder): void;
  /** Called when the set of orders changes (add / remove). */
  onChange(view: OrderView[]): void;
}

/**
 * Manages up to `maxOrders` customer orders: spawn cadence, patience countdown,
 * timeouts, and auto-matching a served dish to the first matching order.
 */
export class OrderManager {
  private orders: CustomerOrder[] = [];
  private nextId = 1;
  private spawnTimer = 0;

  constructor(
    private readonly recipes: RecipeManager,
    private readonly hooks: OrderHooks,
    private readonly catalogue: readonly RecipeDefinition[] = RECIPES,
  ) {}

  reset(): void {
    this.orders = [];
    this.nextId = 1;
    this.spawnTimer = 0.6; // first order appears shortly after start
    this.hooks.onChange(this.view());
  }

  update(dt: number): void {
    let changed = false;
    for (const order of this.orders) order.tick(dt);

    const expired = this.orders.filter((o) => o.expired);
    if (expired.length > 0) {
      this.orders = this.orders.filter((o) => !o.expired);
      for (const order of expired) this.hooks.onTimeout(order);
      changed = true;
    }

    if (this.orders.length < GAME_BALANCE.maxOrders) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawn();
        this.spawnTimer = GAME_BALANCE.order.spawnIntervalSec;
        changed = true;
      }
    }

    if (changed) this.hooks.onChange(this.view());
  }

  private spawn(): void {
    const recipe = this.catalogue[Math.floor(Math.random() * this.catalogue.length)];
    const { minPatienceSec, maxPatienceSec } = GAME_BALANCE.order;
    const patience = minPatienceSec + Math.random() * (maxPatienceSec - minPatienceSec);
    this.orders.push(new CustomerOrder(this.nextId++, recipe, patience));
  }

  /** Auto-match a served dish to the first matching active order. */
  submit(serving: Serving): void {
    const recipe = serving.allReady ? this.recipes.match(serving.ids) : null;
    const idx = recipe ? this.orders.findIndex((o) => o.recipe.id === recipe.id) : -1;
    if (idx >= 0) {
      const [order] = this.orders.splice(idx, 1);
      this.hooks.onComplete(order);
      this.hooks.onChange(this.view());
    } else {
      this.hooks.onWrong();
    }
  }

  /** Live patience per order id — for animating bars without rebuilding cards. */
  patienceById(): Map<number, number> {
    const map = new Map<number, number>();
    for (const order of this.orders) map.set(order.id, order.patience01);
    return map;
  }

  private view(): OrderView[] {
    return this.orders.map((o) => ({
      id: o.id,
      recipeId: o.recipe.id,
      displayName: o.recipe.displayName,
      ingredientIds: o.recipe.ingredients,
      patience01: o.patience01,
      baseScore: o.recipe.baseScore,
      baseReward: o.recipe.baseReward,
    }));
  }
}

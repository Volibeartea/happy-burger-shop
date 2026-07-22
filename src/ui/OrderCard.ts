import type { OrderView } from '@/systems/OrderManager';
import { INGREDIENTS_BY_ID } from '@/data/ingredients';

function iconsFor(ids: string[]): string {
  return ids.map((id) => INGREDIENTS_BY_ID.get(id)?.icon ?? '•').join(' ');
}

/** One customer order card (name, ingredient icons, reward, patience bar). */
export class OrderCard {
  readonly root: HTMLDivElement;
  private readonly bar: HTMLDivElement;

  constructor(view: OrderView) {
    this.root = document.createElement('div');
    this.root.className = 'order-card';

    const title = document.createElement('div');
    title.className = 'order-title';
    title.textContent = view.displayName;

    const icons = document.createElement('div');
    icons.className = 'order-icons';
    icons.textContent = iconsFor(view.ingredientIds);

    const reward = document.createElement('div');
    reward.className = 'order-reward';
    reward.textContent = `⭐ ${view.baseScore}　💰 ${view.baseReward}`;

    const barWrap = document.createElement('div');
    barWrap.className = 'order-bar';
    this.bar = document.createElement('div');
    this.bar.className = 'order-bar-fill';
    barWrap.appendChild(this.bar);

    this.root.append(title, icons, reward, barWrap);
    this.setPatience(view.patience01);
  }

  setPatience(frac: number): void {
    const clamped = Math.max(0, Math.min(1, frac));
    this.bar.style.width = `${clamped * 100}%`;
    // Green (calm) → red (urgent).
    this.bar.style.background = `hsl(${120 * clamped}, 72%, 48%)`;
    this.root.classList.toggle('urgent', clamped < 0.25);
  }
}

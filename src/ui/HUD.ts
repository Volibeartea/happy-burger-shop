import type { GameState } from '@/game/GameState';
import type { PlatformService } from '@/platform/PlatformService';
import type { TooltipHost } from '@/input/PointerController';
import type { OrderView } from '@/systems/OrderManager';
import { GAME_BALANCE } from '@/data/gameBalance';
import { OrderCard } from '@/ui/OrderCard';

export interface HudHandlers {
  onPause: () => void;
}

function chip(text: string, className: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = `hud-chip ${className}`;
  el.textContent = text;
  return el;
}

function formatTime(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

/**
 * HTML/CSS overlay: stats bar (time / score / money / lives / combo), the order
 * list, pause + fullscreen controls, the hover tooltip and serve toasts.
 */
export class HUD implements TooltipHost {
  private readonly timeEl: HTMLDivElement;
  private readonly scoreEl: HTMLDivElement;
  private readonly moneyEl: HTMLDivElement;
  private readonly livesEl: HTMLDivElement;
  private readonly comboEl: HTMLDivElement;
  private readonly pauseBtn: HTMLButtonElement;
  private readonly ordersEl: HTMLDivElement;
  private readonly tooltipEl: HTMLDivElement;
  private readonly toastEl: HTMLDivElement;
  private toastTimer = 0;
  private readonly orderCards = new Map<number, OrderCard>();

  constructor(
    root: HTMLElement,
    state: GameState,
    platform: PlatformService,
    handlers: HudHandlers,
  ) {
    const topbar = document.createElement('div');
    topbar.className = 'hud-topbar';
    topbar.appendChild(chip('🍔', 'hud-title'));

    const stats = document.createElement('div');
    stats.className = 'hud-stats';
    this.timeEl = chip('3:00', 'hud-time');
    this.scoreEl = chip('0', 'hud-score');
    this.moneyEl = chip('💰 0', 'hud-money');
    this.livesEl = chip('❤❤❤', 'hud-lives');
    this.comboEl = chip('', 'hud-combo');
    stats.append(this.timeEl, this.scoreEl, this.moneyEl, this.livesEl, this.comboEl);
    topbar.appendChild(stats);

    const controls = document.createElement('div');
    controls.className = 'hud-controls';
    this.pauseBtn = document.createElement('button');
    this.pauseBtn.className = 'hud-btn';
    this.pauseBtn.type = 'button';
    this.pauseBtn.textContent = '⏸';
    this.pauseBtn.addEventListener('click', handlers.onPause);

    const fsBtn = document.createElement('button');
    fsBtn.className = 'hud-btn';
    fsBtn.type = 'button';
    fsBtn.textContent = '⛶';
    fsBtn.addEventListener('click', () => {
      void platform.toggleFullscreen();
    });
    controls.append(this.pauseBtn, fsBtn);
    topbar.appendChild(controls);
    root.appendChild(topbar);

    this.ordersEl = document.createElement('div');
    this.ordersEl.className = 'orders';
    root.appendChild(this.ordersEl);

    this.tooltipEl = document.createElement('div');
    this.tooltipEl.className = 'hud-tooltip';
    this.tooltipEl.style.display = 'none';
    root.appendChild(this.tooltipEl);

    this.toastEl = document.createElement('div');
    this.toastEl.className = 'hud-toast';
    root.appendChild(this.toastEl);

    this.update(state);
  }

  update(state: GameState): void {
    this.timeEl.textContent = `⏱ ${formatTime(state.timeLeftSec)}`;
    this.scoreEl.textContent = `⭐ ${state.score}`;
    this.moneyEl.textContent = `💰 ${state.money}`;
    const max = GAME_BALANCE.startingLives;
    const lives = Math.max(0, state.lives);
    this.livesEl.textContent = '❤'.repeat(lives) + '🤍'.repeat(Math.max(0, max - lives));
    this.comboEl.textContent = state.combo >= 2 ? `🔥 x${state.combo}` : '';
  }

  setPaused(paused: boolean): void {
    this.pauseBtn.textContent = paused ? '▶' : '⏸';
  }

  renderOrders(view: OrderView[]): void {
    const seen = new Set<number>();
    for (const v of view) {
      seen.add(v.id);
      const existing = this.orderCards.get(v.id);
      if (existing) {
        existing.setPatience(v.patience01);
      } else {
        const card = new OrderCard(v);
        this.orderCards.set(v.id, card);
        this.ordersEl.appendChild(card.root);
      }
    }
    for (const [id, card] of this.orderCards) {
      if (!seen.has(id)) {
        card.root.remove();
        this.orderCards.delete(id);
      }
    }
  }

  updateOrderPatience(map: Map<number, number>): void {
    for (const [id, frac] of map) this.orderCards.get(id)?.setPatience(frac);
  }

  clearOrders(): void {
    for (const card of this.orderCards.values()) card.root.remove();
    this.orderCards.clear();
  }

  showToast(text: string, ok = true): void {
    this.toastEl.textContent = text;
    this.toastEl.className = `hud-toast ${ok ? 'ok' : 'bad'} show`;
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.toastEl.classList.remove('show');
    }, 1600);
  }

  showTooltip(text: string, clientX: number, clientY: number): void {
    this.tooltipEl.textContent = text;
    this.tooltipEl.style.display = 'block';
    this.tooltipEl.style.left = `${clientX + 14}px`;
    this.tooltipEl.style.top = `${clientY + 16}px`;
  }

  hideTooltip(): void {
    this.tooltipEl.style.display = 'none';
  }
}

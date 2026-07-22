import type { GameState } from '@/game/GameState';
import type { PlatformService } from '@/platform/PlatformService';
import type { TooltipHost } from '@/input/PointerController';

function chip(text: string, className: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = `hud-chip ${className}`;
  el.textContent = text;
  return el;
}

/**
 * HTML/CSS overlay on top of the WebGL canvas. Phase 1: title bar, best score,
 * fullscreen toggle, a controls panel and the hover tooltip. The gameplay HUD
 * (time / score / lives / combo / orders) is filled in during Phase 4.
 */
export class HUD implements TooltipHost {
  private readonly tooltipEl: HTMLDivElement;

  constructor(root: HTMLElement, state: GameState, platform: PlatformService) {
    const topbar = document.createElement('div');
    topbar.className = 'hud-topbar';
    topbar.appendChild(chip('🍔 Happy Burger Shop', 'hud-title'));
    topbar.appendChild(chip('Phase 2 · Cooking', 'hud-phase'));
    topbar.appendChild(chip(`最佳 ${state.bestScore}`, 'hud-best'));

    const fsBtn = document.createElement('button');
    fsBtn.className = 'hud-btn';
    fsBtn.type = 'button';
    fsBtn.textContent = '⛶ 全螢幕';
    fsBtn.addEventListener('click', () => {
      void platform.toggleFullscreen();
    });
    topbar.appendChild(fsBtn);
    root.appendChild(topbar);

    const help = document.createElement('div');
    help.className = 'hud-help';
    help.innerHTML = [
      '<strong>操作說明</strong>',
      '• 點擊左側 <b>食材區</b> 托盤 → 生成食材',
      '• 漢堡肉拖到 <b>煎台</b>：<b>點擊翻面</b>，兩面煎到 <b>✓完美</b>',
      '• 炸雞 / 薯條拖到 <b>油鍋</b>，完美時取出（過久會 <b>燒焦</b>）',
      '• 拖到 <b>出餐區</b> 送餐、<b>垃圾桶</b> 丟棄；無效放置自動彈回',
    ]
      .map((line, i) => (i === 0 ? line : `<span>${line}</span>`))
      .join('');
    root.appendChild(help);

    this.tooltipEl = document.createElement('div');
    this.tooltipEl.className = 'hud-tooltip';
    this.tooltipEl.style.display = 'none';
    root.appendChild(this.tooltipEl);
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

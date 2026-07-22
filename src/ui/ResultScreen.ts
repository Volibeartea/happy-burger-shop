import { Overlay } from '@/ui/Overlay';

export interface ResultStats {
  score: number;
  money: number;
  completed: number;
  wrong: number;
  timeout: number;
  maxCombo: number;
  avgServeSec: number;
  bestScore: number;
  isNewBest: boolean;
}

function row(label: string, value: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'result-row';
  const l = document.createElement('span');
  l.className = 'result-label';
  l.textContent = label;
  const v = document.createElement('span');
  v.className = 'result-value';
  v.textContent = value;
  el.append(l, v);
  return el;
}

/** End-of-round summary with a restart button. */
export class ResultScreen {
  private readonly overlay: Overlay;
  private readonly titleEl: HTMLHeadingElement;
  private readonly body: HTMLDivElement;

  constructor(parent: HTMLElement, onRestart: () => void) {
    this.overlay = new Overlay(parent, 'result-screen');

    this.titleEl = document.createElement('h2');
    this.titleEl.className = 'screen-title';

    this.body = document.createElement('div');
    this.body.className = 'result-stats';

    const btn = document.createElement('button');
    btn.className = 'screen-btn';
    btn.type = 'button';
    btn.textContent = '重新開始';
    btn.addEventListener('click', onRestart);

    this.overlay.panel.append(this.titleEl, this.body, btn);
  }

  show(stats: ResultStats): void {
    this.titleEl.textContent = stats.isNewBest ? '🎉 新紀錄！' : '結算';
    this.body.replaceChildren(
      row('總分', `${stats.score}`),
      row('獲得金錢', `💰 ${stats.money}`),
      row('完成訂單', `${stats.completed}`),
      row('錯誤出餐', `${stats.wrong}`),
      row('超時訂單', `${stats.timeout}`),
      row('最高 Combo', `🔥 ${stats.maxCombo}`),
      row('平均出餐時間', stats.completed > 0 ? `${stats.avgServeSec.toFixed(1)} 秒` : '—'),
      row('最佳紀錄', `${stats.bestScore}`),
    );
    this.overlay.show();
  }

  hide(): void {
    this.overlay.hide();
  }
}

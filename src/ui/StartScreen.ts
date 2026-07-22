import { Overlay } from '@/ui/Overlay';
import { GAME_BALANCE } from '@/data/gameBalance';

/** Opening screen with a start button. */
export class StartScreen {
  private readonly overlay: Overlay;

  constructor(parent: HTMLElement, onStart: () => void) {
    this.overlay = new Overlay(parent, 'start-screen');

    const title = document.createElement('h1');
    title.className = 'screen-title';
    title.textContent = '🍔 Happy Burger Shop';

    const sub = document.createElement('p');
    sub.className = 'screen-sub';
    sub.textContent = `限時 ${GAME_BALANCE.roundDurationSec} 秒 · ${GAME_BALANCE.startingLives} 條命 · 最多 ${GAME_BALANCE.maxOrders} 張訂單`;

    const how = document.createElement('div');
    how.className = 'screen-how';
    how.innerHTML = [
      '點擊 <b>食材區</b> 拿食材 → <b>煎台/油鍋</b> 烹調（漢堡肉點擊翻面）',
      '材料放 <b>組裝台</b> → 點 <b>打包</b> → 拖到 <b>出餐區</b> 交給對應訂單',
      '越快出餐分數越高，連續正確累積 <b>Combo</b>；訂單超時會失去生命',
    ]
      .map((t) => `<span>${t}</span>`)
      .join('');

    const btn = document.createElement('button');
    btn.className = 'screen-btn';
    btn.type = 'button';
    btn.textContent = '開始遊戲';
    btn.addEventListener('click', onStart);

    this.overlay.panel.append(title, sub, how, btn);
  }

  show(): void {
    this.overlay.show();
  }

  hide(): void {
    this.overlay.hide();
  }
}

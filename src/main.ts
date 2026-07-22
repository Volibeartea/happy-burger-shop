import '@/styles/main.css';
import { Game } from '@/game/Game';
import { CANVAS_ID, UI_ROOT_ID } from '@/game/GameConfig';

const canvas = document.getElementById(CANVAS_ID);
const uiRoot = document.getElementById(UI_ROOT_ID);

if (!(canvas instanceof HTMLCanvasElement) || !uiRoot) {
  throw new Error('index.html is missing #game-canvas or #ui-root');
}

const game = new Game(canvas, uiRoot);
game.start();

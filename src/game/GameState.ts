import type { SaveData } from '@/platform/SaveService';
import { GAME_BALANCE } from '@/data/gameBalance';

export type GamePhase = 'menu' | 'playing' | 'paused' | 'result';

/** Central runtime state for a single round. */
export class GameState {
  phase: GamePhase = 'menu';
  score = 0;
  money = 0;
  lives: number = GAME_BALANCE.startingLives;
  combo = 0;
  maxCombo = 0;
  timeLeftSec: number = GAME_BALANCE.roundDurationSec;
  completed = 0;
  wrong = 0;
  timeout = 0;
  bestScore: number;

  private serveTimes: number[] = [];

  constructor(save: SaveData) {
    this.bestScore = save.highScore;
  }

  /** Reset everything for a fresh round and enter play. */
  reset(): void {
    this.phase = 'playing';
    this.score = 0;
    this.money = 0;
    this.lives = GAME_BALANCE.startingLives;
    this.combo = 0;
    this.maxCombo = 0;
    this.timeLeftSec = GAME_BALANCE.roundDurationSec;
    this.completed = 0;
    this.wrong = 0;
    this.timeout = 0;
    this.serveTimes = [];
  }

  recordServeTime(sec: number): void {
    this.serveTimes.push(sec);
  }

  get averageServeTimeSec(): number {
    if (this.serveTimes.length === 0) return 0;
    const total = this.serveTimes.reduce((a, b) => a + b, 0);
    return total / this.serveTimes.length;
  }
}

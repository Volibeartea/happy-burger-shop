import type { SaveData } from '@/platform/SaveService';
import { GAME_BALANCE } from '@/data/gameBalance';

/**
 * Central mutable runtime state. Phase 1 only surfaces `bestScore`; the round
 * fields (score/money/lives/combo/timeLeft) are wired into gameplay from
 * Phase 4 (orders & scoring).
 */
export class GameState {
  score = 0;
  money = 0;
  lives = GAME_BALANCE.startingLives;
  combo = 0;
  maxCombo = 0;
  timeLeftSec = GAME_BALANCE.roundDurationSec;
  running = false;

  readonly bestScore: number;

  constructor(save: SaveData) {
    this.bestScore = save.highScore;
  }
}

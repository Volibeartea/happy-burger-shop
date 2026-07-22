import type { GameState } from '@/game/GameState';
import type { RecipeDefinition } from '@/data/types';
import { GAME_BALANCE } from '@/data/gameBalance';

/** Applies the scoring / combo / lives rules to the GameState. */
export class ScoreManager {
  constructor(private readonly state: GameState) {}

  /** Correct serve. Returns the points gained (for feedback). */
  serveCorrect(recipe: RecipeDefinition, patience01: number, serveTimeSec: number): number {
    this.state.combo += 1;
    this.state.maxCombo = Math.max(this.state.maxCombo, this.state.combo);

    const mult = Math.min(
      1 + (this.state.combo - 1) * GAME_BALANCE.combo.multiplierStep,
      GAME_BALANCE.combo.maxMultiplier,
    );
    const speedBonus = Math.round(GAME_BALANCE.scoring.speedBonusMax * patience01);
    const gained = Math.round(recipe.baseScore * mult) + speedBonus;

    this.state.score += gained;
    this.state.money += recipe.baseReward;
    this.state.completed += 1;
    this.state.recordServeTime(serveTimeSec);
    return gained;
  }

  /** Wrong serve: breaks combo and applies a penalty. */
  serveWrong(): void {
    this.state.combo = 0;
    this.state.score = Math.max(0, this.state.score - GAME_BALANCE.scoring.wrongPenalty);
    this.state.wrong += 1;
  }

  /** A customer left because their order timed out. */
  orderTimeout(): void {
    this.state.combo = 0;
    this.state.lives = Math.max(0, this.state.lives - 1);
    this.state.timeout += 1;
  }
}

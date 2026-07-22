/**
 * Central gameplay tuning. Balance-only numbers live here so they can be tweaked
 * without hunting through logic. (Technical/scene constants live in GameConfig.)
 */
export const GAME_BALANCE = {
  /** Length of a single round in seconds (default: 3 minutes). */
  roundDurationSec: 180,
  /** Max simultaneous customer orders on screen. */
  maxOrders: 3,
  /** Player starts with this many lives. */
  startingLives: 3,

  order: {
    /** Patience window (seconds) granted when an order spawns. */
    minPatienceSec: 32,
    maxPatienceSec: 55,
    /** Gap between an order clearing and the next spawning. */
    spawnIntervalSec: 3.5,
  },

  combo: {
    /** Score multiplier gained per consecutive correct serve. */
    multiplierStep: 0.1,
    maxMultiplier: 2.5,
  },

  scoring: {
    /** Max bonus for a very fast serve (scaled by remaining patience). */
    speedBonusMax: 200,
    /** Points lost on a wrong serve. */
    wrongPenalty: 100,
  },

  /** Simultaneous item capacity of each cooking station. */
  fryer: { capacity: 4 },
  grill: { capacity: 4 },
} as const;

export type GameBalance = typeof GAME_BALANCE;

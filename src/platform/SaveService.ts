import type { PlatformService } from '@/platform/PlatformService';

export interface GameSettings {
  muted: boolean;
  volume: number; // 0..1
}

export interface SaveData {
  highScore: number;
  settings: GameSettings;
}

const SAVE_KEY = 'hbs.save.v1';

const DEFAULT_SAVE: SaveData = {
  highScore: 0,
  settings: { muted: false, volume: 0.8 },
};

/**
 * Persists save data through the platform storage layer. The browser build uses
 * localStorage; an Electron build can swap the underlying storage transparently.
 */
export class SaveService {
  constructor(private readonly platform: PlatformService) {}

  load(): SaveData {
    const raw = this.platform.storage.getItem(SAVE_KEY);
    if (!raw) return { ...DEFAULT_SAVE, settings: { ...DEFAULT_SAVE.settings } };
    try {
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      return {
        highScore: typeof parsed.highScore === 'number' ? parsed.highScore : 0,
        settings: {
          muted: parsed.settings?.muted ?? DEFAULT_SAVE.settings.muted,
          volume: parsed.settings?.volume ?? DEFAULT_SAVE.settings.volume,
        },
      };
    } catch {
      console.warn('[Save] Corrupt save data — resetting to defaults.');
      return { ...DEFAULT_SAVE, settings: { ...DEFAULT_SAVE.settings } };
    }
  }

  save(data: SaveData): void {
    this.platform.storage.setItem(SAVE_KEY, JSON.stringify(data));
  }

  /** Persists a new high score if it beats the stored one; returns the best. */
  updateHighScore(score: number): number {
    const data = this.load();
    if (score > data.highScore) {
      data.highScore = score;
      this.save(data);
    }
    return data.highScore;
  }

  saveSettings(settings: GameSettings): void {
    const data = this.load();
    data.settings = settings;
    this.save(data);
  }
}

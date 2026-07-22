import type { KeyValueStorage, PlatformService } from '@/platform/PlatformService';

/** In-memory fallback used when localStorage is unavailable (e.g. privacy mode). */
class MemoryStorage implements KeyValueStorage {
  private readonly map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
}

function resolveStorage(): KeyValueStorage {
  try {
    const probe = '__hbs_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    console.warn('[Platform] localStorage unavailable — using in-memory storage.');
    return new MemoryStorage();
  }
}

/** Browser implementation of the platform service (Phase 1 default). */
export class BrowserPlatform implements PlatformService {
  readonly name = 'browser';
  readonly storage: KeyValueStorage = resolveStorage();

  isFullscreen(): boolean {
    return document.fullscreenElement !== null;
  }

  async toggleFullscreen(): Promise<void> {
    try {
      if (this.isFullscreen()) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('[Platform] Fullscreen request failed:', err);
    }
  }
}

/**
 * Platform abstraction.
 *
 * The game core talks ONLY to these interfaces — never directly to Electron,
 * Node.js, `fs`, `path`, `process`, or `window.electron`. A future Electron
 * build supplies an alternate implementation (e.g. file-based storage) via a
 * secure preload/IPC bridge without touching gameplay code.
 */

/** Minimal synchronous key/value store (localStorage-shaped). */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface PlatformService {
  /** Human-readable platform name, e.g. 'browser' | 'electron'. */
  readonly name: string;
  /** Persistent key/value storage for save data and settings. */
  readonly storage: KeyValueStorage;

  isFullscreen(): boolean;
  toggleFullscreen(): Promise<void>;
}

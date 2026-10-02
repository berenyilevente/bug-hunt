import type { HuntSession } from './types.js';
/**
 * - `saved`             — the whole session is stored.
 * - `withoutScreenshots` — the quota could not hold the images; the notes are
 *                          stored, the screenshots live only in memory.
 * - `failed`            — storage is blocked; the session lives only in memory.
 */
export type DraftWrite = 'saved' | 'withoutScreenshots' | 'failed';
export declare function newSession(now?: Date): HuntSession;
/** The unsaved session left by an earlier page load, or `null` for none. */
export declare function readDraft(): HuntSession | null;
/**
 * Mirrors the session to localStorage so a reload, a locale switch or a
 * restarted dev server loses nothing. Screenshots are the heavy part: when the
 * quota refuses them, the notes are kept on their own.
 */
export declare function writeDraft(session: HuntSession): DraftWrite;
export declare function clearDraft(): void;

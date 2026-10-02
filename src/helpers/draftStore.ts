import { isHuntSession } from './guards.js';
import { DRAFT_STORAGE_KEY } from './labels.js';
import type { HuntSession } from './types.js';

/**
 * - `saved`             — the whole session is stored.
 * - `withoutScreenshots` — the quota could not hold the images; the notes are
 *                          stored, the screenshots live only in memory.
 * - `failed`            — storage is blocked; the session lives only in memory.
 */
export type DraftWrite = 'saved' | 'withoutScreenshots' | 'failed';

export function newSession(now: Date = new Date()): HuntSession {
  return { startedAt: now.toISOString(), bugs: [] };
}

/**
 * A draft saved before items had a kind holds only bugs: it reads back as
 * such rather than being thrown away on upgrade.
 */
function withKinds(value: unknown): unknown {
  if (
    typeof value !== 'object' ||
    value === null ||
    !Array.isArray((value as { bugs?: unknown }).bugs)
  ) {
    return value;
  }

  const session = value as { bugs: unknown[] };

  return {
    ...session,
    bugs: session.bugs.map((bug) =>
      typeof bug === 'object' && bug !== null && !('kind' in bug)
        ? { ...bug, kind: 'bug' }
        : bug
    ),
  };
}

/** The unsaved session left by an earlier page load, or `null` for none. */
export function readDraft(): HuntSession | null {
  try {
    const stored = window.localStorage.getItem(DRAFT_STORAGE_KEY);

    if (stored === null) {
      return null;
    }

    const parsed = withKinds(JSON.parse(stored));

    return isHuntSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function store(session: HuntSession): boolean {
  try {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

/**
 * Mirrors the session to localStorage so a reload, a locale switch or a
 * restarted dev server loses nothing. Screenshots are the heavy part: when the
 * quota refuses them, the notes are kept on their own.
 */
export function writeDraft(session: HuntSession): DraftWrite {
  if (store(session)) {
    return 'saved';
  }

  const withoutScreenshots = {
    ...session,
    bugs: session.bugs.map((bug) => ({ ...bug, screenshot: null })),
  };

  return store(withoutScreenshots) ? 'withoutScreenshots' : 'failed';
}

export function clearDraft(): void {
  try {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Blocked storage never held a draft to clear.
  }
}

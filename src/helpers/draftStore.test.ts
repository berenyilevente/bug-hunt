// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearDraft, readDraft, writeDraft } from './draftStore.js';
import { makeBug, makeSession } from './fixtures.js';
import { DRAFT_STORAGE_KEY } from './labels.js';

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('draftStore', () => {
  it('round-trips a session and clears it', () => {
    const session = makeSession();

    expect(writeDraft(session)).toBe('saved');
    expect(readDraft()).toEqual(session);

    clearDraft();

    expect(readDraft()).toBeNull();
  });

  it('ignores corrupt or foreign data', () => {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, '{not json');
    expect(readDraft()).toBeNull();

    window.localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({ bugs: 'x' })
    );
    expect(readDraft()).toBeNull();
  });

  it('drops the screenshots when the quota refuses them, and keeps the notes', () => {
    const setItem = Storage.prototype.setItem;

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
      this: Storage,
      key: string,
      value: string
    ) {
      if (value.includes('data:image/jpeg')) {
        throw new DOMException('full', 'QuotaExceededError');
      }

      setItem.call(this, key, value);
    });

    expect(writeDraft(makeSession([makeBug()]))).toBe('withoutScreenshots');
    expect(readDraft()?.bugs[0]).toMatchObject({
      note: makeBug().note,
      screenshot: null,
    });
  });

  it('reports a blocked storage', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(writeDraft(makeSession())).toBe('failed');
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

const beginBugReport = vi.fn();
const saveBugScreenshot = vi.fn();
const finishBugReport = vi.fn();
const steps = {
  begin: beginBugReport,
  screenshot: saveBugScreenshot,
  finish: finishBugReport,
};

import { JPEG, makeBug, makeSession } from './fixtures.js';
import { uploadSession } from './uploadSession.js';

beforeEach(() => {
  vi.resetAllMocks();
  beginBugReport.mockResolvedValue({
    status: 'success',
    data: { folder: '2026-09-25-1430' },
  });
  saveBugScreenshot.mockImplementation(
    async (_folder: string, number: number) => ({
      status: 'success',
      data: { file: `shots/0${number}.jpg` },
    })
  );
  finishBugReport.mockResolvedValue({
    status: 'success',
    data: {
      board: 'appointiq',
      folder: '/x',
      counts: { bugs: 2, features: 0 },
    },
  });
});

describe('uploadSession', () => {
  it('sends each screenshot on its own, numbered by position, then the report naming them', async () => {
    const session = makeSession([
      makeBug({ id: 'a', screenshot: null }),
      makeBug({ id: 'b', screenshot: JPEG }),
    ]);

    expect(await uploadSession(session, steps)).toMatchObject({
      status: 'success',
    });
    expect(saveBugScreenshot).toHaveBeenCalledOnce();
    expect(saveBugScreenshot).toHaveBeenCalledWith('2026-09-25-1430', 2, JPEG);

    const [folder, report] = finishBugReport.mock.calls[0];

    expect(folder).toBe('2026-09-25-1430');
    expect(
      report.bugs.map((bug: { screenshot: string | null }) => bug.screenshot)
    ).toEqual([null, 'shots/02.jpg']);
  });

  it('stops at the first failure and returns it', async () => {
    saveBugScreenshot.mockResolvedValue({ status: 'error', reason: 'io' });

    expect(await uploadSession(makeSession(), steps)).toEqual({
      status: 'error',
      reason: 'io',
    });
    expect(finishBugReport).not.toHaveBeenCalled();
  });

  it('never gets past a missing board', async () => {
    beginBugReport.mockResolvedValue({
      status: 'error',
      reason: 'noBoard',
      detail: 'none',
    });

    expect(await uploadSession(makeSession(), steps)).toMatchObject({
      reason: 'noBoard',
    });
    expect(saveBugScreenshot).not.toHaveBeenCalled();
  });
});

import { describe, expect, it } from 'vitest';

import { JPEG, makeBug, makeSession } from './fixtures.js';
import {
  isBugNumber,
  isFolderName,
  isHuntSession,
  isReportSession,
  isScreenshotDataUrl,
} from './guards.js';

describe('isHuntSession', () => {
  it('accepts a session with element and box marks', () => {
    const box = makeBug({
      id: 'bug-2',
      mark: {
        kind: 'box',
        rect: { x: 0, y: 0, width: 5, height: 5 },
        components: [],
      },
      screenshot: null,
    });

    expect(isHuntSession(makeSession([makeBug(), box]))).toBe(true);
  });

  it('rejects a blank note, an unknown mark and a non-JPEG screenshot', () => {
    expect(isHuntSession(makeSession([makeBug({ note: '   ' })]))).toBe(false);
    expect(
      isHuntSession(
        makeSession([
          makeBug({
            mark: { kind: 'circle' } as unknown as ReturnType<
              typeof makeBug
            >['mark'],
          }),
        ])
      )
    ).toBe(false);
    expect(
      isHuntSession(
        makeSession([makeBug({ screenshot: 'data:image/png;base64,AAAA' })])
      )
    ).toBe(false);
    expect(isHuntSession({ bugs: [] })).toBe(false);
  });

  it('takes a bug or a feature, and nothing else or nothing at all', () => {
    expect(isHuntSession(makeSession([makeBug({ kind: 'feature' })]))).toBe(
      true
    );
    expect(
      isHuntSession(
        makeSession([
          makeBug({
            kind: 'idea' as unknown as ReturnType<typeof makeBug>['kind'],
          }),
        ])
      )
    ).toBe(false);

    const { kind: _kind, ...withoutKind } = makeBug();

    expect(isHuntSession({ startedAt: 'x', bugs: [withoutKind] })).toBe(false);
  });
});

describe('isReportSession', () => {
  it('takes screenshots as files under shots/ only', () => {
    const report = (screenshot: string | null): unknown => ({
      startedAt: 'x',
      bugs: [{ ...makeBug(), screenshot }],
    });

    expect(isReportSession(report('shots/01.jpg'))).toBe(true);
    expect(isReportSession(report(null))).toBe(true);
    expect(isReportSession(report('../../etc/passwd'))).toBe(false);
    expect(isReportSession(report(JPEG))).toBe(false);
  });

  it('refuses an empty report', () => {
    expect(isReportSession({ startedAt: 'x', bugs: [] })).toBe(false);
  });
});

describe('path-bound values', () => {
  it('only takes folder names createReportFolder makes', () => {
    expect(isFolderName('2026-09-25-1430')).toBe(true);
    expect(isFolderName('2026-09-25-1430-2')).toBe(true);
    expect(isFolderName('../2026-09-25-1430')).toBe(false);
    expect(isFolderName('2026-09-25-1430/..')).toBe(false);
  });

  it('only takes 1-based integer bug numbers and JPEG data URLs', () => {
    expect(isBugNumber(1)).toBe(true);
    expect(isBugNumber(0)).toBe(false);
    expect(isBugNumber(1.5)).toBe(false);
    expect(isScreenshotDataUrl(JPEG)).toBe(true);
    expect(isScreenshotDataUrl('data:text/html;base64,AAAA')).toBe(false);
  });
});

import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { JPEG, makeBug } from '../helpers/fixtures.js';
import { beginBugReport, finishBugReport, saveBugScreenshot } from './steps.js';

let data: string;

beforeEach(async () => {
  data = await mkdtemp(path.join(os.tmpdir(), 'bug-hunt-actions-'));
  await mkdir(path.join(data, 'appointiq'));
  await writeFile(
    path.join(data, 'appointiq', 'board.json'),
    JSON.stringify({ name: 'appointiq', repoPath: process.cwd() })
  );
  vi.stubEnv('NEXT_PUBLIC_BUG_HUNT', 'true');
  vi.stubEnv('DISPOSIT_DATA', data);
});

afterEach(async () => {
  vi.unstubAllEnvs();
  await rm(data, { recursive: true, force: true });
});

describe('bug hunt save steps', () => {
  it('refuse while the flag is off, before touching the disk', async () => {
    vi.stubEnv('NEXT_PUBLIC_BUG_HUNT', 'false');

    expect(await beginBugReport()).toEqual({
      status: 'error',
      reason: 'disabled',
    });
    expect(await saveBugScreenshot('2026-09-25-1430', 1, JPEG)).toMatchObject({
      reason: 'disabled',
    });
    expect(await readdir(path.join(data, 'appointiq'))).toEqual(['board.json']);
  });

  it('write a whole report into the board this repo belongs to', async () => {
    const begun = await beginBugReport();

    if (begun.status !== 'success') {
      throw new Error('begin failed');
    }

    const { folder } = begun.data;
    const shot = await saveBugScreenshot(folder, 1, JPEG);

    expect(shot).toEqual({ status: 'success', data: { file: 'shots/01.jpg' } });

    const finished = await finishBugReport(folder, {
      startedAt: '2026-09-25T12:00:00.000Z',
      bugs: [{ ...makeBug(), screenshot: 'shots/01.jpg' }],
    });
    const folderPath = path.join(data, 'appointiq', 'bug-reports', folder);

    expect(finished).toEqual({
      status: 'success',
      data: { board: 'appointiq', folder: folderPath, bugCount: 1 },
    });
    expect(
      await readFile(path.join(folderPath, 'report.md'), 'utf8')
    ).toContain('board: appointiq');
  });

  it('refuse a folder path, a bad number and a non-JPEG image', async () => {
    expect(await saveBugScreenshot('../../x', 1, JPEG)).toMatchObject({
      reason: 'invalid',
    });
    expect(await saveBugScreenshot('2026-09-25-1430', 0, JPEG)).toMatchObject({
      reason: 'invalid',
    });
    expect(
      await saveBugScreenshot(
        '2026-09-25-1430',
        1,
        'data:text/html;base64,AAAA'
      )
    ).toMatchObject({ reason: 'invalid' });
  });

  it('refuse a report naming a screenshot that was never written', async () => {
    const begun = await beginBugReport();

    if (begun.status !== 'success') {
      throw new Error('begin failed');
    }

    expect(
      await finishBugReport(begun.data.folder, {
        startedAt: 'x',
        bugs: [{ ...makeBug(), screenshot: 'shots/01.jpg' }],
      })
    ).toMatchObject({ reason: 'invalid' });
  });

  it('say why when no board claims this repo', async () => {
    await writeFile(
      path.join(data, 'appointiq', 'board.json'),
      JSON.stringify({ name: 'appointiq', repoPath: '/somewhere/else' })
    );

    expect(await beginBugReport()).toMatchObject({
      status: 'error',
      reason: 'noBoard',
      detail: expect.stringContaining('Boards found: appointiq'),
    });
  });
});

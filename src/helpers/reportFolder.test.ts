import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { JPEG } from './fixtures.js';
import {
  createReportFolder,
  hasFile,
  writeReportFile,
  writeScreenshot,
} from './reportFolder.js';

let root: string;

beforeEach(async () => {
  root = await mkdtemp(path.join(os.tmpdir(), 'bug-hunt-reports-'));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('reportFolder', () => {
  const now = new Date(2026, 8, 25, 14, 30);

  it('makes a stamped folder with shots/, and a fresh one per save in the same minute', async () => {
    const reports = path.join(root, 'bug-reports');

    expect(await createReportFolder(reports, now)).toBe('2026-09-25-1430');
    expect(await createReportFolder(reports, now)).toBe('2026-09-25-1430-2');
    expect(await readdir(path.join(reports, '2026-09-25-1430'))).toEqual([
      'shots',
    ]);
  });

  it('writes a screenshot as bytes, and the report through a temp file', async () => {
    const folder = path.join(root, await createReportFolder(root, now));
    const file = await writeScreenshot(folder, 2, JPEG);

    expect(file).toBe('shots/02.jpg');
    expect(await hasFile(folder, file)).toBe(true);
    expect(await hasFile(folder, 'shots/01.jpg')).toBe(false);
    expect((await readFile(path.join(folder, file)))[0]).toBe(0xff);

    await writeReportFile(folder, '# report\n');

    expect(await readFile(path.join(folder, 'report.md'), 'utf8')).toBe(
      '# report\n'
    );
    expect(await readdir(folder)).toEqual(['report.md', 'shots']);
  });
});

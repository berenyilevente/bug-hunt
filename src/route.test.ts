import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from './route.js';

let data: string;

function post(body: unknown): Promise<Response> {
  return POST(
    new Request('http://localhost/api/bug-hunt', {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })
  );
}

beforeEach(async () => {
  data = await mkdtemp(path.join(os.tmpdir(), 'bug-hunt-route-'));
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

describe('POST /api/bug-hunt', () => {
  it('is a 404 while the flag is off, and writes nothing', async () => {
    vi.stubEnv('NEXT_PUBLIC_BUG_HUNT', 'false');

    const response = await post({ step: 'begin' });

    expect(response.status).toBe(404);
    expect(await readdir(path.join(data, 'appointiq'))).toEqual(['board.json']);
  });

  it('runs the step the body names', async () => {
    const response = await post({ step: 'begin' });
    const result = await response.json();

    expect(result).toMatchObject({ status: 'success' });
    expect(await readdir(path.join(data, 'appointiq', 'bug-reports'))).toEqual([
      result.data.folder,
    ]);
  });

  it('answers invalid for a body that is no step, before touching the disk', async () => {
    for (const body of ['not json', { step: 'delete' }, null]) {
      expect(await (await post(body)).json()).toEqual({
        status: 'error',
        reason: 'invalid',
      });
    }

    expect(
      await (
        await post({ step: 'screenshot', folder: '../../etc', number: 1 })
      ).json()
    ).toMatchObject({ reason: 'invalid' });
    expect(await readdir(path.join(data, 'appointiq'))).toEqual(['board.json']);
  });
});

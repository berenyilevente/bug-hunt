import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { locateBoard, resolveDataDir } from './boardLocator.js';

let root: string;
let home: string;
let data: string;
let repo: string;

async function addBoard(slug: string, repoPath: string | null): Promise<void> {
  await mkdir(path.join(data, slug), { recursive: true });
  await writeFile(
    path.join(data, slug, 'board.json'),
    JSON.stringify(
      repoPath === null ? { name: slug } : { name: slug, repoPath }
    )
  );
}

beforeEach(async () => {
  root = await mkdtemp(path.join(os.tmpdir(), 'bug-hunt-'));
  home = path.join(root, 'home');
  data = path.join(root, 'disposit', 'data');
  repo = path.join(home, 'apps', 'appointiq-app');
  await mkdir(data, { recursive: true });
  await mkdir(repo, { recursive: true });
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('resolveDataDir', () => {
  it('prefers DISPOSIT_DATA, then the root npm run setup recorded', async () => {
    await mkdir(path.join(home, '.config', 'disposit'), { recursive: true });
    await writeFile(
      path.join(home, '.config', 'disposit', 'root'),
      `${path.join(root, 'disposit')}\n`
    );

    expect(await resolveDataDir({}, home)).toBe(data);
    expect(await resolveDataDir({ DISPOSIT_DATA: repo }, home)).toBe(repo);
  });

  it('falls through a candidate that is not a directory', async () => {
    expect(
      await resolveDataDir({ DISPOSIT_DATA: path.join(root, 'gone') }, home)
    ).toBeNull();
  });

  it('honours XDG_CONFIG_HOME for the pointer', async () => {
    const xdg = path.join(root, 'xdg');

    await mkdir(path.join(xdg, 'disposit'), { recursive: true });
    await writeFile(
      path.join(xdg, 'disposit', 'root'),
      path.join(root, 'disposit')
    );

    expect(await resolveDataDir({ XDG_CONFIG_HOME: xdg }, home)).toBe(data);
  });
});

describe('locateBoard', () => {
  const env = (): Record<string, string> => ({ DISPOSIT_DATA: data });

  it('finds the board whose repoPath is this repo, through ~ and a trailing slash', async () => {
    await addBoard('bitecard', '~/apps/bitecard-app');
    await addBoard('appointiq', '~/apps/appointiq-app/');
    await addBoard('broken', null);

    expect(
      await locateBoard({ cwd: repo, configuredBoard: null, env: env(), home })
    ).toEqual({
      status: 'found',
      board: 'appointiq',
      boardDir: path.join(data, 'appointiq'),
    });
  });

  it('matches through a symlinked checkout', async () => {
    const link = path.join(root, 'link');

    await symlink(repo, link);
    await addBoard('appointiq', repo);

    expect(
      await locateBoard({ cwd: link, configuredBoard: null, env: env(), home })
    ).toMatchObject({ status: 'found', board: 'appointiq' });
  });

  it('names the boards it found when none claims the repo', async () => {
    await addBoard('bitecard', '~/apps/bitecard-app');

    const location = await locateBoard({
      cwd: repo,
      configuredBoard: null,
      env: env(),
      home,
    });

    expect(location.status).toBe('missing');
    expect(location).toMatchObject({
      detail: expect.stringContaining('Boards found: bitecard'),
    });
  });

  it('refuses to pick between two boards on one repo', async () => {
    await addBoard('one', repo);
    await addBoard('two', repo);

    expect(
      await locateBoard({ cwd: repo, configuredBoard: null, env: env(), home })
    ).toMatchObject({
      status: 'missing',
      detail: expect.stringContaining('one, two'),
    });
  });

  it('refuses a configured board that is a path rather than a name', async () => {
    await addBoard('appointiq', repo);

    expect(
      await locateBoard({
        cwd: repo,
        configuredBoard: '../appointiq',
        env: env(),
        home,
      })
    ).toMatchObject({
      status: 'missing',
      detail: expect.stringContaining('BUG_HUNT_BOARD'),
    });
  });

  it('takes the configured board over the match, and checks it exists', async () => {
    await addBoard('appointiq', repo);
    await addBoard('other', '~/elsewhere');

    expect(
      await locateBoard({
        cwd: repo,
        configuredBoard: 'other',
        env: env(),
        home,
      })
    ).toMatchObject({ status: 'found', board: 'other' });
    expect(
      await locateBoard({
        cwd: repo,
        configuredBoard: 'nope',
        env: env(),
        home,
      })
    ).toMatchObject({ status: 'missing' });
  });

  it('says how to set disposit up when there is no data directory', async () => {
    expect(
      await locateBoard({ cwd: repo, configuredBoard: null, env: {}, home })
    ).toMatchObject({
      status: 'missing',
      detail: expect.stringContaining('npm run setup'),
    });
  });
});

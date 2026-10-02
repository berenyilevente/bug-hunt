import { readdir, readFile, realpath, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
async function isDirectory(target) {
    try {
        return (await stat(target)).isDirectory();
    }
    catch {
        return false;
    }
}
async function canonical(target) {
    const resolved = path.resolve(target);
    try {
        return await realpath(resolved);
    }
    catch {
        return resolved;
    }
}
function expandHome(target, home) {
    if (target === '~') {
        return home;
    }
    return target.startsWith('~/') ? path.join(home, target.slice(2)) : target;
}
async function readRootPointer(env, home) {
    const configDir = env.XDG_CONFIG_HOME
        ? path.join(env.XDG_CONFIG_HOME, 'disposit')
        : path.join(home, '.config', 'disposit');
    try {
        const pointer = (await readFile(path.join(configDir, 'root'), 'utf8')).trim();
        return pointer === '' ? null : pointer;
    }
    catch {
        return null;
    }
}
/**
 * disposit's `data/` directory, found in the order its own
 * `resolve-data-dir.mjs` uses: `DISPOSIT_DATA`, then the repo root that
 * `npm run setup` recorded. A candidate that is not a directory falls through.
 */
export async function resolveDataDir(env = process.env, home = os.homedir()) {
    const pointer = await readRootPointer(env, home);
    const candidates = [env.DISPOSIT_DATA, pointer && path.join(pointer, 'data')];
    for (const candidate of candidates) {
        if (candidate && (await isDirectory(candidate))) {
            return path.resolve(candidate);
        }
    }
    return null;
}
async function readRepoPath(boardJson) {
    try {
        const parsed = JSON.parse(await readFile(boardJson, 'utf8'));
        const repoPath = typeof parsed === 'object' && parsed !== null
            ? parsed.repoPath
            : undefined;
        return typeof repoPath === 'string' && repoPath !== '' ? repoPath : null;
    }
    catch {
        return null;
    }
}
/** Every board directory under `data/`: the ones holding a `board.json`. */
async function listBoards(dataDir) {
    const entries = await readdir(dataDir, { withFileTypes: true });
    const boards = await Promise.all(entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => (await stat(path.join(dataDir, entry.name, 'board.json')).catch(() => null))
        ? entry.name
        : null));
    return boards.filter((board) => board !== null).sort();
}
/** A board's directory name: one path segment, never a path. */
const BOARD_SLUG = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
/**
 * The disposit board this repo belongs to: the configured slug when there is
 * one, else the board whose `board.json` `repoPath` is this repo — compared
 * after expanding `~` and resolving symlinks, the way `plan-ticket` matches it.
 * The board is its directory name, which is what every skill addresses.
 */
export async function locateBoard({ cwd, configuredBoard, env = process.env, home = os.homedir(), }) {
    const dataDir = await resolveDataDir(env, home);
    if (!dataDir) {
        return {
            status: 'missing',
            detail: 'disposit is not set up here. Run `npm run setup` in the disposit repo, or set DISPOSIT_DATA.',
        };
    }
    if (configuredBoard && !BOARD_SLUG.test(configuredBoard)) {
        return {
            status: 'missing',
            detail: `BUG_HUNT_BOARD must be a board's directory name, not "${configuredBoard}".`,
        };
    }
    if (configuredBoard) {
        const boardDir = path.join(dataDir, configuredBoard);
        return (await stat(path.join(boardDir, 'board.json')).catch(() => null))
            ? { status: 'found', board: configuredBoard, boardDir }
            : {
                status: 'missing',
                detail: `BUG_HUNT_BOARD names board "${configuredBoard}", which has no board.json under ${dataDir}.`,
            };
    }
    const repo = await canonical(cwd);
    const boards = await listBoards(dataDir);
    const matches = [];
    for (const board of boards) {
        const repoPath = await readRepoPath(path.join(dataDir, board, 'board.json'));
        if (repoPath && (await canonical(expandHome(repoPath, home))) === repo) {
            matches.push(board);
        }
    }
    if (matches.length === 1) {
        return {
            status: 'found',
            board: matches[0],
            boardDir: path.join(dataDir, matches[0]),
        };
    }
    if (matches.length > 1) {
        return {
            status: 'missing',
            detail: `several boards claim ${repo} (${matches.join(', ')}). Set BUG_HUNT_BOARD.`,
        };
    }
    return {
        status: 'missing',
        detail: `no board's repoPath is ${repo}. Boards found: ${boards.join(', ') || 'none'}. Set BUG_HUNT_BOARD, or fix the board's repoPath.`,
    };
}

/**
 * - `found`   — `boardDir` is `<DATA>/<board>`, the board this repo files into.
 * - `missing` — `detail` says why, naming what was looked at.
 */
export type BoardLocation = {
    status: 'found';
    board: string;
    boardDir: string;
} | {
    status: 'missing';
    detail: string;
};
/** The environment variables read here — `process.env`, or a spec's own. */
type Env = Record<string, string | undefined>;
type LocateOptions = {
    cwd: string;
    configuredBoard: string | null;
    env?: Env;
    home?: string;
};
/**
 * disposit's `data/` directory, found in the order its own
 * `resolve-data-dir.mjs` uses: `DISPOSIT_DATA`, then the repo root that
 * `npm run setup` recorded. A candidate that is not a directory falls through.
 */
export declare function resolveDataDir(env?: Env, home?: string): Promise<string | null>;
/**
 * The disposit board this repo belongs to: the configured slug when there is
 * one, else the board whose `board.json` `repoPath` is this repo — compared
 * after expanding `~` and resolving symlinks, the way `plan-ticket` matches it.
 * The board is its directory name, which is what every skill addresses.
 */
export declare function locateBoard({ cwd, configuredBoard, env, home, }: LocateOptions): Promise<BoardLocation>;
export {};

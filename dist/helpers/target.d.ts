import type { HuntTarget } from './types.js';
/**
 * Pins the board to save to, by its slug (its directory under `data/`). Unset,
 * the board is the one whose `board.json` `repoPath` is this repo.
 */
export declare const BOARD_ENV = "BUG_HUNT_BOARD";
/**
 * Where this repo's hunts are saved: `<DATA>/<board>/bug-reports`. Resolved on
 * every call rather than cached, so a board created or an env edited while the
 * server runs is picked up on the next save.
 */
export declare function resolveTarget(cwd?: string): Promise<HuntTarget>;

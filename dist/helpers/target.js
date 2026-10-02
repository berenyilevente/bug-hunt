import path from 'node:path';
import { locateBoard } from './boardLocator.js';
/** The folder inside a board a hunt is saved to, where `/triage-bugs` looks. */
const REPORTS_DIR = 'bug-reports';
/**
 * Pins the board to save to, by its slug (its directory under `data/`). Unset,
 * the board is the one whose `board.json` `repoPath` is this repo.
 */
export const BOARD_ENV = 'BUG_HUNT_BOARD';
/**
 * Where this repo's hunts are saved: `<DATA>/<board>/bug-reports`. Resolved on
 * every call rather than cached, so a board created or an env edited while the
 * server runs is picked up on the next save.
 */
export async function resolveTarget(cwd = process.cwd()) {
    const location = await locateBoard({
        cwd,
        configuredBoard: process.env[BOARD_ENV] || null,
    });
    if (location.status === 'missing') {
        return location;
    }
    return {
        status: 'ready',
        board: location.board,
        reportsPath: path.join(location.boardDir, REPORTS_DIR),
    };
}

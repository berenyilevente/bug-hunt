import type { HuntResult, HuntSession, SavedReport, SaveSteps } from './types.js';
/**
 * Sends a session to the board in the three steps a save takes: the
 * folder, each screenshot on its own, then the report naming them. The first
 * failure stops it and is returned as is; a folder left without `report.md` is
 * one `/triage-business-review` never reads.
 */
export declare function uploadSession(session: HuntSession, steps: SaveSteps): Promise<HuntResult<SavedReport>>;

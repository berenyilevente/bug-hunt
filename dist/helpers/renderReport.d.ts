import type { ReportSession } from './types.js';
type ReportMeta = {
    board: string;
    repo: string;
    created: Date;
};
/** `2026-09-25-1430`, in the dev machine's own time: the report folder's name. */
export declare function folderStamp(date: Date): string;
/** An ISO timestamp with the local offset, `2026-09-25T14:30:00+02:00`. */
export declare function localIso(date: Date): string;
/** The screenshot file of the bug numbered `number`, relative to the report. */
export declare function shotFileName(number: number): string;
/**
 * The report `/triage-business-review` reads. Items are `## Bug N` or
 * `## Feature N`, numbered in one sequence that matches `shots/NN.jpg`. The
 * frontmatter's `status` is what triage flips to `triaged`, and each item's
 * `Outcome` line is what it fills in — so both are written here, empty, in the
 * shape the skill expects.
 */
export declare function renderReport(session: ReportSession, meta: ReportMeta): string;
export {};

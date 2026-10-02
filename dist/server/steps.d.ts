import type { HuntResult, ReportSession, SavedReport } from '../helpers/types.js';
/** Makes the report's folder under the board and returns its name. */
export declare function beginBugReport(): Promise<HuntResult<{
    folder: string;
}>>;
/** Writes the screenshot of bug `number` into a folder `beginBugReport` made. */
export declare function saveBugScreenshot(folder: string, number: number, dataUrl: string): Promise<HuntResult<{
    file: string;
}>>;
/**
 * Writes `report.md`, which is what makes the folder a report. Every
 * screenshot it names must already be on disk.
 */
export declare function finishBugReport(folder: string, session: ReportSession): Promise<HuntResult<SavedReport>>;

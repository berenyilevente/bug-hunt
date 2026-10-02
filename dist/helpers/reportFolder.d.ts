/**
 * Makes a fresh `<reportsRoot>/<stamp>/shots/` and returns the folder's name.
 * Two saves in one minute get `-2`, `-3`, …: `mkdir` without `recursive`
 * refuses a folder that exists, so a report is never written into another's.
 */
export declare function createReportFolder(reportsRoot: string, now: Date): Promise<string>;
/** Writes one bug's screenshot and returns its path relative to the report. */
export declare function writeScreenshot(folder: string, number: number, dataUrl: string): Promise<string>;
export declare function hasFile(folder: string, file: string): Promise<boolean>;
/**
 * Writes `report.md` last, through a temp file renamed over it: a folder with
 * a report in it is a finished one, which is all `/triage-bugs` looks for.
 */
export declare function writeReportFile(folder: string, markdown: string): Promise<string>;

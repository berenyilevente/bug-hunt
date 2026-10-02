import type { HuntSession, ReportSession } from './types.js';
/** A screenshot as a report names it: always a file under `shots/`. */
export declare const SHOT_FILE: RegExp;
/** The draft read back from localStorage — whatever an older copy left there. */
export declare function isHuntSession(value: unknown): value is HuntSession;
/**
 * A server action's argument is whatever the request carried, whatever its
 * TypeScript signature says — checked before any of it reaches the disk.
 */
export declare function isReportSession(value: unknown): value is ReportSession;
export declare function isScreenshotDataUrl(value: unknown): value is string;
/** A report folder's name, as `createReportFolder` made it — never a path. */
export declare function isFolderName(value: unknown): value is string;
/** A bug's position in the report: 1-based, as the report numbers them. */
export declare function isBugNumber(value: unknown): value is number;

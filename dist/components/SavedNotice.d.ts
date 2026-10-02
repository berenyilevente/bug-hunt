import { type ReactNode } from 'react';
import type { SavedReport } from '../helpers/types.js';
type SavedNoticeProps = {
    report: SavedReport;
};
/** Where the report went, and the command that turns it into tickets. */
export declare function SavedNotice({ report }: SavedNoticeProps): ReactNode;
export {};

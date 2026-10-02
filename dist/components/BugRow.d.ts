import type { ReactNode } from 'react';
import type { Bug } from '../helpers/types.js';
type BugRowProps = {
    bug: Bug;
    number: number;
};
/** One bug: its screenshot, page and note, with edit and delete. */
export declare function BugRow({ bug, number }: BugRowProps): ReactNode;
export {};

import type { ReactNode } from 'react';
import type { HuntTarget } from './helpers/types.js';
type BugHuntProps = {
    target: HuntTarget;
    endpoint: string;
};
export declare function BugHunt({ target, endpoint }: BugHuntProps): ReactNode;
export {};

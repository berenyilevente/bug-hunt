import type { ReactNode } from 'react';
import type { HuntTarget, SaveSteps } from './helpers/types.js';
type BugHuntOverlayProps = {
    target: HuntTarget;
    steps: SaveSteps;
};
/**
 * The overlay: toggle, panel, pick layer and note form, under one root that
 * picking and the screenshot both skip.
 */
export declare function BugHuntOverlay({ target, steps, }: BugHuntOverlayProps): ReactNode;
export {};

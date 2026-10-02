import type { ReactNode } from 'react';
import type { Box } from '../helpers/geometry.js';
type OutlineProps = {
    box: Box;
    tone: 'pick' | 'mark';
};
/**
 * A box drawn over the page rather than a style written onto its elements, so
 * the app's own DOM is never touched.
 */
export declare function Outline({ box, tone }: OutlineProps): ReactNode;
export {};

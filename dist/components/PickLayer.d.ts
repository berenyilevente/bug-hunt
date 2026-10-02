import { type ReactNode } from 'react';
/**
 * A transparent sheet over the whole page while picking: it takes every
 * pointer event, so a click marks a bug instead of pressing what is under it.
 * A click marks the element under the pointer; a drag marks the box it draws.
 */
export declare function PickLayer(): ReactNode;

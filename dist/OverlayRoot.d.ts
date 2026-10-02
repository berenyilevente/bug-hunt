import { type ReactNode } from 'react';
import type { HuntTarget } from './helpers/types.js';
type OverlayRootProps = {
    target: HuntTarget;
    endpoint: string;
};
/**
 * Hosts the overlay in a shadow root, under a React root of its own.
 *
 * - The shadow root carries the overlay's own compiled stylesheet: the page's
 *   CSS cannot restyle it, and its CSS cannot leak onto the page.
 * - The separate React root keeps the overlay working over an open dialog,
 *   sheet or menu. Rendered in the page's tree, its events would reach
 *   `document` like any other and a modal layer would take them as clicks and
 *   focus outside itself: it would close, or pull focus back from the note. A
 *   separate root listens on its own container, which lets the host stop
 *   those events before they get there (`isolateFromPage`).
 *
 * The host re-enables pointer events because a modal layer sets
 * `pointer-events: none` on `<body>`, which it would otherwise inherit. Set
 * inline: the page's stylesheet is the only one that reaches the host itself.
 */
export declare function OverlayRoot({ target, endpoint }: OverlayRootProps): ReactNode;
export {};

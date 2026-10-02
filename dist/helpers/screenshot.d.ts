import type { Rect } from './types.js';
/**
 * The viewport as the user sees it, with the marked area outlined in red, as a
 * JPEG data URL — or `null` when the page cannot be drawn (a tainted canvas, a
 * cross-origin frame). A missing picture never costs the bug itself.
 *
 * `modern-screenshot` renders the whole document; the viewport is cut out of
 * it afterwards, so what is drawn is what was on screen when the bug was marked.
 */
export declare function captureViewport(rect: Rect): Promise<string | null>;

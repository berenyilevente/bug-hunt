/**
 * Cuts the overlay under `host` off from the page's document-level listeners
 * and returns the undo. The overlay must be its own React root inside `host`:
 * a root's listeners sit on its container, below the stop, so the overlay's
 * own handlers still run while the page's never do.
 *
 * Two events start on the page rather than in the overlay, so they are caught
 * on `window` in the capture phase, ahead of everything on `document`:
 * - the `focusout` of a page field when focus moves into the overlay, which a
 *   focus trap answers by taking focus back;
 * - Escape pressed in the overlay, which a dismissable layer hears in
 *   `document`'s capture phase — prevented, which Radix reads as "handled".
 */
export declare function isolateFromPage(host: HTMLElement): () => void;

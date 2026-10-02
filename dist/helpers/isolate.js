/**
 * What a page's own layers listen for on `document` to tell an interaction
 * outside them: Radix's dismissable layer (pointerdown, focusin), its focus
 * trap (focusin, focusout) and react-remove-scroll (wheel, touch). Stopped at
 * the overlay's host on the way up, so an open dialog, sheet or menu never
 * hears the overlay being used — it neither closes nor pulls focus back.
 */
const PAGE_LISTENED_EVENTS = [
    'pointerdown',
    'pointerup',
    'mousedown',
    'mouseup',
    'click',
    'touchstart',
    'touchmove',
    'touchend',
    'wheel',
    'focusin',
    'focusout',
    'keydown',
    'keyup',
];
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
export function isolateFromPage(host) {
    const isInOverlay = (node) => node instanceof Node && host.contains(node);
    const stop = (event) => event.stopPropagation();
    const stopFocusLeavingPage = (event) => {
        if (isInOverlay(event.relatedTarget) && !isInOverlay(event.target)) {
            event.stopPropagation();
        }
    };
    const claimEscape = (event) => {
        if (event.key === 'Escape' && isInOverlay(event.target)) {
            event.preventDefault();
        }
    };
    for (const type of PAGE_LISTENED_EVENTS) {
        host.addEventListener(type, stop);
    }
    window.addEventListener('focusout', stopFocusLeavingPage, true);
    window.addEventListener('keydown', claimEscape, true);
    return () => {
        for (const type of PAGE_LISTENED_EVENTS) {
            host.removeEventListener(type, stop);
        }
        window.removeEventListener('focusout', stopFocusLeavingPage, true);
        window.removeEventListener('keydown', claimEscape, true);
    };
}

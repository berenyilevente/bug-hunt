function currentScroll() {
    return { x: window.scrollX, y: window.scrollY };
}
/** A viewport box (a `DOMRect`, a drag) as the page coordinates a mark keeps. */
export function toPageRect(box, scroll = currentScroll()) {
    return {
        x: Math.round(box.left + scroll.x),
        y: Math.round(box.top + scroll.y),
        width: Math.round(box.width),
        height: Math.round(box.height),
    };
}
/** Back to where a page rect sits in the viewport now, for drawing an outline. */
export function toViewportBox(rect, scroll = currentScroll()) {
    return {
        left: rect.x - scroll.x,
        top: rect.y - scroll.y,
        width: rect.width,
        height: rect.height,
    };
}
/** The box between two pointer positions, whichever way the drag went. */
export function boxBetween(from, to) {
    return {
        left: Math.min(from.x, to.x),
        top: Math.min(from.y, to.y),
        width: Math.abs(to.x - from.x),
        height: Math.abs(to.y - from.y),
    };
}
export function distance(from, to) {
    return Math.hypot(to.x - from.x, to.y - from.y);
}

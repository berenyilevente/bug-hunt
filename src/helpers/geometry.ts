import type { Rect } from './types.js';

/** A rectangle in viewport coordinates, as a `DOMRect` reports one. */
export type Box = { left: number; top: number; width: number; height: number };

type Scroll = { x: number; y: number };

function currentScroll(): Scroll {
  return { x: window.scrollX, y: window.scrollY };
}

/** A viewport box (a `DOMRect`, a drag) as the page coordinates a mark keeps. */
export function toPageRect(box: Box, scroll: Scroll = currentScroll()): Rect {
  return {
    x: Math.round(box.left + scroll.x),
    y: Math.round(box.top + scroll.y),
    width: Math.round(box.width),
    height: Math.round(box.height),
  };
}

/** Back to where a page rect sits in the viewport now, for drawing an outline. */
export function toViewportBox(
  rect: Rect,
  scroll: Scroll = currentScroll()
): Box {
  return {
    left: rect.x - scroll.x,
    top: rect.y - scroll.y,
    width: rect.width,
    height: rect.height,
  };
}

/** The box between two pointer positions, whichever way the drag went. */
export function boxBetween(
  from: { x: number; y: number },
  to: { x: number; y: number }
): Box {
  return {
    left: Math.min(from.x, to.x),
    top: Math.min(from.y, to.y),
    width: Math.abs(to.x - from.x),
    height: Math.abs(to.y - from.y),
  };
}

export function distance(
  from: { x: number; y: number },
  to: { x: number; y: number }
): number {
  return Math.hypot(to.x - from.x, to.y - from.y);
}

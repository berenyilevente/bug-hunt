import type { Rect } from './types.js';
/** A rectangle in viewport coordinates, as a `DOMRect` reports one. */
export type Box = {
    left: number;
    top: number;
    width: number;
    height: number;
};
type Scroll = {
    x: number;
    y: number;
};
/** A viewport box (a `DOMRect`, a drag) as the page coordinates a mark keeps. */
export declare function toPageRect(box: Box, scroll?: Scroll): Rect;
/** Back to where a page rect sits in the viewport now, for drawing an outline. */
export declare function toViewportBox(rect: Rect, scroll?: Scroll): Box;
/** The box between two pointer positions, whichever way the drag went. */
export declare function boxBetween(from: {
    x: number;
    y: number;
}, to: {
    x: number;
    y: number;
}): Box;
export declare function distance(from: {
    x: number;
    y: number;
}, to: {
    x: number;
    y: number;
}): number;
export {};

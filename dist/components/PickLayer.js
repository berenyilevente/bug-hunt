'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { componentStack } from '../helpers/componentStack.js';
import { boxBetween, distance, toPageRect } from '../helpers/geometry.js';
import { DEV_OVERLAY_ATTRIBUTE, DRAG_THRESHOLD, LABELS, } from '../helpers/labels.js';
import { selectorFor, visibleText } from '../helpers/selector.js';
import { useBugHunt } from '../hooks/use-bug-hunt.js';
import { Outline } from './Outline.js';
/** The page element under a point, looking through both dev overlays. */
function elementAt({ x, y }) {
    return (document
        .elementsFromPoint(x, y)
        .find((element) => !element.closest(`[${DEV_OVERLAY_ATTRIBUTE}]`)) ?? null);
}
function pointOf(event) {
    return { x: event.clientX, y: event.clientY };
}
function elementMark(element) {
    return {
        kind: 'element',
        selector: selectorFor(element),
        text: visibleText(element),
        rect: toPageRect(element.getBoundingClientRect()),
        components: componentStack(element),
    };
}
function boxMark(from, to) {
    const box = boxBetween(from, to);
    const centre = elementAt({
        x: box.left + box.width / 2,
        y: box.top + box.height / 2,
    });
    return {
        kind: 'box',
        rect: toPageRect(box),
        components: centre ? componentStack(centre) : [],
    };
}
/**
 * A transparent sheet over the whole page while picking: it takes every
 * pointer event, so a click marks a bug instead of pressing what is under it.
 * A click marks the element under the pointer; a drag marks the box it draws.
 */
export function PickLayer() {
    const { completeMark } = useBugHunt();
    const [hovered, setHovered] = useState(null);
    const [dragFrom, setDragFrom] = useState(null);
    const [pointer, setPointer] = useState(null);
    const isDragging = dragFrom !== null &&
        pointer !== null &&
        distance(dragFrom, pointer) > DRAG_THRESHOLD;
    const handlePointerDown = (event) => {
        event.preventDefault();
        setDragFrom(pointOf(event));
    };
    const handlePointerMove = (event) => {
        const point = pointOf(event);
        setPointer(point);
        if (!dragFrom) {
            setHovered(elementAt(point));
        }
    };
    const handlePointerUp = (event) => {
        const point = pointOf(event);
        const from = dragFrom;
        setDragFrom(null);
        if (from && distance(from, point) > DRAG_THRESHOLD) {
            void completeMark(boxMark(from, point));
            return;
        }
        const element = elementAt(point);
        if (element) {
            void completeMark(elementMark(element));
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { role: "presentation", onPointerDown: handlePointerDown, onPointerMove: handlePointerMove, onPointerUp: handlePointerUp, className: "fixed inset-0 z-[2147482998] cursor-crosshair" }), _jsx("p", { className: "pointer-events-none fixed left-1/2 top-4 z-[2147483000] -translate-x-1/2 rounded-full bg-zinc-900 px-3 py-1.5 font-sans text-xs text-white shadow-lg", children: LABELS.picking }), isDragging && dragFrom && pointer && (_jsx(Outline, { box: boxBetween(dragFrom, pointer), tone: "mark" })), !isDragging && hovered && (_jsx(Outline, { box: hovered.getBoundingClientRect(), tone: "pick" }))] }));
}

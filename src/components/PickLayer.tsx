'use client';

import { useState, type PointerEvent, type ReactNode } from 'react';

import { componentStack } from '../helpers/componentStack.js';
import { boxBetween, distance, toPageRect } from '../helpers/geometry.js';
import {
  DEV_OVERLAY_ATTRIBUTE,
  DRAG_THRESHOLD,
  LABELS,
} from '../helpers/labels.js';
import { selectorFor, visibleText } from '../helpers/selector.js';
import type { Mark } from '../helpers/types.js';
import { useBugHunt } from '../hooks/use-bug-hunt.js';
import { Outline } from './Outline.js';

type Point = { x: number; y: number };

/** The page element under a point, looking through both dev overlays. */
function elementAt({ x, y }: Point): Element | null {
  return (
    document
      .elementsFromPoint(x, y)
      .find((element) => !element.closest(`[${DEV_OVERLAY_ATTRIBUTE}]`)) ?? null
  );
}

function pointOf(event: PointerEvent): Point {
  return { x: event.clientX, y: event.clientY };
}

function elementMark(element: Element): Mark {
  return {
    kind: 'element',
    selector: selectorFor(element),
    text: visibleText(element),
    rect: toPageRect(element.getBoundingClientRect()),
    components: componentStack(element),
  };
}

function boxMark(from: Point, to: Point): Mark {
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
export function PickLayer(): ReactNode {
  const { completeMark } = useBugHunt();
  const [hovered, setHovered] = useState<Element | null>(null);
  const [dragFrom, setDragFrom] = useState<Point | null>(null);
  const [pointer, setPointer] = useState<Point | null>(null);

  const isDragging =
    dragFrom !== null &&
    pointer !== null &&
    distance(dragFrom, pointer) > DRAG_THRESHOLD;

  const handlePointerDown = (event: PointerEvent): void => {
    event.preventDefault();
    setDragFrom(pointOf(event));
  };

  const handlePointerMove = (event: PointerEvent): void => {
    const point = pointOf(event);

    setPointer(point);

    if (!dragFrom) {
      setHovered(elementAt(point));
    }
  };

  const handlePointerUp = (event: PointerEvent): void => {
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

  return (
    <>
      <div
        role="presentation"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="fixed inset-0 z-[2147482998] cursor-crosshair"
      />
      <p className="pointer-events-none fixed left-1/2 top-4 z-[2147483000] -translate-x-1/2 rounded-full bg-zinc-900 px-3 py-1.5 font-sans text-xs text-white shadow-lg">
        {LABELS.picking}
      </p>
      {isDragging && dragFrom && pointer && (
        <Outline box={boxBetween(dragFrom, pointer)} tone="mark" />
      )}
      {!isDragging && hovered && (
        <Outline box={hovered.getBoundingClientRect()} tone="pick" />
      )}
    </>
  );
}

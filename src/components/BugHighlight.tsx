'use client';

import type { ReactNode } from 'react';

import { toViewportBox, type Box } from '../helpers/geometry.js';
import type { Bug } from '../helpers/types.js';
import { useBugHunt } from '../hooks/use-bug-hunt.js';
import { Outline } from './Outline.js';

/**
 * Where a bug sits on the page now: its element found again by selector, or
 * its box moved by however far the page has scrolled since. Only on the page
 * it was marked on.
 */
function boxOf(bug: Bug): Box | null {
  if (bug.pathname !== window.location.pathname) {
    return null;
  }

  if (bug.mark.kind === 'element') {
    const element = document.querySelector(bug.mark.selector);

    return element
      ? element.getBoundingClientRect()
      : toViewportBox(bug.mark.rect);
  }

  return toViewportBox(bug.mark.rect);
}

/** Outlines the hovered row's bug, and the mark a note is being written for. */
export function BugHighlight(): ReactNode {
  const { bugs, hoveredBugId, pending } = useBugHunt();
  const hovered = bugs.find((bug) => bug.id === hoveredBugId);
  const box = hovered ? boxOf(hovered) : null;

  return (
    <>
      {box && <Outline box={box} tone="mark" />}
      {pending && (
        <Outline box={toViewportBox(pending.mark.rect)} tone="mark" />
      )}
    </>
  );
}

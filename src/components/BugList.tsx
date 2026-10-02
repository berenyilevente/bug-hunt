'use client';

import type { ReactNode } from 'react';

import { LABELS } from '../helpers/labels.js';
import { useBugHunt } from '../hooks/use-bug-hunt.js';
import { BugRow } from './BugRow.js';

/** The session's bugs, in the order they were marked — the report's order. */
export function BugList(): ReactNode {
  const { bugs } = useBugHunt();

  if (bugs.length === 0) {
    return <p className="flex-1 p-3 text-sm text-zinc-500">{LABELS.empty}</p>;
  }

  return (
    <ol className="flex-1 divide-y divide-zinc-100 overflow-y-auto">
      {bugs.map((bug, index) => (
        <BugRow key={bug.id} bug={bug} number={index + 1} />
      ))}
    </ol>
  );
}

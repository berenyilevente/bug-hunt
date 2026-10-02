'use client';

import type { ReactNode } from 'react';

import { LABELS, signalCountLabel } from '../helpers/labels.js';
import type { Bug } from '../helpers/types.js';
import { useBugHunt } from '../hooks/use-bug-hunt.js';
import { KindBadge } from './KindBadge.js';

type BugRowProps = { bug: Bug; number: number };

/** One item: its kind, screenshot, page and note, with edit and delete. */
export function BugRow({ bug, number }: BugRowProps): ReactNode {
  const { startEdit, deleteBug, setHoveredBugId } = useBugHunt();
  const signalCount = bug.consoleErrors.length + bug.failedRequests.length;

  return (
    <li
      onMouseEnter={() => setHoveredBugId(bug.id)}
      onMouseLeave={() => setHoveredBugId(null)}
      className="flex gap-2 p-3 hover:bg-zinc-50"
    >
      {bug.screenshot ? (
        // A data URL from the page itself: nothing for next/image to optimise.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bug.screenshot}
          alt=""
          className="h-12 w-16 shrink-0 rounded border border-zinc-200 object-cover"
        />
      ) : (
        <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded border border-dashed border-zinc-300 text-[10px] text-zinc-400">
          {LABELS.noScreenshot}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
          <span>#{number}</span>
          <KindBadge kind={bug.kind} />
          <span className="truncate">{bug.pathname}</span>
          {signalCount > 0 && (
            <span className="shrink-0 rounded bg-red-100 px-1 text-red-700">
              {signalCountLabel(signalCount)}
            </span>
          )}
        </p>
        <p className="line-clamp-2 text-sm">{bug.note}</p>
        <div className="mt-1 flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => startEdit(bug.id)}
            className="text-zinc-600 underline hover:no-underline"
          >
            {LABELS.edit}
          </button>
          <button
            type="button"
            onClick={() => deleteBug(bug.id)}
            className="text-red-600 underline hover:no-underline"
          >
            {LABELS.delete}
          </button>
        </div>
      </div>
    </li>
  );
}

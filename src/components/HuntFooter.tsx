'use client';

import type { ReactNode } from 'react';

import { itemCountLabel, LABELS } from '../helpers/labels.js';
import { countKinds } from '../helpers/counts.js';
import { useBugHunt } from '../hooks/use-bug-hunt.js';
import { SavedNotice } from './SavedNotice.js';

/** The last save's outcome, and the two session actions. */
export function HuntFooter(): ReactNode {
  const { bugs, status, isSaving, save, discardSession, target } = useBugHunt();
  const hasBugs = bugs.length > 0;

  return (
    <div className="flex flex-col gap-2 border-t border-zinc-200 p-3">
      {status?.kind === 'saved' && <SavedNotice report={status.report} />}
      {status?.kind === 'error' && (
        <p role="alert" className="text-xs text-red-700">
          {status.message}
        </p>
      )}
      <div className="flex items-center gap-2">
        <span className="mr-auto text-xs text-zinc-500">
          {hasBugs && itemCountLabel(countKinds(bugs))}
        </span>
        <button
          type="button"
          onClick={discardSession}
          disabled={!hasBugs || isSaving}
          className="rounded-md px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
        >
          {LABELS.discardSession}
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!hasBugs || isSaving || target.status === 'missing'}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-40"
        >
          {isSaving ? LABELS.saving : LABELS.save}
        </button>
      </div>
    </div>
  );
}

'use client';

import type { ReactNode } from 'react';

import { LABELS } from '../helpers/labels.js';
import { useBugHunt } from '../hooks/use-bug-hunt.js';

/** The Mark button, and why Save would fail when there is no board yet. */
export function HuntToolbar(): ReactNode {
  const { startPicking, isPicking, isCapturing, target, isStorageFull } =
    useBugHunt();

  return (
    <div className="flex flex-col gap-2 border-b border-zinc-200 p-3">
      <button
        type="button"
        onClick={startPicking}
        disabled={isPicking || isCapturing}
        className="flex items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
      >
        {isCapturing ? LABELS.capturing : LABELS.mark}
        <kbd className="font-mono text-[10px] opacity-70">
          {LABELS.markShortcut}
        </kbd>
      </button>
      {target.status === 'missing' && (
        <p
          role="alert"
          className="rounded-md bg-amber-100 px-2 py-1.5 text-xs text-amber-900"
        >
          {LABELS.noBoard} {target.detail}
        </p>
      )}
      {isStorageFull && (
        <p className="rounded-md bg-amber-100 px-2 py-1.5 text-xs text-amber-900">
          {LABELS.storageWarning}
        </p>
      )}
    </div>
  );
}

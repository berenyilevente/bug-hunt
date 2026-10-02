'use client';

import { useState, type ReactNode } from 'react';

import { LABELS, savedLabel } from '../helpers/labels.js';
import type { SavedReport } from '../helpers/types.js';

type SavedNoticeProps = { report: SavedReport };

/** Where the report went, and the command that turns it into tickets. */
export function SavedNotice({ report }: SavedNoticeProps): ReactNode {
  const [isCopied, setIsCopied] = useState(false);

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(LABELS.triageCommand);
      setIsCopied(true);
    } catch {
      // No clipboard permission: the command is on screen to copy by hand.
    }
  };

  return (
    <div
      role="status"
      className="flex flex-col gap-1 rounded-md bg-emerald-50 p-2 text-xs text-emerald-900"
    >
      <p>
        {savedLabel(report.bugCount)}{' '}
        <code className="break-all font-mono">{report.folder}</code>
      </p>
      <p>{LABELS.nextStep}</p>
      <p className="flex items-center gap-2">
        <code className="rounded bg-white px-1.5 py-0.5 font-mono">
          {LABELS.triageCommand}
        </code>
        <button
          type="button"
          onClick={() => void copy()}
          className="underline hover:no-underline"
        >
          {isCopied ? LABELS.copied : LABELS.copy}
        </button>
      </p>
    </div>
  );
}

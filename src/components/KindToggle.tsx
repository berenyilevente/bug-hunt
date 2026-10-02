'use client';

import type { ReactNode } from 'react';

import { KIND_LABELS, LABELS } from '../helpers/labels.js';
import type { ItemKind } from '../helpers/types.js';

const KINDS: ItemKind[] = ['bug', 'feature'];

type KindToggleProps = {
  kind: ItemKind;
  onChange: (kind: ItemKind) => void;
};

/** Bug or feature request: the reporter's call, which triage may revise. */
export function KindToggle({ kind, onChange }: KindToggleProps): ReactNode {
  return (
    <div
      role="group"
      aria-label={LABELS.kindLabel}
      className="flex w-fit rounded-md border border-zinc-300 p-0.5 text-xs"
    >
      {KINDS.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={kind === option}
          onClick={() => onChange(option)}
          className={`rounded px-2.5 py-1 ${kind === option ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}
        >
          {KIND_LABELS[option]}
        </button>
      ))}
    </div>
  );
}

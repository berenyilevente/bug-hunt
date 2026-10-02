'use client';

import type { ReactNode } from 'react';

import { KIND_LABELS } from '../helpers/labels.js';
import type { ItemKind } from '../helpers/types.js';

const TONES: Record<ItemKind, string> = {
  bug: 'bg-red-100 text-red-700',
  feature: 'bg-sky-100 text-sky-700',
};

/** An item's kind, on its row in the panel. */
export function KindBadge({ kind }: { kind: ItemKind }): ReactNode {
  return (
    <span className={`shrink-0 rounded px-1 font-sans ${TONES[kind]}`}>
      {KIND_LABELS[kind]}
    </span>
  );
}

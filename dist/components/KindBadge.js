'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { KIND_LABELS } from '../helpers/labels.js';
const TONES = {
    bug: 'bg-red-100 text-red-700',
    feature: 'bg-sky-100 text-sky-700',
};
/** An item's kind, on its row in the panel. */
export function KindBadge({ kind }) {
    return (_jsx("span", { className: `shrink-0 rounded px-1 font-sans ${TONES[kind]}`, children: KIND_LABELS[kind] }));
}

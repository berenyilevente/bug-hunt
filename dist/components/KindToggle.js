'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { KIND_LABELS, LABELS } from '../helpers/labels.js';
const KINDS = ['bug', 'feature'];
/** Bug or feature request: the reporter's call, which triage may revise. */
export function KindToggle({ kind, onChange }) {
    return (_jsx("div", { role: "group", "aria-label": LABELS.kindLabel, className: "flex w-fit rounded-md border border-zinc-300 p-0.5 text-xs", children: KINDS.map((option) => (_jsx("button", { type: "button", "aria-pressed": kind === option, onClick: () => onChange(option), className: `rounded px-2.5 py-1 ${kind === option ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`, children: KIND_LABELS[option] }, option))) }));
}

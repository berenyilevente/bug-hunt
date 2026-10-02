'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { LABELS } from '../helpers/labels.js';
import { useBugHunt } from '../hooks/use-bug-hunt.js';
import { BugRow } from './BugRow.js';
/** The session's bugs, in the order they were marked — the report's order. */
export function BugList() {
    const { bugs } = useBugHunt();
    if (bugs.length === 0) {
        return _jsx("p", { className: "flex-1 p-3 text-sm text-zinc-500", children: LABELS.empty });
    }
    return (_jsx("ol", { className: "flex-1 divide-y divide-zinc-100 overflow-y-auto", children: bugs.map((bug, index) => (_jsx(BugRow, { bug: bug, number: index + 1 }, bug.id))) }));
}

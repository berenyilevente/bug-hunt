'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { itemCountLabel, LABELS } from '../helpers/labels.js';
import { countKinds } from '../helpers/counts.js';
import { useBugHunt } from '../hooks/use-bug-hunt.js';
import { SavedNotice } from './SavedNotice.js';
/** The last save's outcome, and the two session actions. */
export function HuntFooter() {
    const { bugs, status, isSaving, save, discardSession, target } = useBugHunt();
    const hasBugs = bugs.length > 0;
    return (_jsxs("div", { className: "flex flex-col gap-2 border-t border-zinc-200 p-3", children: [status?.kind === 'saved' && _jsx(SavedNotice, { report: status.report }), status?.kind === 'error' && (_jsx("p", { role: "alert", className: "text-xs text-red-700", children: status.message })), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "mr-auto text-xs text-zinc-500", children: hasBugs && itemCountLabel(countKinds(bugs)) }), _jsx("button", { type: "button", onClick: discardSession, disabled: !hasBugs || isSaving, className: "rounded-md px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-40", children: LABELS.discardSession }), _jsx("button", { type: "button", onClick: save, disabled: !hasBugs || isSaving || target.status === 'missing', className: "rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-40", children: isSaving ? LABELS.saving : LABELS.save })] })] }));
}

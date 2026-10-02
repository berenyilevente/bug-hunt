'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LABELS } from '../helpers/labels.js';
import { useBugHunt } from '../hooks/use-bug-hunt.js';
/** The Mark button, and why Save would fail when there is no board yet. */
export function HuntToolbar() {
    const { startPicking, isPicking, isCapturing, target, isStorageFull } = useBugHunt();
    return (_jsxs("div", { className: "flex flex-col gap-2 border-b border-zinc-200 p-3", children: [_jsxs("button", { type: "button", onClick: startPicking, disabled: isPicking || isCapturing, className: "flex items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50", children: [isCapturing ? LABELS.capturing : LABELS.mark, _jsx("kbd", { className: "font-mono text-[10px] opacity-70", children: LABELS.markShortcut })] }), target.status === 'missing' && (_jsxs("p", { role: "alert", className: "rounded-md bg-amber-100 px-2 py-1.5 text-xs text-amber-900", children: [LABELS.noBoard, " ", target.detail] })), isStorageFull && (_jsx("p", { className: "rounded-md bg-amber-100 px-2 py-1.5 text-xs text-amber-900", children: LABELS.storageWarning }))] }));
}

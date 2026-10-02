'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LABELS, signalCountLabel } from '../helpers/labels.js';
import { useBugHunt } from '../hooks/use-bug-hunt.js';
/** One bug: its screenshot, page and note, with edit and delete. */
export function BugRow({ bug, number }) {
    const { startEdit, deleteBug, setHoveredBugId } = useBugHunt();
    const signalCount = bug.consoleErrors.length + bug.failedRequests.length;
    return (_jsxs("li", { onMouseEnter: () => setHoveredBugId(bug.id), onMouseLeave: () => setHoveredBugId(null), className: "flex gap-2 p-3 hover:bg-zinc-50", children: [bug.screenshot ? (
            // A data URL from the page itself: nothing for next/image to optimise.
            // eslint-disable-next-line @next/next/no-img-element
            _jsx("img", { src: bug.screenshot, alt: "", className: "h-12 w-16 shrink-0 rounded border border-zinc-200 object-cover" })) : (_jsx("span", { className: "flex h-12 w-16 shrink-0 items-center justify-center rounded border border-dashed border-zinc-300 text-[10px] text-zinc-400", children: LABELS.noScreenshot })), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("p", { className: "flex items-center gap-2 font-mono text-[11px] text-zinc-500", children: [_jsxs("span", { children: ["#", number] }), _jsx("span", { className: "truncate", children: bug.pathname }), signalCount > 0 && (_jsx("span", { className: "shrink-0 rounded bg-red-100 px-1 text-red-700", children: signalCountLabel(signalCount) }))] }), _jsx("p", { className: "line-clamp-2 text-sm", children: bug.note }), _jsxs("div", { className: "mt-1 flex gap-2 text-xs", children: [_jsx("button", { type: "button", onClick: () => startEdit(bug.id), className: "text-zinc-600 underline hover:no-underline", children: LABELS.edit }), _jsx("button", { type: "button", onClick: () => deleteBug(bug.id), className: "text-red-600 underline hover:no-underline", children: LABELS.delete })] })] })] }));
}

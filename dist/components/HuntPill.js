'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LABELS } from '../helpers/labels.js';
import { useBugHunt } from '../hooks/use-bug-hunt.js';
/**
 * The floating toggle, bottom-right beside the i18n editor's pill: `right-4`
 * plus that pill's width (`i18n` in 12px mono, `px-3`) plus an 8px gap, and
 * clear of the Next.js dev indicator in the bottom-left corner. It carries the
 * session's bug count, and turns amber when Save has no board to write to.
 */
export function HuntPill() {
    const { isOpen, setOpen, bugs, target } = useBugHunt();
    const hasNoBoard = target.status === 'missing';
    return (_jsxs("button", { type: "button", onClick: () => setOpen(!isOpen), title: LABELS.pillTitle, className: `fixed bottom-4 right-[4.8rem] z-[2147483000] flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-xs font-semibold shadow-lg ring-1 ring-white/20 ${hasNoBoard ? 'bg-amber-500 text-zinc-900 hover:bg-amber-400' : 'bg-zinc-900 text-white hover:bg-zinc-700'}`, children: [LABELS.pill, bugs.length > 0 && (_jsx("span", { className: "rounded-full bg-red-500 px-1.5 text-white", children: bugs.length }))] }));
}

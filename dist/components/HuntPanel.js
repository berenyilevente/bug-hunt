'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LABELS } from '../helpers/labels.js';
import { useBugHunt } from '../hooks/use-bug-hunt.js';
import { BugList } from './BugList.js';
import { HuntFooter } from './HuntFooter.js';
import { HuntToolbar } from './HuntToolbar.js';
/**
 * The side panel, on the left so the i18n editor's panel can sit on the right.
 * Always mounted and hidden when closed; non-modal, so the page behind it
 * stays usable while hunting.
 *
 * Hidden by class, not by the `hidden` attribute alone: Tailwind's preflight
 * hides `[hidden]` in its base layer, which any display utility (`flex`) on the
 * same element overrides. The attribute stays for assistive technology.
 */
export function HuntPanel() {
    const { isOpen, setOpen } = useBugHunt();
    return (_jsxs("aside", { "aria-label": LABELS.panelTitle, hidden: !isOpen, className: `fixed inset-y-0 left-0 z-[2147483000] w-[22rem] max-w-full flex-col border-r border-zinc-200 bg-white font-sans text-zinc-900 shadow-2xl ${isOpen ? 'flex' : 'hidden'}`, children: [_jsxs("header", { className: "flex items-center justify-between border-b border-zinc-200 px-3 py-2", children: [_jsx("h2", { className: "text-sm font-semibold", children: LABELS.panelTitle }), _jsx("button", { type: "button", onClick: () => setOpen(false), className: "rounded px-2 py-0.5 text-sm text-zinc-500 hover:bg-zinc-100", children: LABELS.close })] }), _jsx(HuntToolbar, {}), _jsx(BugList, {}), _jsx(HuntFooter, {})] }));
}

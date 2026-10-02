'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { LABELS, savedLabel } from '../helpers/labels.js';
/** Where the report went, and the command that turns it into tickets. */
export function SavedNotice({ report }) {
    const [isCopied, setIsCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(LABELS.triageCommand);
            setIsCopied(true);
        }
        catch {
            // No clipboard permission: the command is on screen to copy by hand.
        }
    };
    return (_jsxs("div", { role: "status", className: "flex flex-col gap-1 rounded-md bg-emerald-50 p-2 text-xs text-emerald-900", children: [_jsxs("p", { children: [savedLabel(report.bugCount), ' ', _jsx("code", { className: "break-all font-mono", children: report.folder })] }), _jsx("p", { children: LABELS.nextStep }), _jsxs("p", { className: "flex items-center gap-2", children: [_jsx("code", { className: "rounded bg-white px-1.5 py-0.5 font-mono", children: LABELS.triageCommand }), _jsx("button", { type: "button", onClick: () => void copy(), className: "underline hover:no-underline", children: isCopied ? LABELS.copied : LABELS.copy })] })] }));
}

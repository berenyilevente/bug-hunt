'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { toViewportBox } from '../helpers/geometry.js';
import { LABELS } from '../helpers/labels.js';
import { useBugHunt } from '../hooks/use-bug-hunt.js';
const FORM_WIDTH = 320;
const FORM_HEIGHT = 190;
const GAP = 8;
/**
 * Below the mark when it fits, above it when it does not, and kept inside the
 * viewport either way.
 */
function placeNear(rect) {
    const box = toViewportBox(rect);
    const below = box.top + box.height + GAP;
    const top = below + FORM_HEIGHT <= window.innerHeight
        ? below
        : Math.max(GAP, box.top - FORM_HEIGHT - GAP);
    const left = Math.min(Math.max(GAP, box.left), window.innerWidth - FORM_WIDTH - GAP);
    return { top, left };
}
function NoteCard({ initialNote, rect, isEdit }) {
    const { submitNote, closeNote } = useBugHunt();
    const [note, setNote] = useState(initialNote);
    const position = rect ? placeNear(rect) : null;
    const handleKeyDown = (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault();
            submitNote(note);
            return;
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            closeNote();
        }
    };
    return (_jsxs("form", { onSubmit: (event) => {
            event.preventDefault();
            submitNote(note);
        }, className: `fixed z-[2147483001] flex w-80 flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-3 font-sans text-zinc-900 shadow-2xl ${position ? '' : 'left-1/2 top-1/3 -translate-x-1/2'}`, 
        // Placed next to a measured mark — the one inline style.
        style: position ?? undefined, children: [_jsx("textarea", { "aria-label": LABELS.noteLabel, value: note, onChange: (event) => setNote(event.target.value), onKeyDown: handleKeyDown, placeholder: LABELS.notePlaceholder, rows: 4, autoFocus: true, className: "w-full resize-none rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-500" }), _jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx("button", { type: "button", onClick: closeNote, className: "rounded-md px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100", children: LABELS.noteCancel }), _jsxs("button", { type: "submit", disabled: note.trim() === '', className: "rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-40", children: [isEdit ? LABELS.noteUpdate : LABELS.noteSave, ' ', _jsx("kbd", { className: "font-mono text-[10px] opacity-70", children: LABELS.noteShortcut })] })] })] }));
}
/**
 * The note for a new mark, or for the bug being edited. Keyed by what it is
 * about, so switching from one to the next starts from that one's text.
 */
export function NoteForm() {
    const { pending, editingBug } = useBugHunt();
    if (editingBug) {
        return (_jsx(NoteCard, { initialNote: editingBug.note, rect: null, isEdit: true }, editingBug.id));
    }
    if (pending) {
        return (_jsx(NoteCard, { initialNote: "", rect: pending.mark.rect, isEdit: false }, pending.markedAt));
    }
    return null;
}

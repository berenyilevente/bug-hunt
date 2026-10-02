'use client';
import { useEffect, useLayoutEffect, useRef, useState, useTransition, } from 'react';
import { clearDraft, newSession, readDraft, writeDraft, } from '../helpers/draftStore.js';
import { failureLabel, OPEN_STORAGE_KEY, SHORTCUT_CODES, } from '../helpers/labels.js';
import { captureViewport } from '../helpers/screenshot.js';
import { uploadSession } from '../helpers/uploadSession.js';
import { createHuntContext } from './create-hunt-context.js';
import { usePageSignals } from './use-page-signals.js';
function readStoredOpen() {
    try {
        return window.localStorage.getItem(OPEN_STORAGE_KEY) === 'true';
    }
    catch {
        return false;
    }
}
function storeOpen(isOpen) {
    try {
        window.localStorage.setItem(OPEN_STORAGE_KEY, String(isOpen));
    }
    catch {
        // A blocked storage only costs remembering the panel across reloads.
    }
}
/** ⌥⇧ plus a key, matched by physical key. */
function isShortcut(event, code) {
    return event.altKey && event.shiftKey && event.code === code;
}
function useHuntValue({ target, steps }) {
    const [isOpen, setIsOpen] = useState(readStoredOpen);
    const [isPicking, setIsPicking] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [pending, setPending] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [hoveredBugId, setHoveredBugId] = useState(null);
    const [session, setSession] = useState(() => readDraft() ?? newSession());
    const [isStorageFull, setIsStorageFull] = useState(false);
    const [status, setStatus] = useState(null);
    const [isSaving, startTransition] = useTransition();
    const signalsFor = usePageSignals();
    const updateSession = (next) => {
        setSession(next);
        setIsStorageFull(writeDraft(next) !== 'saved');
        setStatus(null);
    };
    const setOpen = (next) => {
        setIsOpen(next);
        storeOpen(next);
    };
    const startPicking = () => {
        setPending(null);
        setEditingId(null);
        setIsPicking(true);
    };
    const cancelPicking = () => setIsPicking(false);
    const completeMark = async (mark) => {
        setIsPicking(false);
        setIsCapturing(true);
        const screenshot = await captureViewport(mark.rect);
        setPending({
            mark,
            url: window.location.href,
            pathname: window.location.pathname,
            screenshot,
            markedAt: new Date().toISOString(),
            ...signalsFor(window.location.pathname),
        });
        setIsCapturing(false);
    };
    const editingBug = session.bugs.find((bug) => bug.id === editingId) ?? null;
    const closeNote = () => {
        setPending(null);
        setEditingId(null);
    };
    const submitNote = (note, kind) => {
        const trimmed = note.trim();
        if (trimmed === '') {
            return;
        }
        if (editingBug) {
            updateSession({
                ...session,
                bugs: session.bugs.map((bug) => bug.id === editingBug.id ? { ...bug, note: trimmed, kind } : bug),
            });
            closeNote();
            return;
        }
        if (!pending) {
            return;
        }
        const bug = {
            id: crypto.randomUUID(),
            kind,
            note: trimmed,
            ...pending,
        };
        updateSession({ ...session, bugs: [...session.bugs, bug] });
        closeNote();
    };
    const startEdit = (id) => {
        setPending(null);
        setEditingId(id);
    };
    const deleteBug = (id) => {
        updateSession({
            ...session,
            bugs: session.bugs.filter((bug) => bug.id !== id),
        });
    };
    const discardSession = () => {
        clearDraft();
        setSession(newSession());
        setIsStorageFull(false);
        setStatus(null);
        closeNote();
    };
    const save = () => {
        if (session.bugs.length === 0 || isSaving) {
            return;
        }
        startTransition(async () => {
            const result = await uploadSession(session, steps);
            if (result.status === 'error') {
                setStatus({
                    kind: 'error',
                    message: failureLabel(result.reason, result.detail),
                });
                return;
            }
            clearDraft();
            setSession(newSession());
            setIsStorageFull(false);
            setStatus({ kind: 'saved', report: result.data });
        });
    };
    const handleKeyDown = (event) => {
        if (isShortcut(event, SHORTCUT_CODES.toggle)) {
            event.preventDefault();
            setOpen(!isOpen);
            return;
        }
        if (isShortcut(event, SHORTCUT_CODES.mark)) {
            event.preventDefault();
            startPicking();
            return;
        }
        if (isPicking && event.key === 'Escape') {
            event.preventDefault();
            cancelPicking();
        }
    };
    // The listener is subscribed once and always calls this render's handler —
    // `useEffectEvent`'s job, which the installed hooks lint rule cannot read yet.
    const keyDownRef = useRef(handleKeyDown);
    useLayoutEffect(() => {
        keyDownRef.current = handleKeyDown;
    });
    // In the capture phase, ahead of the page: a dialog's own Escape listener
    // sits on `document`, and sees this one's `preventDefault` as handled — so
    // Esc while picking over an open dialog cancels the pick, not the dialog.
    useEffect(() => {
        const listener = (event) => keyDownRef.current(event);
        window.addEventListener('keydown', listener, true);
        return () => window.removeEventListener('keydown', listener, true);
    }, []);
    return {
        target,
        isOpen,
        setOpen,
        isPicking,
        isCapturing,
        startPicking,
        cancelPicking,
        completeMark,
        pending,
        editingBug,
        submitNote,
        closeNote,
        startEdit,
        deleteBug,
        bugs: session.bugs,
        hoveredBugId,
        setHoveredBugId,
        isStorageFull,
        status,
        isSaving,
        save,
        discardSession,
    };
}
export const [useBugHunt, BugHuntProvider] = createHuntContext(useHuntValue);

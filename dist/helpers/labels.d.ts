import type { HuntFailure, ItemCounts, ItemKind } from './types.js';
/**
 * Every word the overlay shows. Deliberately not in `messages/`: this is
 * developer tooling that is never shipped. Held here rather than inline so the
 * host's `i18next/no-literal-string` rule, which guards `.tsx` files, stays
 * green without a disable.
 */
export declare const LABELS: {
    readonly pill: "bugs";
    readonly pillTitle: "Toggle the bug hunt (⌥⇧B)";
    readonly panelTitle: "Bug hunt";
    readonly close: "Close";
    readonly mark: "Mark something";
    readonly markShortcut: "⌥⇧M";
    readonly picking: "Click an element, or drag a box. Esc cancels.";
    readonly capturing: "Capturing…";
    readonly save: "Save";
    readonly saving: "Saving…";
    readonly discardSession: "Discard session";
    readonly empty: "Nothing marked yet. Mark a bug or a feature idea on the page.";
    readonly edit: "Edit";
    readonly delete: "Delete";
    readonly noteLabel: "Note";
    readonly kindLabel: "Kind";
    readonly noteSave: "Add";
    readonly noteUpdate: "Update";
    readonly noteCancel: "Cancel";
    readonly noteShortcut: "⌘↵";
    readonly noBoard: "Save has nowhere to go:";
    readonly storageWarning: "The browser storage is full: screenshots will not survive a reload until you save.";
    readonly nextStep: "Now run this in Claude Code, from this repo:";
    readonly triageCommand: "/triage-business-review";
    readonly copy: "Copy";
    readonly copied: "Copied";
    readonly noScreenshot: "no image";
};
/** What each kind is called, on the toggle and the row badge. */
export declare const KIND_LABELS: Record<ItemKind, string>;
/** The note's prompt, per kind: a bug and a feature ask for different things. */
export declare const NOTE_PLACEHOLDERS: Record<ItemKind, string>;
/** `2 bugs · 1 feature` — a kind with none is left out. */
export declare function itemCountLabel({ bugs, features }: ItemCounts): string;
export declare function savedLabel(counts: ItemCounts): string;
export declare function signalCountLabel(count: number): string;
export declare function failureLabel(reason: HuntFailure, detail?: string): string;
/** Where the unsaved session lives between reloads, per browser. */
export declare const DRAFT_STORAGE_KEY = "bug-hunt:session";
/** Where the panel remembers whether it was open, per browser. */
export declare const OPEN_STORAGE_KEY = "bug-hunt:open";
/**
 * The attribute both dev overlays carry. Picking skips anything under it and
 * the screenshot leaves it out, so an overlay never reports itself.
 */
export declare const DEV_OVERLAY_ATTRIBUTE = "data-dev-overlay";
/** The shortcuts' physical keys: on a Mac, Option turns `event.key` into a glyph. */
export declare const SHORTCUT_CODES: {
    readonly toggle: "KeyB";
    readonly mark: "KeyM";
};
/** How far a press must travel before it is a box rather than a click. */
export declare const DRAG_THRESHOLD = 8;
/** Per page, how many console errors and failed requests are kept. */
export declare const SIGNAL_LIMIT = 20;

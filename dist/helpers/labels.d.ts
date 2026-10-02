import type { HuntFailure } from './types.js';
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
    readonly mark: "Mark a bug";
    readonly markShortcut: "⌥⇧M";
    readonly picking: "Click an element, or drag a box. Esc cancels.";
    readonly capturing: "Capturing…";
    readonly save: "Save";
    readonly saving: "Saving…";
    readonly discardSession: "Discard session";
    readonly empty: "No bugs yet. Mark one on the page.";
    readonly edit: "Edit";
    readonly delete: "Delete";
    readonly notePlaceholder: "What is wrong here? What did you expect?";
    readonly noteLabel: "Bug note";
    readonly noteSave: "Add";
    readonly noteUpdate: "Update";
    readonly noteCancel: "Cancel";
    readonly noteShortcut: "⌘↵";
    readonly noBoard: "Save has nowhere to go:";
    readonly storageWarning: "The browser storage is full: screenshots will not survive a reload until you save.";
    readonly nextStep: "Now run this in Claude Code, from this repo:";
    readonly triageCommand: "/triage-bugs";
    readonly copy: "Copy";
    readonly copied: "Copied";
    readonly noScreenshot: "no image";
};
export declare function bugCountLabel(count: number): string;
export declare function savedLabel(count: number): string;
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

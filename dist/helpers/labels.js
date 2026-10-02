/**
 * Every word the overlay shows. Deliberately not in `messages/`: this is
 * developer tooling that is never shipped. Held here rather than inline so the
 * host's `i18next/no-literal-string` rule, which guards `.tsx` files, stays
 * green without a disable.
 */
export const LABELS = {
    pill: 'bugs',
    pillTitle: 'Toggle the bug hunt (⌥⇧B)',
    panelTitle: 'Bug hunt',
    close: 'Close',
    mark: 'Mark something',
    markShortcut: '⌥⇧M',
    picking: 'Click an element, or drag a box. Esc cancels.',
    capturing: 'Capturing…',
    save: 'Save',
    saving: 'Saving…',
    discardSession: 'Discard session',
    empty: 'Nothing marked yet. Mark a bug or a feature idea on the page.',
    edit: 'Edit',
    delete: 'Delete',
    noteLabel: 'Note',
    kindLabel: 'Kind',
    noteSave: 'Add',
    noteUpdate: 'Update',
    noteCancel: 'Cancel',
    noteShortcut: '⌘↵',
    noBoard: 'Save has nowhere to go:',
    storageWarning: 'The browser storage is full: screenshots will not survive a reload until you save.',
    nextStep: 'Now run this in Claude Code, from this repo:',
    triageCommand: '/triage-business-review',
    copy: 'Copy',
    copied: 'Copied',
    noScreenshot: 'no image',
};
/** What each kind is called, on the toggle and the row badge. */
export const KIND_LABELS = {
    bug: 'Bug',
    feature: 'Feature',
};
/** The note's prompt, per kind: a bug and a feature ask for different things. */
export const NOTE_PLACEHOLDERS = {
    bug: 'What is wrong here? What did you expect?',
    feature: 'What should this do? Why would it help?',
};
function plural(count, one, many) {
    return `${count} ${count === 1 ? one : many}`;
}
/** `2 bugs · 1 feature` — a kind with none is left out. */
export function itemCountLabel({ bugs, features }) {
    return [
        bugs > 0 ? plural(bugs, 'bug', 'bugs') : null,
        features > 0 ? plural(features, 'feature', 'features') : null,
    ]
        .filter(Boolean)
        .join(' · ');
}
export function savedLabel(counts) {
    return `${itemCountLabel(counts)} saved to`;
}
export function signalCountLabel(count) {
    return count === 1 ? '1 error' : `${count} errors`;
}
const FAILURE_LABELS = {
    disabled: 'Saving is off: NEXT_PUBLIC_BUG_HUNT is not true.',
    invalid: 'The save request was malformed.',
    noBoard: 'No disposit board to save to:',
    io: 'The report could not be written. See the dev server log.',
    noRoute: 'Nothing answered the save. Is the route file in place (npx bug-hunt setup)? Tried',
};
export function failureLabel(reason, detail) {
    return detail
        ? `${FAILURE_LABELS[reason]} ${detail}`
        : FAILURE_LABELS[reason];
}
/** Where the unsaved session lives between reloads, per browser. */
export const DRAFT_STORAGE_KEY = 'bug-hunt:session';
/** Where the panel remembers whether it was open, per browser. */
export const OPEN_STORAGE_KEY = 'bug-hunt:open';
/**
 * The attribute both dev overlays carry. Picking skips anything under it and
 * the screenshot leaves it out, so an overlay never reports itself.
 */
export const DEV_OVERLAY_ATTRIBUTE = 'data-dev-overlay';
/** The shortcuts' physical keys: on a Mac, Option turns `event.key` into a glyph. */
export const SHORTCUT_CODES = { toggle: 'KeyB', mark: 'KeyM' };
/** How far a press must travel before it is a box rather than a click. */
export const DRAG_THRESHOLD = 8;
/** Per page, how many console errors and failed requests are kept. */
export const SIGNAL_LIMIT = 20;

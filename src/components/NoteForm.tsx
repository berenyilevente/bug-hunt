'use client';

import { useState, type KeyboardEvent, type ReactNode } from 'react';

import { toViewportBox } from '../helpers/geometry.js';
import { LABELS, NOTE_PLACEHOLDERS } from '../helpers/labels.js';
import type { ItemKind, Rect } from '../helpers/types.js';
import { useBugHunt } from '../hooks/use-bug-hunt.js';
import { KindToggle } from './KindToggle.js';

const FORM_WIDTH = 320;
const FORM_HEIGHT = 226;
const GAP = 8;

/**
 * Below the mark when it fits, above it when it does not, and kept inside the
 * viewport either way.
 */
function placeNear(rect: Rect): { top: number; left: number } {
  const box = toViewportBox(rect);
  const below = box.top + box.height + GAP;
  const top =
    below + FORM_HEIGHT <= window.innerHeight
      ? below
      : Math.max(GAP, box.top - FORM_HEIGHT - GAP);
  const left = Math.min(
    Math.max(GAP, box.left),
    window.innerWidth - FORM_WIDTH - GAP
  );

  return { top, left };
}

type NoteCardProps = {
  initialNote: string;
  initialKind: ItemKind;
  rect: Rect | null;
  isEdit: boolean;
};

function NoteCard({
  initialNote,
  initialKind,
  rect,
  isEdit,
}: NoteCardProps): ReactNode {
  const { submitNote, closeNote } = useBugHunt();
  const [note, setNote] = useState(initialNote);
  const [kind, setKind] = useState(initialKind);
  const position = rect ? placeNear(rect) : null;

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      submitNote(note, kind);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeNote();
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitNote(note, kind);
      }}
      className={`fixed z-[2147483001] flex w-80 flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-3 font-sans text-zinc-900 shadow-2xl ${position ? '' : 'left-1/2 top-1/3 -translate-x-1/2'}`}
      // Placed next to a measured mark — the one inline style.
      style={position ?? undefined}
    >
      <KindToggle kind={kind} onChange={setKind} />
      <textarea
        aria-label={LABELS.noteLabel}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={NOTE_PLACEHOLDERS[kind]}
        rows={4}
        autoFocus
        className="w-full resize-none rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-500"
      />
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={closeNote}
          className="rounded-md px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
        >
          {LABELS.noteCancel}
        </button>
        <button
          type="submit"
          disabled={note.trim() === ''}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-40"
        >
          {isEdit ? LABELS.noteUpdate : LABELS.noteSave}{' '}
          <kbd className="font-mono text-[10px] opacity-70">
            {LABELS.noteShortcut}
          </kbd>
        </button>
      </div>
    </form>
  );
}

/**
 * The note for a new mark, or for the bug being edited. Keyed by what it is
 * about, so switching from one to the next starts from that one's text.
 */
export function NoteForm(): ReactNode {
  const { pending, editingBug } = useBugHunt();

  if (editingBug) {
    return (
      <NoteCard
        key={editingBug.id}
        initialNote={editingBug.note}
        initialKind={editingBug.kind}
        rect={null}
        isEdit
      />
    );
  }

  if (pending) {
    return (
      <NoteCard
        key={pending.markedAt}
        initialNote=""
        initialKind="bug"
        rect={pending.mark.rect}
        isEdit={false}
      />
    );
  }

  return null;
}

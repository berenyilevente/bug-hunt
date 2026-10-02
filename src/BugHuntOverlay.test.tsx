import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { captureViewport } = vi.hoisted(() => ({ captureViewport: vi.fn() }));

vi.mock('./helpers/screenshot.js', () => ({ captureViewport }));

import { BugHuntOverlay } from './BugHuntOverlay.js';
import { JPEG, makeBug, makeSession } from './helpers/fixtures.js';
import { DRAFT_STORAGE_KEY } from './helpers/labels.js';
import type { HuntTarget } from './helpers/types.js';

const beginBugReport = vi.fn();
const saveBugScreenshot = vi.fn();
const finishBugReport = vi.fn();
const steps = {
  begin: beginBugReport,
  screenshot: saveBugScreenshot,
  finish: finishBugReport,
};

const READY: HuntTarget = {
  status: 'ready',
  board: 'appointiq',
  reportsPath: '/data/appointiq/bug-reports',
};

let pageTarget: HTMLElement;

function renderHunt(target: HuntTarget = READY): void {
  render(
    <>
      <main>
        <button type="button" data-testid="invite">
          Invite member
        </button>
      </main>
      <BugHuntOverlay target={target} steps={steps} />
    </>
  );
  pageTarget = screen.getByTestId('invite');
}

function openPanel(): HTMLElement {
  fireEvent.keyDown(window, { code: 'KeyB', altKey: true, shiftKey: true });

  return screen.getByRole('complementary', { name: 'Bug hunt' });
}

function pickLayer(): HTMLElement {
  return screen.getByRole('presentation');
}

async function markElementWithNote(note: string): Promise<void> {
  fireEvent.click(screen.getByRole('button', { name: /Mark something/ }));
  fireEvent.pointerDown(pickLayer(), { clientX: 5, clientY: 5 });
  fireEvent.pointerUp(pickLayer(), { clientX: 5, clientY: 5 });

  const textarea = await screen.findByRole('textbox', { name: 'Note' });

  fireEvent.change(textarea, { target: { value: note } });
  fireEvent.click(screen.getByRole('button', { name: /Add/ }));
}

function storedSession(): { bugs: Array<Record<string, unknown>> } {
  return JSON.parse(window.localStorage.getItem(DRAFT_STORAGE_KEY) ?? 'null');
}

beforeEach(() => {
  window.localStorage.clear();
  vi.resetAllMocks();
  captureViewport.mockResolvedValue(JPEG);
  // jsdom lays nothing out: the element "under the pointer" is the page's button.
  document.elementsFromPoint = () => [pageTarget];
});

afterEach(() => {
  window.localStorage.clear();
});

describe('BugHuntOverlay', () => {
  it('stays closed until ⌥⇧B, then shows an empty session', () => {
    renderHunt();

    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();

    const panel = openPanel();

    expect(within(panel).getByText(/Nothing marked yet/)).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('marks a clicked element with its selector, text, screenshot and note', async () => {
    renderHunt();
    const panel = openPanel();

    await markElementWithNote('The invite button overlaps the header.');

    expect(
      within(panel).getByText('The invite button overlaps the header.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bugs/ })).toHaveTextContent('1');

    const [bug] = storedSession().bugs;

    expect(bug).toMatchObject({
      note: 'The invite button overlaps the header.',
      screenshot: JPEG,
      mark: {
        kind: 'element',
        selector: '[data-testid="invite"]',
        text: 'Invite member',
      },
    });
  });

  it('marks a dragged box, and Esc leaves pick mode without a mark', async () => {
    renderHunt();
    openPanel();

    fireEvent.click(screen.getByRole('button', { name: /Mark something/ }));
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(screen.queryByRole('presentation')).not.toBeInTheDocument();

    fireEvent.keyDown(window, { code: 'KeyM', altKey: true, shiftKey: true });
    fireEvent.pointerDown(pickLayer(), { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(pickLayer(), { clientX: 60, clientY: 90 });
    fireEvent.pointerUp(pickLayer(), { clientX: 60, clientY: 90 });

    const textarea = await screen.findByRole('textbox', { name: 'Note' });

    fireEvent.change(textarea, { target: { value: 'Gap under the table' } });
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });

    expect(storedSession().bugs[0].mark).toMatchObject({
      kind: 'box',
      rect: { x: 10, y: 10, width: 50, height: 80 },
    });
  });

  it('attaches the console errors the page logged', async () => {
    renderHunt();
    openPanel();

    act(() => {
      console.error('Hydration failed');
    });

    await markElementWithNote('Broken');

    expect(storedSession().bugs[0].consoleErrors).toEqual([
      { message: 'Hydration failed' },
    ]);
    expect(screen.getByText('1 error')).toBeInTheDocument();
  });

  it('edits and deletes a bug', async () => {
    renderHunt();
    const panel = openPanel();

    await markElementWithNote('First wording');
    fireEvent.click(within(panel).getByRole('button', { name: 'Edit' }));

    const textarea = screen.getByRole('textbox', { name: 'Note' });

    expect(textarea).toHaveValue('First wording');
    fireEvent.change(textarea, { target: { value: 'Second wording' } });
    fireEvent.click(screen.getByRole('button', { name: /Update/ }));

    expect(within(panel).getByText('Second wording')).toBeInTheDocument();

    fireEvent.click(within(panel).getByRole('button', { name: 'Delete' }));

    expect(within(panel).getByText(/Nothing marked yet/)).toBeInTheDocument();
    expect(storedSession().bugs).toEqual([]);
  });

  it('records a feature request, badges it, and lets an edit make it a bug', async () => {
    renderHunt();
    const panel = openPanel();

    fireEvent.click(screen.getByRole('button', { name: /Mark something/ }));
    fireEvent.pointerDown(pickLayer(), { clientX: 5, clientY: 5 });
    fireEvent.pointerUp(pickLayer(), { clientX: 5, clientY: 5 });

    const textarea = await screen.findByRole('textbox', { name: 'Note' });
    const feature = screen.getByRole('button', { name: 'Feature' });

    expect(screen.getByRole('button', { name: 'Bug' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    fireEvent.click(feature);
    expect(feature).toHaveAttribute('aria-pressed', 'true');
    expect(textarea).toHaveAttribute(
      'placeholder',
      'What should this do? Why would it help?'
    );
    fireEvent.change(textarea, { target: { value: 'Export members as CSV' } });
    fireEvent.click(screen.getByRole('button', { name: /Add/ }));

    expect(storedSession().bugs[0]).toMatchObject({ kind: 'feature' });
    expect(within(panel).getByText('Feature')).toBeInTheDocument();
    expect(within(panel).getByText('1 feature')).toBeInTheDocument();

    fireEvent.click(within(panel).getByRole('button', { name: 'Edit' }));
    expect(screen.getByRole('button', { name: 'Feature' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Bug' }));
    fireEvent.click(screen.getByRole('button', { name: /Update/ }));

    expect(storedSession().bugs[0]).toMatchObject({
      kind: 'bug',
      note: 'Export members as CSV',
    });
    expect(within(panel).getByText('1 bug')).toBeInTheDocument();
  });

  it('restores an unsaved session after a reload', () => {
    window.localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify(makeSession([makeBug({ note: 'From before the reload' })]))
    );
    renderHunt();

    expect(
      within(openPanel()).getByText('From before the reload')
    ).toBeInTheDocument();
  });

  it('saves to the board, clears the draft, and hands over /triage-business-review', async () => {
    window.localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify(makeSession())
    );
    beginBugReport.mockResolvedValue({
      status: 'success',
      data: { folder: '2026-09-25-1430' },
    });
    saveBugScreenshot.mockResolvedValue({
      status: 'success',
      data: { file: 'shots/01.jpg' },
    });
    finishBugReport.mockResolvedValue({
      status: 'success',
      data: {
        board: 'appointiq',
        folder: '/data/appointiq/bug-reports/2026-09-25-1430',
        counts: { bugs: 1, features: 0 },
      },
    });
    renderHunt();
    const panel = openPanel();

    fireEvent.click(within(panel).getByRole('button', { name: 'Save' }));

    const status = await within(panel).findByRole('status');

    expect(status).toHaveTextContent(
      '/data/appointiq/bug-reports/2026-09-25-1430'
    );
    expect(status).toHaveTextContent('/triage-business-review');
    expect(window.localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
    expect(within(panel).getByText(/Nothing marked yet/)).toBeInTheDocument();
  });

  it('keeps the draft and says why when a save fails', async () => {
    window.localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify(makeSession())
    );
    beginBugReport.mockResolvedValue({ status: 'error', reason: 'io' });
    renderHunt();
    const panel = openPanel();

    fireEvent.click(within(panel).getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(within(panel).getByRole('alert')).toHaveTextContent(
        'could not be written'
      )
    );
    expect(storedSession().bugs).toHaveLength(1);
  });

  it('warns up front, and disables Save, when there is no board', () => {
    window.localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify(makeSession())
    );
    renderHunt({ status: 'missing', detail: 'no board claims /repo' });
    const panel = openPanel();

    expect(within(panel).getByRole('alert')).toHaveTextContent(
      'no board claims /repo'
    );
    expect(within(panel).getByRole('button', { name: 'Save' })).toBeDisabled();
  });
});

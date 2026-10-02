import * as Dialog from '@radix-ui/react-dialog';
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

import { JPEG } from './helpers/fixtures.js';
import type { HuntTarget } from './helpers/types.js';
import { OverlayRoot } from './OverlayRoot.js';

const READY: HuntTarget = {
  status: 'ready',
  board: 'appointiq',
  reportsPath: '/data/appointiq/bug-reports',
};

/** The modal the shadcn dialog and the vaul sheet are both built on. */
function PageWithDialog(): React.ReactNode {
  return (
    <Dialog.Root defaultOpen>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content aria-describedby={undefined}>
          <Dialog.Title>Edit member</Dialog.Title>
          <input aria-label="Member name" />
          <button type="button" data-testid="save-member">
            Save member
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** A modal hides everything else from the accessibility tree: query past it. */
const HIDDEN = { hidden: true } as const;

let host: HTMLElement;

/** The overlay's shadow root, where its whole tree lives. */
function shadow(): ShadowRoot {
  const shadowRoot = host.firstElementChild?.shadowRoot;

  if (!shadowRoot) {
    throw new Error('the overlay has no shadow root');
  }

  return shadowRoot;
}

/** Queries scoped to the overlay: `screen` cannot see into a shadow root. */
function overlay(): ReturnType<typeof within> {
  return within(shadow().lastElementChild as HTMLElement);
}

async function renderOverPage(): Promise<void> {
  const { container } = render(
    <>
      <PageWithDialog />
      <OverlayRoot target={READY} endpoint="/api/bug-hunt" />
    </>
  );

  host = container.querySelector('[data-dev-overlay]') as HTMLElement;
  // The overlay's root renders after the page's commit.
  await waitFor(() =>
    expect(
      overlay().getByRole('button', { name: /bugs/, ...HIDDEN })
    ).toBeInTheDocument()
  );
  // Radix arms its outside-pointer listener on a timeout of its own.
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
}

function dialog(): HTMLElement | null {
  return screen.queryByRole('dialog', { name: 'Edit member' });
}

function startPicking(): HTMLElement {
  fireEvent.keyDown(window, { code: 'KeyM', altKey: true, shiftKey: true });

  return overlay().getByRole('presentation', HIDDEN);
}

beforeEach(() => {
  window.localStorage.clear();
  captureViewport.mockResolvedValue(JPEG);
  // jsdom lays nothing out: the element "under the pointer" is the dialog's.
  document.elementsFromPoint = () => [screen.getByTestId('save-member')];
});

afterEach(() => {
  window.localStorage.clear();
});

describe('OverlayRoot over an open dialog', () => {
  it('marks an element inside the dialog without closing it', async () => {
    await renderOverPage();
    const layer = startPicking();

    fireEvent.pointerDown(layer, { clientX: 5, clientY: 5 });
    fireEvent.pointerUp(layer, { clientX: 5, clientY: 5 });

    const textarea = await overlay().findByRole('textbox', {
      name: 'Bug note',
      ...HIDDEN,
    });

    expect(dialog()).toBeInTheDocument();
    await waitFor(() => expect(shadow().activeElement).toBe(textarea));

    fireEvent.change(textarea, { target: { value: 'Save overlaps the name' } });
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });

    expect(dialog()).toBeInTheDocument();
    expect(
      JSON.parse(window.localStorage.getItem('bug-hunt:session') ?? '{}')
        .bugs[0].mark
    ).toMatchObject({ selector: '[data-testid="save-member"]' });
  });

  it('keeps the dialog open when Esc cancels a pick or a note', async () => {
    await renderOverPage();
    startPicking();

    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: 'Escape',
    });

    expect(
      overlay().queryByRole('presentation', HIDDEN)
    ).not.toBeInTheDocument();
    expect(dialog()).toBeInTheDocument();

    const layer = startPicking();

    fireEvent.pointerDown(layer, { clientX: 5, clientY: 5 });
    fireEvent.pointerUp(layer, { clientX: 5, clientY: 5 });

    const textarea = await overlay().findByRole('textbox', {
      name: 'Bug note',
      ...HIDDEN,
    });

    fireEvent.keyDown(textarea, { key: 'Escape' });

    expect(
      overlay().queryByRole('textbox', { name: 'Bug note', ...HIDDEN })
    ).not.toBeInTheDocument();
    expect(dialog()).toBeInTheDocument();
  });

  it('opens the panel from its pill without closing the dialog', async () => {
    await renderOverPage();

    const pill = overlay().getByRole('button', { name: /bugs/, ...HIDDEN });

    fireEvent.pointerDown(pill);
    fireEvent.click(pill);

    // jsdom computes no accessible name inside a shadow root: found by role,
    // then checked by its label.
    const [panel] = overlay().getAllByRole('complementary', HIDDEN);

    expect(panel).toHaveAttribute('aria-label', 'Bug hunt');
    expect(panel).not.toHaveAttribute('hidden');
    expect(dialog()).toBeInTheDocument();
  });

  it('carries its own stylesheet inside the shadow root', async () => {
    await renderOverPage();

    expect(shadow().querySelector('style')?.textContent).toContain(
      'z-index:2147483000'
    );
    expect(document.head.innerHTML).not.toContain('z-index:2147483000');
  });
});

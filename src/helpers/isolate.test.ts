// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isolateFromPage } from './isolate.js';

let host: HTMLElement;
let inside: HTMLButtonElement;
let pageField: HTMLInputElement;
let release: () => void;

beforeEach(() => {
  host = document.createElement('div');
  inside = document.createElement('button');
  pageField = document.createElement('input');
  host.appendChild(inside);
  document.body.append(pageField, host);
  release = isolateFromPage(host);
});

afterEach(() => {
  release();
  document.body.replaceChildren();
});

describe('isolateFromPage', () => {
  it('keeps the overlay’s pointer, focus and wheel events from reaching the document', () => {
    const heard = vi.fn();

    for (const type of ['pointerdown', 'focusin', 'wheel', 'click']) {
      document.addEventListener(type, heard);
      inside.dispatchEvent(new Event(type, { bubbles: true }));
      document.removeEventListener(type, heard);
    }

    expect(heard).not.toHaveBeenCalled();
  });

  it('lets the page’s own events through', () => {
    const heard = vi.fn();

    document.addEventListener('pointerdown', heard);
    pageField.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    document.removeEventListener('pointerdown', heard);

    expect(heard).toHaveBeenCalledOnce();
  });

  it('hides a page field losing focus to the overlay, but not to the page', () => {
    const heard = vi.fn();

    document.addEventListener('focusout', heard);
    pageField.dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: inside })
    );
    pageField.dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: document.body,
      })
    );
    document.removeEventListener('focusout', heard);

    expect(heard).toHaveBeenCalledOnce();
  });

  it('marks Escape in the overlay as handled before the document’s capture phase', () => {
    let wasPrevented: boolean | null = null;
    const listener = (event: KeyboardEvent): void => {
      wasPrevented = event.defaultPrevented;
    };

    document.addEventListener('keydown', listener, true);
    inside.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      })
    );
    document.removeEventListener('keydown', listener, true);

    expect(wasPrevented).toBe(true);
  });

  it('stops nothing once released', () => {
    const heard = vi.fn();

    release();
    document.addEventListener('pointerdown', heard);
    inside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    document.removeEventListener('pointerdown', heard);

    expect(heard).toHaveBeenCalledOnce();
  });
});

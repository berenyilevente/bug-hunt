// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';

import { selectorFor, visibleText } from './selector.js';

afterEach(() => {
  document.body.innerHTML = '';
});

function find(selector: string): Element {
  const element = document.querySelector(selector);

  if (!element) {
    throw new Error(`no ${selector}`);
  }

  return element;
}

describe('selectorFor', () => {
  it('prefers a unique data-testid, then data-tour, then id', () => {
    document.body.innerHTML = `
      <button data-testid="save" data-tour="t" id="i">Save</button>
      <div data-tour="sidebar" id="side"></div>
      <p id="only"></p>`;

    expect(selectorFor(find('button'))).toBe('[data-testid="save"]');
    expect(selectorFor(find('div'))).toBe('[data-tour="sidebar"]');
    expect(selectorFor(find('p'))).toBe('[id="only"]');
  });

  it('skips a stable attribute that is not unique', () => {
    document.body.innerHTML = `
      <section data-testid="card"><span>a</span></section>
      <section data-testid="card"><span>b</span></section>`;

    expect(selectorFor(document.querySelectorAll('span')[1])).toBe(
      'body > section:nth-of-type(2) > span'
    );
  });

  it('walks up to the nearest stable ancestor, and finds the element again', () => {
    document.body.innerHTML = `
      <main data-testid="members"><ul><li>one</li><li><a>two</a></li></ul></main>`;

    const target = find('a');
    const selector = selectorFor(target);

    expect(selector).toBe(
      '[data-testid="members"] > ul > li:nth-of-type(2) > a'
    );
    expect(document.querySelector(selector)).toBe(target);
  });
});

describe('visibleText', () => {
  it('collapses whitespace and cuts long text', () => {
    document.body.innerHTML = `<p>  Hello \n  world  </p><p>${'x'.repeat(200)}</p>`;

    const [short, long] = document.querySelectorAll('p');

    expect(visibleText(short)).toBe('Hello world');
    expect(visibleText(long, 10)).toBe(`${'x'.repeat(9)}…`);
  });
});

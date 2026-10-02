// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

import { componentStack } from './componentStack.js';

type Fiber = { type: unknown; return: Fiber | null; _debugInfo?: unknown };

function chain(types: unknown[]): Fiber {
  return types.reduceRight<Fiber | null>(
    (parent, type) => ({ type, return: parent }),
    null
  ) as Fiber;
}

function withFiber(fiber: Fiber): Element {
  const element = document.createElement('button');

  Object.assign(element, { __reactFiber$abc123: fiber });

  return element;
}

function InviteButton(): null {
  return null;
}

function MembersList(): null {
  return null;
}

describe('componentStack', () => {
  it('lists the app components innermost first, skipping hosts and framework plumbing', () => {
    const fiber = chain([
      'button',
      InviteButton,
      'div',
      { displayName: 'Toolbar', render: MembersList },
      { render: MembersList },
      { type: InviteButton },
      function InnerLayoutRouter() {},
      function lowercase() {},
    ]);

    expect(componentStack(withFiber(fiber))).toEqual([
      'InviteButton',
      'Toolbar',
      'MembersList',
      'InviteButton',
    ]);
  });

  it('collapses a component repeated by its own wrappers, and stops at the cap', () => {
    const fiber = chain([
      InviteButton,
      InviteButton,
      MembersList,
      { displayName: 'A' },
    ]);

    expect(componentStack(withFiber(fiber), 2)).toEqual([
      'InviteButton',
      'MembersList',
    ]);
  });

  it('skips contexts, namespaced library parts and Next plumbing', () => {
    const fiber = chain([
      'a',
      {
        $$typeof: Symbol.for('react.context'),
        _currentValue: null,
        displayName: 'LayoutRouterContext',
      },
      function LinkComponent() {},
      { displayName: 'Slot.Slot', render: InviteButton },
      { displayName: 'Button', render: InviteButton },
    ]);

    expect(componentStack(withFiber(fiber))).toEqual(['Button']);
  });

  it('names the server components a dev build records, marked as such', () => {
    const fiber = chain(['a', 'section', null, function SegmentViewNode() {}]);

    fiber.return!._debugInfo = [{ name: 'Hero', env: 'Server' }];
    fiber.return!.return!._debugInfo = [
      { name: 'LandingPage', env: 'Server' },
      { time: 12 },
    ];

    expect(componentStack(withFiber(fiber))).toEqual([
      'Hero (server)',
      'LandingPage (server)',
    ]);
  });

  it('returns nothing for an element React did not render', () => {
    expect(componentStack(document.createElement('div'))).toEqual([]);
  });
});

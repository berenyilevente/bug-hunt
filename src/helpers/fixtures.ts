import type { Bug, HuntSession } from './types.js';

/** A tiny but valid JPEG data URL — the guards only check its shape. */
export const JPEG = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';

export function makeBug(overrides: Partial<Bug> = {}): Bug {
  return {
    id: 'bug-1',
    kind: 'bug',
    url: 'http://localhost:3000/en/members',
    pathname: '/en/members',
    mark: {
      kind: 'element',
      selector: '[data-testid="invite"]',
      text: 'Invite member',
      rect: { x: 10, y: 20, width: 120, height: 32 },
      components: ['InviteButton', 'MembersList'],
    },
    note: 'The invite button overlaps the table header.',
    screenshot: JPEG,
    consoleErrors: [],
    failedRequests: [],
    markedAt: '2026-09-25T12:30:00.000Z',
    ...overrides,
  };
}

export function makeSession(bugs: Bug[] = [makeBug()]): HuntSession {
  return { startedAt: '2026-09-25T12:00:00.000Z', bugs };
}

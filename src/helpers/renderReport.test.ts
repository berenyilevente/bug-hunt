import { describe, expect, it } from 'vitest';

import { makeBug } from './fixtures.js';
import { folderStamp, renderReport, shotFileName } from './renderReport.js';
import type { ReportSession } from './types.js';

const CREATED = new Date(2026, 8, 25, 14, 30, 5);

function report(bugs: ReportSession['bugs']): string {
  return renderReport(
    { startedAt: '2026-09-25T12:00:00.000Z', bugs },
    { board: 'appointiq', repo: '/repos/appointiq-app', created: CREATED }
  );
}

describe('renderReport', () => {
  it('writes the frontmatter /triage-business-review reads, with status new', () => {
    const markdown = report([{ ...makeBug(), screenshot: 'shots/01.jpg' }]);

    expect(
      markdown.startsWith('---\nboard: appointiq\nrepo: /repos/appointiq-app\n')
    ).toBe(true);
    expect(markdown).toContain('\nstatus: new\nbugs: 1\nfeatures: 0\n---\n');
    expect(markdown).toContain('# Bug hunt — 2026-09-25-1430');
  });

  it('heads each item by its kind, in one sequence, and counts both kinds', () => {
    const markdown = report([
      { ...makeBug(), screenshot: 'shots/01.jpg' },
      { ...makeBug({ id: 'b', kind: 'feature' }), screenshot: 'shots/02.jpg' },
      { ...makeBug({ id: 'c' }), screenshot: null },
    ]);

    expect(markdown).toContain('\nbugs: 2\nfeatures: 1\n---\n');
    expect(markdown.match(/^## .+$/gm)).toEqual([
      '## Bug 1',
      '## Feature 2',
      '## Bug 3',
    ]);
    expect(markdown).toContain('## Feature 2\n\n- **Page:**');
    expect(markdown).toContain('- **Screenshot:** shots/02.jpg');
  });

  it('writes each bug with its page, anchor, components, screenshot and an empty outcome', () => {
    const markdown = report([
      { ...makeBug(), screenshot: 'shots/01.jpg' },
      {
        ...makeBug({
          id: 'bug-2',
          mark: {
            kind: 'box',
            rect: { x: 40, y: 210, width: 320, height: 140 },
            components: [],
          },
        }),
        screenshot: null,
      },
    ]);

    expect(markdown).toContain(
      '## Bug 1\n\n- **Page:** /en/members — http://localhost:3000/en/members'
    );
    expect(markdown).toContain(
      '- **Marked:** element `[data-testid="invite"]` — "Invite member"'
    );
    expect(markdown).toContain('- **Components:** InviteButton ← MembersList');
    expect(markdown).toContain('- **Screenshot:** shots/01.jpg');
    expect(markdown).toContain('- **Outcome:** —');
    expect(markdown).toContain('## Bug 2');
    expect(markdown).toContain('- **Marked:** box 320×140 at 40,210');
    expect(markdown).toContain('- **Components:** —\n- **Screenshot:** —');
  });

  it('quotes the note so none of its lines can pass for a heading', () => {
    const markdown = report([
      {
        ...makeBug({ note: '## Not a bug heading\n\nsecond `line`' }),
        screenshot: null,
      },
    ]);

    expect(markdown).toContain('> ## Not a bug heading\n>\n> second `line`');
    expect(markdown.match(/^## /gm)).toHaveLength(1);
  });

  it('keeps a selector with backticks inside one code span', () => {
    const markdown = report([
      {
        ...makeBug({
          mark: {
            kind: 'element',
            selector: '[title="a`b"]',
            text: '',
            rect: { x: 0, y: 0, width: 1, height: 1 },
            components: [],
          },
        }),
        screenshot: null,
      },
    ]);

    expect(markdown).toContain('- **Marked:** element ``[title="a`b"]``\n');
  });

  it('lists console errors as indented blocks and failed requests as items', () => {
    const markdown = report([
      {
        ...makeBug({
          consoleErrors: [
            { message: 'TypeError: x is undefined\nat Foo (a.tsx:1)' },
          ],
          failedRequests: [
            { method: 'POST', url: '/en/members', status: 500 },
            { method: 'GET', url: '/api/x', status: null },
          ],
        }),
        screenshot: null,
      },
    ]);

    expect(markdown).toContain(
      '**Console errors**\n\n    TypeError: x is undefined\n    at Foo (a.tsx:1)'
    );
    expect(markdown).toContain('- POST `/en/members` → 500');
    expect(markdown).toContain('- GET `/api/x` → no response');
  });
});

describe('names', () => {
  it('stamps folders in local time and numbers screenshots from 01', () => {
    expect(folderStamp(CREATED)).toBe('2026-09-25-1430');
    expect(shotFileName(3)).toBe('shots/03.jpg');
  });
});

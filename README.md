# Bug hunt

An overlay for reporting bugs and feature requests from inside a Next.js app,
on only when `NEXT_PUBLIC_BUG_HUNT=true`. You click through the app and mark
each bug, or each place a feature should go, as you find it. Clicking an
element or dragging a box over an area opens a note. At the end, one **Save**
writes the whole session as a markdown report into the app's disposit board.
`/triage-business-review` in Claude Code then sorts that report into bugs,
which it files as fix tickets, and feature requests, which it plans through
`/plan-board`.

The flag is the only gate, in development and production alike. A build
without it compiles the overlay out, and the save route answers 404. A build
with it lets anyone who reaches the app save a report — there is no session
check — and Save needs the disposit data directory on the machine the server
runs on, so it only succeeds where that directory exists.

## Add it to an app

It expects Next.js App Router (15+), React 19 and a disposit board for the app.
It needs nothing from the app's Tailwind or CSS.

```bash
npm i -D github:berenyilevente/bug-hunt#v0.2.0
npx bug-hunt setup
```

`bug-hunt setup` is safe to re-run. It:

| Step         | Edit                                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Layout       | Renders `<BugHuntMount />` from `@berenyilevente/bug-hunt` as the first child of `<body>`.                                  |
| Save route   | Writes `src/app/api/bug-hunt/route.ts`: `export { POST } from '@berenyilevente/bug-hunt/route';`                            |
| Playwright   | Pins `NEXT_PUBLIC_BUG_HUNT: 'false'` in `webServer.env`, so a `.env.local` that turns it on never puts it over an e2e page. |
| .env.example | Documents the flag and `BUG_HUNT_BOARD`.                                                                                    |

When it can't find where an edit goes, it changes nothing and prints the
snippet to add by hand.

**Moving off the copied-in `src/bug-hunt/` folder.** Run the same command. It
points the layout at the package, drops the folder's Tailwind `content` entry,
its `bug-hunt:setup` script and its `modern-screenshot` devDependency (now the
package's own), then tells you to delete the folder and run `npm install`.

**Updating.** Bump the tag in the app's `package.json` and `npm install`.

If the app also has the i18n editor, its root needs `data-dev-overlay=""`.
Otherwise the bug hunt can pick the editor's panel and draw it into
screenshots.

If the route is not at `/api/bug-hunt`, pass its path:
`<BugHuntMount endpoint="/somewhere/else" />`. The app's middleware must let
the request through untouched.

## Use

1. Set `NEXT_PUBLIC_BUG_HUNT=true` in `.env.local`.
2. Run `npm run dev`, then press **⌥⇧B** or click the **bugs** pill in the
   bottom-right corner.
3. Press **Mark something** (or **⌥⇧M**). The page is covered by a pick layer:
   - **Click** an element to mark it. The report records a selector for it,
     its text and the React components that rendered it.
   - **Drag** a box over something that isn't a single element, such as a gap,
     an overlap or a broken layout.
   - **Esc** cancels.

   This works over an open dialog, sheet or menu too, and leaves it open.

4. Pick **Bug** or **Feature** at the top of the note card (Bug by default),
   then write the note: for a bug, what is wrong and what you expected; for a
   feature, what it should do and why it would help. Save it with ⌘↵. Editing
   an item can change its kind too. The overlay adds:
   - a screenshot of the viewport with the mark outlined in red
   - the console errors and failed `fetch` calls (server actions included) that
     page logged
5. Keep going across as many pages as you like. The session survives reloads
   and locale switches, because it is kept in `localStorage` until you save or
   discard it. Hovering an item in the panel outlines it again when you are on
   its page.
6. **Save**. The panel shows the folder the report went to and the command to
   run next: `/triage-business-review`.

## Where it saves

Save writes to `<DATA>/<board>/bug-reports/<YYYY-MM-DD-HHmm>/`:

```
report.md      frontmatter (board, repo, status: new, bugs: N, features: N)
               + one "## Bug N" or "## Feature N" section per item, numbered in one sequence
shots/01.jpg   one screenshot per item that has one, numbered like the report
```

`<DATA>` is disposit's `data/` directory, found the way disposit's own skills
find it: from `DISPOSIT_DATA`, or else from the repo root that `npm run setup`
recorded in `~/.config/disposit/root`. `<board>` is the board whose
`board.json` has the app's repo as its `repoPath`. Set `BUG_HUNT_BOARD` to a
board's directory name to pick one yourself. If no board matches, the pill
turns amber, the panel says why and Save is disabled. Your session stays in
`localStorage`, so nothing is lost.

`/triage-business-review` reads the newest report whose `status` isn't
`triaged`. It has the final say on each item's kind, fills in each item's
`Outcome:` line, and sets `status: triaged` once every item has one. Reports
from before feature requests, with only `## Bug N` sections, read the same
way.

## How it works

- `BugHuntMount` is a server component. It resolves the board once, so the
  panel can warn before you have marked anything. It then renders `BugHunt`,
  which loads the overlay in the browser only (`ssr: false`), because the
  overlay's state lives in `localStorage`. Its flag check is read inline:
  Next inlines `NEXT_PUBLIC_` values in package code too, so a build without
  the flag drops the overlay from its output.
- The overlay runs in a **shadow root**, under a **React root of its own**
  (`OverlayRoot`):
  - The shadow root carries the package's own compiled Tailwind
    (`src/styles/overlay.css`, embedded at build time). The app's CSS cannot
    restyle the overlay, and the overlay's CSS cannot leak onto the app.
  - A modal Radix layer (dialog, sheet, menu) listens on `document` for clicks
    and focus outside itself, then closes or takes focus back, and sets
    `pointer-events: none` on `<body>`. The overlay's host re-enables pointer
    events and stops its events before they reach `document`
    (`helpers/isolate.ts`). Escape pressed in the overlay is marked as handled,
    so the layer ignores it.
- Save is three kinds of POST to the route: one to create the folder, one per
  screenshot, and one to write `report.md`. Each request takes a folder _name_
  and re-resolves the board, so nothing the browser sends can point a write
  elsewhere. `report.md` is written last, so a folder without it is an
  interrupted save that `/triage-business-review` never reads.
- Screenshots are `modern-screenshot` renders of the document, cropped to the
  viewport and scaled to ≤1280px JPEG. Anything under `[data-dev-overlay]` is
  left out. When a page can't be drawn (a tainted canvas, a cross-origin
  frame), the bug is kept without an image.
- The component stack is read from the React fiber on the DOM node, innermost
  first. A server component has no fiber of its own, so its name comes from the
  `_debugInfo` a dev build records, and it appears as `Hero (server)`. The walk
  skips contexts, namespaced library parts (`Slot.Slot`) and Next's plumbing
  (`LayoutRouter`, the error boundaries, …).

## Develop

```bash
npm install
npm test           # compiles the CSS, then vitest (node + jsdom projects)
npm run typecheck
npm run build      # dist/: ESM + .d.ts, one file per module, directives kept
```

`dist/` is committed: apps install straight from a git tag, and a committed
build means the install runs no scripts and pulls none of this repo's dev
tooling. To try a change in an app before tagging it, `npm pack` here and
`npm i -D <tarball>` there.

Release: bump `version`, `npm run build`, commit (with `dist/`),
`git tag vX.Y.Z && git push origin main vX.Y.Z`, then bump the tag in each app.

## Remove it

`npm uninstall @berenyilevente/bug-hunt`, then delete the route file and the
`<BugHuntMount />` line and its import from the layout.

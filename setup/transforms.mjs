/**
 * The edits `bug-hunt setup` makes to a host app, one pure function per file:
 * source text in, `{ status, source, snippet }` out. Pure so each can be
 * specced on template-shaped input without touching a disk.
 *
 * - `applied`   — `source` is the edited file.
 * - `skipped`   — already done; `source` is unchanged.
 * - `needs-you` — no anchor found; `source` is unchanged and `snippet` says
 *                 what to add by hand. A transform never guesses.
 *
 * @typedef {{ status: 'applied' | 'skipped' | 'needs-you', source: string, snippet?: string }} TransformResult
 */

export const PACKAGE_NAME = '@berenyilevente/bug-hunt';
export const ENV_FLAG = 'NEXT_PUBLIC_BUG_HUNT';
export const BOARD_ENV = 'BUG_HUNT_BOARD';
export const MOUNT_TAG = '<BugHuntMount />';
export const ROUTE_FILE = 'src/app/api/bug-hunt/route.ts';
export const ROUTE_SOURCE = `export { POST } from '${PACKAGE_NAME}/route';\n`;

/** What the copied-in folder this package replaces left behind. */
export const LEGACY = {
  folder: 'src/bug-hunt',
  mountImport: '@/bug-hunt/BugHuntMount',
  tailwindGlob: './src/bug-hunt/**/*.{ts,tsx}',
  setupScript: 'bug-hunt:setup',
  screenshotPackage: 'modern-screenshot',
};

/** @param {string} source @returns {TransformResult} */
const skipped = (source) => ({ status: 'skipped', source });

/** @param {string} source @param {string} snippet @returns {TransformResult} */
const needsYou = (source, snippet) => ({
  status: 'needs-you',
  source,
  snippet,
});

/**
 * Drops what the copied-in folder added to package.json: its setup script,
 * and the screenshot library — now this package's own dependency — unless
 * the app uses it elsewhere.
 *
 * @param {string} source package.json
 * @param {{ appUsesScreenshotLibrary: boolean }} options
 * @returns {TransformResult}
 */
export function dropLegacyPackageEntries(source, { appUsesScreenshotLibrary }) {
  const pkg = JSON.parse(source);
  let changed = false;

  if (pkg.scripts?.[LEGACY.setupScript]) {
    delete pkg.scripts[LEGACY.setupScript];
    changed = true;
  }

  if (!appUsesScreenshotLibrary) {
    for (const field of ['dependencies', 'devDependencies']) {
      if (pkg[field]?.[LEGACY.screenshotPackage]) {
        delete pkg[field][LEGACY.screenshotPackage];
        changed = true;
      }
    }
  }

  return changed
    ? { status: 'applied', source: `${JSON.stringify(pkg, null, 2)}\n` }
    : skipped(source);
}

/**
 * Takes the copied-in folder off Tailwind's `content` list: the package
 * carries its own compiled CSS, so the app's Tailwind never needs its classes.
 *
 * @param {string} source tailwind.config.*
 * @returns {TransformResult}
 */
export function dropLegacyTailwindContent(source) {
  if (!source.includes(LEGACY.tailwindGlob)) {
    return skipped(source);
  }

  const entry =
    /[ \t]*(["'`])\.\/src\/bug-hunt\/\*\*\/\*\.\{ts,tsx\}\1,?[ \t]*\n?/;

  return { status: 'applied', source: source.replace(entry, '') };
}

/**
 * Mounts the overlay as the first child of `<body>`: it needs no provider, so
 * the outermost spot keeps it clear of whatever the app wraps its pages in. A
 * layout still importing the copied-in folder's mount is pointed at the
 * package instead.
 *
 * @param {string} source the layout rendering `<body>`
 * @returns {TransformResult}
 */
export function mountInLayout(source) {
  if (
    source.includes(`'${PACKAGE_NAME}'`) ||
    source.includes(`"${PACKAGE_NAME}"`)
  ) {
    return skipped(source);
  }

  if (source.includes(LEGACY.mountImport)) {
    return {
      status: 'applied',
      source: source.replace(LEGACY.mountImport, PACKAGE_NAME),
    };
  }

  const quote = source.includes("from '") ? "'" : '"';
  const semicolon = /from\s+['"][^'"]+['"];/.test(source) ? ';' : '';
  const importLine = `import { BugHuntMount } from ${quote}${PACKAGE_NAME}${quote}${semicolon}`;
  const snippet = `${importLine}\n…\n<body>\n  ${MOUNT_TAG}\n  …`;
  const body = /(<body\b(?:[^>]*[^/>])?>)(\n)([ \t]*)/;
  const lastImport = [
    ...source.matchAll(
      /^(?:.*\bfrom\s+['"][^'"]+['"]|import\s+['"][^'"]+['"]);?[ \t]*$/gm
    ),
  ].at(-1);

  if (!body.test(source) || lastImport?.index === undefined) {
    return needsYou(source, snippet);
  }

  const importEnd = lastImport.index + lastImport[0].length;
  const withImport = `${source.slice(0, importEnd)}\n${importLine}${source.slice(importEnd)}`;

  return {
    status: 'applied',
    source: withImport.replace(
      body,
      (_, open, newline, indent) =>
        `${open}${newline}${indent}${MOUNT_TAG}${newline}${indent}`
    ),
  };
}

/**
 * The route the overlay saves through, re-exported from the package.
 *
 * @param {string | null} source the route file, or null when there is none
 * @returns {TransformResult}
 */
export function writeRoute(source) {
  if (source === null) {
    return { status: 'applied', source: ROUTE_SOURCE };
  }

  return source.includes(`${PACKAGE_NAME}/route`)
    ? skipped(source)
    : needsYou(
        source,
        `${ROUTE_FILE} exists and is not the bug hunt's. It should read: ${ROUTE_SOURCE}`
      );
}

/**
 * Pins the flag off for the Playwright dev server: `next dev` loads
 * `.env.local`, so a developer who turned the overlay on would otherwise get
 * it floating over every end-to-end page.
 *
 * @param {string} source playwright.config.*
 * @returns {TransformResult}
 */
export function pinPlaywrightEnv(source) {
  if (source.includes(ENV_FLAG)) {
    return skipped(source);
  }

  const anchor = /(webServer[\s\S]*?\benv\s*:\s*\{)(\n)([ \t]*)/;
  const line = `${ENV_FLAG}: 'false',`;

  if (!anchor.test(source)) {
    return needsYou(source, `webServer: { env: { ${line} } }`);
  }

  return {
    status: 'applied',
    source: source.replace(
      anchor,
      (_, open, newline, indent) =>
        `${open}${newline}${indent}// \`.env.local\` may turn the bug hunt on; never over an e2e page.${newline}${indent}${line}${newline}${indent}`
    ),
  };
}

/**
 * Documents the flag and the board override where every other env var is
 * documented. An entry the copied-in folder wrote is reworded in place.
 *
 * @param {string} source .env.example
 * @returns {TransformResult}
 */
export function documentEnv(source) {
  if (source.includes(BOARD_ENV)) {
    return skipped(source);
  }

  const block =
    `### BUG HUNT — overlay, on only when this is true, that saves bug reports to this app's disposit board (${PACKAGE_NAME})\n` +
    `# ${ENV_FLAG}=true\n` +
    `# Optional: the board to save to, when no board's repoPath is this repo\n` +
    `# ${BOARD_ENV}=\n`;
  const legacy = new RegExp(`### BUG HUNT[^\\n]*\\n# ${ENV_FLAG}=true\\n`);

  if (legacy.test(source)) {
    return { status: 'applied', source: source.replace(legacy, block) };
  }

  const separator = source.endsWith('\n') || source === '' ? '' : '\n';

  return { status: 'applied', source: `${source}${separator}\n${block}` };
}

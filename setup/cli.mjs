#!/usr/bin/env node
/**
 * Wires the bug hunt into the app it is installed in. Run from the app's root
 * after `npm i -D @berenyilevente/bug-hunt`:
 *
 *   npx bug-hunt setup
 *
 * Every step is idempotent, so it is safe to re-run. An app that still has the
 * copied-in `src/bug-hunt/` folder is moved over: the layout is pointed at the
 * package, the folder's Tailwind and package.json entries are dropped, and the
 * folder itself is left for you to delete. A step that cannot find its anchor
 * edits nothing and prints what to add by hand.
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

import {
  BOARD_ENV,
  documentEnv,
  dropLegacyPackageEntries,
  dropLegacyTailwindContent,
  ENV_FLAG,
  LEGACY,
  mountInLayout,
  pinPlaywrightEnv,
  ROUTE_FILE,
  writeRoute,
} from './transforms.mjs';

const root = process.cwd();
const [command] = process.argv.slice(2);

if (command !== 'setup') {
  console.log('Usage: npx bug-hunt setup   (from the app’s root)');
  process.exit(command ? 1 : 0);
}

if (!existsSync(path.join(root, 'package.json'))) {
  console.error('Run this from the app’s root: there is no package.json here.');
  process.exit(1);
}

/** @param {string[]} candidates @returns {string | null} */
function firstExisting(candidates) {
  return (
    candidates.map((file) => path.join(root, file)).find(existsSync) ?? null
  );
}

/** @param {string} dir @param {(name: string) => boolean} matches @returns {string[]} */
function findFiles(dir, matches) {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return entry.name === 'node_modules' ? [] : findFiles(full, matches);
    }

    return matches(entry.name) ? [full] : [];
  });
}

/** The one layout rendering `<body>`, if there is exactly one. */
function findBodyLayout() {
  const preferred = firstExisting([
    'src/app/[locale]/layout.tsx',
    'src/app/layout.tsx',
  ]);

  if (preferred && readFileSync(preferred, 'utf8').includes('<body')) {
    return preferred;
  }

  const layouts = findFiles(
    path.join(root, 'src/app'),
    (name) => name === 'layout.tsx'
  ).filter((file) => readFileSync(file, 'utf8').includes('<body'));

  return layouts.length === 1 ? layouts[0] : null;
}

/** Whether anything but the copied-in folder imports the screenshot library. */
function appUsesScreenshotLibrary() {
  const legacyFolder = path.join(root, LEGACY.folder);

  return findFiles(path.join(root, 'src'), (name) =>
    /\.(ts|tsx|js|jsx|mjs)$/.test(name)
  )
    .filter((file) => !file.startsWith(legacyFolder + path.sep))
    .some((file) =>
      readFileSync(file, 'utf8').includes(LEGACY.screenshotPackage)
    );
}

/** @type {Array<{ step: string, status: string, snippet?: string }>} */
const report = [];

/**
 * @param {string} step
 * @param {string | null} file
 * @param {(source: string) => import('./transforms.mjs').TransformResult} transform
 * @param {string} missing what to do by hand when the file is not there
 */
function run(step, file, transform, missing) {
  if (!file) {
    report.push({ step, status: 'needs-you', snippet: missing });
    return false;
  }

  const result = transform(readFileSync(file, 'utf8'));

  if (result.status === 'applied') {
    writeFileSync(file, result.source);
  }

  report.push({
    step: `${step} (${path.relative(root, file)})`,
    status: result.status,
    snippet: result.snippet,
  });

  return result.status === 'applied';
}

run(
  'Layout mount',
  findBodyLayout(),
  mountInLayout,
  'render <BugHuntMount /> as the first child of <body> in the root layout'
);

const routePath = path.join(root, ROUTE_FILE);
const route = writeRoute(
  existsSync(routePath) ? readFileSync(routePath, 'utf8') : null
);

if (route.status === 'applied') {
  mkdirSync(path.dirname(routePath), { recursive: true });
  writeFileSync(routePath, route.source);
}

report.push({
  step: `Save route (${ROUTE_FILE})`,
  status: route.status,
  snippet: route.snippet,
});

const playwright = firstExisting([
  'playwright.config.ts',
  'playwright.config.js',
  'playwright.config.mjs',
]);

if (playwright) {
  run('Playwright env', playwright, pinPlaywrightEnv, '');
} else {
  report.push({ step: 'Playwright env', status: 'skipped' });
}

run(
  '.env.example',
  firstExisting(['.env.example']),
  documentEnv,
  `document ${ENV_FLAG}=true wherever the app lists its env vars`
);

// The copied-in folder this package replaces, if the app still has traces of it.
const usesLibrary = appUsesScreenshotLibrary();
const packageChanged = run(
  'Legacy package.json entries',
  path.join(root, 'package.json'),
  (source) =>
    dropLegacyPackageEntries(source, { appUsesScreenshotLibrary: usesLibrary }),
  ''
);

const tailwind = firstExisting([
  'tailwind.config.ts',
  'tailwind.config.js',
  'tailwind.config.mjs',
  'tailwind.config.cjs',
]);

if (tailwind) {
  run('Legacy Tailwind content', tailwind, dropLegacyTailwindContent, '');
}

if (existsSync(path.join(root, LEGACY.folder))) {
  report.push({
    step: `Legacy folder (${LEGACY.folder})`,
    status: 'needs-you',
    snippet: `delete it — the package replaces it: git rm -r ${LEGACY.folder}`,
  });
}

if (packageChanged) {
  report.push({
    step: 'npm install',
    status: 'needs-you',
    snippet: 'package.json changed: run npm install',
  });
}

console.log('\nbug hunt setup');

for (const { step, status, snippet } of report) {
  console.log(`  ${status.padEnd(9)} ${step}`);

  if (snippet) {
    console.log(`            ${snippet.split('\n').join('\n            ')}`);
  }
}

console.log(
  `\nTurn it on with ${ENV_FLAG}=true in .env.local, then \`npm run dev\` and press ⌥⇧B.` +
    `\nSave writes to the disposit board whose repoPath is this repo; set ${BOARD_ENV} to pick one yourself.`
);

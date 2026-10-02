import { describe, expect, it } from 'vitest';

import {
  documentEnv,
  dropLegacyPackageEntries,
  dropLegacyTailwindContent,
  mountInLayout,
  pinPlaywrightEnv,
  ROUTE_SOURCE,
  writeRoute,
} from './transforms.mjs';

const PACKAGE_JSON = `${JSON.stringify(
  {
    name: 'app',
    scripts: {
      dev: 'next dev',
      'bug-hunt:setup': 'node src/bug-hunt/setup/setup.mjs',
    },
    devDependencies: {
      vitest: '^4.0.0',
      'modern-screenshot': '^4.7.0',
    },
  },
  null,
  2
)}\n`;

const TAILWIND = `const config: Config = {
  content: [
    "./src/bug-hunt/**/*.{ts,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};
`;

const LAYOUT = `import { NextIntlClientProvider } from 'next-intl';

import MainProvider from '../MainProvider';
import '../globals.css';

export default function Layout({ children }: Props) {
  return (
    <html>
      <body>
        <NextIntlClientProvider>
          <MainProvider>{children}</MainProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
`;

const PLAYWRIGHT = `export default defineConfig({
  webServer: {
    command: 'npm run dev',
    env: {
      DATABASE_URL: E2E_DATABASE_URL,
    },
  },
});
`;

describe('dropLegacyPackageEntries', () => {
  it('drops the copied-in folder’s setup script and screenshot library, once', () => {
    const result = dropLegacyPackageEntries(PACKAGE_JSON, {
      appUsesScreenshotLibrary: false,
    });
    const pkg = JSON.parse(result.source);

    expect(result.status).toBe('applied');
    expect(pkg.scripts).toEqual({ dev: 'next dev' });
    expect(pkg.devDependencies).toEqual({ vitest: '^4.0.0' });
    expect(
      dropLegacyPackageEntries(result.source, {
        appUsesScreenshotLibrary: false,
      }).status
    ).toBe('skipped');
  });

  it('keeps the library when the app uses it elsewhere', () => {
    const result = dropLegacyPackageEntries(PACKAGE_JSON, {
      appUsesScreenshotLibrary: true,
    });

    expect(JSON.parse(result.source).devDependencies).toHaveProperty(
      'modern-screenshot'
    );
  });
});

describe('dropLegacyTailwindContent', () => {
  it('takes the copied-in folder off the content list, once', () => {
    const result = dropLegacyTailwindContent(TAILWIND);

    expect(result.status).toBe('applied');
    expect(result.source).toBe(`const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};
`);
    expect(dropLegacyTailwindContent(result.source).status).toBe('skipped');
  });
});

describe('mountInLayout', () => {
  it('imports the mount and renders it as the first child of <body>', () => {
    const result = mountInLayout(LAYOUT);

    expect(result.status).toBe('applied');
    expect(result.source).toContain(
      "import '../globals.css';\nimport { BugHuntMount } from '@berenyilevente/bug-hunt';\n"
    );
    expect(result.source).toContain(
      '<body>\n        <BugHuntMount />\n        <NextIntlClientProvider>'
    );
    expect(mountInLayout(result.source).status).toBe('skipped');
  });

  it('points a layout still on the copied-in folder at the package', () => {
    const legacy = LAYOUT.replace(
      "import '../globals.css';",
      "import '../globals.css';\nimport { BugHuntMount } from '@/bug-hunt/BugHuntMount';"
    ).replace('<body>', '<body>\n        <BugHuntMount />');
    const result = mountInLayout(legacy);

    expect(result.status).toBe('applied');
    expect(result.source).toBe(
      legacy.replace('@/bug-hunt/BugHuntMount', '@berenyilevente/bug-hunt')
    );
    expect(result.source.match(/<BugHuntMount \/>/g)).toHaveLength(1);
  });

  it('keeps a body that takes props', () => {
    const result = mountInLayout(
      LAYOUT.replace('<body>', '<body className="x">')
    );

    expect(result.source).toContain(
      '<body className="x">\n        <BugHuntMount />'
    );
  });

  it('asks for a hand edit when the layout renders no <body>', () => {
    const source =
      "import x from 'y';\nexport default function L() { return <div />; }\n";
    const result = mountInLayout(source);

    expect(result).toMatchObject({ status: 'needs-you', source });
  });
});

describe('writeRoute', () => {
  it('writes the re-export when there is no route, and leaves it after', () => {
    expect(writeRoute(null)).toEqual({
      status: 'applied',
      source: ROUTE_SOURCE,
    });
    expect(writeRoute(ROUTE_SOURCE).status).toBe('skipped');
  });

  it('never overwrites a route of the app’s own', () => {
    expect(writeRoute('export async function POST() {}\n').status).toBe(
      'needs-you'
    );
  });
});

describe('pinPlaywrightEnv', () => {
  it('pins the flag off in webServer.env, once', () => {
    const result = pinPlaywrightEnv(PLAYWRIGHT);

    expect(result.source).toContain(
      "env: {\n      // `.env.local` may turn the bug hunt on; never over an e2e page.\n      NEXT_PUBLIC_BUG_HUNT: 'false',\n      DATABASE_URL"
    );
    expect(pinPlaywrightEnv(result.source).status).toBe('skipped');
  });

  it('asks for a hand edit without a webServer env', () => {
    expect(pinPlaywrightEnv('export default {};\n').status).toBe('needs-you');
  });
});

describe('documentEnv', () => {
  const BLOCK =
    "### BUG HUNT — overlay, on only when this is true, that saves bug reports to this app's disposit board (@berenyilevente/bug-hunt)\n# NEXT_PUBLIC_BUG_HUNT=true\n# Optional: the board to save to, when no board's repoPath is this repo\n# BUG_HUNT_BOARD=\n";

  it('documents the flag and the board override commented out, once', () => {
    const result = documentEnv('A=1');

    expect(result.source).toBe(`A=1\n\n${BLOCK}`);
    expect(documentEnv(result.source).status).toBe('skipped');
  });

  it('rewords the entry the copied-in folder wrote, in place', () => {
    const legacy =
      "A=1\n\n### BUG HUNT — overlay, on only when this is true, that saves bug reports to this app's disposit board (src/bug-hunt)\n# NEXT_PUBLIC_BUG_HUNT=true\n\nB=2\n";

    expect(documentEnv(legacy).source).toBe(`A=1\n\n${BLOCK}\nB=2\n`);
  });
});

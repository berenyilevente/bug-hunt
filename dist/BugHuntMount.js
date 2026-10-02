import { jsx as _jsx } from "react/jsx-runtime";
import { DEFAULT_ENDPOINT } from './helpers/httpSteps.js';
/**
 * Renders the overlay when `NEXT_PUBLIC_BUG_HUNT=true`, and nothing otherwise,
 * in any build. A server component, so the board this repo saves to is
 * resolved here and the panel can say up front when there is none.
 *
 * The flag is the only gate, and it is read inline, not behind a helper: Next
 * inlines a `NEXT_PUBLIC_` value at build time — in this package's code as in
 * the app's — so a build without the flag sees `if (false)` and drops the
 * dynamic imports, and with them the whole overlay, from its output.
 */
export async function BugHuntMount({ endpoint = DEFAULT_ENDPOINT, }) {
    if (process.env.NEXT_PUBLIC_BUG_HUNT === 'true') {
        const [{ resolveTarget }, { BugHunt }] = await Promise.all([
            import('./helpers/target.js'),
            import('./BugHunt.js'),
        ]);
        const target = await resolveTarget().catch((error) => {
            // A dev tool that cannot read the board must not take the app down.
            console.error('[bug-hunt] could not resolve the board', error);
            return { status: 'missing', detail: String(error) };
        });
        return _jsx(BugHunt, { target: target, endpoint: endpoint });
    }
    return null;
}

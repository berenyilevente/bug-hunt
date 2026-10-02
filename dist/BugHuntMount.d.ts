import type { ReactNode } from 'react';
export type BugHuntMountProps = {
    /** Where the app mounted the package's route. `/api/bug-hunt` by default. */
    endpoint?: string;
};
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
export declare function BugHuntMount({ endpoint, }: BugHuntMountProps): Promise<ReactNode>;

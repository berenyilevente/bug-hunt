import type { SaveSteps } from './types.js';
/** Where `npx bug-hunt setup` puts the route. */
export declare const DEFAULT_ENDPOINT = "/api/bug-hunt";
/**
 * The save steps over HTTP, one POST each to the package's route.
 *
 * Takes `fetch` when it is made, and it is made before the overlay mounts: the
 * page-signals hook wraps `window.fetch` once mounted, and the overlay's own
 * requests are not the page's errors.
 */
export declare function httpSteps(endpoint: string, send?: typeof fetch): SaveSteps;

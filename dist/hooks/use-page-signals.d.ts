import type { PageSignals } from '../helpers/types.js';
/**
 * Listens to what the page reports while the overlay is mounted —
 * `console.error`, uncaught errors, unhandled rejections and failed `fetch`
 * calls (server actions included) — so a bug marked on a page carries that
 * page's errors. An effect because each of these is a subscription to the
 * window, undone on unmount.
 */
export declare function usePageSignals(): (pathname: string) => PageSignals;

import type { FailedRequest, PageSignals } from './types.js';
/**
 * What the page logged while the overlay was mounted, per pathname — the
 * errors a bug brings with it are the ones its own page produced.
 */
export type SignalBuffer = {
    recordError: (message: string) => void;
    recordRequest: (request: FailedRequest) => void;
    signalsFor: (pathname: string) => PageSignals;
};
export declare function createSignalBuffer(currentPathname?: () => string): SignalBuffer;
/** A `console.error(…)` call's arguments as one readable message. */
export declare function describeError(values: unknown[]): string;
/** An unhandled promise rejection's reason, marked as one. */
export declare function describeRejection(reason: unknown): string;
/** The method and URL a `fetch(input, init)` call went out with. */
export declare function describeRequest(input: RequestInfo | URL, init?: RequestInit): {
    method: string;
    url: string;
};

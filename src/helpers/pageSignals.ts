import { SIGNAL_LIMIT } from './labels.js';
import type { ConsoleError, FailedRequest, PageSignals } from './types.js';

type Recorded<T> = T & { pathname: string };

/** How many lines of a stack come along with an error's message. */
const STACK_LINES = 4;

/**
 * What the page logged while the overlay was mounted, per pathname — the
 * errors a bug brings with it are the ones its own page produced.
 */
export type SignalBuffer = {
  recordError: (message: string) => void;
  recordRequest: (request: FailedRequest) => void;
  signalsFor: (pathname: string) => PageSignals;
};

export function createSignalBuffer(
  currentPathname: () => string = () => window.location.pathname
): SignalBuffer {
  const errors: Recorded<ConsoleError>[] = [];
  const requests: Recorded<FailedRequest>[] = [];

  const keep = <T extends { pathname: string }>(list: T[], entry: T): void => {
    list.push(entry);

    const onPage = list.filter((item) => item.pathname === entry.pathname);

    if (onPage.length > SIGNAL_LIMIT) {
      list.splice(list.indexOf(onPage[0]), 1);
    }
  };

  return {
    recordError: (message) =>
      keep(errors, { message, pathname: currentPathname() }),
    recordRequest: (request) =>
      keep(requests, { ...request, pathname: currentPathname() }),
    signalsFor: (pathname) => ({
      consoleErrors: errors
        .filter((entry) => entry.pathname === pathname)
        .map(({ message }) => ({ message })),
      failedRequests: requests
        .filter((entry) => entry.pathname === pathname)
        .map(({ method, url, status }) => ({ method, url, status })),
    }),
  };
}

function describeOne(value: unknown): string {
  if (value instanceof Error) {
    const stack = (value.stack ?? '')
      .split('\n')
      .slice(1, STACK_LINES + 1)
      .map((line) => line.trim());

    return [`${value.name}: ${value.message}`, ...stack].join('\n');
  }

  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

/** A `console.error(…)` call's arguments as one readable message. */
export function describeError(values: unknown[]): string {
  return values.map(describeOne).join(' ');
}

/** An unhandled promise rejection's reason, marked as one. */
export function describeRejection(reason: unknown): string {
  return describeError(['Unhandled rejection:', reason]);
}

/** The method and URL a `fetch(input, init)` call went out with. */
export function describeRequest(
  input: RequestInfo | URL,
  init?: RequestInit
): { method: string; url: string } {
  const isRequest = typeof Request !== 'undefined' && input instanceof Request;
  const method = (
    init?.method ?? (isRequest ? input.method : 'GET')
  ).toUpperCase();
  const raw = isRequest ? input.url : String(input);

  try {
    const url = new URL(raw, window.location.href);

    return {
      method,
      url:
        url.origin === window.location.origin
          ? `${url.pathname}${url.search}`
          : url.href,
    };
  } catch {
    return { method, url: raw };
  }
}

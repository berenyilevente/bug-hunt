'use client';

import { useEffect, useState } from 'react';

import {
  createSignalBuffer,
  describeError,
  describeRejection,
  describeRequest,
  type SignalBuffer,
} from '../helpers/pageSignals.js';
import type { PageSignals } from '../helpers/types.js';

/**
 * Listens to what the page reports while the overlay is mounted —
 * `console.error`, uncaught errors, unhandled rejections and failed `fetch`
 * calls (server actions included) — so a bug marked on a page carries that
 * page's errors. An effect because each of these is a subscription to the
 * window, undone on unmount.
 */
export function usePageSignals(): (pathname: string) => PageSignals {
  const [buffer] = useState<SignalBuffer>(() => createSignalBuffer());

  useEffect(() => {
    const originalError = console.error;
    const originalFetch = window.fetch;

    console.error = (...values: unknown[]): void => {
      buffer.recordError(describeError(values));
      originalError.apply(console, values);
    };

    window.fetch = async (input, init) => {
      const { method, url } = describeRequest(input, init);

      try {
        const response = await originalFetch(input, init);

        if (!response.ok) {
          buffer.recordRequest({ method, url, status: response.status });
        }

        return response;
      } catch (error) {
        buffer.recordRequest({ method, url, status: null });
        throw error;
      }
    };

    const onError = (event: ErrorEvent): void =>
      buffer.recordError(describeError([event.error ?? event.message]));
    const onRejection = (event: PromiseRejectionEvent): void =>
      buffer.recordError(describeRejection(event.reason));

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    return () => {
      console.error = originalError;
      window.fetch = originalFetch;
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, [buffer]);

  return buffer.signalsFor;
}

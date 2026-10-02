import { fail, FAILURE } from './results.js';
import type { HuntResult, SaveSteps, StepRequest } from './types.js';

/** Where `npx bug-hunt setup` puts the route. */
export const DEFAULT_ENDPOINT = '/api/bug-hunt';

/**
 * The save steps over HTTP, one POST each to the package's route.
 *
 * Takes `fetch` when it is made, and it is made before the overlay mounts: the
 * page-signals hook wraps `window.fetch` once mounted, and the overlay's own
 * requests are not the page's errors.
 */
export function httpSteps(
  endpoint: string,
  send: typeof fetch = window.fetch.bind(window)
): SaveSteps {
  async function post<T>(body: StepRequest): Promise<HuntResult<T>> {
    try {
      const response = await send(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        return fail(FAILURE.noRoute, endpoint);
      }

      return (await response.json()) as HuntResult<T>;
    } catch {
      return fail(FAILURE.noRoute, endpoint);
    }
  }

  return {
    begin: () => post({ step: 'begin' }),
    screenshot: (folder, number, dataUrl) =>
      post({ step: 'screenshot', folder, number, dataUrl }),
    finish: (folder, session) => post({ step: 'finish', folder, session }),
  };
}

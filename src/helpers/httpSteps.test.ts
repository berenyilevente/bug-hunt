import { describe, expect, it, vi } from 'vitest';

import { makeSession } from './fixtures.js';
import { httpSteps } from './httpSteps.js';

function answering(response: Response) {
  return vi.fn<typeof fetch>().mockResolvedValue(response);
}

describe('httpSteps', () => {
  it('posts each step as JSON to the endpoint and hands back its result', async () => {
    const send = answering(
      Response.json({ status: 'success', data: { folder: 'f' } })
    );
    const steps = httpSteps('/api/bug-hunt', send);

    expect(await steps.begin()).toEqual({
      status: 'success',
      data: { folder: 'f' },
    });

    const session = { startedAt: makeSession().startedAt, bugs: [] };

    await steps.screenshot('f', 2, 'data:image/jpeg;base64,AA==');
    await steps.finish('f', session);

    expect(send.mock.calls.map(([url]) => url)).toEqual([
      '/api/bug-hunt',
      '/api/bug-hunt',
      '/api/bug-hunt',
    ]);
    expect(
      send.mock.calls.map(([, init]) => JSON.parse(String(init?.body)))
    ).toEqual([
      { step: 'begin' },
      {
        step: 'screenshot',
        folder: 'f',
        number: 2,
        dataUrl: 'data:image/jpeg;base64,AA==',
      },
      { step: 'finish', folder: 'f', session },
    ]);
  });

  it('says the route is missing on a non-2xx answer or no answer at all', async () => {
    const missing = httpSteps(
      '/api/bug-hunt',
      answering(new Response('<html>', { status: 404 }))
    );
    const offline = httpSteps(
      '/api/bug-hunt',
      vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'))
    );

    for (const steps of [missing, offline]) {
      expect(await steps.begin()).toEqual({
        status: 'error',
        reason: 'noRoute',
        detail: '/api/bug-hunt',
      });
    }
  });
});

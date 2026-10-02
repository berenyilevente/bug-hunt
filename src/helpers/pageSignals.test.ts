// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

import { SIGNAL_LIMIT } from './labels.js';
import {
  createSignalBuffer,
  describeError,
  describeRejection,
  describeRequest,
} from './pageSignals.js';

describe('createSignalBuffer', () => {
  it('keeps each page its own signals', () => {
    let pathname = '/en/members';
    const buffer = createSignalBuffer(() => pathname);

    buffer.recordError('boom');
    buffer.recordRequest({ method: 'POST', url: '/en/members', status: 500 });
    pathname = '/en/dashboard';
    buffer.recordError('other page');

    expect(buffer.signalsFor('/en/members')).toEqual({
      consoleErrors: [{ message: 'boom' }],
      failedRequests: [{ method: 'POST', url: '/en/members', status: 500 }],
    });
    expect(buffer.signalsFor('/en/dashboard').consoleErrors).toEqual([
      { message: 'other page' },
    ]);
  });

  it('keeps only the newest entries per page', () => {
    const buffer = createSignalBuffer(() => '/p');

    for (let index = 0; index < SIGNAL_LIMIT + 5; index += 1) {
      buffer.recordError(`e${index}`);
    }

    const { consoleErrors } = buffer.signalsFor('/p');

    expect(consoleErrors).toHaveLength(SIGNAL_LIMIT);
    expect(consoleErrors[0]).toEqual({ message: 'e5' });
  });
});

describe('describing', () => {
  it('turns console.error arguments into one message with a short stack', () => {
    const error = new TypeError('x is undefined');

    error.stack =
      'TypeError: x is undefined\n  at a\n  at b\n  at c\n  at d\n  at e';

    expect(describeError(['Failed:', error, { id: 1 }])).toBe(
      'Failed: TypeError: x is undefined\nat a\nat b\nat c\nat d {"id":1}'
    );
    expect(describeRejection('nope')).toBe('Unhandled rejection: nope');
  });

  it('shortens same-origin URLs and reads the method off init or a Request', () => {
    expect(describeRequest('/en/members?page=2', { method: 'post' })).toEqual({
      method: 'POST',
      url: '/en/members?page=2',
    });
    expect(describeRequest(new URL('https://api.example.com/x'))).toEqual({
      method: 'GET',
      url: 'https://api.example.com/x',
    });
    expect(
      describeRequest(
        new Request(`${window.location.origin}/api/y`, { method: 'DELETE' })
      )
    ).toEqual({ method: 'DELETE', url: '/api/y' });
  });
});

import type { HuntFailure, HuntResult } from './types.js';

/** The failure reasons as values, so no module spells one as a bare string. */
export const FAILURE = {
  disabled: 'disabled',
  invalid: 'invalid',
  noBoard: 'noBoard',
  io: 'io',
  noRoute: 'noRoute',
} as const satisfies Record<HuntFailure, HuntFailure>;

export function succeed<T>(data: T): HuntResult<T> {
  return { status: 'success', data };
}

export function fail<T>(reason: HuntFailure, detail?: string): HuntResult<T> {
  return detail === undefined
    ? { status: 'error', reason }
    : { status: 'error', reason, detail };
}

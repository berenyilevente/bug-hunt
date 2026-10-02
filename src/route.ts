import { isEnabled } from './server/flag.js';
import {
  beginBugReport,
  finishBugReport,
  saveBugScreenshot,
} from './server/steps.js';
import { fail, FAILURE } from './helpers/results.js';
import type { HuntResult } from './helpers/types.js';

/**
 * The route a host app mounts at `src/app/api/bug-hunt/route.ts`:
 *
 *   export { POST } from '@berenyilevente/bug-hunt/route';
 *
 * One request per save step. With the flag off it answers 404 before reading
 * the body, so a production build gives away nothing about it.
 */
export async function POST(request: Request): Promise<Response> {
  if (!isEnabled()) {
    return new Response(null, { status: 404 });
  }

  const body: unknown = await request.json().catch(() => null);

  return Response.json(await runStep(body));
}

function runStep(body: unknown): Promise<HuntResult<unknown>> {
  if (typeof body !== 'object' || body === null || !('step' in body)) {
    return Promise.resolve(fail(FAILURE.invalid));
  }

  const fields = body as Record<string, unknown>;

  if (fields.step === 'begin') {
    return beginBugReport();
  }

  // The steps check every field's shape themselves; these casts only hand
  // them on, so a malformed body still ends in `invalid` there.
  if (fields.step === 'screenshot') {
    return saveBugScreenshot(
      fields.folder as string,
      fields.number as number,
      fields.dataUrl as string
    );
  }

  if (fields.step === 'finish') {
    return finishBugReport(
      fields.folder as string,
      fields.session as Parameters<typeof finishBugReport>[1]
    );
  }

  return Promise.resolve(fail(FAILURE.invalid));
}

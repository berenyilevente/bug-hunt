import { isEnabled } from './server/flag.js';
import { beginBugReport, finishBugReport, saveBugScreenshot, } from './server/steps.js';
import { fail, FAILURE } from './helpers/results.js';
/**
 * The route a host app mounts at `src/app/api/bug-hunt/route.ts`:
 *
 *   export { POST } from '@berenyilevente/bug-hunt/route';
 *
 * One request per save step. With the flag off it answers 404 before reading
 * the body, so a production build gives away nothing about it.
 */
export async function POST(request) {
    if (!isEnabled()) {
        return new Response(null, { status: 404 });
    }
    const body = await request.json().catch(() => null);
    return Response.json(await runStep(body));
}
function runStep(body) {
    if (typeof body !== 'object' || body === null || !('step' in body)) {
        return Promise.resolve(fail(FAILURE.invalid));
    }
    const fields = body;
    if (fields.step === 'begin') {
        return beginBugReport();
    }
    // The steps check every field's shape themselves; these casts only hand
    // them on, so a malformed body still ends in `invalid` there.
    if (fields.step === 'screenshot') {
        return saveBugScreenshot(fields.folder, fields.number, fields.dataUrl);
    }
    if (fields.step === 'finish') {
        return finishBugReport(fields.folder, fields.session);
    }
    return Promise.resolve(fail(FAILURE.invalid));
}

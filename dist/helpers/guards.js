const JPEG_DATA_URL = /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/;
const FOLDER_NAME = /^\d{4}-\d{2}-\d{2}-\d{4}(-\d+)?$/;
/** A screenshot as a report names it: always a file under `shots/`. */
export const SHOT_FILE = /^shots\/\d{2,3}\.jpg$/;
function isObject(value) {
    return typeof value === 'object' && value !== null;
}
function isString(value) {
    return typeof value === 'string';
}
function isStringList(value) {
    return Array.isArray(value) && value.every(isString);
}
function isRect(value) {
    if (!isObject(value)) {
        return false;
    }
    return [value.x, value.y, value.width, value.height].every((field) => typeof field === 'number' && Number.isFinite(field));
}
function isMark(value) {
    if (!isObject(value) ||
        !isRect(value.rect) ||
        !isStringList(value.components)) {
        return false;
    }
    if (value.kind === 'box') {
        return true;
    }
    return (value.kind === 'element' && isString(value.selector) && isString(value.text));
}
function isItemKind(value) {
    return value === 'bug' || value === 'feature';
}
function isConsoleError(value) {
    return isObject(value) && isString(value.message);
}
function isFailedRequest(value) {
    return (isObject(value) &&
        isString(value.method) &&
        isString(value.url) &&
        (value.status === null || typeof value.status === 'number'));
}
/** Everything a bug carries but its screenshot, which the two forms type apart. */
function isBugBody(value) {
    return (isObject(value) &&
        isItemKind(value.kind) &&
        [value.id, value.url, value.pathname, value.note, value.markedAt].every(isString) &&
        value.note.trim() !== '' &&
        isMark(value.mark) &&
        Array.isArray(value.consoleErrors) &&
        value.consoleErrors.every(isConsoleError) &&
        Array.isArray(value.failedRequests) &&
        value.failedRequests.every(isFailedRequest));
}
function isBug(value) {
    return (isBugBody(value) &&
        (value.screenshot === null || isScreenshotDataUrl(value.screenshot)));
}
/** A report names each screenshot by its file, and only ever one under `shots/`. */
function isReportBug(value) {
    return (isBugBody(value) &&
        (value.screenshot === null ||
            (isString(value.screenshot) && SHOT_FILE.test(value.screenshot))));
}
/** The draft read back from localStorage — whatever an older copy left there. */
export function isHuntSession(value) {
    return (isObject(value) &&
        isString(value.startedAt) &&
        Array.isArray(value.bugs) &&
        value.bugs.every(isBug));
}
/**
 * A server action's argument is whatever the request carried, whatever its
 * TypeScript signature says — checked before any of it reaches the disk.
 */
export function isReportSession(value) {
    return (isObject(value) &&
        isString(value.startedAt) &&
        Array.isArray(value.bugs) &&
        value.bugs.length > 0 &&
        value.bugs.every(isReportBug));
}
export function isScreenshotDataUrl(value) {
    return isString(value) && JPEG_DATA_URL.test(value);
}
/** A report folder's name, as `createReportFolder` made it — never a path. */
export function isFolderName(value) {
    return isString(value) && FOLDER_NAME.test(value);
}
/** A bug's position in the report: 1-based, as the report numbers them. */
export function isBugNumber(value) {
    return (Number.isInteger(value) &&
        value >= 1 &&
        value <= 999);
}

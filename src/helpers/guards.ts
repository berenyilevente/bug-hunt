import type {
  Bug,
  ItemKind,
  ConsoleError,
  FailedRequest,
  HuntSession,
  Mark,
  Rect,
  ReportBug,
  ReportSession,
} from './types.js';

type Fields = Record<string, unknown>;

const JPEG_DATA_URL = /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/;

const FOLDER_NAME = /^\d{4}-\d{2}-\d{2}-\d{4}(-\d+)?$/;

/** A screenshot as a report names it: always a file under `shots/`. */
export const SHOT_FILE = /^shots\/\d{2,3}\.jpg$/;

function isObject(value: unknown): value is Fields {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isRect(value: unknown): value is Rect {
  if (!isObject(value)) {
    return false;
  }

  return [value.x, value.y, value.width, value.height].every(
    (field) => typeof field === 'number' && Number.isFinite(field)
  );
}

function isMark(value: unknown): value is Mark {
  if (
    !isObject(value) ||
    !isRect(value.rect) ||
    !isStringList(value.components)
  ) {
    return false;
  }

  if (value.kind === 'box') {
    return true;
  }

  return (
    value.kind === 'element' && isString(value.selector) && isString(value.text)
  );
}

function isItemKind(value: unknown): value is ItemKind {
  return value === 'bug' || value === 'feature';
}

function isConsoleError(value: unknown): value is ConsoleError {
  return isObject(value) && isString(value.message);
}

function isFailedRequest(value: unknown): value is FailedRequest {
  return (
    isObject(value) &&
    isString(value.method) &&
    isString(value.url) &&
    (value.status === null || typeof value.status === 'number')
  );
}

/** Everything a bug carries but its screenshot, which the two forms type apart. */
function isBugBody(value: unknown): value is Fields {
  return (
    isObject(value) &&
    isItemKind(value.kind) &&
    [value.id, value.url, value.pathname, value.note, value.markedAt].every(
      isString
    ) &&
    (value.note as string).trim() !== '' &&
    isMark(value.mark) &&
    Array.isArray(value.consoleErrors) &&
    value.consoleErrors.every(isConsoleError) &&
    Array.isArray(value.failedRequests) &&
    value.failedRequests.every(isFailedRequest)
  );
}

function isBug(value: unknown): value is Bug {
  return (
    isBugBody(value) &&
    (value.screenshot === null || isScreenshotDataUrl(value.screenshot))
  );
}

/** A report names each screenshot by its file, and only ever one under `shots/`. */
function isReportBug(value: unknown): value is ReportBug {
  return (
    isBugBody(value) &&
    (value.screenshot === null ||
      (isString(value.screenshot) && SHOT_FILE.test(value.screenshot)))
  );
}

/** The draft read back from localStorage — whatever an older copy left there. */
export function isHuntSession(value: unknown): value is HuntSession {
  return (
    isObject(value) &&
    isString(value.startedAt) &&
    Array.isArray(value.bugs) &&
    value.bugs.every(isBug)
  );
}

/**
 * A server action's argument is whatever the request carried, whatever its
 * TypeScript signature says — checked before any of it reaches the disk.
 */
export function isReportSession(value: unknown): value is ReportSession {
  return (
    isObject(value) &&
    isString(value.startedAt) &&
    Array.isArray(value.bugs) &&
    value.bugs.length > 0 &&
    value.bugs.every(isReportBug)
  );
}

export function isScreenshotDataUrl(value: unknown): value is string {
  return isString(value) && JPEG_DATA_URL.test(value);
}

/** A report folder's name, as `createReportFolder` made it — never a path. */
export function isFolderName(value: unknown): value is string {
  return isString(value) && FOLDER_NAME.test(value);
}

/** A bug's position in the report: 1-based, as the report numbers them. */
export function isBugNumber(value: unknown): value is number {
  return (
    Number.isInteger(value) &&
    (value as number) >= 1 &&
    (value as number) <= 999
  );
}

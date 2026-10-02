import path from 'node:path';

import {
  isBugNumber,
  isFolderName,
  isReportSession,
  isScreenshotDataUrl,
} from '../helpers/guards.js';
import { countKinds } from '../helpers/counts.js';
import { renderReport } from '../helpers/renderReport.js';
import {
  createReportFolder,
  hasFile,
  writeReportFile,
  writeScreenshot,
} from '../helpers/reportFolder.js';
import { fail, FAILURE, succeed } from '../helpers/results.js';
import { resolveTarget } from '../helpers/target.js';
import { isEnabled } from './flag.js';
import type {
  HuntResult,
  ReportSession,
  SavedReport,
} from '../helpers/types.js';

/*
 * A save is three steps rather than one request: a session's screenshots
 * together run to megabytes, and one screenshot per request keeps every body
 * small whatever limit sits in front of the route.
 *
 * Every call refuses before touching anything unless `NEXT_PUBLIC_BUG_HUNT=true`
 * — the flag is the whole boundary. No session check, since the overlay also
 * runs on public pages: a build with the flag on lets anyone who reaches it
 * save a report. Every call re-resolves the board and takes only a folder
 * *name*, so nothing the browser sends can point a write elsewhere.
 */

/** Makes the report's folder under the board and returns its name. */
export async function beginBugReport(): Promise<
  HuntResult<{ folder: string }>
> {
  if (!isEnabled()) {
    return fail(FAILURE.disabled);
  }

  try {
    const target = await resolveTarget();

    if (target.status === 'missing') {
      return fail(FAILURE.noBoard, target.detail);
    }

    return succeed({
      folder: await createReportFolder(target.reportsPath, new Date()),
    });
  } catch (error) {
    console.error('[bug-hunt]', error);
    return fail(FAILURE.io);
  }
}

/** Writes the screenshot of bug `number` into a folder `beginBugReport` made. */
export async function saveBugScreenshot(
  folder: string,
  number: number,
  dataUrl: string
): Promise<HuntResult<{ file: string }>> {
  if (!isEnabled()) {
    return fail(FAILURE.disabled);
  }

  if (
    !isFolderName(folder) ||
    !isBugNumber(number) ||
    !isScreenshotDataUrl(dataUrl)
  ) {
    return fail(FAILURE.invalid);
  }

  try {
    const target = await resolveTarget();

    if (target.status === 'missing') {
      return fail(FAILURE.noBoard, target.detail);
    }

    return succeed({
      file: await writeScreenshot(
        path.join(target.reportsPath, folder),
        number,
        dataUrl
      ),
    });
  } catch (error) {
    console.error('[bug-hunt]', error);
    return fail(FAILURE.io);
  }
}

/**
 * Writes `report.md`, which is what makes the folder a report. Every
 * screenshot it names must already be on disk.
 */
export async function finishBugReport(
  folder: string,
  session: ReportSession
): Promise<HuntResult<SavedReport>> {
  if (!isEnabled()) {
    return fail(FAILURE.disabled);
  }

  if (!isFolderName(folder) || !isReportSession(session)) {
    return fail(FAILURE.invalid);
  }

  try {
    const target = await resolveTarget();

    if (target.status === 'missing') {
      return fail(FAILURE.noBoard, target.detail);
    }

    const folderPath = path.join(target.reportsPath, folder);
    const shots = session.bugs.flatMap((bug) =>
      bug.screenshot ? [bug.screenshot] : []
    );
    const present = await Promise.all(
      shots.map((file) => hasFile(folderPath, file))
    );

    if (present.includes(false)) {
      return fail(FAILURE.invalid);
    }

    const markdown = renderReport(session, {
      board: target.board,
      repo: process.cwd(),
      created: new Date(),
    });

    await writeReportFile(folderPath, markdown);

    return succeed({
      board: target.board,
      folder: folderPath,
      counts: countKinds(session.bugs),
    });
  } catch (error) {
    console.error('[bug-hunt]', error);
    return fail(FAILURE.io);
  }
}

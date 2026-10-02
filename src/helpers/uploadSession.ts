import type {
  HuntResult,
  HuntSession,
  ReportBug,
  SavedReport,
  SaveSteps,
} from './types.js';

/**
 * Sends a session to the board in the three steps a save takes: the
 * folder, each screenshot on its own, then the report naming them. The first
 * failure stops it and is returned as is; a folder left without `report.md` is
 * one `/triage-business-review` never reads.
 */
export async function uploadSession(
  session: HuntSession,
  steps: SaveSteps
): Promise<HuntResult<SavedReport>> {
  const begun = await steps.begin();

  if (begun.status === 'error') {
    return begun;
  }

  const { folder } = begun.data;
  const bugs: ReportBug[] = [];

  for (const [index, bug] of session.bugs.entries()) {
    if (!bug.screenshot) {
      bugs.push({ ...bug, screenshot: null });
      continue;
    }

    const saved = await steps.screenshot(folder, index + 1, bug.screenshot);

    if (saved.status === 'error') {
      return saved;
    }

    bugs.push({ ...bug, screenshot: saved.data.file });
  }

  return steps.finish(folder, { startedAt: session.startedAt, bugs });
}

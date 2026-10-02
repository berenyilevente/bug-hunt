import { mkdir, rename, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { folderStamp, shotFileName } from './renderReport.js';
const REPORT_FILE = 'report.md';
/**
 * Makes a fresh `<reportsRoot>/<stamp>/shots/` and returns the folder's name.
 * Two saves in one minute get `-2`, `-3`, …: `mkdir` without `recursive`
 * refuses a folder that exists, so a report is never written into another's.
 */
export async function createReportFolder(reportsRoot, now) {
    await mkdir(reportsRoot, { recursive: true });
    const stamp = folderStamp(now);
    for (let attempt = 1;; attempt += 1) {
        const name = attempt === 1 ? stamp : `${stamp}-${attempt}`;
        try {
            await mkdir(path.join(reportsRoot, name));
            await mkdir(path.join(reportsRoot, name, 'shots'));
            return name;
        }
        catch (error) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
    }
}
/** Writes one bug's screenshot and returns its path relative to the report. */
export async function writeScreenshot(folder, number, dataUrl) {
    const file = shotFileName(number);
    const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
    await writeFile(path.join(folder, file), Buffer.from(base64, 'base64'));
    return file;
}
export async function hasFile(folder, file) {
    try {
        return (await stat(path.join(folder, file))).isFile();
    }
    catch {
        return false;
    }
}
/**
 * Writes `report.md` last, through a temp file renamed over it: a folder with
 * a report in it is a finished one, which is all `/triage-bugs` looks for.
 */
export async function writeReportFile(folder, markdown) {
    const target = path.join(folder, REPORT_FILE);
    const temp = `${target}.tmp`;
    await writeFile(temp, markdown, 'utf8');
    await rename(temp, target);
    return target;
}

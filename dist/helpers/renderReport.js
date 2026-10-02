const pad = (value, width = 2) => String(value).padStart(width, '0');
/** `2026-09-25-1430`, in the dev machine's own time: the report folder's name. */
export function folderStamp(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}
/** An ISO timestamp with the local offset, `2026-09-25T14:30:00+02:00`. */
export function localIso(date) {
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const hours = pad(Math.floor(Math.abs(offset) / 60));
    const minutes = pad(Math.abs(offset) % 60);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${sign}${hours}:${minutes}`;
}
/** The screenshot file of the bug numbered `number`, relative to the report. */
export function shotFileName(number) {
    return `shots/${pad(number)}.jpg`;
}
/** A code span that survives backticks in its content. */
function code(value) {
    const longestRun = Math.max(0, ...(value.match(/`+/g) ?? []).map((run) => run.length));
    const fence = '`'.repeat(longestRun + 1);
    const padding = value.startsWith('`') || value.endsWith('`') ? ' ' : '';
    return `${fence}${padding}${value}${padding}${fence}`;
}
/** A block the markdown never reads as structure: every line indented four spaces. */
function indented(value) {
    return value
        .split('\n')
        .map((line) => `    ${line}`)
        .join('\n');
}
/**
 * The note, verbatim, as a blockquote — so a line of it starting with `##` can
 * never pass for the next bug's heading.
 */
function quoted(value) {
    return value
        .trim()
        .split('\n')
        .map((line) => (line === '' ? '>' : `> ${line}`))
        .join('\n');
}
function describeMark(mark) {
    const { x, y, width, height } = mark.rect;
    if (mark.kind === 'box') {
        return `box ${width}×${height} at ${x},${y}`;
    }
    const text = mark.text ? ` — "${mark.text.replace(/"/g, '\\"')}"` : '';
    return `element ${code(mark.selector)}${text}`;
}
function renderBug(bug, number) {
    const lines = [
        `## Bug ${number}`,
        '',
        `- **Page:** ${bug.pathname} — ${bug.url}`,
        `- **Marked:** ${describeMark(bug.mark)}`,
        `- **Components:** ${bug.mark.components.length > 0 ? bug.mark.components.join(' ← ') : '—'}`,
        `- **Screenshot:** ${bug.screenshot ?? '—'}`,
        `- **Marked at:** ${bug.markedAt}`,
        '- **Outcome:** —',
        '',
        quoted(bug.note),
    ];
    if (bug.consoleErrors.length > 0) {
        lines.push('', '**Console errors**', '', ...bug.consoleErrors
            .map(({ message }) => indented(message))
            .join('\n\n')
            .split('\n'));
    }
    if (bug.failedRequests.length > 0) {
        lines.push('', '**Failed requests**', '', ...bug.failedRequests.map(({ method, url, status }) => `- ${method} ${code(url)} → ${status ?? 'no response'}`));
    }
    return lines.join('\n');
}
/**
 * The report `/triage-bugs` reads. The frontmatter's `status` is what it flips
 * to `triaged`, and each bug's `Outcome` line is what it fills in — so both are
 * written here, empty, in the shape the skill expects.
 */
export function renderReport(session, meta) {
    const header = [
        '---',
        `board: ${meta.board}`,
        `repo: ${meta.repo}`,
        `created: ${localIso(meta.created)}`,
        `started: ${session.startedAt}`,
        'status: new',
        `bugs: ${session.bugs.length}`,
        '---',
        '',
        `# Bug hunt — ${folderStamp(meta.created)}`,
    ].join('\n');
    const bugs = session.bugs.map((bug, index) => renderBug(bug, index + 1));
    return `${[header, ...bugs].join('\n\n')}\n`;
}

/**
 * A rectangle in page coordinates — the viewport rect plus the scroll offset at
 * the moment it was marked — so it still names the same spot after a scroll.
 */
export type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
};
/** A bug pinned to one element: the anchor Claude uses to find its code. */
export type ElementMark = {
    kind: 'element';
    selector: string;
    text: string;
    rect: Rect;
    components: string[];
};
/** A free box, for what is not one element — a gap, an overlap, a layout. */
export type BoxMark = {
    kind: 'box';
    rect: Rect;
    components: string[];
};
export type Mark = ElementMark | BoxMark;
export type ConsoleError = {
    message: string;
};
/** A request that failed: a non-2xx status, or `null` when it never answered. */
export type FailedRequest = {
    method: string;
    url: string;
    status: number | null;
};
/** What the page logged, captured while the overlay was mounted. */
export type PageSignals = {
    consoleErrors: ConsoleError[];
    failedRequests: FailedRequest[];
};
/** One reported bug. `screenshot` is a JPEG data URL, or null when capture failed. */
export type Bug = PageSignals & {
    id: string;
    url: string;
    pathname: string;
    mark: Mark;
    note: string;
    screenshot: string | null;
    markedAt: string;
};
export type HuntSession = {
    startedAt: string;
    bugs: Bug[];
};
/**
 * A bug as the report records it: `screenshot` is the file it was written to,
 * relative to the report folder, rather than the image itself.
 */
export type ReportBug = Omit<Bug, 'screenshot'> & {
    screenshot: string | null;
};
export type ReportSession = {
    startedAt: string;
    bugs: ReportBug[];
};
/** Where Save writes, resolved from the disposit board this repo belongs to. */
export type HuntTarget = {
    status: 'ready';
    board: string;
    reportsPath: string;
} | {
    status: 'missing';
    detail: string;
};
export type HuntFailure = 'disabled' | 'invalid' | 'noBoard' | 'io' | 'noRoute';
export type HuntResult<T> = {
    status: 'success';
    data: T;
} | {
    status: 'error';
    reason: HuntFailure;
    detail?: string;
};
export type SavedReport = {
    board: string;
    folder: string;
    bugCount: number;
};
/**
 * The three steps a save takes, as the browser calls them. A seam rather than
 * a fixed transport, so the upload's ordering is specced without a server.
 */
export type SaveSteps = {
    begin: () => Promise<HuntResult<{
        folder: string;
    }>>;
    screenshot: (folder: string, number: number, dataUrl: string) => Promise<HuntResult<{
        file: string;
    }>>;
    finish: (folder: string, session: ReportSession) => Promise<HuntResult<SavedReport>>;
};
/** What the browser posts to the route: one step per request. */
export type StepRequest = {
    step: 'begin';
} | {
    step: 'screenshot';
    folder: string;
    number: number;
    dataUrl: string;
} | {
    step: 'finish';
    folder: string;
    session: ReportSession;
};

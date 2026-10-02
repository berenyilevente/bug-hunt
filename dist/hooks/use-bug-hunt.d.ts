import type { Bug, HuntTarget, Mark, PageSignals, SavedReport, SaveSteps } from '../helpers/types.js';
type HuntProps = {
    target: HuntTarget;
    steps: SaveSteps;
};
/** A mark waiting for its note: everything the bug will carry but the words. */
type PendingBug = PageSignals & {
    mark: Mark;
    url: string;
    pathname: string;
    screenshot: string | null;
    markedAt: string;
};
type SaveStatus = {
    kind: 'saved';
    report: SavedReport;
} | {
    kind: 'error';
    message: string;
};
export declare const useBugHunt: () => {
    target: HuntTarget;
    isOpen: boolean;
    setOpen: (next: boolean) => void;
    isPicking: boolean;
    isCapturing: boolean;
    startPicking: () => void;
    cancelPicking: () => void;
    completeMark: (mark: Mark) => Promise<void>;
    pending: PendingBug | null;
    editingBug: Bug | null;
    submitNote: (note: string) => void;
    closeNote: () => void;
    startEdit: (id: string) => void;
    deleteBug: (id: string) => void;
    bugs: Bug[];
    hoveredBugId: string | null;
    setHoveredBugId: import("react").Dispatch<import("react").SetStateAction<string | null>>;
    isStorageFull: boolean;
    status: SaveStatus | null;
    isSaving: boolean;
    save: () => void;
    discardSession: () => void;
}, BugHuntProvider: (props: HuntProps & {
    children: import("react").ReactNode;
}) => import("react").ReactNode;
export {};

import type { ReactNode } from 'react';
import type { ItemKind } from '../helpers/types.js';
type KindToggleProps = {
    kind: ItemKind;
    onChange: (kind: ItemKind) => void;
};
/** Bug or feature request: the reporter's call, which triage may revise. */
export declare function KindToggle({ kind, onChange }: KindToggleProps): ReactNode;
export {};

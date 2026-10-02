import type { HuntFailure, HuntResult } from './types.js';
/** The failure reasons as values, so no module spells one as a bare string. */
export declare const FAILURE: {
    readonly disabled: "disabled";
    readonly invalid: "invalid";
    readonly noBoard: "noBoard";
    readonly io: "io";
    readonly noRoute: "noRoute";
};
export declare function succeed<T>(data: T): HuntResult<T>;
export declare function fail<T>(reason: HuntFailure, detail?: string): HuntResult<T>;

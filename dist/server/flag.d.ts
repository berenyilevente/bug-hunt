/**
 * The overlay's one gate, read inline wherever it is read: Next inlines a
 * `NEXT_PUBLIC_` value at build time — in this package's code too — so a build
 * without the flag sees a constant `false` and drops what sits behind it.
 */
export declare function isEnabled(): boolean;

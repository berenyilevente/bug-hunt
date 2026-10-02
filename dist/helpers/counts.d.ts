import type { ItemCounts, ItemKind } from './types.js';
/** How many items of each kind a session holds. */
export declare function countKinds(items: Array<{
    kind: ItemKind;
}>): ItemCounts;

import type { ItemCounts, ItemKind } from './types.js';

/** How many items of each kind a session holds. */
export function countKinds(items: Array<{ kind: ItemKind }>): ItemCounts {
  return {
    bugs: items.filter((item) => item.kind === 'bug').length,
    features: items.filter((item) => item.kind === 'feature').length,
  };
}

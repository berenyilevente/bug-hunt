/**
 * A CSS selector that finds `element` again: the element's own stable
 * attribute when it has a unique one, else a path of `tag:nth-of-type` steps
 * up to the nearest ancestor that has one, or to `body`.
 */
export declare function selectorFor(element: Element): string;
/** The element's own words, collapsed and cut short: enough to grep for. */
export declare function visibleText(element: Element, max?: number): string;

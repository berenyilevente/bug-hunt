/**
 * The names of the components that rendered `element`, innermost first — what
 * turns "the button in the corner" into a file to open. Client components come
 * from React's fiber on the DOM node, server components from the debug info a
 * dev build keeps on it, marked `(server)`. Returns `[]` where there is none.
 */
export declare function componentStack(element: Element, max?: number): string[];

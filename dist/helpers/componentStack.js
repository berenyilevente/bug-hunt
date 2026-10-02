/** React stores an element's fiber under a key salted per React copy. */
const FIBER_KEY_PREFIX = '__reactFiber$';
/** How a server component is told apart from a client one in the stack. */
const SERVER_SUFFIX = ' (server)';
/**
 * Framework components between the page and the root: never the app's own
 * code, so never where a bug is fixed.
 */
const FRAMEWORK_NAMES = new Set([
    'AppRouter',
    'BaseLink',
    'ErrorBoundary',
    'ErrorBoundaryHandler',
    'HTTPAccessFallbackBoundary',
    'HTTPAccessFallbackErrorBoundary',
    'InnerLayoutRouter',
    'InnerScrollAndFocusHandler',
    'InnerScrollHandlerNew',
    'LayoutRouter',
    'LinkComponent',
    'LoadingBoundary',
    'OuterLayoutRouter',
    'RedirectBoundary',
    'RedirectErrorBoundary',
    'RenderFromTemplateContext',
    'Router',
    'ScrollAndFocusHandler',
    'ScrollAndMaybeFocusHandler',
    'SegmentStateProvider',
    'SegmentViewNode',
    'ServerRoot',
]);
function fiberOf(element) {
    const key = Object.keys(element).find((name) => name.startsWith(FIBER_KEY_PREFIX));
    return key
        ? (element[key] ?? null)
        : null;
}
function nameOf(type) {
    if (typeof type === 'function') {
        const { displayName, name } = type;
        const found = displayName ?? name;
        return typeof found === 'string' ? found : null;
    }
    if (typeof type !== 'object' || type === null) {
        return null;
    }
    // forwardRef keeps its component under `render`, memo under `type`. Any
    // other object — a context, a provider — is not a component.
    const { displayName, render, type: inner, } = type;
    if (render === undefined && inner === undefined) {
        return null;
    }
    if (typeof displayName === 'string') {
        return displayName;
    }
    return nameOf(render ?? inner);
}
/** The server components recorded on a fiber, innermost first. */
function serverNamesOf(fiber) {
    if (!Array.isArray(fiber._debugInfo)) {
        return [];
    }
    return fiber._debugInfo
        .flatMap((info) => {
        const { name } = (info ?? {});
        return typeof name === 'string' ? [name] : [];
    })
        .reverse();
}
/**
 * A component the app wrote: capitalised, not the framework's plumbing, and
 * not a library's namespaced part (`Slot.Slot`, `Dialog.Content`).
 */
function isAppComponent(name) {
    return Boolean(name &&
        /^[A-Z]/.test(name) &&
        !name.includes('.') &&
        !FRAMEWORK_NAMES.has(name));
}
/**
 * The names of the components that rendered `element`, innermost first — what
 * turns "the button in the corner" into a file to open. Client components come
 * from React's fiber on the DOM node, server components from the debug info a
 * dev build keeps on it, marked `(server)`. Returns `[]` where there is none.
 */
export function componentStack(element, max = 8) {
    const names = [];
    let fiber = fiberOf(element);
    while (fiber && names.length < max) {
        const own = nameOf(fiber.type);
        const found = [
            ...(isAppComponent(own) ? [own] : []),
            ...serverNamesOf(fiber)
                .filter(isAppComponent)
                .map((name) => `${name}${SERVER_SUFFIX}`),
        ];
        for (const name of found) {
            if (names.at(-1) !== name) {
                names.push(name);
            }
        }
        fiber = fiber.return ?? null;
    }
    return names.slice(0, max);
}

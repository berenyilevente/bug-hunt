/**
 * The slice of a React fiber this walk reads — nothing else is relied on.
 * `_debugInfo` is where a dev build records the server components that
 * produced a fiber: they have no fiber of their own on the client.
 */
type FiberLike = {
  type?: unknown;
  return?: FiberLike | null;
  _debugInfo?: unknown;
};

type Named = { displayName?: unknown; name?: unknown };

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

function fiberOf(element: Element): FiberLike | null {
  const key = Object.keys(element).find((name) =>
    name.startsWith(FIBER_KEY_PREFIX)
  );

  return key
    ? ((element as unknown as Record<string, FiberLike>)[key] ?? null)
    : null;
}

function nameOf(type: unknown): string | null {
  if (typeof type === 'function') {
    const { displayName, name } = type as Named;
    const found = displayName ?? name;

    return typeof found === 'string' ? found : null;
  }

  if (typeof type !== 'object' || type === null) {
    return null;
  }

  // forwardRef keeps its component under `render`, memo under `type`. Any
  // other object — a context, a provider — is not a component.
  const {
    displayName,
    render,
    type: inner,
  } = type as Named & {
    render?: unknown;
    type?: unknown;
  };

  if (render === undefined && inner === undefined) {
    return null;
  }

  if (typeof displayName === 'string') {
    return displayName;
  }

  return nameOf(render ?? inner);
}

/** The server components recorded on a fiber, innermost first. */
function serverNamesOf(fiber: FiberLike): string[] {
  if (!Array.isArray(fiber._debugInfo)) {
    return [];
  }

  return fiber._debugInfo
    .flatMap((info: unknown) => {
      const { name } = (info ?? {}) as Named;

      return typeof name === 'string' ? [name] : [];
    })
    .reverse();
}

/**
 * A component the app wrote: capitalised, not the framework's plumbing, and
 * not a library's namespaced part (`Slot.Slot`, `Dialog.Content`).
 */
function isAppComponent(name: string | null): name is string {
  return Boolean(
    name &&
    /^[A-Z]/.test(name) &&
    !name.includes('.') &&
    !FRAMEWORK_NAMES.has(name)
  );
}

/**
 * The names of the components that rendered `element`, innermost first — what
 * turns "the button in the corner" into a file to open. Client components come
 * from React's fiber on the DOM node, server components from the debug info a
 * dev build keeps on it, marked `(server)`. Returns `[]` where there is none.
 */
export function componentStack(element: Element, max = 8): string[] {
  const names: string[] = [];
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

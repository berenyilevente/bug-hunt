/**
 * Attributes a person or a test put there on purpose, in the order they are
 * trusted: each one is a name Claude can grep for, where an `nth-of-type`
 * path only says where the element happened to sit.
 */
const STABLE_ATTRIBUTES = ['data-testid', 'data-tour', 'id'] as const;

function attributeSelector(name: string, value: string): string {
  return `[${name}=${JSON.stringify(value)}]`;
}

function isUnique(doc: Document, selector: string): boolean {
  try {
    return doc.querySelectorAll(selector).length === 1;
  } catch {
    return false;
  }
}

function stableSelector(element: Element): string | null {
  for (const name of STABLE_ATTRIBUTES) {
    const value = element.getAttribute(name);

    if (value) {
      const selector = attributeSelector(name, value);

      if (isUnique(element.ownerDocument, selector)) {
        return selector;
      }
    }
  }

  return null;
}

function positionalStep(element: Element): string {
  const tag = element.tagName.toLowerCase();
  const siblings = element.parentElement
    ? [...element.parentElement.children].filter(
        (sibling) => sibling.tagName === element.tagName
      )
    : [element];

  return siblings.length === 1
    ? tag
    : `${tag}:nth-of-type(${siblings.indexOf(element) + 1})`;
}

/**
 * A CSS selector that finds `element` again: the element's own stable
 * attribute when it has a unique one, else a path of `tag:nth-of-type` steps
 * up to the nearest ancestor that has one, or to `body`.
 */
export function selectorFor(element: Element): string {
  const steps: string[] = [];
  let current: Element | null = element;

  while (current && current.tagName !== 'BODY' && current.tagName !== 'HTML') {
    const stable = stableSelector(current);

    if (stable) {
      return [stable, ...steps].join(' > ');
    }

    steps.unshift(positionalStep(current));
    current = current.parentElement;
  }

  return ['body', ...steps].join(' > ');
}

/** The element's own words, collapsed and cut short: enough to grep for. */
export function visibleText(element: Element, max = 120): string {
  const text =
    (element instanceof HTMLElement ? (element.innerText ?? '') : '') ||
    element.textContent ||
    element.getAttribute('aria-label') ||
    '';
  const collapsed = text.replace(/\s+/g, ' ').trim();

  return collapsed.length > max ? `${collapsed.slice(0, max - 1)}…` : collapsed;
}

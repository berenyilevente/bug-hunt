import { DEV_OVERLAY_ATTRIBUTE } from './labels.js';
import { toViewportBox } from './geometry.js';
import type { Rect } from './types.js';

/** Wide enough to read a label, small enough that a session fits localStorage. */
const MAX_WIDTH = 1280;
const JPEG_QUALITY = 0.75;
const OUTLINE_COLOR = '#ef4444';
const OUTLINE_WIDTH = 3;

function isOverlayNode(node: Node): boolean {
  return node instanceof Element && node.hasAttribute(DEV_OVERLAY_ATTRIBUTE);
}

/**
 * The viewport as the user sees it, with the marked area outlined in red, as a
 * JPEG data URL — or `null` when the page cannot be drawn (a tainted canvas, a
 * cross-origin frame). A missing picture never costs the bug itself.
 *
 * `modern-screenshot` renders the whole document; the viewport is cut out of
 * it afterwards, so what is drawn is what was on screen when the bug was marked.
 */
export async function captureViewport(rect: Rect): Promise<string | null> {
  try {
    const { domToCanvas } = await import('modern-screenshot');
    const page = await domToCanvas(document.documentElement, {
      scale: 1,
      filter: (node) => !isOverlayNode(node),
    });
    const scale = Math.min(1, MAX_WIDTH / window.innerWidth);
    const output = document.createElement('canvas');

    output.width = Math.round(window.innerWidth * scale);
    output.height = Math.round(window.innerHeight * scale);

    const context = output.getContext('2d');

    if (!context) {
      return null;
    }

    context.drawImage(
      page,
      window.scrollX,
      window.scrollY,
      window.innerWidth,
      window.innerHeight,
      0,
      0,
      output.width,
      output.height
    );

    const box = toViewportBox(rect);

    context.strokeStyle = OUTLINE_COLOR;
    context.lineWidth = OUTLINE_WIDTH;
    context.strokeRect(
      box.left * scale,
      box.top * scale,
      box.width * scale,
      box.height * scale
    );

    return output.toDataURL('image/jpeg', JPEG_QUALITY);
  } catch (error) {
    console.warn('[bug-hunt] screenshot failed', error);
    return null;
  }
}

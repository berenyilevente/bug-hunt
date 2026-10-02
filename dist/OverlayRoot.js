'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { BugHuntOverlay } from './BugHuntOverlay.js';
import { httpSteps } from './helpers/httpSteps.js';
import { isolateFromPage } from './helpers/isolate.js';
import { DEV_OVERLAY_ATTRIBUTE } from './helpers/labels.js';
import { OVERLAY_CSS } from './styles/overlay-css.generated.js';
/**
 * Hosts the overlay in a shadow root, under a React root of its own.
 *
 * - The shadow root carries the overlay's own compiled stylesheet: the page's
 *   CSS cannot restyle it, and its CSS cannot leak onto the page.
 * - The separate React root keeps the overlay working over an open dialog,
 *   sheet or menu. Rendered in the page's tree, its events would reach
 *   `document` like any other and a modal layer would take them as clicks and
 *   focus outside itself: it would close, or pull focus back from the note. A
 *   separate root listens on its own container, which lets the host stop
 *   those events before they get there (`isolateFromPage`).
 *
 * The host re-enables pointer events because a modal layer sets
 * `pointer-events: none` on `<body>`, which it would otherwise inherit. Set
 * inline: the page's stylesheet is the only one that reaches the host itself.
 */
export function OverlayRoot({ target, endpoint }) {
    const hostRef = useRef(null);
    const mountedRef = useRef(null);
    useEffect(() => {
        const host = hostRef.current;
        if (!host) {
            return;
        }
        // A fresh shadow host per mount: Strict Mode remounts before the deferred
        // unmount below has run, and an element takes only one shadow root.
        const shadowHost = document.createElement('div');
        const shadow = shadowHost.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        const container = document.createElement('div');
        style.textContent = OVERLAY_CSS;
        shadow.append(style, container);
        host.appendChild(shadowHost);
        const release = isolateFromPage(host);
        // The steps are made here, before the overlay mounts and wraps `fetch`.
        const mounted = {
            root: createRoot(container),
            steps: httpSteps(endpoint),
        };
        mountedRef.current = mounted;
        return () => {
            release();
            mountedRef.current = null;
            // Unmounting a root while the page's own root is still committing warns.
            window.setTimeout(() => {
                mounted.root.unmount();
                shadowHost.remove();
            });
        };
    }, [endpoint]);
    useEffect(() => {
        const mounted = mountedRef.current;
        mounted?.root.render(_jsx(BugHuntOverlay, { target: target, steps: mounted.steps }));
    }, [target, endpoint]);
    return (_jsx("div", { ref: hostRef, [DEV_OVERLAY_ATTRIBUTE]: '', 
        // Must win over an inherited `none` from `<body>`; no stylesheet reaches here.
        style: { pointerEvents: 'auto' } }));
}

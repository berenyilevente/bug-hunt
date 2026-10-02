'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import dynamic from 'next/dynamic';
/**
 * Loaded in the browser only: the overlay restores its session from
 * localStorage and measures the page, neither of which the server render can
 * know — rendering it there would only produce a hydration mismatch.
 */
const OverlayRoot = dynamic(() => import('./OverlayRoot.js').then((module) => module.OverlayRoot), { ssr: false });
export function BugHunt({ target, endpoint }) {
    return _jsx(OverlayRoot, { target: target, endpoint: endpoint });
}

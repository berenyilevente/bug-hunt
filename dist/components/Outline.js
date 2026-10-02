'use client';
import { jsx as _jsx } from "react/jsx-runtime";
const TONES = {
    pick: 'bg-sky-400/15 outline-sky-500',
    mark: 'bg-red-400/15 outline-red-500',
};
/**
 * A box drawn over the page rather than a style written onto its elements, so
 * the app's own DOM is never touched.
 */
export function Outline({ box, tone }) {
    return (_jsx("div", { "aria-hidden": true, className: `pointer-events-none fixed z-[2147482999] rounded-sm outline outline-2 ${TONES[tone]}`, 
        // Positions are measured, not designed — the one inline style.
        style: {
            top: box.top,
            left: box.left,
            width: box.width,
            height: box.height,
        } }));
}

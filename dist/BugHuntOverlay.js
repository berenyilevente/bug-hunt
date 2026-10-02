'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { BugHighlight } from './components/BugHighlight.js';
import { HuntPanel } from './components/HuntPanel.js';
import { HuntPill } from './components/HuntPill.js';
import { NoteForm } from './components/NoteForm.js';
import { PickLayer } from './components/PickLayer.js';
import { DEV_OVERLAY_ATTRIBUTE } from './helpers/labels.js';
import { BugHuntProvider, useBugHunt } from './hooks/use-bug-hunt.js';
/** Mounted only while picking, so each pick starts with no hover or drag. */
function Layers() {
    const { isPicking } = useBugHunt();
    return (_jsxs(_Fragment, { children: [isPicking && _jsx(PickLayer, {}), _jsx(NoteForm, {}), _jsx(BugHighlight, {})] }));
}
/**
 * The overlay: toggle, panel, pick layer and note form, under one root that
 * picking and the screenshot both skip.
 */
export function BugHuntOverlay({ target, steps, }) {
    return (_jsx(BugHuntProvider, { target: target, steps: steps, children: _jsxs("div", { [DEV_OVERLAY_ATTRIBUTE]: '', children: [_jsx(HuntPill, {}), _jsx(HuntPanel, {}), _jsx(Layers, {})] }) }));
}

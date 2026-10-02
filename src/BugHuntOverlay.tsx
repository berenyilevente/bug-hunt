'use client';

import type { ReactNode } from 'react';

import { BugHighlight } from './components/BugHighlight.js';
import { HuntPanel } from './components/HuntPanel.js';
import { HuntPill } from './components/HuntPill.js';
import { NoteForm } from './components/NoteForm.js';
import { PickLayer } from './components/PickLayer.js';
import { DEV_OVERLAY_ATTRIBUTE } from './helpers/labels.js';
import type { HuntTarget, SaveSteps } from './helpers/types.js';
import { BugHuntProvider, useBugHunt } from './hooks/use-bug-hunt.js';

type BugHuntOverlayProps = { target: HuntTarget; steps: SaveSteps };

/** Mounted only while picking, so each pick starts with no hover or drag. */
function Layers(): ReactNode {
  const { isPicking } = useBugHunt();

  return (
    <>
      {isPicking && <PickLayer />}
      <NoteForm />
      <BugHighlight />
    </>
  );
}

/**
 * The overlay: toggle, panel, pick layer and note form, under one root that
 * picking and the screenshot both skip.
 */
export function BugHuntOverlay({
  target,
  steps,
}: BugHuntOverlayProps): ReactNode {
  return (
    <BugHuntProvider target={target} steps={steps}>
      <div {...{ [DEV_OVERLAY_ATTRIBUTE]: '' }}>
        <HuntPill />
        <HuntPanel />
        <Layers />
      </div>
    </BugHuntProvider>
  );
}

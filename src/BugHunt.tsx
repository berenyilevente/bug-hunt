'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

import type { HuntTarget } from './helpers/types.js';

/**
 * Loaded in the browser only: the overlay restores its session from
 * localStorage and measures the page, neither of which the server render can
 * know — rendering it there would only produce a hydration mismatch.
 */
const OverlayRoot = dynamic(
  () => import('./OverlayRoot.js').then((module) => module.OverlayRoot),
  { ssr: false }
);

type BugHuntProps = { target: HuntTarget; endpoint: string };

export function BugHunt({ target, endpoint }: BugHuntProps): ReactNode {
  return <OverlayRoot target={target} endpoint={endpoint} />;
}

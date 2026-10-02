import type { ReactNode } from 'react';
/**
 * The side panel, on the left so the i18n editor's panel can sit on the right.
 * Always mounted and hidden when closed; non-modal, so the page behind it
 * stays usable while hunting.
 *
 * Hidden by class, not by the `hidden` attribute alone: Tailwind's preflight
 * hides `[hidden]` in its base layer, which any display utility (`flex`) on the
 * same element overrides. The attribute stays for assistive technology.
 */
export declare function HuntPanel(): ReactNode;

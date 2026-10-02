import { describe, expect, it } from 'vitest';

import { boxBetween, distance, toPageRect, toViewportBox } from './geometry.js';

describe('geometry', () => {
  it('round-trips a viewport box through page coordinates at any scroll', () => {
    const rect = toPageRect(
      { left: 10.4, top: 20.6, width: 30, height: 40 },
      { x: 0, y: 500 }
    );

    expect(rect).toEqual({ x: 10, y: 521, width: 30, height: 40 });
    expect(toViewportBox(rect, { x: 0, y: 300 })).toEqual({
      left: 10,
      top: 221,
      width: 30,
      height: 40,
    });
  });

  it('draws the same box whichever way the drag went', () => {
    expect(boxBetween({ x: 50, y: 60 }, { x: 10, y: 20 })).toEqual({
      left: 10,
      top: 20,
      width: 40,
      height: 40,
    });
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
});

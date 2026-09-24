import { describe, expect, it } from 'vitest';
import { DEFAULTS, resolveTiming } from '../transition.js';

describe('resolveTiming', () => {
  it('uses default timings when not provided', () => {
    const timing = resolveTiming({}, false);
    expect(timing.duration).toBe(DEFAULTS.duration);
    expect(timing.revealDuration).toBe(DEFAULTS.revealDuration);
    expect(timing.minimumSkeletonDuration).toBe(DEFAULTS.minimumSkeletonDuration);
  });

  it('respects custom timing overrides', () => {
    const timing = resolveTiming(
      { duration: 500, revealDuration: 200, minimumSkeletonDuration: 180 },
      false,
    );
    expect(timing.duration).toBe(500);
    expect(timing.revealDuration).toBe(200);
    expect(timing.minimumSkeletonDuration).toBe(180);
  });

  it('sets all durations to 0 when reduced motion is requested', () => {
    const timing = resolveTiming(
      { duration: 500, revealDuration: 200, minimumSkeletonDuration: 180 },
      true,
    );
    expect(timing.duration).toBe(0);
    expect(timing.revealDuration).toBe(0);
    expect(timing.minimumSkeletonDuration).toBe(0);
  });
});

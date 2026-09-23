import { describe, expect, it } from 'vitest';
import { createEstimatedSkeletonElement, createSkeletonElement } from '../skeleton.js';
import type { LayoutSnapshot } from '../types.js';

describe('skeleton DOM generation without React', () => {
  it('creates skeleton DOM element with bones and shimmer', () => {
    const snapshot: LayoutSnapshot = {
      width: 300,
      height: 200,
      bones: [
        { type: 'rect', x: 10, y: 10, width: 280, height: 100, borderRadius: 8 },
        { type: 'text', x: 10, y: 120, width: 200, height: 20 },
        { type: 'circle', x: 220, y: 120, width: 30, height: 30 },
      ],
    };

    const skeleton = createSkeletonElement(snapshot);
    expect(skeleton.className).toContain('fluid-loading-skeleton');
    expect(skeleton.getAttribute('aria-hidden')).toBe('true');

    const shimmer = skeleton.querySelector('.fluid-loading-shimmer');
    expect(shimmer).not.toBeNull();

    const bones = skeleton.querySelectorAll('.fluid-loading-bone');
    expect(bones).toHaveLength(3);

    expect(bones[0].className).toContain('fluid-loading-bone-rect');
    expect((bones[0] as HTMLElement).style.left).toBe('10px');
    expect((bones[0] as HTMLElement).style.borderRadius).toBe('8px');

    expect(bones[1].className).toContain('fluid-loading-bone-text');
    expect((bones[1] as HTMLElement).style.width).toBe('200px');

    expect(bones[2].className).toContain('fluid-loading-bone-circle');
    expect((bones[2] as HTMLElement).style.left).toBe('220px');
  });

  it('creates estimated skeleton element correctly', () => {
    const estimated = createEstimatedSkeletonElement(240, 320);
    expect(estimated.className).toContain('fluid-loading-skeleton');
    expect(estimated.className).toContain('fluid-loading-estimated');
    expect(estimated.style.height).toBe('240px');
    expect(estimated.style.width).toBe('320px');
    expect(estimated.querySelector('.fluid-loading-shimmer')).not.toBeNull();
  });
});

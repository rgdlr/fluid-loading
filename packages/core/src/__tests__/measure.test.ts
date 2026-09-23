import { describe, expect, it } from 'vitest';
import { measureElement } from '../measure.js';

function setMockRect(el: HTMLElement, rect: { left: number; top: number; width: number; height: number }) {
  el.getBoundingClientRect = () => ({
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    x: rect.left,
    y: rect.top,
    toJSON: () => {},
  });
}

describe('measureElement', () => {
  it('measures root and ignores empty/zero-size elements', () => {
    const root = document.createElement('div');
    setMockRect(root, { left: 0, top: 0, width: 300, height: 200 });

    const zeroEl = document.createElement('div');
    setMockRect(zeroEl, { left: 10, top: 10, width: 0, height: 0 });
    root.appendChild(zeroEl);

    document.body.appendChild(root);

    const snapshot = measureElement(root);
    expect(snapshot.width).toBe(300);
    expect(snapshot.height).toBe(200);
    expect(snapshot.bones).toHaveLength(0);

    document.body.removeChild(root);
  });

  it('calculates relative coordinates correctly for child bones', () => {
    const root = document.createElement('div');
    setMockRect(root, { left: 100, top: 50, width: 400, height: 300 });

    const title = document.createElement('h1');
    title.textContent = 'Main Title';
    setMockRect(title, { left: 120, top: 70, width: 200, height: 30 });
    root.appendChild(title);

    const img = document.createElement('img');
    setMockRect(img, { left: 120, top: 110, width: 360, height: 180 });
    root.appendChild(img);

    document.body.appendChild(root);

    const snapshot = measureElement(root);
    expect(snapshot.width).toBe(400);
    expect(snapshot.height).toBe(300);
    expect(snapshot.bones).toHaveLength(2);

    expect(snapshot.bones[0]).toEqual({
      type: 'text',
      x: 20,
      y: 20,
      width: 200,
      height: 30,
    });

    expect(snapshot.bones[1]).toEqual({
      type: 'rect',
      x: 20,
      y: 60,
      width: 360,
      height: 180,
    });

    document.body.removeChild(root);
  });

  it('respects data-fluid-loading-ignore', () => {
    const root = document.createElement('div');
    setMockRect(root, { left: 0, top: 0, width: 300, height: 200 });

    const button = document.createElement('button');
    button.textContent = 'Ignored Button';
    button.setAttribute('data-fluid-loading-ignore', '');
    setMockRect(button, { left: 10, top: 10, width: 100, height: 40 });
    root.appendChild(button);

    document.body.appendChild(root);

    const snapshot = measureElement(root);
    expect(snapshot.bones).toHaveLength(0);

    document.body.removeChild(root);
  });

  it('detects explicit data-fluid-loading-type overrides', () => {
    const root = document.createElement('div');
    setMockRect(root, { left: 0, top: 0, width: 300, height: 200 });

    const customEl = document.createElement('div');
    customEl.setAttribute('data-fluid-loading-type', 'circle');
    setMockRect(customEl, { left: 10, top: 10, width: 50, height: 50 });
    root.appendChild(customEl);

    document.body.appendChild(root);

    const snapshot = measureElement(root);
    expect(snapshot.bones).toHaveLength(1);
    expect(snapshot.bones[0].type).toBe('circle');

    document.body.removeChild(root);
  });

  it('detects circle based on aspect ratio and border-radius', () => {
    const root = document.createElement('div');
    setMockRect(root, { left: 0, top: 0, width: 300, height: 200 });

    const avatar = document.createElement('div');
    avatar.style.borderRadius = '50%';
    setMockRect(avatar, { left: 10, top: 10, width: 60, height: 60 });
    root.appendChild(avatar);

    document.body.appendChild(root);

    const snapshot = measureElement(root);
    expect(snapshot.bones).toHaveLength(1);
    expect(snapshot.bones[0].type).toBe('circle');

    document.body.removeChild(root);
  });

  it('skips elements outside the root bounding box', () => {
    const root = document.createElement('div');
    setMockRect(root, { left: 0, top: 0, width: 300, height: 200 });

    const outside = document.createElement('div');
    setMockRect(outside, { left: 400, top: 500, width: 100, height: 50 });
    root.appendChild(outside);

    document.body.appendChild(root);

    const snapshot = measureElement(root);
    expect(snapshot.bones).toHaveLength(0);

    document.body.removeChild(root);
  });
});

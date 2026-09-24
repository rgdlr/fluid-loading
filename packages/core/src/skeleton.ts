import type { LayoutSnapshot } from './types.js';

export function createSkeletonElement(
  snapshot: LayoutSnapshot,
  options: { className?: string; includeShimmer?: boolean } = {},
): HTMLElement {
  const container = document.createElement('div');
  container.className = `fluid-loading-skeleton ${options.className ?? ''}`.trim();
  container.setAttribute('aria-hidden', 'true');
  container.style.position = 'absolute';
  container.style.inset = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.pointerEvents = 'none';

  if (options.includeShimmer !== false) {
    const shimmer = document.createElement('div');
    shimmer.className = 'fluid-loading-shimmer';
    container.appendChild(shimmer);
  }

  for (const bone of snapshot.bones) {
    const boneEl = document.createElement('div');
    boneEl.className = `fluid-loading-bone fluid-loading-bone-${bone.type}`;
    boneEl.style.position = 'absolute';
    boneEl.style.left = `${bone.x}px`;
    boneEl.style.top = `${bone.y}px`;
    boneEl.style.width = `${bone.width}px`;
    boneEl.style.height = `${bone.height}px`;

    if (bone.borderRadius !== undefined) {
      boneEl.style.borderRadius = `${bone.borderRadius}px`;
    }

    container.appendChild(boneEl);
  }

  return container;
}

export function createEstimatedSkeletonElement(
  height: number,
  width: number | string = '100%',
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'fluid-loading-skeleton fluid-loading-estimated';
  container.setAttribute('aria-hidden', 'true');
  container.style.position = 'relative';
  container.style.width = typeof width === 'number' ? `${width}px` : width;
  container.style.height = `${height}px`;
  container.style.overflow = 'hidden';

  const shimmer = document.createElement('div');
  shimmer.className = 'fluid-loading-shimmer';
  container.appendChild(shimmer);

  return container;
}

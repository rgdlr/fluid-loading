import { createSnapshot } from './snapshot.js';
import type { Bone, BoneType, LayoutSnapshot, MeasureOptions } from './types.js';

const TEXT_TAGS = new Set([
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'P', 'SPAN', 'LABEL', 'SMALL', 'STRONG',
  'EM', 'B', 'I', 'A', 'TIME'
]);

const LEAF_MEDIA_TAGS = new Set([
  'IMG', 'SVG', 'CANVAS', 'VIDEO', 'BUTTON', 'INPUT', 'TEXTAREA'
]);

function parseBorderRadius(radiusStr: string, minDim: number): number {
  if (!radiusStr) return 0;
  const first = radiusStr.split(' ')[0].trim();
  if (first.endsWith('%')) {
    const pct = parseFloat(first);
    return (pct / 100) * minDim;
  }
  const px = parseFloat(first);
  return Number.isNaN(px) ? 0 : px;
}

function detectBoneType(
  element: HTMLElement,
  width: number,
  height: number,
  radius: number,
  typeAttr: string
): BoneType {
  const explicit = element.getAttribute(typeAttr)?.toLowerCase();
  if (explicit === 'circle' || explicit === 'text' || explicit === 'rect') {
    return explicit;
  }

  const minDim = Math.min(width, height);
  const maxDim = Math.max(width, height);
  const isRoughlySquare = maxDim > 0 && Math.abs(width - height) / maxDim < 0.2;
  const isCircle = isRoughlySquare && radius >= minDim * 0.35;

  if (isCircle) {
    return 'circle';
  }

  const tagName = element.tagName.toUpperCase();
  if (TEXT_TAGS.has(tagName)) {
    return 'text';
  }

  return 'rect';
}

function isElementVisible(
  element: HTMLElement,
  computed: CSSStyleDeclaration,
  rootComputed: CSSStyleDeclaration
): boolean {
  if (computed.display === 'none') {
    return false;
  }
  if (element.style.visibility === 'hidden') {
    return false;
  }
  if (computed.visibility === 'hidden' && rootComputed.visibility !== 'hidden') {
    return false;
  }
  if (element.style.opacity === '0') {
    return false;
  }
  return true;
}

function hasRenderableText(element: HTMLElement): boolean {
  for (let i = 0; i < element.childNodes.length; i++) {
    const node = element.childNodes[i];
    if (node.nodeType === Node.TEXT_NODE && (node.textContent || '').trim().length > 0) {
      return true;
    }
  }
  return false;
}

export function measureElement(root: HTMLElement, options: MeasureOptions = {}): LayoutSnapshot {
  const ignoreAttr = options.ignoreAttribute ?? 'data-fluid-ignore';
  const typeAttr = options.typeAttribute ?? 'data-fluid-type';
  const minDim = options.minDimension ?? 1;

  const rootRect = root.getBoundingClientRect();
  if (rootRect.width <= 0 && rootRect.height <= 0) {
    return createSnapshot(0, 0, []);
  }

  const rootComputed = window.getComputedStyle(root);
  const bones: Bone[] = [];
  const elements = Array.from(root.querySelectorAll<HTMLElement>('*'));

  const candidateElements: Array<{
    el: HTMLElement;
    rect: DOMRect;
    computed: CSSStyleDeclaration;
  }> = [];

  for (const el of elements) {
    if (el.hasAttribute(ignoreAttr)) {
      continue;
    }

    const rect = el.getBoundingClientRect();
    if (rect.width < minDim || rect.height < minDim) {
      continue;
    }

    if (
      rect.right < rootRect.left ||
      rect.left > rootRect.right ||
      rect.bottom < rootRect.top ||
      rect.top > rootRect.bottom
    ) {
      continue;
    }

    const computed = window.getComputedStyle(el);
    if (!isElementVisible(el, computed, rootComputed)) {
      continue;
    }

    candidateElements.push({ el, rect, computed });
  }

  for (const { el, rect, computed } of candidateElements) {
    const explicit = el.getAttribute(typeAttr);
    const tagName = el.tagName.toUpperCase();
    const isLeafMedia = LEAF_MEDIA_TAGS.has(tagName);
    const isTextTag = TEXT_TAGS.has(tagName);
    const hasText = hasRenderableText(el);

    const hasCandidateChildren = candidateElements.some(
      (other) => other.el !== el && el.contains(other.el)
    );

    const shouldRenderBone =
      Boolean(explicit) ||
      isLeafMedia ||
      (isTextTag && !hasCandidateChildren) ||
      (!hasCandidateChildren && hasText) ||
      (!hasCandidateChildren && (computed.backgroundColor !== 'rgba(0, 0, 0, 0)' || computed.backgroundImage !== 'none'));

    if (!shouldRenderBone) {
      continue;
    }

    const w = rect.width;
    const h = rect.height;
    const rawRadius = computed.borderRadius || computed.borderTopLeftRadius || el.style.borderRadius;
    const radius = parseBorderRadius(rawRadius, Math.min(w, h));
    const type = detectBoneType(el, w, h, radius, typeAttr);

    const x = rect.left - rootRect.left;
    const y = rect.top - rootRect.top;

    bones.push({
      type,
      x,
      y,
      width: w,
      height: h,
      ...(radius > 0 ? { borderRadius: radius } : {}),
    });
  }

  return createSnapshot(rootRect.width, rootRect.height, bones);
}

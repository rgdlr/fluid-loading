import type { Bone, LayoutSnapshot } from './types.js';

export function createSnapshot(width: number, height: number, bones: Bone[] = []): LayoutSnapshot {
  return {
    width: Math.max(0, Math.round(width)),
    height: Math.max(0, Math.round(height)),
    bones: bones.map((bone) => ({
      ...bone,
      x: Math.round(bone.x),
      y: Math.round(bone.y),
      width: Math.max(0, Math.round(bone.width)),
      height: Math.max(0, Math.round(bone.height)),
      ...(bone.borderRadius !== undefined ? { borderRadius: Math.round(bone.borderRadius) } : {}),
    })),
  };
}

export function serializeSnapshot(snapshot: LayoutSnapshot): string {
  return JSON.stringify(snapshot);
}

export function deserializeSnapshot(json: string): LayoutSnapshot {
  const parsed = JSON.parse(json) as LayoutSnapshot;
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof parsed.width !== 'number' ||
    typeof parsed.height !== 'number' ||
    !Array.isArray(parsed.bones)
  ) {
    throw new Error('Invalid LayoutSnapshot JSON format');
  }

  return createSnapshot(parsed.width, parsed.height, parsed.bones);
}

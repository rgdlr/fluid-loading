export type BoneType = 'rect' | 'text' | 'circle';

export interface Bone {
  type: BoneType;
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius?: number;
}

export interface LayoutSnapshot {
  width: number;
  height: number;
  bones: Bone[];
}

export type FluidLoadingState = 'loading' | 'transitioning' | 'ready' | 'error';

export type InternalState =
  | 'loading'
  | 'measuring'
  | 'morphing'
  | 'precise-skeleton'
  | 'revealing'
  | 'ready'
  | 'error';

export interface MeasureOptions {
  ignoreAttribute?: string;
  typeAttribute?: string;
  minDimension?: number;
}

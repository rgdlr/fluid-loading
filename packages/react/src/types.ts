import type { CSSProperties, ReactNode } from 'react';
import type { FluidLoadingState, InternalState, LayoutSnapshot } from '@fluid-loading/core';

export interface FluidLoadingProps {
  loading: boolean;
  error?: unknown;
  estimatedHeight?: number;
  estimatedWidth?: number | string;
  duration?: number;
  revealDuration?: number;
  minimumSkeletonDuration?: number;
  boneBg?: string;
  surfaceBg?: string;
  shimmerColor?: string;
  shimmerDuration?: number | string;
  radius?: number | string;
  textRadius?: number | string;
  rectRadius?: number | string;
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode | ((props: { error: unknown }) => ReactNode);
  className?: string;
  style?: CSSProperties;
  onStateChange?: (state: FluidLoadingState) => void;
  onInternalStateChange?: (state: InternalState) => void;
  onSnapshot?: (snapshot: LayoutSnapshot) => void;
}

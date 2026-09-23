import type { CSSProperties, ReactNode } from 'react';
import type { FluidState, InternalState, LayoutSnapshot } from '@fluid-loading/core';

export interface FluidProps {
  loading: boolean;
  error?: unknown;
  estimatedHeight?: number;
  estimatedWidth?: number | string;
  duration?: number;
  revealDuration?: number;
  minimumSkeletonDuration?: number;
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode | ((props: { error: unknown }) => ReactNode);
  className?: string;
  style?: CSSProperties;
  onStateChange?: (state: FluidState) => void;
  onInternalStateChange?: (state: InternalState) => void;
  onSnapshot?: (snapshot: LayoutSnapshot) => void;
}

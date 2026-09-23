export const DEFAULTS = {
  duration: 300,
  revealDuration: 150,
  minimumSkeletonDuration: 120,
  estimatedHeight: 240,
  estimatedWidth: '100%',
} as const;

export function isReducedMotionPreferred(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export interface TransitionTimingOptions {
  duration?: number;
  revealDuration?: number;
  minimumSkeletonDuration?: number;
}

export interface ResolvedTiming {
  duration: number;
  revealDuration: number;
  minimumSkeletonDuration: number;
}

export function resolveTiming(
  options: TransitionTimingOptions,
  reducedMotion: boolean = isReducedMotionPreferred()
): ResolvedTiming {
  if (reducedMotion) {
    return {
      duration: 0,
      revealDuration: 0,
      minimumSkeletonDuration: 0,
    };
  }

  return {
    duration: options.duration ?? DEFAULTS.duration,
    revealDuration: options.revealDuration ?? DEFAULTS.revealDuration,
    minimumSkeletonDuration: options.minimumSkeletonDuration ?? DEFAULTS.minimumSkeletonDuration,
  };
}

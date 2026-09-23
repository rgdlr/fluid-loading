import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  DEFAULTS,
  FluidLoadingStateMachine,
  isReducedMotionPreferred,
  measureElement,
  resolveTiming,
  type InternalState,
  type LayoutSnapshot,
} from '@fluid-loading/core';
import type { FluidLoadingProps } from './types.js';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function FluidLoading({
  loading,
  error,
  estimatedHeight = DEFAULTS.estimatedHeight,
  estimatedWidth = DEFAULTS.estimatedWidth,
  duration,
  revealDuration,
  minimumSkeletonDuration,
  children,
  fallback,
  errorFallback,
  className = '',
  style,
  onStateChange,
  onInternalStateChange,
  onSnapshot,
}: FluidLoadingProps): React.JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const stateMachineRef = useRef<FluidLoadingStateMachine>(
    new FluidLoadingStateMachine(loading ? 'loading' : error ? 'error' : 'ready')
  );

  const [internalState, setInternalState] = useState<InternalState>(() =>
    loading ? 'loading' : error ? 'error' : 'ready'
  );
  const [snapshot, setSnapshot] = useState<LayoutSnapshot | null>(null);
  const [containerHeight, setContainerHeight] = useState<number | string>(
    estimatedHeight
  );
  const [containerWidth, setContainerWidth] = useState<number | string>(
    estimatedWidth
  );
  const [isMorphing, setIsMorphing] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  const timeoutIdsRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    for (const id of timeoutIdsRef.current) {
      window.clearTimeout(id);
    }
    timeoutIdsRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  useEffect(() => {
    const sm = stateMachineRef.current;
    onStateChange?.(sm.publicState);
    onInternalStateChange?.(sm.state);
    const unsubscribe = sm.subscribe((currInternal, currPublic) => {
      setInternalState(currInternal);
      onStateChange?.(currPublic);
      onInternalStateChange?.(currInternal);
    });
    return unsubscribe;
  }, [onStateChange, onInternalStateChange]);

  const reducedMotion =
    typeof window !== 'undefined' && isReducedMotionPreferred();
  const timing = resolveTiming(
    { duration, revealDuration, minimumSkeletonDuration },
    reducedMotion
  );

  useEffect(() => {
    const sm = stateMachineRef.current;

    if (loading) {
      clearTimers();
      setIsMorphing(false);
      setIsRevealing(false);
      setSnapshot(null);
      setContainerHeight(estimatedHeight);
      setContainerWidth(estimatedWidth);
      sm.reset();
      return;
    }

    if (error !== undefined && error !== null) {
      clearTimers();
      setIsMorphing(false);
      setIsRevealing(false);
      sm.setError(error);
      return;
    }

    if (internalState === 'loading' || internalState === 'error') {
      sm.transition('measuring');
    }
  }, [loading, error, estimatedHeight, estimatedWidth, internalState, clearTimers]);

  useIsomorphicLayoutEffect(() => {
    if (internalState !== 'measuring' || loading) {
      return;
    }

    const contentEl = contentRef.current;
    if (!contentEl) {
      return;
    }

    let rafId: number;

    rafId = requestAnimationFrame(() => {
      const snap = measureElement(contentEl);
      setSnapshot(snap);
      onSnapshot?.(snap);

      const targetHeight = snap.height > 0 ? snap.height : estimatedHeight;
      const targetWidth = snap.width > 0 ? snap.width : estimatedWidth;

      const sm = stateMachineRef.current;

      if (reducedMotion) {
        sm.transition('ready');
        setIsMorphing(false);
        setIsRevealing(false);
        return;
      }

      if (rootRef.current) {
        void rootRef.current.offsetHeight;
      }

      sm.transition('morphing');
      setIsMorphing(true);
      setContainerHeight(targetHeight);
      setContainerWidth(typeof targetWidth === 'number' ? targetWidth : targetWidth);

      const morphTimer = window.setTimeout(() => {
        sm.transition('precise-skeleton');
        setIsMorphing(false);

        const holdTimer = window.setTimeout(() => {
          sm.transition('revealing');
          setIsRevealing(true);

          const revealTimer = window.setTimeout(() => {
            sm.transition('ready');
            setIsRevealing(false);
          }, timing.revealDuration);

          timeoutIdsRef.current.push(revealTimer);
        }, timing.minimumSkeletonDuration);

        timeoutIdsRef.current.push(holdTimer);
      }, timing.duration);

      timeoutIdsRef.current.push(morphTimer);
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [
    internalState,
    loading,
    estimatedHeight,
    estimatedWidth,
    timing.duration,
    timing.revealDuration,
    timing.minimumSkeletonDuration,
    reducedMotion,
    onSnapshot,
  ]);

  const effectiveState: InternalState = loading
    ? 'loading'
    : error !== undefined && error !== null
    ? 'error'
    : internalState;

  const isReady = effectiveState === 'ready';
  const isError = effectiveState === 'error';
  const isSkeletonFading = effectiveState === 'revealing';
  const hasBones = !loading && Boolean(snapshot && snapshot.bones.length > 0);

  const currentHeight = loading
    ? estimatedHeight
    : isReady
    ? (style?.height ?? 'auto')
    : containerHeight;

  const currentWidth = loading
    ? estimatedWidth
    : isReady
    ? (style?.width ?? 'auto')
    : containerWidth;

  const rootStyle: React.CSSProperties = {
    ...style,
    height: currentHeight,
    width: currentWidth,
    overflow: isReady ? (style?.overflow ?? 'visible') : 'hidden',
    transition: isReady ? 'none' : undefined,
    ['--fluid-loading-duration' as string]: `${timing.duration}ms`,
    ['--fluid-loading-reveal-duration' as string]: `${timing.revealDuration}ms`,
  };

  const rootClass = [
    'fluid-loading-root',
    isMorphing ? 'fluid-loading-morphing' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={rootRef}
      className={rootClass}
      style={rootStyle}
      aria-busy={loading || (!isReady && !isError)}
    >
      {isError ? (
        errorFallback ? (
          typeof errorFallback === 'function' ? (
            errorFallback({ error })
          ) : (
            errorFallback
          )
        ) : (
          <div className="fluid-loading-error-container">
            <p>Failed to load content</p>
          </div>
        )
      ) : null}

      {!isReady && !isError && (
        <div
          className="fluid-loading-skeleton"
          style={{
            opacity: isSkeletonFading ? 0 : 1,
          }}
          aria-hidden="true"
        >
          <div
            className="fluid-loading-skeleton fluid-loading-estimated"
            style={{
              position: 'absolute',
              inset: 0,
              opacity: hasBones ? 0 : 1,
              transition: `opacity ${Math.min(250, timing.duration)}ms ease-out`,
              pointerEvents: 'none',
            }}
          >
            {!reducedMotion && <div className="fluid-loading-shimmer" />}
          </div>

          {hasBones && (
            <div
              className="fluid-loading-bones-layer"
              style={{
                position: 'absolute',
                inset: 0,
              }}
            >
              {snapshot!.bones.map((bone, index) => (
                <div
                  key={index}
                  className={`fluid-loading-bone fluid-loading-bone-${bone.type}`}
                  style={{
                    left: `${bone.x}px`,
                    top: `${bone.y}px`,
                    width: `${bone.width}px`,
                    height: `${bone.height}px`,
                    borderRadius:
                      bone.borderRadius !== undefined
                        ? `${bone.borderRadius}px`
                        : undefined,
                  }}
                />
              ))}
              {!reducedMotion && <div className="fluid-loading-shimmer" />}
            </div>
          )}

          {fallback && !hasBones && fallback}
        </div>
      )}

      {!isError && (
        <div
          ref={contentRef}
          className={[
            'fluid-loading-content',
            effectiveState === 'measuring' ? 'fluid-loading-measuring' : '',
            effectiveState === 'morphing' || effectiveState === 'precise-skeleton'
              ? 'fluid-loading-hidden'
              : '',
            isRevealing || isReady ? 'fluid-loading-visible' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{
            opacity: isReady || isRevealing ? 1 : 0,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

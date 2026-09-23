import { describe, expect, it, vi } from 'vitest';
import { FluidLoadingStateMachine, toPublicState } from '../state.js';

describe('toPublicState', () => {
  it('maps internal states to public states correctly', () => {
    expect(toPublicState('loading')).toBe('loading');
    expect(toPublicState('measuring')).toBe('transitioning');
    expect(toPublicState('morphing')).toBe('transitioning');
    expect(toPublicState('precise-skeleton')).toBe('transitioning');
    expect(toPublicState('revealing')).toBe('transitioning');
    expect(toPublicState('ready')).toBe('ready');
    expect(toPublicState('error')).toBe('error');
  });
});

describe('FluidLoadingStateMachine', () => {
  it('initializes with default loading state', () => {
    const sm = new FluidLoadingStateMachine();
    expect(sm.state).toBe('loading');
    expect(sm.publicState).toBe('loading');
    expect(sm.error).toBeNull();
  });

  it('handles standard transition flow', () => {
    const sm = new FluidLoadingStateMachine();
    const transitions: string[] = [];
    sm.subscribe((internal, pub) => {
      transitions.push(`${internal}:${pub}`);
    });

    expect(sm.transition('measuring')).toBe(true);
    expect(sm.state).toBe('measuring');
    expect(sm.publicState).toBe('transitioning');

    expect(sm.transition('morphing')).toBe(true);
    expect(sm.state).toBe('morphing');

    expect(sm.transition('precise-skeleton')).toBe(true);
    expect(sm.state).toBe('precise-skeleton');

    expect(sm.transition('revealing')).toBe(true);
    expect(sm.state).toBe('revealing');

    expect(sm.transition('ready')).toBe(true);
    expect(sm.state).toBe('ready');
    expect(sm.publicState).toBe('ready');

    expect(transitions).toEqual([
      'measuring:transitioning',
      'morphing:transitioning',
      'precise-skeleton:transitioning',
      'revealing:transitioning',
      'ready:ready',
    ]);
  });

  it('transitions to error from loading without layout collapse', () => {
    const sm = new FluidLoadingStateMachine();
    const testError = new Error('Network failure');
    expect(sm.setError(testError)).toBe(true);
    expect(sm.state).toBe('error');
    expect(sm.publicState).toBe('error');
    expect(sm.error).toBe(testError);
  });

  it('rejects invalid state transitions', () => {
    const sm = new FluidLoadingStateMachine();
    expect(sm.transition('ready')).toBe(false);
    expect(sm.state).toBe('loading');
  });

  it('allows reset back to loading', () => {
    const sm = new FluidLoadingStateMachine('ready');
    sm.reset();
    expect(sm.state).toBe('loading');
    expect(sm.publicState).toBe('loading');
  });
});

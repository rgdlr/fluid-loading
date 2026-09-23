import type { FluidState, InternalState } from './types.js';

export function toPublicState(internal: InternalState): FluidState {
  switch (internal) {
    case 'loading':
      return 'loading';
    case 'measuring':
    case 'morphing':
    case 'precise-skeleton':
    case 'revealing':
      return 'transitioning';
    case 'ready':
      return 'ready';
    case 'error':
      return 'error';
  }
}

const ALLOWED_TRANSITIONS: Record<InternalState, ReadonlySet<InternalState>> = {
  loading: new Set(['measuring', 'error']),
  measuring: new Set(['morphing', 'ready', 'loading', 'error']),
  morphing: new Set(['precise-skeleton', 'ready', 'loading', 'error']),
  'precise-skeleton': new Set(['revealing', 'ready', 'loading', 'error']),
  revealing: new Set(['ready', 'loading', 'error']),
  ready: new Set(['loading', 'measuring', 'error']),
  error: new Set(['loading', 'measuring']),
};

export class FluidStateMachine {
  private currentState: InternalState;
  private currentError: unknown = null;
  private readonly listeners = new Set<(internal: InternalState, publicState: FluidState) => void>();

  constructor(initialState: InternalState = 'loading') {
    this.currentState = initialState;
  }

  get state(): InternalState {
    return this.currentState;
  }

  get publicState(): FluidState {
    return toPublicState(this.currentState);
  }

  get error(): unknown {
    return this.currentError;
  }

  transition(next: InternalState, error: unknown = null): boolean {
    if (this.currentState === next) {
      return false;
    }

    const allowed = ALLOWED_TRANSITIONS[this.currentState];
    if (!allowed || !allowed.has(next)) {
      return false;
    }

    this.currentState = next;
    this.currentError = next === 'error' ? error : null;
    this.notify();
    return true;
  }

  setError(error: unknown): boolean {
    return this.transition('error', error);
  }

  reset(): void {
    this.currentState = 'loading';
    this.currentError = null;
    this.notify();
  }

  subscribe(listener: (internal: InternalState, publicState: FluidState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const pub = this.publicState;
    for (const listener of this.listeners) {
      listener(this.currentState, pub);
    }
  }
}

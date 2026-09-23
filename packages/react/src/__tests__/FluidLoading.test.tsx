import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { FluidLoading } from '../FluidLoading.js';

describe('<FluidLoading /> integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('transitions smoothly through estimated, precise skeleton, and ready states', async () => {
    const states: string[] = [];

    const Card = () => (
      <article data-testid="card">
        <img src="avatar.jpg" alt="avatar" />
        <h2>Card Title</h2>
        <p>Card description text</p>
        <button type="button">Action</button>
      </article>
    );

    const { rerender } = render(
      <FluidLoading
        loading={true}
        estimatedHeight={300}
        duration={100}
        revealDuration={50}
        minimumSkeletonDuration={50}
        onStateChange={(state) => states.push(state)}
      >
        <Card />
      </FluidLoading>
    );

    const root = document.querySelector('.fluid-loading-root') as HTMLElement;
    expect(root).toBeInTheDocument();
    expect(root.getAttribute('aria-busy')).toBe('true');
    expect(document.querySelector('.fluid-loading-estimated')).toBeInTheDocument();

    rerender(
      <FluidLoading
        loading={false}
        estimatedHeight={300}
        duration={100}
        revealDuration={50}
        minimumSkeletonDuration={50}
        onStateChange={(state) => states.push(state)}
      >
        <Card />
      </FluidLoading>
    );

    act(() => {
      vi.advanceTimersByTime(16);
    });

    expect(states).toContain('transitioning');

    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(states).toContain('ready');
    expect(root.getAttribute('aria-busy')).toBe('false');
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });

  it('supports variable content heights', () => {
    const { rerender } = render(
      <FluidLoading loading={true} estimatedHeight={120}>
        <div style={{ height: 100 }}>Short content</div>
      </FluidLoading>
    );

    const root = document.querySelector('.fluid-loading-root') as HTMLElement;
    expect(root.style.height).toBe('120px');

    rerender(
      <FluidLoading loading={true} estimatedHeight={450}>
        <div style={{ height: 400 }}>Long content</div>
      </FluidLoading>
    );

    expect(root.style.height).toBe('450px');
  });

  it('maintains estimated surface without layout collapse on error', () => {
    const states: string[] = [];

    render(
      <FluidLoading
        loading={false}
        error={new Error('Data fetch failed')}
        estimatedHeight={280}
        onStateChange={(state) => states.push(state)}
      >
        <div>Should not be visible</div>
      </FluidLoading>
    );

    const root = document.querySelector('.fluid-loading-root') as HTMLElement;
    expect(root.style.height).toBe('280px');
    expect(states).toContain('error');
    expect(screen.getByText('Failed to load content')).toBeInTheDocument();
  });

  it('prevents visual flash using minimum skeleton duration', () => {
    const states: string[] = [];

    const { rerender } = render(
      <FluidLoading
        loading={true}
        duration={50}
        revealDuration={30}
        minimumSkeletonDuration={120}
        onStateChange={(state) => states.push(state)}
      >
        <div>Fast Content</div>
      </FluidLoading>
    );

    rerender(
      <FluidLoading
        loading={false}
        duration={50}
        revealDuration={30}
        minimumSkeletonDuration={120}
        onStateChange={(state) => states.push(state)}
      >
        <div>Fast Content</div>
      </FluidLoading>
    );

    act(() => {
      vi.advanceTimersByTime(16);
    });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(states).not.toContain('ready');

    act(() => {
      vi.advanceTimersByTime(120);
    });

    act(() => {
      vi.advanceTimersByTime(30);
    });

    expect(states).toContain('ready');
  });

  it('maintains estimated skeleton while in loading state', () => {
    render(
      <FluidLoading loading={true} estimatedHeight={320}>
        <div>Will load eventually</div>
      </FluidLoading>
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const root = document.querySelector('.fluid-loading-root') as HTMLElement;
    expect(root.getAttribute('aria-busy')).toBe('true');
    expect(document.querySelector('.fluid-loading-estimated')).toBeInTheDocument();
  });

  it('bypasses animation delays when reduced motion is preferred', () => {
    const states: string[] = [];
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { rerender } = render(
      <FluidLoading
        loading={true}
        duration={300}
        revealDuration={150}
        minimumSkeletonDuration={120}
        onStateChange={(state) => states.push(state)}
      >
        <div>Accessible Content</div>
      </FluidLoading>
    );

    rerender(
      <FluidLoading
        loading={false}
        duration={300}
        revealDuration={150}
        minimumSkeletonDuration={120}
        onStateChange={(state) => states.push(state)}
      >
        <div>Accessible Content</div>
      </FluidLoading>
    );

    act(() => {
      vi.advanceTimersByTime(16);
    });

    expect(states).toContain('ready');
  });
});

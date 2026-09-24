# Fluid Loading

A layout-aware loading transition and morphing skeleton engine for React and the DOM.

![Fluid Loading Banner](./apps/landing/public/banner.jpg)

Instead of abrupt flashes between generic placeholder boxes and final content, Fluid Loading measures the real DOM geometry in-flight, smoothly interpolates container dimensions, overlays an accurate structural skeleton, and seamlessly reveals the layout with **0.00 Cumulative Layout Shift (CLS)**.

```text
estimated loading surface
          ↓
measurement of real DOM layout
          ↓
smooth geometry morph (CSS transition)
          ↓
precise structural skeleton
          ↓
seamless content reveal
```

## Features

- **Zero Layout Shift (0.00 CLS)**: Eliminates visual jarring by smoothly morphing container dimensions directly to the incoming layout.
- **In-flight DOM Scanner**: Measures real layout geometry off-screen in `< 1ms` without rendering artifacts.
- **Dual-Mode Configuration**: Configure everything via typed React props or standard CSS Custom Properties (`--fluid-loading-*`).
- **Zero-Config Styles**: Component styles are bundled directly into `@fluid-loading/react` with zero required CSS imports.
- **Flash Prevention**: Built-in `minimumSkeletonDuration` prevents sub-frame flashes on high-speed responses.
- **100% Accessible**: Built-in `aria-busy`, `aria-hidden` on skeletons, and full `@media (prefers-reduced-motion: reduce)` support.

## Packages

This monorepo contains:

- [`@fluid-loading/core`](./packages/core): Framework-agnostic DOM geometry scanner, state machine, and skeleton generator.
- [`@fluid-loading/react`](./packages/react): React component adapter with integrated state transitions and bundled styles.
- [`@fluid-loading/landing`](./apps/landing): Interactive Studio Workbench and documentation with static site generation (SSG).

## Installation

```bash
pnpm install @fluid-loading/react
```

## Quick Start

Import `FluidLoading` and wrap your dynamic content. Styles are bundled and injected automatically:

```tsx
import React from 'react';
import { FluidLoading } from '@fluid-loading/react';

export function UserCard({ user, loading, error }) {
  return (
    <FluidLoading
      loading={loading}
      error={error}
      estimatedHeight={320}
    >
      <article className="user-card">
        <img
          src={user?.avatar}
          alt={user?.name}
          data-fluid-loading-type="circle"
        />
        <h2>{user?.name}</h2>
        <p>{user?.bio}</p>
        <button type="button" data-fluid-loading-ignore>Contact</button>
      </article>
    </FluidLoading>
  );
}
```

## Configuration & DX

Fluid Loading provides full symmetry between **React Component Props** and **CSS Custom Properties**. You can configure timing and visual tokens entirely through JSX props, entirely through CSS variables in your stylesheet or `:root`, or mix both (props override CSS variables per-instance).

### Option A: Component Props

```tsx
<FluidLoading
  loading={loading}
  error={error}
  estimatedHeight={360}
  duration={350}
  revealDuration={200}
  minimumSkeletonDuration={250}
  boneBg="#353d4f"
  surfaceBg="#1c202b"
  shimmerColor="rgba(251, 191, 36, 0.25)"
  shimmerDuration="1.5s"
  radius={14}
  textRadius={5}
  rectRadius={8}
  errorFallback={({ error }) => (
    <div className="error-banner">
      <p>Failed to load data. The container surface remained stable.</p>
    </div>
  )}
>
  <DashboardCard metrics={metrics} />
</FluidLoading>
```

### Option B: CSS Custom Properties

Define variables globally in `:root`, inside a scoped class, or via `style`:

```css
:root {
  --fluid-loading-duration: 350ms;
  --fluid-loading-reveal-duration: 200ms;
  --fluid-loading-minimum-skeleton-duration: 250ms;
  --fluid-loading-shimmer-duration: 1.5s;
  --fluid-loading-radius: 14px;
  --fluid-loading-text-radius: 5px;
  --fluid-loading-rect-radius: 8px;
  --fluid-loading-surface-bg: #1c202b;
  --fluid-loading-bone-bg: #353d4f;
  --fluid-loading-shimmer-color: rgba(251, 191, 36, 0.25);
}
```

When timing props (`duration`, `revealDuration`, `minimumSkeletonDuration`) are omitted from JSX, `FluidLoading` automatically resolves them from the active CSS variables.

## Props Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `loading` | `boolean` | **Required** | Controls loading and transition cycle. |
| `error` | `unknown` | `undefined` | Error state. Preserves container dimensions to prevent collapse. |
| `estimatedHeight` | `number` | `240` | Initial estimated height in pixels during loading. |
| `estimatedWidth` | `number \| string` | `'100%'` | Initial estimated container width. |
| `duration` | `number` | `300` | Container morph duration in ms (maps to `--fluid-loading-duration`). |
| `revealDuration` | `number` | `150` | Content reveal duration in ms (maps to `--fluid-loading-reveal-duration`). |
| `minimumSkeletonDuration` | `number` | `120` | Minimum duration precise skeleton is shown to prevent flashes (maps to `--fluid-loading-minimum-skeleton-duration`). |
| `boneBg` | `string` | `undefined` | Background color for skeleton bones (maps to `--fluid-loading-bone-bg`). |
| `surfaceBg` | `string` | `undefined` | Container background color during skeleton phase (maps to `--fluid-loading-surface-bg`). |
| `shimmerColor` | `string` | `undefined` | Highlight wave gradient color (maps to `--fluid-loading-shimmer-color`). |
| `shimmerDuration` | `number \| string` | `undefined` | Shimmer wave animation cycle speed (maps to `--fluid-loading-shimmer-duration`). |
| `radius` | `number \| string` | `undefined` | Border radius of container surface (maps to `--fluid-loading-radius`). |
| `textRadius` | `number \| string` | `undefined` | Border radius for text bones (maps to `--fluid-loading-text-radius`). |
| `rectRadius` | `number \| string` | `undefined` | Border radius for rectangular bones (maps to `--fluid-loading-rect-radius`). |
| `fallback` | `ReactNode` | `undefined` | Custom placeholder shown during initial estimated loading. |
| `errorFallback` | `ReactNode \| Function` | Default UI | Custom component or render function for error states. |
| `className` | `string` | `''` | Class name applied to root container. |
| `style` | `CSSProperties` | `undefined` | Inline styles applied to root container. |
| `onStateChange` | `(state: FluidLoadingState) => void` | `undefined` | Callback emitted on public state changes (`loading`, `transitioning`, `ready`, `error`). |
| `onInternalStateChange` | `(state: InternalState) => void` | `undefined` | Emits internal state changes (`loading`, `measuring`, `morphing`, `precise-skeleton`, `revealing`, `ready`, `error`). |
| `onSnapshot` | `(snapshot: LayoutSnapshot) => void` | `undefined` | Emits measured geometry bones and dimensions. |

## CSS Custom Properties Reference

| Variable | Default (Dark) | Default (Light) | Description |
| :--- | :--- | :--- | :--- |
| `--fluid-loading-duration` | `300ms` | `300ms` | Morph animation duration |
| `--fluid-loading-reveal-duration` | `150ms` | `150ms` | Fade transition duration between skeleton and content |
| `--fluid-loading-minimum-skeleton-duration` | `120ms` | `120ms` | Minimum skeleton hold time to prevent flash |
| `--fluid-loading-bone-bg` | `#353d4f` | `#cbd5e1` | Background color for skeleton bones |
| `--fluid-loading-surface-bg` | `#1c202b` | `#ffffff` | Background color for skeleton overlay |
| `--fluid-loading-shimmer-color` | `rgba(251, 191, 36, 0.16)` | `rgba(251, 191, 36, 0.25)` | Wave highlight color |
| `--fluid-loading-shimmer-duration` | `1.5s` | `1.5s` | Wave animation cycle duration |
| `--fluid-loading-radius` | `12px` | `12px` | Border radius of container & error state |
| `--fluid-loading-text-radius` | `5px` | `5px` | Border radius for text bones |
| `--fluid-loading-rect-radius` | `8px` | `8px` | Border radius for rectangle bones |

## HTML Control Attributes

Use HTML attributes on target child nodes to fine-tune automatic skeleton detection:

- `data-fluid-loading-ignore`: Excludes the element from skeleton calculation.
- `data-fluid-loading-type="text | rect | circle"`: Explicitly forces bone rendering geometry.

```html
<div class="user-avatar" data-fluid-loading-type="circle"></div>
<button data-fluid-loading-ignore>Dismiss</button>
```

## Accessibility & Reduced Motion

- Sets `aria-busy="true"` during loading and transition states.
- Structural skeletons are rendered with `aria-hidden="true"`.
- Automatically respects `@media (prefers-reduced-motion: reduce)` by disabling transitions and immediately displaying content with zero animation delays.

## Development

```bash
# Install dependencies
pnpm install

# Start landing page & interactive studio workbench
pnpm dev

# Run test suite
pnpm test

# Typecheck monorepo
pnpm run typecheck

# Build all packages and static site prerender
pnpm run build
```

## License

MIT © [rgdlr](https://github.com/rgdlr)

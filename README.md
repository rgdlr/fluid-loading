# Fluid Loading

A layout-aware loading transition engine for React and the DOM.

![fluid loading banner](./playground/public/banner.jpg)

Instead of abrupt jumps between generic placeholders and final content, Fluid Loading measures the real DOM in-flight, smoothly morphs the container geometry, displays an accurate skeleton overlay, and seamlessly reveals the final layout without layout shifts.

```text
estimated surface
       ↓
measurement of real layout
       ↓
smooth geometry morph
       ↓
precise structural skeleton
       ↓
seamless content reveal
```

## Installation

```bash
npm install @fluid-loading/react
```

```bash
pnpm add @fluid-loading/react
```

## Quick Start

Import the `FluidLoading` component. Styles are imported automatically by the package:

```tsx
import React from 'react';
import { FluidLoading } from '@fluid-loading/react';

export function Article({ loading, error, data }) {
  return (
    <FluidLoading
      loading={loading}
      error={error}
      estimatedHeight={320}
    >
      <article>
        <img src={data?.image} alt={data?.title} />
        <h2>{data?.title}</h2>
        <p>{data?.description}</p>
        <button type="button">Read more</button>
      </article>
    </FluidLoading>
  );
}
```

## Configuration

```tsx
<FluidLoading
  loading={loading}
  error={error}
  estimatedHeight={360}
  duration={300}
  revealDuration={150}
  minimumSkeletonDuration={120}
  errorFallback={({ error }) => (
    <div className="error-banner">
      <p>Failed to load content.</p>
    </div>
  )}
>
  <DashboardCard metrics={metrics} />
</FluidLoading>
```

### Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `loading` | `boolean` | Required | Triggers estimated loading surface when true. |
| `error` | `unknown` | `undefined` | Error state. Preserves surface dimensions to prevent collapse. |
| `estimatedHeight` | `number` | `240` | Estimated container height in pixels during loading. |
| `estimatedWidth` | `number \| string` | `'100%'` | Estimated container width. |
| `duration` | `number` | `300` | Morph animation duration in milliseconds. |
| `revealDuration` | `number` | `150` | Fade transition duration between skeleton and content. |
| `minimumSkeletonDuration`| `number` | `120` | Minimum duration precise skeleton is shown to prevent flashes. |
| `fallback` | `ReactNode` | `undefined` | Custom placeholder shown during estimated loading. |
| `errorFallback` | `ReactNode \| Function` | Default UI | Custom component or render function for error states. |
| `onStateChange` | `(state: FluidLoadingState) => void` | `undefined` | Callback emitted on state change (`loading`, `transitioning`, `ready`, `error`). |
| `onSnapshot` | `(snapshot: LayoutSnapshot) => void` | `undefined` | Emits measured geometry bones and dimensions. |

## HTML Control Attributes

Use HTML attributes on target child nodes to fine-tune automatic skeleton detection:

- `data-fluid-loading-ignore`: Excludes the element from skeleton calculation.
- `data-fluid-loading-type="text | rect | circle"`: Explicitly forces bone rendering type.

```html
<div class="user-avatar" data-fluid-loading-type="circle"></div>
<button data-fluid-loading-ignore>Dismiss</button>
```

## Styling & CSS Variables

You can customize the appearance globally in your CSS or per-instance via inline `style`:

```css
:root {
  --fluid-loading-bone-bg: #353d4f;
  --fluid-loading-surface-bg: #1c202b;
  --fluid-loading-shimmer-color: rgba(251, 191, 36, 0.25);
  --fluid-loading-shimmer-duration: 1.5s;
  --fluid-loading-radius: 12px;
  --fluid-loading-text-radius: 5px;
  --fluid-loading-rect-radius: 8px;
}
```

| Variable | Default (Dark) | Default (Light) | Description |
| :--- | :--- | :--- | :--- |
| `--fluid-loading-bone-bg` | `#353d4f` | `#cbd5e1` | Background color for skeleton bones |
| `--fluid-loading-surface-bg` | `#1c202b` | `#ffffff` | Background color for skeleton overlay |
| `--fluid-loading-shimmer-color`| `rgba(251, 191, 36, 0.16)` | `rgba(251, 191, 36, 0.25)` | Wave highlight color |
| `--fluid-loading-shimmer-duration`| `1.5s` | `1.5s` | Animation speed of the shimmer wave |
| `--fluid-loading-radius` | `12px` | `12px` | Border radius of container & error state |
| `--fluid-loading-text-radius` | `5px` | `5px` | Border radius for text bones |
| `--fluid-loading-rect-radius` | `8px` | `8px` | Border radius for rectangle bones |

## Accessibility & Reduced Motion

- Sets `aria-busy="true"` during loading and transitions.
- Skeletons are marked with `aria-hidden="true"`.
- Automatically respects `@media (prefers-reduced-motion: reduce)` by disabling animations and transitioning instantly.

## Development & Playground

Clone the repository and run:

```bash
pnpm install
pnpm dev
```

Run test suite:

```bash
pnpm test
```

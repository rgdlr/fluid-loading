# Fluid Loading

A layout-aware loading transition engine for React and the DOM.

![fluid loading banner](./docs/banner.jpg)

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
npm install @fluid-loading/react @fluid-loading/styles
```

```bash
pnpm add @fluid-loading/react @fluid-loading/styles
```

## Quick Start

Import the `@fluid-loading/react` component and the stylesheet:

```tsx
import React from 'react';
import { Fluid } from '@fluid-loading/react';
import '@fluid-loading/styles';

export function Article({ loading, error, data }) {
  return (
    <Fluid
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
    </Fluid>
  );
}
```

## Configuration

```tsx
<Fluid
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
</Fluid>
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
| `onStateChange` | `(state: FluidState) => void` | `undefined` | Callback emitted on state change (`loading`, `transitioning`, `ready`, `error`). |
| `onSnapshot` | `(snapshot: LayoutSnapshot) => void` | `undefined` | Emits measured geometry bones and dimensions. |

## HTML Control Attributes

Use HTML attributes on target child nodes to fine-tune automatic skeleton detection:

- `data-fluid-ignore`: Excludes the element from skeleton calculation.
- `data-fluid-type="text | rect | circle"`: Explicitly forces bone rendering type.

```html
<div class="user-avatar" data-fluid-type="circle"></div>
<button data-fluid-ignore>Dismiss</button>
```

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

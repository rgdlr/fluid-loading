# @fluid-loading/react

> Declarative React adapter for Fluid Loading. Zero-layout-shift (CLS 0.00) skeleton morphing transitions for React 18 & 19.

[![npm version](https://img.shields.io/npm/v/@fluid-loading/react.svg)](https://www.npmjs.com/package/@fluid-loading/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`@fluid-loading/react` eliminates Cumulative Layout Shift (CLS) during asynchronous UI loading. Instead of harsh pop-ins or inaccurate skeleton boxes, `<FluidLoading>` measures the real DOM layout of your child components in-flight, smoothly interpolates container dimensions, overlays matching skeleton bones, and seamlessly reveals the hydrated content.

- **Zero CLS (0.00)**: Eliminates layout shifts during asynchronous data loading.
- **Ultra-lightweight**: In-flight DOM scanner with `< 1ms` overhead, zero heavy animation dependencies.
- **Zero-Config Styles**: Component styles are bundled directly into `@fluid-loading/react` with zero required CSS imports.
- **Dual-Mode Customization**: Configure via strongly-typed React props or standard `--fluid-loading-*` CSS tokens.
- **Accessible & Compliant**: Built-in `aria-busy`, `aria-hidden` on skeletons, and automatic `prefers-reduced-motion` compliance.

## Installation

```bash
npm install @fluid-loading/react
# or
pnpm add @fluid-loading/react
# or
yarn add @fluid-loading/react
```

> **Note**: Peer dependencies are `react` and `react-dom` (>= 18.0.0, including React 19).

## Quick Start

Import `FluidLoading` and wrap your dynamic content. Styles are injected automatically:

```tsx
import { useState } from 'react';
import { FluidLoading } from '@fluid-loading/react';

export function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  return (
    <FluidLoading
      loading={loading}
      estimatedHeight={260}
      duration={350}
      revealDuration={200}
    >
      <article className="profile-card">
        <img
          src={user?.avatar}
          alt={user?.name}
          className="avatar"
          data-fluid-loading-type="circle"
        />
        <h2>{user?.name}</h2>
        <p>{user?.bio}</p>
        <button type="button" data-fluid-loading-ignore>Follow</button>
      </article>
    </FluidLoading>
  );
}
```

---

## Component Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `loading` | `boolean` | **Required** | Controls loading and transition cycle. |
| `error` | `unknown` | `undefined` | Error state. Preserves container dimensions to prevent collapse. |
| `estimatedHeight` | `number` | `240` | Initial estimated height in pixels during loading. |
| `estimatedWidth` | `number \| string` | `'100%'` | Initial estimated container width. |
| `duration` | `number` | `300` | Container morph duration in ms (maps to `--fluid-loading-duration`). |
| `revealDuration` | `number` | `150` | Content reveal duration in ms (maps to `--fluid-loading-reveal-duration`). |
| `minimumSkeletonDuration` | `number` | `120` | Minimum skeleton hold time in ms (maps to `--fluid-loading-minimum-skeleton-duration`). |
| `boneBg` | `string` | `undefined` | Background color for skeleton bones (maps to `--fluid-loading-bone-bg`). |
| `surfaceBg` | `string` | `undefined` | Container background color during skeleton phase (maps to `--fluid-loading-surface-bg`). |
| `shimmerColor` | `string` | `undefined` | Highlight wave gradient color (maps to `--fluid-loading-shimmer-color`). |
| `shimmerDuration` | `number \| string` | `undefined` | Shimmer wave animation cycle speed (maps to `--fluid-loading-shimmer-duration`). |
| `radius` | `number \| string` | `undefined` | Border radius of container surface (maps to `--fluid-loading-radius`). |
| `textRadius` | `number \| string` | `undefined` | Border radius for text bones (maps to `--fluid-loading-text-radius`). |
| `rectRadius` | `number \| string` | `undefined` | Border radius for rectangular bones (maps to `--fluid-loading-rect-radius`). |
| `fallback` | `ReactNode` | `undefined` | Custom placeholder shown during initial estimated loading. |
| `errorFallback` | `ReactNode \| ((props: { error: unknown }) => ReactNode)` | Default UI | Custom component or render function for error states. |
| `className` | `string` | `''` | Class name applied to root container. |
| `style` | `CSSProperties` | `undefined` | Inline styles applied to root container. |
| `onStateChange` | `(state: FluidLoadingState) => void` | `undefined` | Emits public state changes (`loading`, `transitioning`, `ready`, `error`). |
| `onInternalStateChange` | `(state: InternalState) => void` | `undefined` | Emits internal lifecycle states (`loading`, `measuring`, `morphing`, `precise-skeleton`, `revealing`, `ready`, `error`). |
| `onSnapshot` | `(snapshot: LayoutSnapshot) => void` | `undefined` | Emits measured geometry bones and dimensions. |

---

## HTML Control Attributes

Use HTML attributes on target child nodes to fine-tune automatic skeleton detection:

- `data-fluid-loading-ignore`: Excludes the element from skeleton calculation.
- `data-fluid-loading-type="text | rect | circle"`: Explicitly forces bone rendering geometry.

```html
<div class="user-avatar" data-fluid-loading-type="circle"></div>
<button data-fluid-loading-ignore>Dismiss</button>
```

---

## CSS Custom Properties Reference

All styling and timing values can also be customized directly through CSS variables at `:root` or on parent containers:

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

When timing props (`duration`, `revealDuration`, `minimumSkeletonDuration`) are omitted from JSX, `<FluidLoading>` automatically resolves them from the active CSS variables.

---

## Accessibility (Reduced Motion)

When `prefers-reduced-motion: reduce` is active on the user's operating system, `<FluidLoading>` automatically bypasses transitions and immediately displays content without animation delays.

---

## License

MIT © [rgdlr](https://github.com/rgdlr)

# @fluid-loading/react

> Declarative React adapter for Fluid Loading. Zero-layout-shift (CLS 0.00) skeleton morphing transitions for React 18 & 19.

[![npm version](https://img.shields.io/npm/v/@fluid-loading/react.svg)](https://www.npmjs.com/package/@fluid-loading/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`@fluid-loading/react` eliminates Cumulative Layout Shift (CLS) during asynchronous UI loading. Instead of harsh pop-ins or jarring content replacements, `<FluidLoading>` captures in-flight DOM geometries and executes GPU-accelerated FLIP morph transitions from placeholder skeleton bones directly to real hydrated content.

- **Zero CLS (0.00)**: Eliminates visual jumps during data hydration.
- **Ultra-lightweight**: Under 1ms measurement overhead, zero heavy animation dependencies.
- **Styles automatically bundled**: No separate CSS import required when using standard bundlers.
- **Full Customization**: Configure via strongly-typed React props or `--fluid-*` CSS variables.
- **Accessible & Compliant**: Respects `prefers-reduced-motion` automatically.

## Installation

```bash
npm install @fluid-loading/react
# or
pnpm add @fluid-loading/react
# or
yarn add @fluid-loading/react
```

> **Note**: Peer dependency is `react` and `react-dom` >= 18.0.0.

## Quick Start

```tsx
import { useState } from 'react';
import { FluidLoading } from '@fluid-loading/react';

export function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  return (
    <FluidLoading
      loading={loading}
      pattern="card"
      estimatedHeight={240}
      duration={350}
      revealDuration={200}
    >
      <div className="profile-card">
        <img src={user?.avatar} alt={user?.name} className="avatar" />
        <h2>{user?.name}</h2>
        <p>{user?.bio}</p>
      </div>
    </FluidLoading>
  );
}
```

## Component Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `loading` | `boolean` | `true` | Controls whether skeleton placeholder or real content is displayed |
| `pattern` | `'card' \| 'text' \| 'avatar' \| 'table' \| 'media' \| 'feed'` | `'card'` | Structural skeleton preset layout |
| `boneCount` | `number` | `3` | Number of placeholder bone lines or elements |
| `estimatedHeight` | `number` | `undefined` | Reserved height (px) prior to first measurement |
| `duration` | `number` | `350` | Morph animation duration in milliseconds |
| `revealDuration` | `number` | `200` | Crossfade duration in milliseconds |
| `minimumSkeletonDuration` | `number` | `150` | Minimum time (ms) skeleton remains to prevent fast-network flashes |
| `easing` | `string` | `'cubic-bezier(0.16, 1, 0.3, 1)'` | CSS transition timing function |
| `stagger` | `number \| string` | `30` | Cascading bone morph stagger (ms or CSS value) |
| `radius` | `number \| string` | `8` | Bone border radius (px or CSS string) |
| `shimmer` | `boolean` | `true` | Enables animated highlight shimmer over skeleton bones |
| `shimmerDuration` | `number \| string` | `'1.5s'` | Shimmer cycle interval |
| `skeletonBg` | `string` | `'#1e2028'` | Skeleton bone base background color |
| `shimmerColor` | `string` | `'rgba(255, 255, 255, 0.06)'` | Shimmer highlight gradient color |
| `shimmerAngle` | `number` | `90` | Angle in degrees for the shimmer sweep |
| `as` | `ElementType` | `'div'` | Custom wrapper HTML tag or React component |
| `skeleton` | `ReactNode` | `undefined` | Custom skeleton DOM node to override automatic bone generator |
| `onTransitionStart` | `() => void` | `undefined` | Callback fired when the FLIP morph begins |
| `onTransitionEnd` | `() => void` | `undefined` | Callback fired when real content is fully revealed |

## CSS Custom Properties

All styling and timing values can also be customized directly through CSS variables at `:root` or on parent containers:

```css
.my-card-container {
  --fluid-duration: 400ms;
  --fluid-reveal-duration: 250ms;
  --fluid-min-duration: 200ms;
  --fluid-easing: cubic-bezier(0.25, 1, 0.5, 1);
  --fluid-radius: 12px;
  --fluid-skeleton-bg: #14171f;
  --fluid-shimmer-color: rgba(99, 102, 241, 0.15);
}
```

## Accessibility (Reduced Motion)

When `prefers-reduced-motion: reduce` is active on the user's operating system, `<FluidLoading>` automatically bypasses transform morphs and executes an instant clean fade transition without motion sickness risks.

## License

MIT © [rgdlr](https://github.com/rgdlr)

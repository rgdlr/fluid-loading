# @fluid-loading/core

> Framework-agnostic core layout measurement and skeleton transition engine for Fluid Loading. Zero Cumulative Layout Shift (CLS 0.00).

[![npm version](https://img.shields.io/npm/v/@fluid-loading/core.svg)](https://www.npmjs.com/package/@fluid-loading/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`@fluid-loading/core` is the mathematical and structural engine powering Fluid Loading. It provides:
- Exact in-flight DOM layout geometry measurement before content renders.
- FLIP-based hardware-accelerated morph transitions from skeleton bones directly to real DOM elements.
- Deterministic finite state machine lifecycle (`IDLE` -> `LOADING` -> `TRANSITIONING` -> `REVEALING` -> `IDLE`).
- Dynamic bone pattern generator (`card`, `text`, `avatar`, `table`, `feed`, etc.).
- Complete CSS token design system with automatic `prefers-reduced-motion` compliance.

If you are using React, consider using the official adapter [`@fluid-loading/react`](https://www.npmjs.com/package/@fluid-loading/react).

## Installation

```bash
npm install @fluid-loading/core
# or
pnpm add @fluid-loading/core
# or
yarn add @fluid-loading/core
```

## Styling

Include the core stylesheet for shimmer animations and CSS custom properties:

```js
import '@fluid-loading/core/styles.css';
```

Or reference it in your HTML:

```html
<link rel="stylesheet" href="node_modules/@fluid-loading/core/dist/styles.css">
```

## Core API

### `FluidLoadingStateMachine`

Controls the deterministic transition lifecycle:

```ts
import { FluidLoadingStateMachine } from '@fluid-loading/core';

const sm = new FluidLoadingStateMachine({
  timing: {
    duration: 350,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    revealDuration: 200,
    minimumSkeletonDuration: 150
  },
  onStateChange: (state, prevState) => {
    console.log(`State transitioned: ${prevState} -> ${state}`);
  }
});

// Start loading
sm.startLoading();

// Signal data ready
sm.contentLoaded();
```

### `measureElement` & `measureHiddenContent`

Measures incoming target element bounding boxes without causing visible layout jumps or reflow thrashing:

```ts
import { measureElement } from '@fluid-loading/core';

const metrics = measureElement(contentNode);
console.log(metrics.width, metrics.height);
```

### `generateSkeletonBones` & `createSkeletonElement`

Generates matching geometric bones based on pattern or measured dimensions:

```ts
import { generateSkeletonBones, createSkeletonElement } from '@fluid-loading/core';

const bones = generateSkeletonBones({
  pattern: 'card',
  boneCount: 4,
  estimatedHeight: 280
});

const skeletonDom = createSkeletonElement({
  bones,
  shimmer: true
});
container.appendChild(skeletonDom);
```

### `createFLIPTransition`

Executes FLIP (First, Last, Invert, Play) transforms using Web Animations API:

```ts
import { createFLIPTransition } from '@fluid-loading/core';

await createFLIPTransition({
  from: skeletonSnapshot,
  to: contentSnapshot,
  element: containerElement,
  timing: { duration: 350, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
});
```

## CSS Custom Properties

| Variable | Default | Description |
| :--- | :--- | :--- |
| `--fluid-duration` | `350ms` | Morph transition duration |
| `--fluid-reveal-duration` | `200ms` | Content crossfade duration |
| `--fluid-min-duration` | `150ms` | Minimum skeleton display duration |
| `--fluid-easing` | `cubic-bezier(0.16, 1, 0.3, 1)` | Animation timing function |
| `--fluid-stagger` | `30ms` | Cascading bone delay |
| `--fluid-radius` | `8px` | Skeleton bone border radius |
| `--fluid-shimmer-duration`| `1.5s` | Shimmer cycle interval |
| `--fluid-skeleton-bg` | `#1e2028` | Base bone background color |
| `--fluid-shimmer-color` | `rgba(255, 255, 255, 0.06)` | Gradient shimmer highlight |

## License

MIT © [rgdlr](https://github.com/rgdlr)

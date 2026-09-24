# @fluid-loading/core

> Framework-agnostic DOM geometry scanner, state machine, and skeleton layout engine for Fluid Loading. Zero Cumulative Layout Shift (CLS 0.00).

[![npm version](https://img.shields.io/npm/v/@fluid-loading/core.svg)](https://www.npmjs.com/package/@fluid-loading/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`@fluid-loading/core` is the mathematical and structural engine powering Fluid Loading. It provides:
- **In-flight DOM Layout Scanner**: Off-screen layout measurement (`< 1ms`) that extracts bounding boxes, leaf media, and text nodes into structural skeleton bones.
- **Deterministic State Machine**: Lifecycle coordinator transitioning between `loading` -> `measuring` -> `morphing` -> `precise-skeleton` -> `revealing` -> `ready` (or `error`).
- **CSS Design Tokens**: Complete custom property design system (`--fluid-loading-*`) with automatic `@media (prefers-reduced-motion: reduce)` compliance.
- **Zero Dependencies**: Lightweight, tree-shakeable, and framework-agnostic.

If you are using React, use the official adapter [`@fluid-loading/react`](https://www.npmjs.com/package/@fluid-loading/react).

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

---

## Core API

### `measureElement(root, options?)`

Scans an element and its children to compute a `LayoutSnapshot`. Automatically detects circular elements (avatars, icons), rectangular elements (cards, images, videos), and text lines:

```ts
import { measureElement } from '@fluid-loading/core';

const snapshot = measureElement(contentElement, {
  ignoreAttribute: 'data-fluid-loading-ignore',
  typeAttribute: 'data-fluid-loading-type',
  minDimension: 2,
});

console.log(`Measured bounds: ${snapshot.width}x${snapshot.height}`);
console.log(`Extracted bones:`, snapshot.bones);
// [
//   { type: 'rect', x: 0, y: 0, width: 320, height: 160, borderRadius: 8 },
//   { type: 'circle', x: 16, y: 176, width: 48, height: 48, borderRadius: 24 },
//   { type: 'text', x: 74, y: 184, width: 180, height: 18, borderRadius: 5 }
// ]
```

### HTML Control Attributes

Use HTML attributes on target child nodes to fine-tune automatic skeleton detection:

- `data-fluid-loading-ignore`: Excludes the element from skeleton calculation.
- `data-fluid-loading-type="text | rect | circle"`: Explicitly forces bone rendering geometry.

```html
<div class="user-avatar" data-fluid-loading-type="circle"></div>
<button data-fluid-loading-ignore>Dismiss</button>
```

### `FluidLoadingStateMachine`

Controls the deterministic transition lifecycle:

```ts
import { FluidLoadingStateMachine, toPublicState } from '@fluid-loading/core';

const sm = new FluidLoadingStateMachine('loading');

// Subscribe to state changes
const unsubscribe = sm.subscribe((newState, prevState, error) => {
  console.log(`State: ${prevState} -> ${newState}`);
  console.log(`Public state: ${toPublicState(newState)}`);
});

// Transition between internal states
sm.transition('measuring');
sm.transition('morphing');
sm.transition('precise-skeleton');
sm.transition('revealing');
sm.transition('ready');

// In case of error
sm.setError(new Error('Network request failed'));

// Query current state
console.log(sm.getState()); // 'error'
console.log(sm.getPublicState()); // 'error'

// Reset back to initial loading state
sm.reset();

// Cleanup listener
unsubscribe();
```

#### Lifecycle States

- **Internal States**: `'loading'` | `'measuring'` | `'morphing'` | `'precise-skeleton'` | `'revealing'` | `'ready'` | `'error'`
- **Public States**: `'loading'` | `'transitioning'` | `'ready'` | `'error'`

### `resolveTiming(timing, reducedMotion?)`

Resolves timing configurations with fallback defaults and handles `prefers-reduced-motion`:

```ts
import { resolveTiming } from '@fluid-loading/core';

const timing = resolveTiming(
  {
    duration: 350,
    revealDuration: 200,
    minimumSkeletonDuration: 150,
  },
  false // reducedMotion
);
// { duration: 350, revealDuration: 200, minimumSkeletonDuration: 150 }
```

When `reducedMotion` is `true`, all durations are automatically collapsed to `0` for instantaneous accessible transitions.

### Snapshot Utilities

```ts
import {
  calculateLayoutDiff,
  createSnapshot,
  deserializeSnapshot,
  serializeSnapshot,
} from '@fluid-loading/core';

// Create a custom snapshot
const snapshot = createSnapshot(400, 300, bones);

// Serialize to JSON and deserialize back
const json = serializeSnapshot(snapshot);
const restored = deserializeSnapshot(json);

// Calculate layout shift difference between two snapshots
const diff = calculateLayoutDiff(snapshotA, snapshotB);
console.log(`Shift: ${diff.deltaWidth}px width, ${diff.deltaHeight}px height`);
```

---

## CSS Custom Properties Reference

| Variable | Default (Dark) | Default (Light) | Description |
| :--- | :--- | :--- | :--- |
| `--fluid-loading-duration` | `300ms` | `300ms` | Container dimension morph animation duration |
| `--fluid-loading-reveal-duration` | `150ms` | `150ms` | Fade transition duration between skeleton and content |
| `--fluid-loading-minimum-skeleton-duration` | `120ms` | `120ms` | Minimum skeleton hold time to prevent sub-frame flashes |
| `--fluid-loading-bone-bg` | `#353d4f` | `#cbd5e1` | Background color for skeleton bones |
| `--fluid-loading-surface-bg` | `#1c202b` | `#ffffff` | Background color for skeleton overlay |
| `--fluid-loading-shimmer-color` | `rgba(251, 191, 36, 0.16)` | `rgba(251, 191, 36, 0.25)` | Wave highlight color |
| `--fluid-loading-shimmer-duration` | `1.5s` | `1.5s` | Wave animation cycle duration |
| `--fluid-loading-radius` | `12px` | `12px` | Border radius of container & error state |
| `--fluid-loading-text-radius` | `5px` | `5px` | Border radius for text bones |
| `--fluid-loading-rect-radius` | `8px` | `8px` | Border radius for rectangle bones |

---

## License

MIT © [rgdlr](https://github.com/rgdlr)

# thinking-orbs-universal

Dotted thought-orb loading indicators for AI & agent UIs — **framework-agnostic**, with native support for **Vue 3**, **React**, **Web Components**, and **Vanilla JS**.

A derivative of [`thinking-orbs`](https://github.com/Jakubantalik/thinking-orbs) by Jakub Antalik. The original is a beautiful, hand-tuned React-only canvas library; this project decouples the rendering engine from any framework and adds Vue 3, Web Component, and Vanilla JS adapters — plus a CSS custom-property API for theme authors.

Six hand-tuned animated states, each shipped at two purpose-tuned sizes, rendered on a plain 2D canvas — no WebGL, no filters, works identically in Chrome, Safari and Firefox.

[Repository](https://github.com/wangbin3162/thinking-orbs-universal) · [Report an issue](https://github.com/wangbin3162/thinking-orbs-universal/issues) · [Architecture & design spec](./docs/ARCHITECTURE.md) · [Implementation plan](./docs/IMPLEMENTATION_PLAN.md)

## Install

```bash
npm install thinking-orbs-universal
```

`vue`, `react` and `react-dom` are listed as **optional** peer dependencies — a pure-Vue project will never pull in React, and a plain-HTML project will pull in no framework at all.

## Quick start

Pick the adapter that matches your stack. Every adapter renders the exact same pixels.

### React

```tsx
import { ThinkingOrb } from 'thinking-orbs-universal/react';

function Status() {
  return <ThinkingOrb state="searching" size={64} />;
}
```

### Vue 3

```vue
<script setup lang="ts">
import { ThinkingOrb } from 'thinking-orbs-universal/vue';
</script>

<template>
  <ThinkingOrb state="working" :size="64" :speed="1.5" />
</template>
```

### Web Component / plain HTML

The custom element auto-registers on import:

```html
<script type="module">
  import 'thinking-orbs-universal/web-component';
</script>

<thinking-orb state="searching" size="20"></thinking-orb>
```

Attributes mirror the props: `state`, `size`, `theme`, `speed`, `paused`, `aria-label`. Updates to attributes are reflected live.

### Vanilla JS

For frameworks not listed above (Svelte, Angular, Solid…) or direct canvas control:

```ts
import { mountOrb } from 'thinking-orbs-universal';

const orb = mountOrb(document.getElementById('orb')!, {
  state: 'solving',
  size: 20,
});

// later…
orb.updateOptions({ paused: true });
orb.destroy();
```

`mountOrb` accepts either an existing `<canvas>` or a container element (it creates the canvas for you). The returned handle exposes `controller`, `canvas`, `updateOptions`, and `destroy`.

## States

Six verbs an agent can be doing, each a distinct animation:

```tsx
<ThinkingOrb state="working" />    {/* particles on tilted orbits */}
<ThinkingOrb state="searching" />  {/* a scan meridian sweeps a dotted globe */}
<ThinkingOrb state="solving" />    {/* bands scramble, then click back solved */}
<ThinkingOrb state="listening" />  {/* a waveform rolls through the rings */}
<ThinkingOrb state="composing" />  {/* an undulating multi-band sash */}
<ThinkingOrb state="shaping" />    {/* dotted outline: circle → triangle → square */}
```

## Sizes

Two tuned presets — separate designs, not a scale factor. `64` for chat-avatar scale, `20` for inline-text scale. Each carries its own dot count, dot size and speed tuning. Any other numeric size snaps to the nearest preset (≤ 32 → `20`, otherwise → `64`) while keeping the pixel dimensions you requested.

```tsx
<ThinkingOrb state="working" size={64} />
<ThinkingOrb state="working" size={20} />
```

## Theme

Strictly monochrome — light ink for dark backgrounds, dark ink for light backgrounds — with the mode picked automatically from the host project:

```tsx
<ThinkingOrb theme="auto" />   {/* default — detects from the project */}
<ThinkingOrb theme="dark" />   {/* pin: light dots for dark backgrounds */}
<ThinkingOrb theme="light" />  {/* pin: dark dots for light backgrounds */}
```

`auto` resolves in three layers and updates live when any of them change:

1. an ancestor `data-theme="dark|light"` attribute or `dark`/`light` class (the Tailwind / shadcn convention), watched via `MutationObserver`;
2. otherwise `prefers-color-scheme`, subscribed for live OS theme switches;
3. SSR-safe — the canvas paints only on the client, after the theme has resolved.

## CSS custom properties

Drive size, speed, and the two ink colors from CSS instead of props — ideal for theme files and design tokens. Resolved off the element or any ancestor, in real time.

| Variable             | Type       | Description                                   | Fallback              |
| -------------------- | ---------- | --------------------------------------------- | --------------------- |
| `--orb-size`         | `<length>` | Rendered size, e.g. `64px`, `20px`            | the `size` prop       |
| `--orb-speed`        | `<number>` | Speed multiplier, e.g. `1.5`                  | the `speed` prop      |
| `--orb-color-dark`   | `<color>`  | Ink color for dark backgrounds                | `#ffffff`             |
| `--orb-color-light`  | `<color>`  | Ink color for light backgrounds               | `#000000`             |

Resolution priority: **explicit props > CSS variables > preset defaults.**

```css
thinking-orb {
  --orb-size: 20px;
  --orb-speed: 1.4;
  --orb-color-dark: #e6e6e6;
}
```

## Other props

```tsx
<ThinkingOrb
  state="solving"
  size={20}
  speed={1.5}          // multiplier on the preset's baked speed
  paused={false}       // freeze on the current frame
  aria-label="Analysing repository…"  // overrides the per-state default
/>
```

In React, all other `<canvas>` props (`className`, `style`, `data-*`, …) pass through. In the web component, set `aria-label` and standard element attributes directly on the tag.

## Accessibility & performance

- `role="img"` with a sensible per-state `aria-label` out of the box (`Working…`, `Searching…`, …).
- `prefers-reduced-motion: reduce` renders a static representative frame — no animation — and still follows the live theme.
- Every instance pauses automatically when scrolled offscreen (`IntersectionObserver`) or when the tab is hidden, and resumes in phase — all instances share one clock.
- Plain 2D canvas arcs only: no `ctx.filter`, no SVG filters, no WebGL — the same pixels everywhere, cheap on low-end devices. Device-pixel-ratio capped at 2.

## Advanced: the core engine

Power users can skip the adapters and talk to the engine directly:

```ts
import {
  OrbController,       // bind a canvas, drive the lifecycle yourself
  mountOrb,            // convenience wrapper around OrbController
  ThemeObserver,       // standalone theme resolution + live subscription
  ReducedMotionObserver,
  resolveCSSVars,
  resolvePreset,       // (state, size) → mode + fully-scaled draw options
  STATE_TO_MODE,
  MODE_DRAWS,          // raw per-mode draw functions
  registerThinkingOrbElement,  // pick a custom tag name
} from 'thinking-orbs-universal';
```

## Local demo

```bash
npm install
npm run dev      # vite demo playground
npm run build    # library build (dist/)
npm run typecheck
```

## License

MIT © [Jakub Antalik](https://github.com/Jakubantalik) (original `thinking-orbs`) and [wangbin3162](https://github.com/wangbin3162) (`thinking-orbs-universal`). See [LICENSE](./LICENSE).

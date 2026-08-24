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

## Text Shimmer (文字流光)

A lightweight, framework-agnostic "shining text" utility for the status label next to the orb. The styles ship as a standalone CSS file — no framework import required.

```css
/* JS / TSX / any bundler */
import 'thinking-orbs-universal/shimmer.css';
```

```html
<span class="t-shimmer" data-text="Searching…">Searching…</span>
```

`data-text` must equal the visible text — it is used by the `::before` layer that renders the moving highlight. Add the `.sm` class for the inline (size `20`) variant:

```html
<span class="t-shimmer sm" data-text="Working…">Working…</span>
```

The effect reads its tokens from CSS custom properties, so you can tune it from your own theme without re-importing:

| Variable             | Description                       | Default           |
| -------------------- | --------------------------------- | ----------------- |
| `--shimmer-dur`      | Animation duration                | `2000ms`          |
| `--shimmer-band`     | Gradient band width               | `400%`            |
| `--shimmer-ease`     | Animation easing                  | `linear`          |
| `--shimmer-base`     | Resting text color                | light/dark-aware  |
| `--shimmer-highlight`| Sweeping highlight color          | light/dark-aware  |

The base and highlight colors follow the `data-theme="light"` / `dark` convention automatically, and the animation is disabled under `prefers-reduced-motion: reduce`.

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

The color variables are fully live: `--orb-color-dark` paints the dots when the resolved theme is dark, `--orb-color-light` when it is light. Any CSS color is accepted (`#hex`, `rgb()`/`rgba()`). Each dot renders as that color scaled by its brightness — the brightest dots hold the full hue, deeper dots fall toward black — so you get a custom-tinted orb that keeps its 3D depth. Omit both and the classic grayscale ink is used.

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

## 如何修改颜色

> 开始前先安装本包：`npm i thinking-orbs-universal`（安装方式见上方 [Install](#install)）。下面两种颜色都可直接在你的样式里覆盖，无需改源码。

### 修改文字流光颜色

文字流光（`.t-shimmer`）的颜色由 CSS 自定义属性控制，直接在你自己的样式里覆盖即可，无需改源码。所有变量都可选，不设就用默认值。

```css
/* 在项目引入流光样式之后覆盖 */
.t-shimmer {
  --shimmer-dur: 1500ms;         /* 扫光动画时长 */
  --shimmer-base: #c7d2fe;       /* 静止时文字的颜色 */
  --shimmer-highlight: #ffffff;  /* 扫过时最亮的高光颜色 */
}
```

- 只改文字颜色：覆盖 `--shimmer-base`。
- 想调亮高光的扫光颜色：覆盖 `--shimmer-highlight`。
- 默认值会自动跟随深浅主题（`data-theme="dark|light"`），一般无需手动指定。
- 记得先引入样式文件：`import 'thinking-orbs-universal/shimmer.css';`，否则 `.t-shimmer` 类不存在，改动不生效。

### 修改小球颜色

小球（`thinking-orb`）的颜色通过两个 CSS 自定义属性设置，按主题分别生效：

```css
thinking-orb {
  --orb-color-dark: #6366f1;   /* 深色背景下小球的颜色，如靛蓝 */
  --orb-color-light: #4f46e5;  /* 浅色背景下小球的颜色 */
}
```

- 支持任意 CSS 颜色格式：`#hex`、`rgb()` / `rgba()`。
- 深色背景用 `--orb-color-dark`，浅色背景用 `--orb-color-light`，不设则回退为经典黑白灰。
- 每个小点按亮度缩放该颜色：最亮的点保持纯色，越远越偏黑，因此着色后仍保留立体感。
- 也可通过 inline style 针对单个实例覆盖，例如：
  ```html
  <thinking-orb state="searching" style="--orb-color-dark:#61dafb"></thinking-orb>
  ```

## License

MIT © [Jakub Antalik](https://github.com/Jakubantalik) (original `thinking-orbs`) and [wangbin3162](https://github.com/wangbin3162) (`thinking-orbs-universal`). See [LICENSE](./LICENSE).

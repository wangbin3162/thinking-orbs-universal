# `thinking-orbs-universal` 架构设计与实现说明

## 1. 项目背景与目标

原 `thinking-orbs` 库提供了非常优秀的 AI Agent 动销加载效果，基于 Canvas 2D 渲染，性能优异。然而其原始实现深度绑定了 React (`ThinkingOrb.tsx` 以及关联的 React Hooks)。

`thinking-orbs-universal` 的目标是**彻底解耦 React 依赖**，建立一套**框架无关 (Framework-Agnostic)** 的通用 2D Canvas 动销组件库，实现以下核心能力：

1. **核心引擎独立**：Canvas 渲染算法、3D 数学计算与 Preset 配置不依赖任何 Web 框架。
2. **通用生命周期控制器**：提供纯 TypeScript/JavaScript 的 `OrbController`，管理 Canvas 渲染、`requestAnimationFrame` 循环、`IntersectionObserver` 视口监听和主题切换。
3. **原生 CSS 变量扩展支持**：允许开发者通过 CSS 自定义属性（如 `--orb-size`, `--orb-speed`, `--orb-color-dark`, `--orb-color-light`）动态控制动画参数。
4. **多框架原生适配包**：
   - **Vanilla JS API**：`mountOrb(canvasElement, options)`
   - **Web Component**：自定义元素 `<thinking-orb>`（支持 Vue、Angular、Svelte、HTML 直接引用）
   - **Vue 3 组件**：`import { ThinkingOrb } from 'thinking-orbs-universal/vue'`
   - **React 组件**：`import { ThinkingOrb } from 'thinking-orbs-universal/react'`（100% 兼容原 API）

---

## 2. 整体架构分层设计

```mermaid
graph TD
    SubA[Vue 3 项目] -->|import /vue| VueAdapter[Vue 3 适配层]
    SubB[React 项目] -->|import /react| ReactAdapter[React 适配层]
    SubC[原生 HTML / Svelte] -->|<thinking-orb>| WebComp[Web Component 适配层]
    SubD[Vanilla JS] -->|mountOrb()| CoreAPI[Core API]

    VueAdapter --> CoreController[OrbController 核心控制器]
    ReactAdapter --> CoreController
    WebComp --> CoreController
    CoreAPI --> CoreController

    CoreController --> ThemeObs[ThemeObserver 主题订阅器]
    CoreController --> MotionObs[ReducedMotionObserver]
    CoreController --> CSSVarResolver[CSS 变量解析器]
    CoreController --> Engine[Canvas 2D 渲染引擎 Engine]

    Engine --> MathCore[3D 投影 / 数学算法]
    Engine --> Presets[动销 Presets 64 / 20]
```

---

## 3. 核心模块详细设计

### 3.1 核心控制器 (`OrbController`)
`OrbController` 是整个库的神经中枢，其主要职责：
- 绑定传入的 `HTMLCanvasElement`；
- 初始化并适配 DPR (Device Pixel Ratio) 视网膜屏分辨率；
- 维护 `requestAnimationFrame` 动画 Loop，监听 `visibilitychange` 与 `IntersectionObserver`，离屏或后台时自动暂停释放 CPU；
- 响应属性更新 (`updateOptions(options)`) 并触发重绘；
- 组件销毁时彻底清理 Observer 与 Timer (`destroy()`)。

### 3.2 CSS 变量解析机制 (`CSSVarResolver`)
在渲染每帧或更新配置时，`OrbController` 将自动计算挂载节点及祖先节点的 CSS 变量：

| CSS 变量名 | 类型 | 描述 | 默认回退值 |
| :--- | :--- | :--- | :--- |
| `--orb-size` | `<length>` | 渲染尺寸（如 `64px`, `20px`） | 来自 Component `size` 属性 |
| `--orb-speed` | `<number>` | 播放速度倍率（如 `1.5`） | 来自 Component `speed` 属性 |
| `--orb-color-dark` | `<color>` | 暗色模式下的 Ink 颜色 | `#FFFFFF` |
| `--orb-color-light` | `<color>` | 亮色模式下的 Ink 颜色 | `#000000` |

计算优先级策略：**显式传入的 Props > CSS 自定义变量 > 预设默认值 (Presets Defaults)**。

### 3.3 主题与无障碍观察器 (`ThemeObserver` & `ReducedMotionObserver`)
- **`ThemeObserver`**：
  - 深度遍历/观察祖先节点的 `data-theme="dark|light"` 或 `.dark`/`.light` Class (`MutationObserver`)；
  - 订阅系统 `prefers-color-scheme: dark` 媒体查询；
  - 提供 `subscribe((isDark: boolean) => void)` 闭包取消机制。
- **`ReducedMotionObserver`**：
  - 监听系统的 `prefers-reduced-motion: reduce`；
  - 当用户开启“减少动态效果”时，绘制确定性的单帧静态状态。

---

## 4. 各适配层实现规范

### 4.1 Custom Element / Web Component (`<thinking-orb>`)
```ts
class ThinkingOrbElement extends HTMLElement {
  static get observedAttributes() {
    return ['state', 'size', 'theme', 'speed', 'paused'];
  }
  // 内部连接 OrbController，在 attributeChangedCallback 中触发 controller.updateOptions()
}
```

### 4.2 Vue 3 组件 API
```vue
<script setup ts>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { OrbController } from '../core/OrbController';

const props = withDefaults(defineProps<{
  state?: 'working' | 'searching' | 'solving' | 'listening' | 'composing' | 'shaping';
  size?: 64 | 20;
  theme?: 'auto' | 'dark' | 'light';
  speed?: number;
  paused?: boolean;
}>(), {
  state: 'working',
  size: 64,
  theme: 'auto',
  speed: 1,
  paused: false
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
let controller: OrbController | null = null;

onMounted(() => {
  if (canvasRef.value) {
    controller = new OrbController(canvasRef.value, props);
  }
});
watch(() => props, (newProps) => controller?.updateOptions(newProps), { deep: true });
onUnmounted(() => controller?.destroy());
</script>

<template>
  <canvas ref="canvasRef" :role="'img'" :aria-label="state" />
</template>
```

---

## 5. 打包与分发设计

工程采用 Vite Lib 模式 + `vite-plugin-dts` 打包，支持全平台模块导入：

- `dist/index.js` & `dist/index.cjs`: 核心 Core 与 Web Component API
- `dist/vue/index.js`: Vue 3 专属构建产物
- `dist/react/index.js`: React 专属构建产物

`peerDependencies` 将 `vue` 和 `react` 标为可选 (`optional: true`)，因此纯 Vue 开发者安装时**绝不会安装 React 依赖**，纯 Vanilla 开发者也不会包含任何框架代码！

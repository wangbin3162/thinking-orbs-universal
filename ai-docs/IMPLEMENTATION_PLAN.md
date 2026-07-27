# `thinking-orbs-universal` 详细落地实施计划

本文档提供了将 `thinking-orbs` 迁移并实现为 `thinking-orbs-universal` 通用组件库的完整、可落地的开发计划。

---

## 阶段一：项目基础搭建与核心引擎迁移 (Project Setup & Engine Migration)

### 任务 1.1：目录结构规划
建立干净的代码目录架构：
```
thinking-orbs-universal/
├── docs/
│   ├── ARCHITECTURE.md
│   └── IMPLEMENTATION_PLAN.md
├── src/
│   ├── engine/           # 从原项目迁移的纯 TS 数学与绘图核心
│   │   ├── core.ts
│   │   ├── lattice.ts
│   │   ├── morph.ts
│   │   ├── orbits.ts
│   │   ├── profiles.ts
│   │   ├── registry.ts
│   │   ├── ribbon.ts
│   │   └── types.ts
│   ├── presets.ts        # 预设解析
│   ├── core/             # 框架无关的核心控制器与 Observer
│   │   ├── theme-observer.ts
│   │   ├── motion-observer.ts
│   │   ├── css-vars.ts
│   │   └── OrbController.ts
│   ├── web-component/    # Custom Element 实现
│   │   └── ThinkingOrbElement.ts
│   ├── vue/              # Vue 3 组件
│   │   └── ThinkingOrb.vue
│   ├── react/            # React 组件
│   │   └── ThinkingOrb.tsx
│   └── index.ts          # Core 导出入口
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### 任务 1.2：迁移并校验 `engine` 引擎代码
- 从 `/Users/wangbin/workspace/temp/thinking-orbs/src/engine/` 完整复制核心绘图代码至 `src/engine/`。
- 确认引擎代码内零 React 引入，纯 TypeScript 类型检查无报错。

---

## 阶段二：框架无关核心控制器实现 (Framework-Agnostic Core)

### 任务 2.1：编写主题与观察器 (`src/core/theme-observer.ts`)
- 提取原生 `MutationObserver` 监听祖先 `data-theme` 属性和 `.dark` / `.light` Class。
- 监听 `matchMedia('(prefers-color-scheme: dark)')`。
- 提供回调订阅与取消订阅接口：
  ```ts
  export class ThemeObserver {
    constructor(hostEl: HTMLElement | null, mode: OrbTheme, onChange: (isDark: boolean) => void);
    destroy(): void;
  }
  ```

### 任务 2.2：编写 CSS 变量解析模块 (`src/core/css-vars.ts`)
- 实时获取 DOM 计算样式 `window.getComputedStyle(element)`。
- 读取 `--orb-size`, `--orb-speed`, `--orb-color-dark`, `--orb-color-light`。

### 任务 2.3：实现核心控制器 (`src/core/OrbController.ts`)
- 封装 Canvas 初始化、DPR 缩放设置。
- 封装 `requestAnimationFrame` 动画循环。
- 结合 `IntersectionObserver` 实现滚动到视口外自动 Pause，滚动回视口 Resume。
- 结合 `document.addEventListener('visibilitychange')` 实现切换 Tab 时自动暂停/恢复。
- 暴露 `updateOptions(newOptions: Partial<OrbOptions>)` 和 `destroy()`。

---

## 阶段三：Web Component 与 Vanilla API 实现

### 任务 3.1：封装 Web Component (`src/web-component/ThinkingOrbElement.ts`)
- 继承 `HTMLElement`，注册自定义标签 `<thinking-orb>`。
- 内部创建 `<canvas>` 并挂载 `OrbController`。
- 实现 `attributeChangedCallback`，支持 HTML 属性修改即时响应。

### 任务 3.2：暴露 Vanilla JS `mountOrb`
- 实现 `mountOrb(container: HTMLElement | HTMLCanvasElement, options?: OrbOptions)` 快捷 API，方便无框架或 JQuery / Legacy 页面直接嵌入。

---

## 阶段四：Vue 3 与 React 适配器实现

### 任务 4.1：实现 Vue 3 适配器 (`src/vue/ThinkingOrb.vue`)
- 使用 `<script setup lang="ts">`。
- 定义 Vue 3 Props，模板声明 `<canvas>`。
- 在 `onMounted` 中实例化 `OrbController`，在 `onUnmounted` 中销毁。
- 使用 `watch` 深度监听 Props 变化更新动画。

### 任务 4.2：重构 React 适配器 (`src/react/ThinkingOrb.tsx`)
- 使用 `useRef` + `useEffect` 挂载 `OrbController`。
- 确保组件属性接口与原 `thinking-orbs` 100% 兼容。

---

## 阶段五：工程构建配置 (Vite Build & Package Config)

### 任务 5.1：配置 `vite.config.ts`
配置多入口 Lib 编译，分别生成 Core、Vue 3、React 的 ESM / CJS 产物与 `.d.ts` 类型声明文件。

### 任务 5.2：配置 `package.json` 的 `exports`
配置子路径导出，保证按需加载与 Tree-shaking：
- `import { mountOrb } from 'thinking-orbs-universal'`
- `import { ThinkingOrb } from 'thinking-orbs-universal/vue'`
- `import { ThinkingOrb } from 'thinking-orbs-universal/react'`
- `import 'thinking-orbs-universal/web-component'`

---

## 阶段六：测试与 Demo 验证 (Verification & Playground)

### 任务 6.1：多技术栈 Demo 测试
- **原生 HTML / Web Component 测试**：测试 `<thinking-orb state="searching">` 与 CSS 变量调整。
- **Vue 3 项目测试**：验证在 Vue 3 (Vite + Vue) 环境下的属性绑定与响应性。
- **React 项目测试**：验证在 React 18 环境下的渲染表现。

---

## 📅 进度追踪 Check List

- [x] **Phase 1**: 项目基础设施与 Engine 纯 TS 代码迁移
- [x] **Phase 2**: `OrbController` & `ThemeObserver` 核心逻辑开发
- [x] **Phase 3**: Custom Element (`<thinking-orb>`) 开发
- [x] **Phase 4**: Vue 3 组件开发与单元验证
- [x] **Phase 5**: React 兼容组件开发
- [x] **Phase 6**: Vite 多产物打包发布与类型校验

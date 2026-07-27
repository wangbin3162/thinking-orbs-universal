import { useEffect, useRef } from 'react';
import { mountOrb, registerThinkingOrbElement } from '../../src';
import type { OrbState } from '../../src/types';
import { ORB_LABELS } from '../../src/types';
import { highlightCode } from '../highlight';

// Register the Web Component
registerThinkingOrbElement();

const ORB_STATES: OrbState[] = ['working', 'searching', 'solving', 'listening', 'composing', 'shaping'];

export interface VanillaDemoOptions {
  speed: number;
  paused: boolean;
  isSmall: boolean;
}

export function renderVanillaDemo(container: HTMLElement, options: VanillaDemoOptions) {
  const { speed, paused, isSmall } = options;

  container.innerHTML = '';

  const section = document.createElement('div');
  section.className = 'demo-section';

  const title = document.createElement('div');
  title.className = 'section-title';
  title.innerHTML = '<span>⚡ Vanilla JS API & Web Component Examples (with Text Shimmer Effect)</span>';
  section.appendChild(title);

  // Grid container
  const grid = document.createElement('div');
  grid.className = 'demo-grid';

  ORB_STATES.forEach((st) => {
    const label = ORB_LABELS[st];

    const card = document.createElement('div');
    card.className = 'demo-card';

    const badge = document.createElement('div');
    badge.className = 'demo-card-badge';
    badge.textContent = st === 'working' || st === 'solving' || st === 'composing' ? 'mountOrb() API' : '<thinking-orb>';
    card.appendChild(badge);

    // Pill container - 100% identical to React and Vue
    const pill = document.createElement('div');
    pill.className = `orb-pill ${isSmall ? 'compact' : ''}`;

    if (st === 'working' || st === 'solving' || st === 'composing') {
      // Demonstrated using mountOrb() Vanilla JS API
      mountOrb(pill, {
        state: st,
        size: isSmall ? 20 : 64,
        speed,
        paused,
      });
    } else {
      // Demonstrated using <thinking-orb> Web Component
      const webComponent = document.createElement('thinking-orb') as HTMLElement;
      webComponent.setAttribute('state', st);
      webComponent.setAttribute('size', String(isSmall ? 20 : 64));
      webComponent.setAttribute('speed', String(speed));
      if (paused) {
        webComponent.setAttribute('paused', '');
      }
      pill.appendChild(webComponent);
    }

    // Text Shimmer Effect span - 100% identical to React and Vue
    const textSpan = document.createElement('span');
    textSpan.className = `t-shimmer ${isSmall ? 'sm' : ''}`;
    textSpan.setAttribute('data-text', label);
    textSpan.textContent = label;
    pill.appendChild(textSpan);

    card.appendChild(pill);
    grid.appendChild(card);
  });

  section.appendChild(grid);

  // Code Snippet Box 1: Web Component Method
  const codeBoxWebComp = document.createElement('div');
  codeBoxWebComp.className = 'code-box';
  codeBoxWebComp.innerHTML = `
    <div class="code-box-header">
      <span>方式一：原生 Web Component 标签 (&lt;thinking-orb&gt;)</span>
      <span>HTML / JS</span>
    </div>
    <pre class="code-content hljs language-xml" data-lang="xml">// 1. 引入 Web Component 自动注册包及样式
import 'thinking-orbs-universal/web-component';
import 'thinking-orbs-universal/demo/styles.css';

// 2. 直接在 HTML 中静态书写标签（无需 JS 动态创建）：
/*
&lt;div class="orb-pill"&gt;
  &lt;thinking-orb state="working" size="${isSmall ? 20 : 64}" speed="${speed}" ${paused ? 'paused' : ''}&gt;&lt;/thinking-orb&gt;
  &lt;span class="t-shimmer" data-text="Working…"&gt;Working…&lt;/span&gt;
&lt;/div&gt;
*/

// 3. 也可用原生 JS 动态操控属性：
const orb = document.querySelector('thinking-orb');
orb.setAttribute('state', 'searching'); // 切换动画
orb.setAttribute('speed', '${speed}');       // 改变速度</pre>
  `;
  section.appendChild(codeBoxWebComp);

  // Code Snippet Box 2: mountOrb JS API Method
  const codeBoxMount = document.createElement('div');
  codeBoxMount.className = 'code-box';
  codeBoxMount.innerHTML = `
    <div class="code-box-header">
      <span>方式二：Vanilla JS API 函数 (mountOrb)</span>
      <span>JavaScript</span>
    </div>
    <pre class="code-content hljs language-javascript" data-lang="javascript">// 1. 引入 mountOrb 函数与样式
import { mountOrb } from 'thinking-orbs-universal';
import 'thinking-orbs-universal/demo/styles.css';

// 2. 创建容器并挂载 Orb
const pill = document.createElement('div');
pill.className = 'orb-pill';

const orbInstance = mountOrb(pill, {
  state: 'working',
  size: ${isSmall ? 20 : 64},
  speed: ${speed},
  paused: ${paused}
});

// 3. 拼接扫光文字
const text = document.createElement('span');
text.className = 't-shimmer';
text.setAttribute('data-text', 'Working…');
text.textContent = 'Working…';
pill.appendChild(text);

// 4. 动态更新属性或销毁：
orbInstance.updateOptions({ state: 'solving' });
// orbInstance.destroy(); // 销毁实例</pre>
  `;
  section.appendChild(codeBoxMount);

  // 语法高亮所有代码块（读取原始文本再替换为高亮 HTML）
  section.querySelectorAll('pre.code-content').forEach((pre) => {
    const lang = pre.getAttribute('data-lang') === 'javascript' ? 'javascript' : 'xml';
    pre.innerHTML = highlightCode(pre.textContent || '', lang);
  });

  container.appendChild(section);
}

export function VanillaDemo(props: VanillaDemoOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      renderVanillaDemo(containerRef.current, props);
    }
  }, [props.speed, props.paused, props.isSmall]);

  return <div ref={containerRef} />;
}

export default VanillaDemo;

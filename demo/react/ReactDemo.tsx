import { useState } from 'react';
import { ThinkingOrb } from '../../src/react';
import type { OrbState } from '../../src/types';
import { ORB_LABELS } from '../../src/types';
import { highlightCode } from '../highlight';

const ORB_STATES: OrbState[] = ['working', 'searching', 'solving', 'listening', 'composing', 'shaping'];

export interface DemoControlsProps {
  speed: number;
  paused: boolean;
  isSmall: boolean;
}

export function ReactDemo({ speed, paused, isSmall }: DemoControlsProps) {
  const [selectedState, setSelectedState] = useState<OrbState>('working');

  const codeSnippet = `// 安装
// npm i thinking-orbs-universal
// (react / react-dom 为可选 peer 依赖)

import { ThinkingOrb } from 'thinking-orbs-universal/react';
import 'thinking-orbs-universal/shimmer.css';

export function ReactAIStatus() {
  return (
    <div className="orb-pill">
      <ThinkingOrb state="${selectedState}" size={${isSmall ? 20 : 64}} speed={${speed}} ${paused ? 'paused ' : ''}/>
      <span className="t-shimmer" data-text="${ORB_LABELS[selectedState]}">
        ${ORB_LABELS[selectedState]}
      </span>
    </div>
  );
}

// ── 修改颜色 ──────────────────────────────
// 1. 文字流光颜色：覆盖 .t-shimmer 上的 --shimmer-* 变量
//    .t-shimmer {
//      --shimmer-base: #c7d2fe;       /* 静止文字颜色 */
//      --shimmer-highlight: #ffffff;  /* 扫光高光颜色 */
//    }
//
// 2. 小球颜色：覆盖 thinking-orb 上的 --orb-color-* 变量
//    thinking-orb {
//      --orb-color-dark: #6366f1;   /* 深色背景小球颜色 */
//      --orb-color-light: #4f46e5;  /* 浅色背景小球颜色 */
//    }`;

  return (
    <div className="demo-section">
      <div className="section-title">
        <span>⚛️ React Component Examples (with Text Shimmer Effect)</span>
      </div>

      {/* Grid of all 6 states rendered as AI pills with shimmering text */}
      <div className="demo-grid">
        {ORB_STATES.map((st) => {
          const label = ORB_LABELS[st];
          const isSelected = selectedState === st;
          return (
            <div
              key={st}
              className={`demo-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedState(st)}
              style={{ cursor: 'pointer' }}
            >
              <div className="demo-card-badge">React Component</div>
              <div className={`orb-pill ${isSmall ? 'compact' : ''}`}>
                <ThinkingOrb
                  state={st}
                  size={isSmall ? 20 : 64}
                  speed={speed}
                  paused={paused}
                />
                {/* Text Shimmer Effect */}
                <span className={`t-shimmer ${isSmall ? 'sm' : ''}`} data-text={label}>
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Code Snippet Box */}
      <div className="code-box">
        <div className="code-box-header">
          <span>React Usage Code Snippet</span>
          <span>JSX / TSX</span>
        </div>
        <pre
          className="code-content hljs language-javascript"
          dangerouslySetInnerHTML={{ __html: highlightCode(codeSnippet, 'javascript') }}
        />
      </div>
    </div>
  );
}

export default ReactDemo;

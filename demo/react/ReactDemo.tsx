import { useState } from 'react';
import { ThinkingOrb } from '../../src/react';
import type { OrbState } from '../../src/types';
import { ORB_LABELS } from '../../src/types';

const ORB_STATES: OrbState[] = ['working', 'searching', 'solving', 'listening', 'composing', 'shaping'];

export interface DemoControlsProps {
  speed: number;
  paused: boolean;
  isSmall: boolean;
}

export function ReactDemo({ speed, paused, isSmall }: DemoControlsProps) {
  const [selectedState, setSelectedState] = useState<OrbState>('working');

  const codeSnippet = `import { ThinkingOrb } from 'thinking-orbs-universal/react';
import 'thinking-orbs-universal/demo/styles.css';

export function ReactAIStatus() {
  return (
    <div className="orb-pill">
      <ThinkingOrb state="${selectedState}" size={${isSmall ? 20 : 64}} speed={${speed}} ${paused ? 'paused ' : ''}/>
      <span className="t-shimmer" data-text="${ORB_LABELS[selectedState]}">
        ${ORB_LABELS[selectedState]}
      </span>
    </div>
  );
}`;

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
        <pre className="code-content">{codeSnippet}</pre>
      </div>
    </div>
  );
}

export default ReactDemo;

import { useState, useEffect } from 'react';
import { ReactDemo } from './react';
import VueWrapper from './vue/VueWrapper';
import { VanillaDemo } from './vanilla';

type FrameworkTab = 'react' | 'vue' | 'vanilla' | 'all';

export function App() {
  const [activeTab, setActiveTab] = useState<FrameworkTab>('all');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [speed, setSpeed] = useState<number>(1);
  const [paused, setPaused] = useState<boolean>(false);
  const [isSmall, setIsSmall] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="demo-app">
      {/* Header */}
      <header className="demo-header">
        <h1 className="demo-title">Thinking Orbs Universal</h1>
        <p className="demo-subtitle">
          Framework-agnostic AI thought orb indicators with animated text shimmer effects across React, Vue 3, and Vanilla JS API.
        </p>

        {/* Global Controls */}
        <div className="control-panel">
          <div className="control-group">
            <button className="btn" onClick={toggleTheme}>
              {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>
            <button className={`btn ${paused ? 'active' : ''}`} onClick={() => setPaused(!paused)}>
              {paused ? '▶️ Play' : '⏸️ Pause'}
            </button>
            <button className={`btn ${isSmall ? 'active' : ''}`} onClick={() => setIsSmall(!isSmall)}>
              {isSmall ? '📏 Inline (20px)' : '⭕ Large (64px)'}
            </button>
          </div>

          <div className="control-group">
            <span className="control-label">Speed ({speed.toFixed(2)}x)</span>
            <input
              type="range"
              min="0.25"
              max="3"
              step="0.25"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="slider-input"
            />
          </div>
        </div>

        {/* Framework Selection Tabs */}
        <div className="tab-container">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            🌐 All Demos
          </button>
          <button
            className={`tab-btn ${activeTab === 'react' ? 'active' : ''}`}
            onClick={() => setActiveTab('react')}
          >
            ⚛️ React Demo
          </button>
          <button
            className={`tab-btn ${activeTab === 'vue' ? 'active' : ''}`}
            onClick={() => setActiveTab('vue')}
          >
            🟢 Vue 3 Demo
          </button>
          <button
            className={`tab-btn ${activeTab === 'vanilla' ? 'active' : ''}`}
            onClick={() => setActiveTab('vanilla')}
          >
            ⚡ Vanilla JS API Demo
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main>
        {(activeTab === 'all' || activeTab === 'react') && (
          <section style={{ marginBottom: '2.5rem' }}>
            <ReactDemo speed={speed} paused={paused} isSmall={isSmall} />
          </section>
        )}

        {(activeTab === 'all' || activeTab === 'vue') && (
          <section style={{ marginBottom: '2.5rem' }}>
            <VueWrapper speed={speed} paused={paused} isSmall={isSmall} />
          </section>
        )}

        {(activeTab === 'all' || activeTab === 'vanilla') && (
          <section style={{ marginBottom: '2.5rem' }}>
            <VanillaDemo speed={speed} paused={paused} isSmall={isSmall} />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;

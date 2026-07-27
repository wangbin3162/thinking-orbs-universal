export { OrbController } from './core/OrbController';
export { mountOrb, type MountedOrbInstance } from './core/mount';
export { ThemeObserver } from './core/theme-observer';
export { ReducedMotionObserver } from './core/motion-observer';
export { resolveCSSVars, type CustomCSSVars } from './core/css-vars';
export { ThinkingOrbElement, registerThinkingOrbElement } from './web-component/ThinkingOrbElement';

export type { OrbOptions, OrbState, OrbSize, OrbTheme } from './types';
export { DEFAULT_ORB_OPTIONS, ORB_LABELS } from './types';

// Raw presets & engine draws for power users
export { resolvePreset, STATE_TO_MODE, type ModeKey, type Resolved } from './presets';
export { MODE_DRAWS } from './engine/registry';

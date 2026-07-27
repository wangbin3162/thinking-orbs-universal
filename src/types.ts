/**
 * The six shipped states — each a hand-tuned animation:
 * - `working`   — particles on tilted orbits
 * - `searching` — a scan meridian sweeps a dotted globe
 * - `solving`   — bands scramble in quarter turns, then click back
 * - `listening` — a waveform rolls through latitude rings
 * - `composing` — an undulating multi-band sash
 * - `shaping`   — a dotted outline morphs circle → triangle → square
 */
export type OrbState = 'working' | 'searching' | 'solving' | 'listening' | 'composing' | 'shaping';

/**
 * Rendered size in CSS pixels. Exactly two tuned presets ship:
 * 64 (chat-avatar scale) and 20 (inline-text scale).
 */
export type OrbSize = 64 | 20;

/**
 * Theme mode.
 * - `auto` (default) detects from ancestor `data-theme` / `.dark` / `.light` or `prefers-color-scheme`
 * - `dark` / `light` pin the palette regardless of context.
 */
export type OrbTheme = 'auto' | 'dark' | 'light';

/**
 * Core options for configuring an Orb instance.
 */
export interface OrbOptions {
  /** Which animation to show. @default 'working' */
  state?: OrbState;

  /** Tuned size preset — 64 or 20 CSS px. @default 64 */
  size?: OrbSize;

  /** Theme mode; `auto` detects from host project. @default 'auto' */
  theme?: OrbTheme;

  /** Animation speed multiplier. @default 1 */
  speed?: number;

  /** Freeze the animation on current frame. @default false */
  paused?: boolean;

  /** ARIA label override */
  ariaLabel?: string;
}

export const DEFAULT_ORB_OPTIONS: Required<Omit<OrbOptions, 'ariaLabel'>> = {
  state: 'working',
  size: 64,
  theme: 'auto',
  speed: 1,
  paused: false
};

export const ORB_LABELS: Record<OrbState, string> = {
  working: 'Working…',
  searching: 'Searching…',
  solving: 'Solving…',
  listening: 'Listening…',
  composing: 'Composing…',
  shaping: 'Shaping…'
};

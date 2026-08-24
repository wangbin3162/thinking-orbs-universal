// Engine-level contracts shared by every mode implementation.

import type { ModeOpts } from './profiles';

export type { Dot, RgbColor } from './core';

/** One frame painter: draws a mode into a 2D context at CSS-px `size`. */
export type ModeDraw = (
  ctx: CanvasRenderingContext2D,
  size: number,
  t: number,
  dark: boolean,
  opts: ModeOpts,
  /** Optional dot color; when omitted the mode falls back to grayscale. */
  color?: import('./core').RgbColor | null
) => void;

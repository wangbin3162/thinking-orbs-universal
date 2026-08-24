// Shared primitives for the dotted 3D thought-orbs. Ported from inkform
// (PlotterLab's HalftoneSphere lineage): honestly 3D — rotated,
// depth-shaded, z-sorted. Depth is carried by dot size and ink weight
// alone. Plain 2D canvas fills only: no ctx.filter, no SVG filters, so
// every mode renders identically in Chrome, Safari and Firefox.

export interface Dot {
  x: number;
  y: number;
  z: number;
  r: number;
  /** Ink value: 0 = darkest ink on paper. Mirrored on dark themes. */
  white: number;
  a?: number;
}

/** An RGB color (0-255 per channel) for the orb dots. */
export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export type Projector = (x: number, y: number, z: number) => [number, number, number];

/** Deterministic hash in [0, 1). */
export function hashD(a: number, b: number): number {
  const h = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return h - Math.floor(h);
}

/** Stable directions on a unit sphere (Fibonacci lattice). */
export function fibDir(i: number, n: number): [number, number, number] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (2 * (i + 0.5)) / n;
  const rad = Math.sqrt(1 - y * y);
  const a = i * golden;
  return [rad * Math.cos(a), y, rad * Math.sin(a)];
}

/** Shortest signed angular distance, wrapped to (-π, π]. */
export function angleDelta(a: number, b: number): number {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

/** Shared spin + tilt + orthographic projection. */
export function makeProj(yaw: number, tilt: number, cx: number, cy: number, scale: number): Projector {
  const st = Math.sin(tilt);
  const ct = Math.cos(tilt);
  const sy = Math.sin(yaw);
  const cyw = Math.cos(yaw);
  return (x, y, z) => {
    const x1 = x * cyw + z * sy;
    const z1 = -x * sy + z * cyw;
    const y1 = y * ct - z1 * st;
    const z2 = y * st + z1 * ct;
    return [cx + x1 * scale, cy - y1 * scale, z2];
  };
}

/**
 * Painter: z-sort far→near, matte dots. On dark substrates the ink value
 * is mirrored (1 - white) so near dots read bright — the same depth
 * language on an inverted substrate.
 *
 * When a `color` is provided, each dot is rendered as that color scaled by
 * its brightness (brightest dot = full color, darkest = black), keeping the
 * existing depth shading while allowing a custom hue. Without a color the
 * classic grayscale behavior is kept.
 */
export function paint(
  ctx: CanvasRenderingContext2D,
  dots: Dot[],
  dark: boolean,
  rMin = 0.3,
  color?: RgbColor | null
): void {
  dots.sort((a, b) => a.z - b.z);
  for (const d of dots) {
    const alpha = d.a ?? 1;
    if (alpha < 0.02) continue;
    const w = Math.min(1, Math.max(0, d.white));
    const brightness = dark ? 1 - w : w;
    if (color) {
      const r = Math.round(color.r * brightness);
      const g = Math.round(color.g * brightness);
      const b = Math.round(color.b * brightness);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    } else {
      const g = Math.round(brightness * 255);
      ctx.fillStyle = `rgba(${g},${g},${g},${alpha})`;
    }
    ctx.beginPath();
    ctx.arc(d.x, d.y, Math.max(rMin, d.r), 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Parses a CSS color string (`#rgb`, `#rrggbb`, `rgb()`/`rgba()`) to RGB. Returns null when unparseable. */
export function parseColor(value: string): RgbColor | null {
  const v = value.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v);
  if (hex) {
    const h = hex[1];
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
    };
  }
  const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(v);
  if (rgb) {
    return {
      r: Math.round(parseFloat(rgb[1])),
      g: Math.round(parseFloat(rgb[2])),
      b: Math.round(parseFloat(rgb[3])),
    };
  }
  return null;
}

/**
 * Dot radii were tuned for a 300pt frame; sub-linear scaling keeps small
 * spinners legible. Lower pow = radii shrink less with size.
 */
export function radiusScale(size: number, pow: number): number {
  return (size / 300) ** pow;
}

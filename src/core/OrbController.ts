import { MODE_DRAWS } from '../engine/registry';
import { resolvePreset } from '../presets';
import type { OrbOptions } from '../types';
import { DEFAULT_ORB_OPTIONS, ORB_LABELS } from '../types';
import { resolveCSSVars } from './css-vars';
import { ReducedMotionObserver } from './motion-observer';
import { ThemeObserver } from './theme-observer';

export class OrbController {
  private canvas: HTMLCanvasElement;
  private options: OrbOptions & typeof DEFAULT_ORB_OPTIONS;
  private themeObserver: ThemeObserver;
  private motionObserver: ReducedMotionObserver;
  private intersectionObserver: IntersectionObserver | null = null;

  private rafId: number = 0;
  private isRunning: boolean = false;
  private isVisible: boolean = true;
  private isDestroyed: boolean = false;

  private onVisibilityChangeHandler: () => void;

  constructor(canvas: HTMLCanvasElement, options?: OrbOptions) {
    this.canvas = canvas;
    this.options = { ...DEFAULT_ORB_OPTIONS, ...options };

    // Set aria role & label
    if (!this.canvas.getAttribute('role')) {
      this.canvas.setAttribute('role', 'img');
    }
    this.updateAriaLabel();

    this.motionObserver = new ReducedMotionObserver(() => {
      this.renderCurrentFrame();
    });

    this.themeObserver = new ThemeObserver(this.canvas, this.options.theme, () => {
      this.renderCurrentFrame();
    });

    this.onVisibilityChangeHandler = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        this.stop();
      } else if (this.isVisible) {
        this.start();
      }
    };

    this.initIntersectionObserver();
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.onVisibilityChangeHandler);
    }

    this.setupCanvasAndRender();
  }

  public updateOptions(newOptions: Partial<OrbOptions>): void {
    if (this.isDestroyed) return;

    this.options = { ...this.options, ...newOptions };
    this.updateAriaLabel();
    this.themeObserver?.updateTheme(this.options.theme, this.canvas);
    this.setupCanvasAndRender();
  }

  public destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    this.stop();
    this.themeObserver?.destroy();
    this.motionObserver?.destroy();

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.onVisibilityChangeHandler);
    }
  }

  private updateAriaLabel(): void {
    const label = this.options.ariaLabel || ORB_LABELS[this.options.state] || 'Loading...';
    this.canvas.setAttribute('aria-label', label);
  }

  private setupCanvasAndRender(): void {
    const cssVars = resolveCSSVars(this.canvas);
    const effectiveSize = cssVars.size ?? this.options.size;

    const dpr = Math.min(2, (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1);
    this.canvas.width = Math.round(effectiveSize * dpr);
    this.canvas.height = Math.round(effectiveSize * dpr);
    this.canvas.style.width = `${effectiveSize}px`;
    this.canvas.style.height = `${effectiveSize}px`;
    this.canvas.style.display = 'block';

    this.renderCurrentFrame();

    if (!this.options.paused && !this.motionObserver?.getIsReduced()) {
      this.start();
    } else {
      this.stop();
    }
  }

  private renderFrameAt(tSec: number): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    const cssVars = resolveCSSVars(this.canvas);
    const rawSize = cssVars.size ?? this.options.size;
    const size = typeof rawSize === 'number' && Number.isFinite(rawSize) && rawSize > 0 ? rawSize : 64;

    const dpr = Math.min(2, (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1);
    const { mode, opts } = resolvePreset(this.options.state, size);
    const draw = MODE_DRAWS[mode] || MODE_DRAWS.orbits;
    const isDark = this.themeObserver ? this.themeObserver.getResolvedDark() : true;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    const safeT = Number.isFinite(tSec) ? tSec : 0;
    draw(ctx, size, safeT, isDark, opts);
  }

  private renderCurrentFrame(): void {
    if (this.motionObserver?.getIsReduced()) {
      this.renderFrameAt(0.6);
      return;
    }

    const cssVars = resolveCSSVars(this.canvas);
    const rawSize = cssVars.size ?? this.options.size;
    const size = typeof rawSize === 'number' && Number.isFinite(rawSize) && rawSize > 0 ? rawSize : 64;
    const rawSpeed = cssVars.speed ?? this.options.speed;
    const speed = typeof rawSpeed === 'number' && Number.isFinite(rawSpeed) ? rawSpeed : 1;

    const { speed: baseSpeed } = resolvePreset(this.options.state, size);
    const effSpeed = (baseSpeed || 1) * speed;

    const tSec = (performance.now() / 1000) * effSpeed;
    this.renderFrameAt(tSec);
  }

  private loop = (): void => {
    if (!this.isRunning || this.isDestroyed) return;
    this.renderCurrentFrame();
    this.rafId = requestAnimationFrame(this.loop);
  };

  private start(): void {
    if (this.isRunning || this.options.paused || this.motionObserver?.getIsReduced() || this.isDestroyed) return;
    this.isRunning = true;
    this.rafId = requestAnimationFrame(this.loop);
  }

  private stop(): void {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private initIntersectionObserver(): void {
    if (typeof IntersectionObserver !== 'undefined') {
      this.intersectionObserver = new IntersectionObserver(([entry]) => {
        this.isVisible = entry.isIntersecting;
        if (this.isVisible && typeof document !== 'undefined' && document.visibilityState !== 'hidden') {
          this.start();
        } else {
          this.stop();
        }
      });
      this.intersectionObserver.observe(this.canvas);
    }
  }
}

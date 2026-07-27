/**
 * Framework-agnostic observer for `prefers-reduced-motion`.
 */
export class ReducedMotionObserver {
  private listener: ((e: MediaQueryListEvent) => void) | null = null;
  private isReduced = false;
  private onChange: (reduced: boolean) => void;

  constructor(onChange: (reduced: boolean) => void) {
    this.onChange = onChange;
    this.init();
  }

  public getIsReduced(): boolean {
    return this.isReduced;
  }

  private init(): void {
    if (typeof matchMedia === 'undefined') return;
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    this.isReduced = mq.matches;

    this.listener = (e: MediaQueryListEvent) => {
      this.isReduced = e.matches;
      this.onChange(this.isReduced);
    };
    mq.addEventListener('change', this.listener);
  }

  public destroy(): void {
    if (this.listener && typeof matchMedia !== 'undefined') {
      const mq = matchMedia('(prefers-reduced-motion: reduce)');
      mq.removeEventListener('change', this.listener);
    }
  }
}

import type { OrbTheme } from '../types';

function ancestorTheme(el: Element | null): boolean | null {
  let node: Element | null = el;
  while (node) {
    const attr = node.getAttribute('data-theme');
    if (attr === 'dark') return true;
    if (attr === 'light') return false;
    if (node.classList.contains('dark')) return true;
    if (node.classList.contains('light')) return false;
    node = node.parentElement;
  }
  return null;
}

function systemDark(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Framework-agnostic observer for theme changes.
 * Resolves theme mode: explicit prop -> ancestor data-theme / class -> prefers-color-scheme.
 */
export class ThemeObserver {
  private element: HTMLElement | null;
  private theme: OrbTheme;
  private onChange: (isDark: boolean) => void;
  private mediaQueryListener: (() => void) | null = null;
  private mutationObserver: MutationObserver | null = null;
  private isDark = true;

  constructor(element: HTMLElement | null, theme: OrbTheme, onChange: (isDark: boolean) => void) {
    this.element = element;
    this.theme = theme;
    this.onChange = onChange;
    this.init();
  }

  public updateTheme(newTheme: OrbTheme, newElement?: HTMLElement | null): void {
    if (newElement !== undefined) {
      this.element = newElement;
    }
    this.theme = newTheme;
    this.reevaluate();
  }

  public getResolvedDark(): boolean {
    return this.isDark;
  }

  private init(): void {
    this.reevaluate();

    if (typeof matchMedia !== 'undefined') {
      const mq = matchMedia('(prefers-color-scheme: dark)');
      this.mediaQueryListener = () => this.reevaluate();
      mq.addEventListener('change', this.mediaQueryListener);
    }

    if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
      this.mutationObserver = new MutationObserver(() => this.reevaluate());
      this.mutationObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme'],
        subtree: true
      });
    }
  }

  private reevaluate(): void {
    let nextDark = true;
    if (this.theme === 'dark') {
      nextDark = true;
    } else if (this.theme === 'light') {
      nextDark = false;
    } else {
      const fromTree = ancestorTheme(this.element);
      nextDark = fromTree ?? systemDark();
    }

    if (this.isDark !== nextDark) {
      this.isDark = nextDark;
      this.onChange(this.isDark);
    }
  }

  public destroy(): void {
    if (this.mediaQueryListener && typeof matchMedia !== 'undefined') {
      const mq = matchMedia('(prefers-color-scheme: dark)');
      mq.removeEventListener('change', this.mediaQueryListener);
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }
}

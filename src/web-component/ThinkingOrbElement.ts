import { OrbController } from '../core/OrbController';
import type { OrbOptions, OrbSize, OrbState, OrbTheme } from '../types';

export class ThinkingOrbElement extends HTMLElement {
  private canvas: HTMLCanvasElement;
  private controller: OrbController | null = null;

  static get observedAttributes() {
    return ['state', 'size', 'theme', 'speed', 'paused', 'aria-label'];
  }

  constructor() {
    super();
    this.canvas = document.createElement('canvas');
  }

  connectedCallback() {
    if (!this.style.display) {
      this.style.display = 'inline-flex';
      this.style.alignItems = 'center';
      this.style.justifyContent = 'center';
    }

    if (!this.contains(this.canvas)) {
      this.appendChild(this.canvas);
    }
    const options = this.getOptionsFromAttributes();
    this.controller = new OrbController(this.canvas, options);
    this.syncCanvasSize();
  }

  disconnectedCallback() {
    if (this.controller) {
      this.controller.destroy();
      this.controller = null;
    }
  }

  attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue || !this.controller) return;
    const options = this.getOptionsFromAttributes();
    this.controller.updateOptions(options);
    this.syncCanvasSize();
  }

  private syncCanvasSize(): void {
    if (this.style.width) {
      this.canvas.style.width = this.style.width;
    }
    if (this.style.height) {
      this.canvas.style.height = this.style.height;
    }
  }

  private getOptionsFromAttributes(): OrbOptions {
    const stateAttr = this.getAttribute('state') as OrbState | null;
    const sizeAttr = this.getAttribute('size');
    const themeAttr = this.getAttribute('theme') as OrbTheme | null;
    const speedAttr = this.getAttribute('speed');
    const pausedAttr = this.hasAttribute('paused');
    const ariaLabelAttr = this.getAttribute('aria-label');

    return {
      state: stateAttr || undefined,
      size: sizeAttr ? (parseInt(sizeAttr, 10) as OrbSize) : undefined,
      theme: themeAttr || undefined,
      speed: speedAttr ? parseFloat(speedAttr) : undefined,
      paused: pausedAttr,
      ariaLabel: ariaLabelAttr || undefined
    };
  }
}

/**
 * Register custom element `<thinking-orb>` if not already registered.
 */
export function registerThinkingOrbElement(tagName = 'thinking-orb') {
  if (typeof customElements !== 'undefined' && !customElements.get(tagName)) {
    customElements.define(tagName, ThinkingOrbElement);
  }
}

// Auto-register on import in browser environment
if (typeof customElements !== 'undefined') {
  registerThinkingOrbElement();
}

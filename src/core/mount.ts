import { OrbController } from './OrbController';
import type { OrbOptions } from '../types';

export interface MountedOrbInstance {
  controller: OrbController;
  canvas: HTMLCanvasElement;
  updateOptions: (newOptions: Partial<OrbOptions>) => void;
  destroy: () => void;
}

/**
 * Mount a ThinkingOrb on a canvas or container element.
 */
export function mountOrb(
  container: HTMLElement | HTMLCanvasElement,
  options?: OrbOptions
): MountedOrbInstance {
  let canvas: HTMLCanvasElement;

  if (container instanceof HTMLCanvasElement) {
    canvas = container;
  } else {
    canvas = document.createElement('canvas');
    container.appendChild(canvas);
  }

  const controller = new OrbController(canvas, options);

  return {
    controller,
    canvas,
    updateOptions: (opts) => controller.updateOptions(opts),
    destroy: () => {
      controller.destroy();
      if (!(container instanceof HTMLCanvasElement) && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  };
}

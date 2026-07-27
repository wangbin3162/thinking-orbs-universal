import React, { useEffect, useRef } from 'react';
import type { OrbOptions, OrbState, OrbSize, OrbTheme } from '../types';
import { OrbController } from '../core/OrbController';

export interface ThinkingOrbProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  state?: OrbState;
  size?: OrbSize;
  theme?: OrbTheme;
  speed?: number;
  paused?: boolean;
  ariaLabel?: string;
}

export const ThinkingOrb: React.FC<ThinkingOrbProps> = (props) => {
  const {
    state = 'working',
    size = 64,
    theme = 'auto',
    speed = 1,
    paused = false,
    ariaLabel,
    className,
    style,
    ...restProps
  } = props;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controllerRef = useRef<OrbController | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const controller = new OrbController(canvasRef.current, {
      state,
      size,
      theme,
      speed,
      paused,
      ariaLabel,
    });
    controllerRef.current = controller;

    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, []); // Run once on mount

  useEffect(() => {
    if (controllerRef.current) {
      const options: OrbOptions = {
        state,
        size,
        theme,
        speed,
        paused,
        ariaLabel,
      };
      controllerRef.current.updateOptions(options);
    }
  }, [state, size, theme, speed, paused, ariaLabel]);

  return <canvas ref={canvasRef} className={className} style={style} {...restProps} />;
};

export default ThinkingOrb;

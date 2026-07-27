import { useEffect, useRef } from 'react';
import { createApp, type App } from 'vue';
import VueDemo from './VueDemo.vue';

export interface VueWrapperProps {
  speed: number;
  paused: boolean;
  isSmall: boolean;
}

export function VueWrapper(props: VueWrapperProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<App | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      if (appRef.current) {
        appRef.current.unmount();
      }
      const app = createApp(VueDemo, {
        speed: props.speed,
        paused: props.paused,
        isSmall: props.isSmall,
      });
      app.mount(containerRef.current);
      appRef.current = app;
    }

    return () => {
      if (appRef.current) {
        appRef.current.unmount();
        appRef.current = null;
      }
    };
  }, [props.speed, props.paused, props.isSmall]);

  return <div ref={containerRef} />;
}

export default VueWrapper;

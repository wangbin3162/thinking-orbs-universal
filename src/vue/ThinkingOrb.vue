<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { OrbOptions } from '../types';
import type { ThinkingOrbProps } from './types';
import { OrbController } from '../core/OrbController';

const props = withDefaults(defineProps<ThinkingOrbProps>(), {
  state: 'working',
  size: 64,
  theme: 'auto',
  speed: 1,
  paused: false,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
let controller: OrbController | null = null;

onMounted(() => {
  if (canvasRef.value) {
    controller = new OrbController(canvasRef.value, {
      state: props.state,
      size: props.size,
      theme: props.theme,
      speed: props.speed,
      paused: props.paused,
      ariaLabel: props.ariaLabel,
    });
  }
});

watch(
  () => ({
    state: props.state,
    size: props.size,
    theme: props.theme,
    speed: props.speed,
    paused: props.paused,
    ariaLabel: props.ariaLabel,
  }),
  (newOptions: OrbOptions) => {
    if (controller) {
      controller.updateOptions(newOptions);
    }
  },
  { deep: true }
);

onUnmounted(() => {
  if (controller) {
    controller.destroy();
    controller = null;
  }
});
</script>

<template>
  <canvas ref="canvasRef" />
</template>

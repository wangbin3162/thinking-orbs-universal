<script setup lang="ts">
import { ref, computed } from 'vue';
import ThinkingOrb from '../../src/vue/ThinkingOrb.vue';
import type { OrbState } from '../../src/types';
import { ORB_LABELS } from '../../src/types';
import { highlightCode } from '../highlight';

const props = withDefaults(
  defineProps<{
    speed?: number;
    paused?: boolean;
    isSmall?: boolean;
  }>(),
  {
    speed: 1,
    paused: false,
    isSmall: false,
  }
);

const orbStates: OrbState[] = ['working', 'searching', 'solving', 'listening', 'composing', 'shaping'];
const selectedState = ref<OrbState>('working');

const codeSnippet = computed(() => {
  return `<template>
  <div class="orb-pill">
    <ThinkingOrb
      state="${selectedState.value}"
      :size="${props.isSmall ? 20 : 64}"
      :speed="${props.speed}"
      :paused="${props.paused}"
    />
    <span class="t-shimmer" data-text="${ORB_LABELS[selectedState.value]}">
      ${ORB_LABELS[selectedState.value]}
    </span>
  </div>
</template>

<script setup>
// 安装
// npm i thinking-orbs-universal
// (vue 为可选 peer 依赖)
import { ThinkingOrb } from 'thinking-orbs-universal/vue';
import 'thinking-orbs-universal/shimmer.css';
<\/script>

<style scoped>
/* 修改颜色 */
/* 1. 文字流光颜色：覆盖 .t-shimmer 上的 --shimmer-* 变量 */
.t-shimmer {
  --shimmer-base: #c7d2fe;       /* 静止文字颜色 */
  --shimmer-highlight: #ffffff;  /* 扫光高光颜色 */
}

/* 2. 小球颜色：覆盖 thinking-orb 上的 --orb-color-* 变量 */
thinking-orb {
  --orb-color-dark: #6366f1;   /* 深色背景小球颜色 */
  --orb-color-light: #4f46e5;  /* 浅色背景小球颜色 */
}
</style>`;
});

const highlightedCode = computed(() => highlightCode(codeSnippet.value, 'xml'));
</script>

<template>
  <div class="demo-section">
    <div class="section-title">
      <span>🟢 Vue 3 Component Examples (with Text Shimmer Effect)</span>
    </div>

    <!-- Grid of all 6 states rendered as AI pills with shimmering text -->
    <div class="demo-grid">
      <div
        v-for="st in orbStates"
        :key="st"
        class="demo-card"
        :class="{ selected: selectedState === st }"
        @click="selectedState = st"
        style="cursor: pointer"
      >
        <div class="demo-card-badge">Vue 3 SFC</div>
        <div class="orb-pill" :class="{ compact: isSmall }">
          <ThinkingOrb
            :state="st"
            :size="isSmall ? 20 : 64"
            :speed="speed"
            :paused="paused"
          />
          <!-- Text Shimmer Effect -->
          <span class="t-shimmer" :class="{ sm: isSmall }" :data-text="ORB_LABELS[st]">
            {{ ORB_LABELS[st] }}
          </span>
        </div>
      </div>
    </div>

    <!-- Code Snippet Box -->
    <div class="code-box">
      <div class="code-box-header">
        <span>Vue 3 Usage Code Snippet</span>
        <span>Vue SFC</span>
      </div>
      <pre class="code-content hljs language-xml" v-html="highlightedCode"></pre>
    </div>
  </div>
</template>

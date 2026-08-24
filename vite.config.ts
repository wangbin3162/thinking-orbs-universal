import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'path';

// 打包时把 src/shimmer.css 原样复制到 dist/shimmer.css，
// 供使用者通过 import 'thinking-orbs-universal/shimmer.css' 引入文字流光样式。
function copyShimmerCss(): Plugin {
  return {
    name: 'copy-shimmer-css',
    apply: 'build',
    async closeBundle() {
      const src = resolve(__dirname, 'src/shimmer.css');
      const dest = resolve(__dirname, 'dist/shimmer.css');
      await mkdir(dirname(dest), { recursive: true });
      await copyFile(src, dest);
    },
  };
}

export default defineConfig({
  plugins: [
    vue(),
    react(),
    dts({
      include: ['src'],
      insertTypesEntry: true,
    }),
    copyShimmerCss(),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'vue/index': resolve(__dirname, 'src/vue/index.ts'),
        'react/index': resolve(__dirname, 'src/react/index.ts'),
        'web-component/index': resolve(__dirname, 'src/web-component/index.ts'),
      },
    },
    rollupOptions: {
      external: ['vue', 'react', 'react-dom', 'react/jsx-runtime'],
      output: [
        {
          format: 'es',
          entryFileNames: '[name].js',
          dir: 'dist',
          exports: 'named',
          preserveModules: false,
        },
        {
          format: 'cjs',
          entryFileNames: '[name].cjs',
          dir: 'dist',
          exports: 'named',
          preserveModules: false,
        },
      ],
    },
  },
});

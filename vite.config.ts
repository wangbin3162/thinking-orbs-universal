import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    react(),
    dts({
      include: ['src'],
      insertTypesEntry: true,
    }),
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

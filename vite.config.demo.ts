import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// base 设为仓库子路径,GitHub Pages 项目站点默认在
// https://<user>.github.io/thinking-orbs-universal/ 下发布。
// 若改用自定义域名或根路径部署,把 base 改回 '/'。
export default defineConfig({
  root: resolve(__dirname, '.'),
  base: '/thinking-orbs-universal/',
  plugins: [vue(), react()],
  build: {
    outDir: resolve(__dirname, 'docs'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
});

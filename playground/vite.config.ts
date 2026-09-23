import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@fluid-loading/core': path.resolve(__dirname, '../packages/core/src/index.ts'),
      '@fluid-loading/react': path.resolve(__dirname, '../packages/react/src/index.ts'),
      '@fluid-loading/styles': path.resolve(__dirname, '../packages/styles/fluid.css'),
    },
  },
  server: {
    port: 3000,
  },
});

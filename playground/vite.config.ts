import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@fluid-loading/core/styles.css': path.resolve(__dirname, '../packages/core/styles.css'),
      '@fluid-loading/core': path.resolve(__dirname, '../packages/core/src/index.ts'),
      '@fluid-loading/react': path.resolve(__dirname, '../packages/react/src/index.ts'),
    },
  },
  server: {
    port: 3000,
  },
});

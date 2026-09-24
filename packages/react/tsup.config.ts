import { defineConfig } from 'tsup';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', '@fluid-loading/core'],
  banner: ({ format }) => {
    if (format === 'esm') {
      return { js: 'import "./styles.css";' };
    }
    return {};
  },
  onSuccess: async () => {
    const coreCss = fileURLToPath(import.meta.resolve('@fluid-loading/core/styles.css'));
    fs.copyFileSync(coreCss, 'dist/styles.css');
  },
});

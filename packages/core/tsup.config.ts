import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    styles: 'src/styles.css',
  },
  format: ['esm', 'cjs'],
  dts: {
    entry: 'src/index.ts',
  },
  sourcemap: true,
  clean: true,
});

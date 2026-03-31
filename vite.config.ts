import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AnimatedGallery',
      formats: ['es', 'cjs'],
      fileName: (format) =>
        format === 'es' ? 'animated-gallery.js' : 'animated-gallery.cjs',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        assetFileNames: 'animated-gallery.[ext]',
      },
    },
    sourcemap: true,
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves this project at https://paolinache47-prog.github.io/busuu/
// so production assets must be requested from /busuu/. Dev server stays at /.
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/busuu/' : '/',
  plugins: [react()],
  server: { port: 5180 },
  preview: { port: 5181 },
}));

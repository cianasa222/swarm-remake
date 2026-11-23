import { defineConfig } from 'vite';

export default defineConfig(async () => ({
  plugins: [(await import('@tailwindcss/vite')).default()],
  base: './',
  build: {
    outDir: 'dist',
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
  },
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
}));

import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      root: process.cwd(),
      server: {
        port: 3000,
        host: '127.0.0.1',
        middlewareMode: false,
        proxy: {
          '/api': {
            target: 'http://127.0.0.1:8001',
            changeOrigin: true,
          },
          '/auth': {
            target: 'http://127.0.0.1:8001',
            changeOrigin: true,
          },
          '/creative': {
            target: 'http://127.0.0.1:8001',
            changeOrigin: true,
          },
          '/admin': {
            target: 'http://127.0.0.1:8001',
            changeOrigin: true,
          },
          '/assistants': {
            target: 'http://127.0.0.1:8001',
            changeOrigin: true,
          }
        }
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

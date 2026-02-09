import type { Config } from 'vite';
import react from '@vitejs/plugin-react';

const config: Config = {
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
};

export default config;

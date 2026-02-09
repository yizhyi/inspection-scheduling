import type { Config } from 'vite';
import react from '@vitejs/plugin-react';

const config: Config = {
  plugins: [react()],
  server: {
    host: '0.0.0.0',
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

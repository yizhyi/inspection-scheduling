import type { Config } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        allowedHosts: ['.monkeycode-ai.online']
      }
    },
    allowedHosts: ['.monkeycode-ai.online']
  }
});

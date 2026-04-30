import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // This intercepts requests to '/opensky-api' and forwards them to OpenSky, bypassing CORS
    proxy: {
      '/opensky-api': {
        target: 'https://opensky-network.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/opensky-api/, '')
      }
    }
  }
});
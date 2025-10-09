import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    cors: true,
    host: true,
    proxy: {
      '/api/obras': {
        target: 'https://visorestrategicobackend-gkejc4hthnace6b4.eastus2-01.azurewebsites.net',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/obras/, '/api/powerbi/obras'),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, _req, _res) => {
            // Agregar headers necesarios
            proxyReq.setHeader('Accept', 'application/json');
            proxyReq.setHeader('User-Agent', 'ProyectoGraficos/1.0');
            proxyReq.setHeader('X-API-KEY', 'pow3rb1_visor_3str4t3g1co_2025');
          });
        },
      },
    },
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});

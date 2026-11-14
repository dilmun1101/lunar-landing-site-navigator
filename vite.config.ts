import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));

// Horizons does not send CORS headers, so the browser calls its own origin
// and Vite forwards the request to JPL. Works in `npm run dev` and `npm run preview`.
const horizonsProxy = {
  '/horizons-api': {
    target: 'https://ssd.jpl.nasa.gov',
    changeOrigin: true,
    rewrite: (path: string) =>
      path.replace(/^\/horizons-api/, '/api/horizons.api'),
  },
};

// The USGS web map service (LOLA elevations) has no CORS headers either: same approach.
const lolaProxy = {
  '/usgs-wms': {
    target: 'https://planetarymaps.usgs.gov',
    changeOrigin: true,
    rewrite: (path: string) =>
      path.replace(
        /^\/usgs-wms\??/,
        '/cgi-bin/mapserv?map=/maps/earth/moon_simp_cyl_elev.map&'
      ),
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],

  base: './',

  resolve: {
    alias: {
      '@': srcDir,
    },
  },

  server: { proxy: { ...horizonsProxy, ...lolaProxy } },
  preview: { proxy: { ...horizonsProxy, ...lolaProxy } },

  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    passWithNoTests: true,
  },
});

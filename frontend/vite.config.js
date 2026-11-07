import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_API_URL points at the backend (see docs/handoff/ai-api.md).
// In dev, /api is proxied to it so the browser never sees CORS issues.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: process.env.VITE_API_URL
      ? { '/api': { target: process.env.VITE_API_URL, changeOrigin: true } }
      : undefined,
  },
}));

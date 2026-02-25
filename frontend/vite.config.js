import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // <-- use root for Render deployment
  server: {
    // Proxy API calls to backend during development so frontend can use
    // relative paths like `/api/auth/register` without CORS issues.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    },
    hmr: {
      overlay: false
    }
  }
})

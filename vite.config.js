import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  cacheDir: '.vite-cache',
  server: {
    host: '0.0.0.0',
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})

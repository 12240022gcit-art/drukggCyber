// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'
// import { defineConfig } from 'vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   cacheDir: '.vite-cache',
//   server: {
//     host: '0.0.0.0',
//     strictPort: true,
//     proxy: {
//       '/api': 'http://localhost:4000',
//     },
//   },
// })
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
  preview: {
    host: '0.0.0.0',
    allowedHosts: ['drukggcyber.onrender.com', '.onrender.com'],
  },
})

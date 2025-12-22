import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    compression({ algorithm: 'gzip' })
  ],
  server: {
    port: 5175, 
    proxy: {
      '/api': {
        target: 'https://forme-k06z.onrender.com',
        changeOrigin: true,
        secure: true,
        // Bu qator backend endpointlaringizda /api prefiksi bo'lmasa juda muhim
        rewrite: (path) => path.replace(/^\/api/, ''), 
      },
    },
  },
  build: {
    // Agar terser o'rnatilmagan bo'lsa, bu qatorni olib tashlang yoki 'esbuild' ishlating
    minify: 'esbuild', 
    chunkSizeWarningLimit: 1000, // Katta fayllar uchun ogohlantirish limitini oshirish
  }
})
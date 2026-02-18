import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    emptyOutDir: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'i18n-vendor': ['i18next', 'react-i18next'],
          'ui-vendor': ['lucide-react', '@heroicons/react', 'react-icons'],
          'swiper-vendor': ['swiper'],
        }
      }
    }
  }
})
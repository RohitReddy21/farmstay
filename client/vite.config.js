import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const googlePopupHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: googlePopupHeaders
  },
  preview: {
    headers: googlePopupHeaders
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
          charts: ['recharts'],
          calendar: ['react-date-range', 'react-calendar'],
          utils: ['axios', 'date-fns']
        }
      }
    }
  }
})

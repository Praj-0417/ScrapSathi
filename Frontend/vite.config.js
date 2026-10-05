import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react'
            }
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'vendor-maps'
            }
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'vendor-charts'
            }
            if (id.includes('@heroicons') || id.includes('lucide-react') || id.includes('react-icons')) {
              return 'vendor-icons'
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion'
            }
            return 'vendor-misc'
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})

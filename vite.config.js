import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          // Recharts (grafiklar) - alohida bo'lak
          'recharts': ['recharts'],
          // Firebase - alohida bo'lak
          'firebase': ['firebase/app', 'firebase/firestore'],
          // React - alohida bo'lak
          'react-vendor': ['react', 'react-dom']
        }
      }
    }
  }
})

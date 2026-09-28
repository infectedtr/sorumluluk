import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false
  },
  build: {
    chunkSizeWarningLimit: 600,
    minify: 'esbuild',
    target: 'esnext',
    rollupOptions: {
      treeshake: true,
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-anime': ['animejs'],
          'vendor-xlsx': ['xlsx'],
          'vendor-icons': ['lucide-react']
        }
      }
    }
  }
})


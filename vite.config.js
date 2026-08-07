import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Standart React SPA sozlamasi.
// Yagona kirish nuqtasi — loyiha ildizidagi index.html (Vite'ning standart holati).
// Boshqa kirish nuqtalari (rollupOptions.input) qo'shilmasin.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
})

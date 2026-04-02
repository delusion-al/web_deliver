import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/web_deliver/', // Synchronized with package.json homepage
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

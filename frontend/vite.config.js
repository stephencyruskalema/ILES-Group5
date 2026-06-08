import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Explicitly ignore the problematic directories
      ignored: ['**/node_modules/**', '**/env/**', '**/dist/**'],
    },
  },
})
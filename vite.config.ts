import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return
          }
          // Keep React runtime together to avoid vendor ↔ react cycles.
          if (
            /node_modules[/\\](react|react-dom|scheduler)[/\\]/.test(id)
          ) {
            return 'react'
          }
          if (id.includes('@dnd-kit')) {
            return 'dnd-kit'
          }
          if (id.includes('@radix-ui')) {
            return 'radix'
          }
          if (id.includes('lucide-react')) {
            return 'icons'
          }
          if (id.includes('react-day-picker') || id.includes('date-fns')) {
            return 'dates'
          }
          if (id.includes('zustand') || id.includes('immer')) {
            return 'state'
          }
          return 'vendor'
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    passWithNoTests: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
  },
})

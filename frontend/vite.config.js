import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/**/*.test.{js,jsx}',
        'src/test/**',
        'src/main.jsx',
        'src/**/Button.jsx',
        'src/**/useMercureSubscription.js',
      ],
      thresholds: {
        lines: 90,
        functions: 75,
        statements: 90,
        branches: 70,
      },
    },
  },
})

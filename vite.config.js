import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Portfolio/CV project, no proprietary secrets in the bundle - readable
    // prod source maps trade a small amount of source exposure for being
    // able to actually debug a production error from its stack trace.
    sourcemap: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/tests/setup.js",
    globals: true,
  },
})

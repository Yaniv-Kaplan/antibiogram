/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from https://yaniv-kaplan.github.io/antibiogram/ on GitHub Pages, so
// production assets need the repo-name base path. Dev/preview stay at root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/antibiogram/' : '/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
}))

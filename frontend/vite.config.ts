import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {

  return {
    plugins: [react()],
    base: `/`,
    build: {
      outDir: `dist`,
      assetsDir: 'assets',
    },
    preview: {
      port: 3000,
    },
    server: {
      port: 3000,
    },
  }
})
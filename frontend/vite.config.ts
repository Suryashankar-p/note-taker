import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {

  const basePath = 'genaistudio'

  return {
    plugins: [react()],
    base: `/${basePath}/`,
    build: {
      outDir: `dist/${basePath}`,
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
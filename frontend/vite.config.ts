// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   base: '/api2/',
//   preview: {
//     port: 3000
//   },
//   server: {
//     port: 3000,
//   },
// })
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const basePath = env.VITE_ROOT_PATH || 'genaistudio'

  return {
    plugins: [react()],
    base: `/${basePath}/`,
    build: {
      outDir: `dist/${basePath}`, // dynamic output folder
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
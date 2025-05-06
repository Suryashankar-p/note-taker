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
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/genaistudio/',
  build: {
    outDir: 'dist/genaistudio',     // put all built files under /genaistudio/
    assetsDir: 'assets',     // keeps assets in /genaistudio/assets
  },
  preview: {
    port: 3000
  },
  server: {
    port: 3000
  }
})

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

console.log("VITE_BACKEND_SSO_URL at build:", process.env.VITE_BACKEND_SSO_URL);
console.log("VITE_BACKEND:", process.env);
export default defineConfig({
  plugins: [react()],
  base: '/api2/',
  build: {
    outDir: 'dist/api2',     // put all built files under /api2/
    assetsDir: 'assets',     // keeps assets in /api2/assets
  },
  preview: {
    port: 3000
  },
  server: {
    port: 3000
  }
})

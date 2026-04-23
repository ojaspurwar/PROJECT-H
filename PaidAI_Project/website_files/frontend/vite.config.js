import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true // This allows Cloudflare Tunnels (and any other host) to access the Dev server
  }
})

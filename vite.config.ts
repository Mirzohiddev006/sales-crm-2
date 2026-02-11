import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    allowedHosts: [
      'uncanonical-chantelle-winningly.ngrok-free.dev',
      '.ngrok-free.dev',
      '.ngrok.io',
      '.trycloudflare.com',
      'localhost',
    ],
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// One-off build config for deploying only the About page as its own
// Cloudflare Pages site, separate from the main uxfirm project.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-about',
    rollupOptions: { input: resolve(__dirname, 'about.html') },
  },
})

import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        links: resolve(__dirname, 'links.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/gsap')) return 'gsap'
          if (id.includes('node_modules/@supabase')) return 'supabase'
        },
      },
    },
  },
})

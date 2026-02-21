import { defineConfig } from 'vite'

export default defineConfig({
  // Base path for GitHub Pages (repo name)
  base: '/KDashX3/',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    
    // Ensure clean build
    emptyOutDir: true,
    
    // Rollup options for SPA
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  
  // Development server
  server: {
    port: 3000,
    open: true
  },
  
  // Preview server (for testing build)
  preview: {
    port: 4173
  }
})

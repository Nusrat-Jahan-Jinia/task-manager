import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: !isProd, // Only enable source maps in development
      minify: isProd, // Ensure minification in production
      rollupOptions: {
        output: {
          manualChunks: isProd ? {
            vendor: ['react', 'react-dom', 'react-router-dom'], // Split vendor chunks in production
          } : undefined,
        },
      },
    },
    server: {
      port: 3000,
      host: true,
      strictPort: true,
      watch: {
        usePolling: !isProd // Only use polling in development
      }
    },
    publicDir: 'public',
  };
});

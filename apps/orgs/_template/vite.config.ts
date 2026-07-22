import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

const configPath = path.resolve(__dirname, './org.config.json');
const orgConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: orgConfig.apiUrl || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    open: false, // Prevent auto-opening browser to avoid conflicts
    strictPort: true, // Fail if port is already in use
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import visora from 'visora-vite-plugin';

export default defineConfig({
  plugins: [react(), visora()],
});

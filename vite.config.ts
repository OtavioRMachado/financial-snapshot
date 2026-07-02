import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

declare const process: { env: Record<string, string | undefined> };

// The base URL prefix. Local dev uses '/', GitHub Pages sets this via the
// VITE_BASE_PATH env in the deploy workflow (e.g. '/financial-tracker/').
const base = process.env.VITE_BASE_PATH ?? '/';

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    port: 5173,
    open: true,
  },
});

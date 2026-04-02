import { defineConfig } from 'astro/config'; // Trigger Build
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://astro.build/config
export default defineConfig({
  site: 'https://delusion-al.github.io',
  base: '/web_deliver/',
  integrations: [react()],
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  },
});

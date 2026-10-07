// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://trangtoan.so1.asia',

  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 3000
  },

  integrations: [react(), sitemap()],

  devToolbar: {
    enabled: false
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ['react', 'react-dom']
    },
    optimizeDeps: {
      exclude: ['@astrojs/react']
    }
  }
});

import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'rujira.ui': resolve(
        __dirname,
        './node_modules/rujira.ui/packages/rujira.ui/src/index',
      ),
      'rujira.js': resolve(
        __dirname,
        './node_modules/rujira.ui/packages/rujira.js/dist/index',
      ),
    },
  },
})

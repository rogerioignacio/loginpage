import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@schema-converter/pages',
        replacement: path.resolve(__dirname, '../schemaConverter/frontend/src/schemaConverterPages.js'),
      },
      {
        find: '@schema-converter',
        replacement: path.resolve(__dirname, '../schemaConverter/frontend/src/App.jsx'),
      },
    ],
    dedupe: ['react', 'react-dom'],
  },
  server: {
    fs: {
      allow: [
        __dirname,
        path.resolve(__dirname, '../schemaConverter/frontend'),
      ],
    },
  },
})

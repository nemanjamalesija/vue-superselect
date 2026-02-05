import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

const repoRoot = path.resolve(__dirname, '..')

export default defineConfig({
  root: __dirname,
  plugins: [vue()],
  resolve: {
    alias: {
      'vue-superselect': path.resolve(repoRoot, 'src/index.ts'),
    },
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
  define: {
    __DEV__: 'true',
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
})

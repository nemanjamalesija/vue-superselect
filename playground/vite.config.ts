import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

const repoRoot = path.resolve(__dirname, '..')
const rootVuePath = path.resolve(
  repoRoot,
  'node_modules/vue/dist/vue.runtime.esm-bundler.js',
)

export default defineConfig({
  root: __dirname,
  plugins: [vue()],
  resolve: {
    dedupe: ['vue'],
    alias: {
      vue: rootVuePath,
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

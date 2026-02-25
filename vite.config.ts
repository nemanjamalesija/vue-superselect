import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import dts from 'unplugin-dts/vite'
import { vitePure } from 'unplugin-pure'
import MagicString from 'magic-string'
import type { Plugin } from 'vite'

const DEV_PLACEHOLDER = '__VUE_SUPERSELECT_DEV__'
const DEV_RUNTIME = '(process.env.NODE_ENV !== "production")'

function devWarningPlugin(): Plugin {
  return {
    name: 'vue-superselect:dev-warnings',
    apply: 'build',
    enforce: 'pre',
    config() {
      return {
        define: {
          __DEV__: DEV_PLACEHOLDER,
        },
      }
    },
    renderChunk(code) {
      if (!code.includes(DEV_PLACEHOLDER)) return null
      const s = new MagicString(code)
      const pattern = new RegExp(DEV_PLACEHOLDER, 'g')
      let match
      while ((match = pattern.exec(code)) !== null) {
        s.overwrite(match.index, match.index + DEV_PLACEHOLDER.length, DEV_RUNTIME)
      }
      return { code: s.toString(), map: s.generateMap({ hires: true }) }
    },
  }
}

export default defineConfig({
  plugins: [
    vue(),
    vitePure({
      functions: ['defineComponent'],
      sourcemap: true,
      rollupOrder: 'post',
    }),
    dts({
      tsconfigPath: './tsconfig.app.json',
    }),
    devWarningPlugin(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueSuperselect',
      fileName: 'vue-superselect',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', '@floating-ui/vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
    sourcemap: true,
  },
  define: {
    __DEV__: 'true',
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
  },
})

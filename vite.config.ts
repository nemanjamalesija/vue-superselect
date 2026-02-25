import { resolve, join } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import dts from 'unplugin-dts/vite'
import { vitePure } from 'unplugin-pure'
import MagicString from 'magic-string'
import type { Plugin } from 'vite'

const DEV_PLACEHOLDER = '__VUE_SUPERSELECT_DEV__'
const DEV_RUNTIME = '(process.env.NODE_ENV !== "production")'

function cjsPureAnnotationPlugin(): Plugin {
  return {
    name: 'vue-superselect:cjs-pure-annotations',
    apply: 'build',
    writeBundle(options, bundle) {
      const outDir = options.dir || 'dist'
      for (const fileName of Object.keys(bundle)) {
        if (!fileName.endsWith('.cjs')) continue

        const filePath = join(outDir, fileName)
        const code = readFileSync(filePath, 'utf-8')

        const pattern = /(?<!\* )\b(\w+)\.defineComponent\s*\(/g
        let match
        const matches: RegExpExecArray[] = []
        while ((match = pattern.exec(code)) !== null) {
          matches.push(match)
        }

        if (matches.length === 0) continue

        const s = new MagicString(code)
        for (const m of matches) {
          s.appendLeft(m.index, '/* @__PURE__ */ ')
        }

        writeFileSync(filePath, s.toString())

        const mapPath = filePath + '.map'
        try {
          const existingMap = JSON.parse(readFileSync(mapPath, 'utf-8'))
          const newMap = s.generateMap({ source: existingMap.file, hires: true })
          writeFileSync(mapPath, JSON.stringify(newMap))
        } catch {
          // No existing sourcemap to update
        }
      }
    },
  }
}

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
      bundleTypes: true,
    }),
    devWarningPlugin(),
    cjsPureAnnotationPlugin(),
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

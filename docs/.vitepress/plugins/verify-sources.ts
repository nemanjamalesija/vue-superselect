import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { SiteConfig } from 'vitepress'

const __dirname_ = dirname(fileURLToPath(import.meta.url))

/**
 * Extracts export names from the library source index.ts file.
 * Parses export statements to find all named exports.
 */
function getActualExports(): string[] {
  const indexPath = resolve(__dirname_, '../../../src/index.ts')
  const source = readFileSync(indexPath, 'utf-8')
  const exports: string[] = []

  // Match: export { Name } from '...'
  const reExportBrace = /export\s*\{([^}]+)\}\s*from/g
  let match: RegExpExecArray | null
  while ((match = reExportBrace.exec(source)) !== null) {
    const names = match[1].split(',').map((s) => s.trim())
    for (const name of names) {
      // Handle "Type as Alias" patterns - skip type-only exports
      const cleaned = name.replace(/^type\s+/, '')
      if (!cleaned) continue
      // Take the exported name (or alias)
      const parts = cleaned.split(/\s+as\s+/)
      const exportName = (parts.length > 1 ? parts[1] : parts[0]).trim()
      if (exportName) exports.push(exportName)
    }
  }

  // Match: export { Name }  (without from - re-exports from local)
  // This pattern is less common in the codebase, skip for now

  return exports
}

/**
 * Extracts documented component and composable names from API markdown files.
 */
function getDocumentedExports(docsDir: string): string[] {
  const documented: string[] = []

  // Parse components API page
  try {
    const componentsPath = resolve(docsDir, 'api/components.md')
    const componentsContent = readFileSync(componentsPath, 'utf-8')

    // Match ## SelectXxx headers
    const componentHeaders = componentsContent.matchAll(/^## (Select\w+)/gm)
    for (const m of componentHeaders) {
      documented.push(m[1])
    }
  } catch {
    // File might not exist yet
  }

  // Parse composable API page
  try {
    const composablePath = resolve(docsDir, 'api/composable.md')
    const composableContent = readFileSync(composablePath, 'utf-8')

    // Match useSelect reference
    if (/useSelect/.test(composableContent)) {
      documented.push('useSelect')
    }
  } catch {
    // File might not exist yet
  }

  return documented
}

/**
 * VitePress buildEnd hook that verifies documentation matches
 * the actual library source exports.
 *
 * - Fails the build if a documented export does not exist in the source
 * - Warns if an actual export is not documented
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function verifySourcesPlugin(_siteConfig: SiteConfig): Promise<void> {
  const docsDir = resolve(__dirname_, '../../')
  const actualExports = getActualExports()
  const documentedExports = getDocumentedExports(docsDir)

  const errors: string[] = []
  const warnings: string[] = []

  // Key exports that should be documented (components + composable)
  const keyExports = actualExports.filter(
    (name) => name.startsWith('Select') || name === 'useSelect',
  )

  // Check: every documented export must exist in source
  for (const name of documentedExports) {
    if (!actualExports.includes(name)) {
      errors.push(`Documented export "${name}" not found in source`)
    }
  }

  // Check: key exports that are not documented
  for (const name of keyExports) {
    if (!documentedExports.includes(name)) {
      // useSelectContext is intentionally undocumented (debug tooling)
      if (name === 'useSelectContext') continue
      warnings.push(`Export "${name}" is not documented`)
    }
  }

  // Print summary
  const documented = documentedExports.filter((d) => actualExports.includes(d)).length
  const total = keyExports.length
  console.log(
    `\n  Source verification: ${documented}/${total} key exports documented`,
  )

  if (warnings.length > 0) {
    console.log(`  Warnings:`)
    for (const w of warnings) {
      console.log(`    - ${w}`)
    }
  }

  if (errors.length > 0) {
    console.error(`  Errors:`)
    for (const e of errors) {
      console.error(`    - ${e}`)
    }
    throw new Error(
      `Source verification failed: ${errors.length} documented export(s) not found in source`,
    )
  }

  console.log(`  Source verification passed\n`)
}

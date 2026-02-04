import { mergeProps as vueMergeProps } from 'vue'

export function mergeProps(
  ...args: Array<Record<string, unknown>>
): Record<string, unknown> {
  const merged = vueMergeProps(...args)

  for (const key of Object.keys(merged)) {
    if (key.startsWith('on') && Array.isArray(merged[key])) {
      merged[key] = merged[key].filter((handler) => typeof handler === 'function')
    }
  }

  return merged
}

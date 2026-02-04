import { useId as vueUseId } from 'vue'

export function useId(deterministicId?: string): string {
  if (deterministicId !== undefined) {
    return deterministicId
  }

  return vueUseId()
}

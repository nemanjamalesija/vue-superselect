import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useKeyboard } from './useKeyboard'
import type { CollectionItem } from './useCollection'

describe('useKeyboard', () => {
  const createItems = () =>
    ref<CollectionItem<string>[]>([
      { id: 'a', value: 'Apple', label: 'Apple', disabled: false },
      { id: 'b', value: 'Banana', label: 'Banana', disabled: true },
      { id: 'c', value: 'Cherry', label: 'Cherry', disabled: false },
    ])

  it('moves with ArrowDown/ArrowUp and skips disabled items', () => {
    const items = createItems()
    const { activeId, onKeyDown } = useKeyboard({ items })

    const event = (key: string) => ({ key, preventDefault: vi.fn() })

    onKeyDown(event('ArrowDown'))
    expect(activeId.value).toBe('a')

    onKeyDown(event('ArrowDown'))
    expect(activeId.value).toBe('c')

    onKeyDown(event('ArrowUp'))
    expect(activeId.value).toBe('a')
  })

  it('jumps to first/last enabled item with Home/End', () => {
    const items = createItems()
    const { activeId, onKeyDown } = useKeyboard({ items })

    const event = (key: string) => ({ key, preventDefault: vi.fn() })

    onKeyDown(event('End'))
    expect(activeId.value).toBe('c')

    onKeyDown(event('Home'))
    expect(activeId.value).toBe('a')
  })

  it('wraps by default', () => {
    const items = createItems()
    const { activeId, onKeyDown } = useKeyboard({ items })

    const event = (key: string) => ({ key, preventDefault: vi.fn() })

    onKeyDown(event('ArrowUp'))
    expect(activeId.value).toBe('c')

    onKeyDown(event('ArrowDown'))
    expect(activeId.value).toBe('a')
  })

  it('does not wrap when loop is false', () => {
    const items = createItems()
    const { activeId, onKeyDown } = useKeyboard({ items, loop: false })

    const event = (key: string) => ({ key, preventDefault: vi.fn() })

    onKeyDown(event('ArrowUp'))
    expect(activeId.value).toBe('c')

    onKeyDown(event('ArrowUp'))
    expect(activeId.value).toBe('a')

    onKeyDown(event('ArrowDown'))
    expect(activeId.value).toBe('c')

    onKeyDown(event('ArrowDown'))
    expect(activeId.value).toBe('c')
  })
})

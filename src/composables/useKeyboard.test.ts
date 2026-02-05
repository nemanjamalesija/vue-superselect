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

  it('calls onSelect with the active item on Enter', () => {
    const items = createItems()
    const onSelect = vi.fn()
    const { onKeyDown } = useKeyboard({ items, onSelect })

    const event = (key: string) => ({ key, preventDefault: vi.fn() })

    // Navigate to first item, then press Enter
    onKeyDown(event('ArrowDown'))
    onKeyDown(event('Enter'))

    expect(onSelect).toHaveBeenCalledOnce()
    expect(onSelect).toHaveBeenCalledWith(items.value[0])
  })

  it('does not call onSelect on Enter when no item is active', () => {
    const items = createItems()
    const onSelect = vi.fn()
    const { onKeyDown } = useKeyboard({ items, onSelect })

    const event = (key: string) => ({ key, preventDefault: vi.fn() })

    onKeyDown(event('Enter'))

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('does not call onSelect on Enter for a disabled item', () => {
    const items = ref<CollectionItem<string>[]>([
      { id: 'a', value: 'Apple', label: 'Apple', disabled: true },
    ])
    const onSelect = vi.fn()
    const activeId = ref<string | null>('a')
    const { onKeyDown } = useKeyboard({ items, onSelect, activeId })

    const event = (key: string) => ({ key, preventDefault: vi.fn() })

    onKeyDown(event('Enter'))

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('prevents default on Enter only when an active item exists', () => {
    const items = createItems()
    const onSelect = vi.fn()
    const { onKeyDown } = useKeyboard({ items, onSelect })

    const noActiveEvent = { key: 'Enter', preventDefault: vi.fn() }
    onKeyDown(noActiveEvent)
    expect(noActiveEvent.preventDefault).not.toHaveBeenCalled()

    const event = (key: string) => ({ key, preventDefault: vi.fn() })
    onKeyDown(event('ArrowDown'))

    const activeEvent = { key: 'Enter', preventDefault: vi.fn() }
    onKeyDown(activeEvent)
    expect(activeEvent.preventDefault).toHaveBeenCalledOnce()
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

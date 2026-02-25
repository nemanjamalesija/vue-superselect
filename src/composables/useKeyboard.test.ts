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

  it('calls onEscape on Escape key', () => {
    const items = createItems()
    const onEscape = vi.fn()
    const { onKeyDown } = useKeyboard({ items, onEscape })

    const event = { key: 'Escape', preventDefault: vi.fn() }
    onKeyDown(event)

    expect(onEscape).toHaveBeenCalledOnce()
    expect(event.preventDefault).toHaveBeenCalledOnce()
  })

  describe('Backspace handling', () => {
    it('calls onRemoveLast when Backspace is pressed', () => {
      const onRemoveLast = vi.fn()
      const { onKeyDown } = useKeyboard({
        items: ref([]),
        onRemoveLast,
      })

      onKeyDown({ key: 'Backspace', preventDefault: vi.fn() })

      expect(onRemoveLast).toHaveBeenCalledOnce()
    })

    it('does not throw when Backspace is pressed without callback', () => {
      const { onKeyDown } = useKeyboard({
        items: ref([]),
      })

      expect(() => {
        onKeyDown({ key: 'Backspace', preventDefault: vi.fn() })
      }).not.toThrow()
    })

    it('does not prevent default for Backspace', () => {
      const preventDefault = vi.fn()
      const { onKeyDown } = useKeyboard({
        items: ref([]),
        onRemoveLast: vi.fn(),
      })

      onKeyDown({ key: 'Backspace', preventDefault })

      expect(preventDefault).not.toHaveBeenCalled()
    })
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

  it('stays at index 0 with loop=false and ArrowUp from first item', () => {
    const items = ref<CollectionItem<string>[]>([
      { id: 'a', value: 'Apple', label: 'Apple', disabled: false },
      { id: 'b', value: 'Banana', label: 'Banana', disabled: false },
    ])
    const { activeId, onKeyDown } = useKeyboard({ items, loop: false })

    const event = (key: string) => ({ key, preventDefault: vi.fn() })

    onKeyDown(event('ArrowDown'))
    expect(activeId.value).toBe('a')

    onKeyDown(event('ArrowUp'))
    expect(activeId.value).toBe('a')
  })

  it('setActiveById with non-existent id sets activeId to null', () => {
    const items = createItems()
    const { activeId, setActiveById, onKeyDown } = useKeyboard({ items })

    const event = (key: string) => ({ key, preventDefault: vi.fn() })
    onKeyDown(event('ArrowDown'))
    expect(activeId.value).toBe('a')

    setActiveById('nonexistent')
    expect(activeId.value).toBeNull()
  })

  it('setActiveById with null sets activeId to null', () => {
    const items = createItems()
    const { activeId, setActiveById, onKeyDown } = useKeyboard({ items })

    const event = (key: string) => ({ key, preventDefault: vi.fn() })
    onKeyDown(event('ArrowDown'))
    expect(activeId.value).toBe('a')

    setActiveById(null)
    expect(activeId.value).toBeNull()
  })

  it('calls onEscapeSecond when Escape is pressed while isOpen is false', () => {
    const items = createItems()
    const isOpen = ref(false)
    const onEscape = vi.fn()
    const onEscapeSecond = vi.fn()

    const { onKeyDown } = useKeyboard({ items, isOpen, onEscape, onEscapeSecond })

    onKeyDown({ key: 'Escape', preventDefault: vi.fn() })

    expect(onEscape).not.toHaveBeenCalled()
    expect(onEscapeSecond).toHaveBeenCalledOnce()
  })

  it('calls onEscape when isOpen is not provided (backward compat)', () => {
    const items = createItems()
    const onEscape = vi.fn()

    const { onKeyDown } = useKeyboard({ items, onEscape })

    const event = { key: 'Escape', preventDefault: vi.fn() }
    onKeyDown(event)

    expect(onEscape).toHaveBeenCalledOnce()
    expect(event.preventDefault).toHaveBeenCalledOnce()
  })

  it('handles empty items list without crashing', () => {
    const items = ref<CollectionItem<string>[]>([])
    const { activeId, onKeyDown } = useKeyboard({ items })

    const event = (key: string) => ({ key, preventDefault: vi.fn() })

    onKeyDown(event('ArrowDown'))
    expect(activeId.value).toBeNull()

    onKeyDown(event('ArrowUp'))
    expect(activeId.value).toBeNull()
  })
})

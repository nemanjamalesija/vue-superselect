import { describe, expect, it, vi } from 'vitest'
import { mergeProps } from './mergeProps'

describe('mergeProps', () => {
  it('merges non-overlapping keys', () => {
    const merged = mergeProps({ id: 'one' }, { role: 'button' })
    expect(merged.id).toBe('one')
    expect(merged.role).toBe('button')
  })

  it('concatenates class strings', () => {
    const merged = mergeProps({ class: 'a' }, { class: 'b' })
    const classValue = merged.class

    if (Array.isArray(classValue)) {
      expect(classValue).toContain('a')
      expect(classValue).toContain('b')
    } else {
      expect(String(classValue)).toContain('a')
      expect(String(classValue)).toContain('b')
    }
  })

  it('merges event handlers additively', () => {
    const fn1 = vi.fn()
    const fn2 = vi.fn()

    const merged = mergeProps({ onClick: fn1 }, { onClick: fn2 })
    const handler = merged.onClick as unknown

    if (Array.isArray(handler)) {
      handler.forEach((fn) => (fn as () => void)())
    } else if (typeof handler === 'function') {
      handler()
    }

    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(1)
  })

  it('filters out undefined handlers from arrays', () => {
    const fn = vi.fn()
    const merged = mergeProps({ onClick: undefined }, { onClick: fn })
    const handler = merged.onClick as unknown

    if (Array.isArray(handler)) {
      expect(handler.every((item) => typeof item === 'function')).toBe(true)
    } else {
      expect(typeof handler).toBe('function')
    }
  })

  it('handles empty objects without errors', () => {
    const merged = mergeProps({}, {})
    expect(merged).toEqual({})
  })

  it('last-wins for non-special props', () => {
    const merged = mergeProps({ id: 'first' }, { id: 'second' })
    expect(merged.id).toBe('second')
  })
})

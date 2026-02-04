import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { createContext } from './createContext'

describe('createContext', () => {
  it('provides and injects context successfully', () => {
    interface TestContext {
      value: string
    }

    const [injectTest, provideTest] = createContext<TestContext>('TestRoot')

    const Child = defineComponent({
      setup() {
        const ctx = injectTest()
        return { ctx }
      },
      template: '<span>{{ ctx.value }}</span>',
    })

    const Parent = defineComponent({
      setup() {
        provideTest({ value: 'hello' })
      },
      render() {
        return h(Child)
      },
    })

    const wrapper = mount(Parent)
    expect(wrapper.text()).toBe('hello')
  })

  it('throws descriptive error when injected outside provider', () => {
    interface TestContext {
      value: string
    }

    const [injectTest] = createContext<TestContext>('TestRoot')

    const Orphan = defineComponent({
      setup() {
        injectTest()
      },
      template: '<div />',
    })

    expect(() => mount(Orphan)).toThrow('must be used within')
  })

  it('includes component name in error message', () => {
    interface TestContext {
      value: string
    }

    const [injectTest] = createContext<TestContext>('SelectRoot')

    const Orphan = defineComponent({
      setup() {
        injectTest()
      },
      template: '<div />',
    })

    expect(() => mount(Orphan)).toThrow('SelectRoot')
  })

  it('includes multiple component names when root is an array', () => {
    interface TestContext {
      value: string
    }

    const [injectTest] = createContext<TestContext>(['SelectRoot', 'SelectGroup'])

    const Orphan = defineComponent({
      setup() {
        injectTest()
      },
      template: '<div />',
    })

    expect(() => mount(Orphan)).toThrow('SelectRoot or SelectGroup')
  })

  it('returns fallback when provided instead of throwing', () => {
    interface TestContext {
      value: string
    }

    const [injectTest] = createContext<TestContext>('TestRoot')

    const Orphan = defineComponent({
      setup() {
        const ctx = injectTest({ value: 'fallback' })
        return { ctx }
      },
      template: '<span>{{ ctx.value }}</span>',
    })

    const wrapper = mount(Orphan)
    expect(wrapper.text()).toBe('fallback')
  })

  it('uses contextName in error message when provided', () => {
    interface TestContext {
      value: string
    }

    const [injectTest] = createContext<TestContext>('SelectRoot', 'SelectContext')

    const Orphan = defineComponent({
      setup() {
        injectTest()
      },
      template: '<div />',
    })

    expect(() => mount(Orphan)).toThrow('SelectContext')
  })
})

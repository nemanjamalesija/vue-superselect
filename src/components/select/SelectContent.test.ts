import { defineComponent, ref } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SelectRoot } from './SelectRoot'
import { SelectControl } from './SelectControl'
import { SelectInput } from './SelectInput'
import { SelectContent } from './SelectContent'
import { SelectOption } from './SelectOption'

type SelectValue = string | null
const FLOATING_UI_OVERRIDE_KEY = '__VUE_SUPERSELECT_FLOATING_UI_MODULE__'

const options = [
  { id: 'a', value: 'Apple', label: 'Apple' },
  { id: 'b', value: 'Banana', label: 'Banana' },
]

const mountSelect = (contentProps = '') =>
  mount(defineComponent({
    components: {
      SelectRoot,
      SelectControl,
      SelectInput,
      SelectContent,
      SelectOption,
    },
    setup() {
      const value = ref<SelectValue>(null)
      return { value, options }
    },
    template: `
      <SelectRoot v-model="value" id="select">
        <SelectControl>
          <SelectInput />
        </SelectControl>
        <SelectContent ${contentProps}>
          <SelectOption
            v-for="opt in options"
            :key="opt.id"
            :id="opt.id"
            :value="opt.value"
            :label="opt.label"
          />
        </SelectContent>
      </SelectRoot>
    `,
  }))

const openListbox = async (wrapper: VueWrapper) => {
  const input = wrapper.find('input')
  await input.setValue('')
}

const getTeleportedListbox = () =>
  document.body.querySelector('[role="listbox"]') as HTMLElement | null

const setFloatingUIOverride = (value: unknown) => {
  const host = globalThis as {
    __VUE_SUPERSELECT_FLOATING_UI_MODULE__?: unknown
  }
  host[FLOATING_UI_OVERRIDE_KEY] = value
}

const clearFloatingUIOverride = () => {
  const host = globalThis as {
    __VUE_SUPERSELECT_FLOATING_UI_MODULE__?: unknown
  }
  delete host[FLOATING_UI_OVERRIDE_KEY]
}

beforeEach(() => {
  // Keep these component tests deterministic regardless of local optional deps.
  setFloatingUIOverride(null)
})

afterEach(() => {
  clearFloatingUIOverride()
  document.body.innerHTML = ''
})

describe('SelectContent', () => {
  it('applies listbox ARIA attributes when open', async () => {
    const wrapper = mountSelect()

    await openListbox(wrapper)

    const listbox = wrapper.find('ul')
    expect(listbox.attributes('role')).toBe('listbox')
    expect(listbox.attributes('id')).toBe('select-listbox')

    wrapper.unmount()
  })

  describe('positioning', () => {
    it('applies CSS fallback styles when Floating UI is unavailable', async () => {
      const wrapper = mountSelect()

      await openListbox(wrapper)

      const listbox = wrapper.find('ul').element as HTMLElement
      expect(listbox.style.position).toBe('absolute')
      expect(listbox.style.top).toBe('100%')
      expect(listbox.style.left).toBe('0px')
      expect(listbox.style.width).toBe('100%')

      wrapper.unmount()
    })

    it('sets data-side and data-align defaults', async () => {
      const wrapper = mountSelect()

      await openListbox(wrapper)

      const listbox = wrapper.find('ul')
      expect(listbox.attributes('data-side')).toBe('bottom')
      expect(listbox.attributes('data-align')).toBe('start')

      wrapper.unmount()
    })

    it('respects forceAbsolute and stays in fallback mode', async () => {
      const wrapper = mountSelect('forceAbsolute')

      await openListbox(wrapper)

      const listbox = wrapper.find('ul').element as HTMLElement
      expect(listbox.style.position).toBe('absolute')
      expect(listbox.style.top).toBe('100%')
      expect(listbox.getAttribute('data-side')).toBe('bottom')
      expect(listbox.getAttribute('data-align')).toBe('start')

      wrapper.unmount()
    })

    it('reflects custom placement in data-side and data-align in fallback mode', async () => {
      const wrapper = mountSelect('placement="top-end"')

      await openListbox(wrapper)

      const listbox = wrapper.find('ul').element as HTMLElement
      expect(listbox.style.position).toBe('absolute')
      expect(listbox.style.top).toBe('100%')
      expect(listbox.getAttribute('data-side')).toBe('top')
      expect(listbox.getAttribute('data-align')).toBe('end')

      wrapper.unmount()
    })

    it('accepts collisionStrategy prop without leaking it to DOM attributes', async () => {
      const wrapper = mountSelect('collisionStrategy="none"')

      await openListbox(wrapper)

      const listbox = wrapper.find('ul')
      expect(listbox.attributes('collisionstrategy')).toBeUndefined()
      expect((listbox.element as HTMLElement).style.top).toBe('100%')

      wrapper.unmount()
    })
  })

  describe('teleport', () => {
    it('does not teleport by default', async () => {
      const wrapper = mountSelect()

      await openListbox(wrapper)

      const localListbox = wrapper.find('ul')
      expect(localListbox.exists()).toBe(true)
      expect(wrapper.element.contains(localListbox.element)).toBe(true)

      wrapper.unmount()
    })

    it('teleports content to body when teleport is true', async () => {
      const wrapper = mountSelect(':teleport="true"')

      await openListbox(wrapper)

      const localListbox = wrapper.find('ul')
      expect(localListbox.exists()).toBe(false)

      const teleportedListbox = getTeleportedListbox()
      expect(teleportedListbox).not.toBeNull()
      expect(teleportedListbox?.getAttribute('role')).toBe('listbox')
      expect(teleportedListbox?.getAttribute('id')).toBe('select-listbox')

      wrapper.unmount()
    })

    it('teleports content to custom selector', async () => {
      const target = document.createElement('div')
      target.id = 'dropdown-target'
      document.body.appendChild(target)

      const wrapper = mountSelect('teleport="#dropdown-target"')

      await openListbox(wrapper)

      const teleportedListbox = target.querySelector('[role="listbox"]')
      expect(teleportedListbox).not.toBeNull()
      expect(wrapper.find('ul').exists()).toBe(false)

      wrapper.unmount()
      target.remove()
    })

    it('preserves selection behavior across teleport boundary', async () => {
      const wrapper = mountSelect(':teleport="true"')

      await openListbox(wrapper)

      const teleportedOption = document.body.querySelector('#select-option-a')
      expect(teleportedOption).not.toBeNull()
      await (teleportedOption as HTMLElement).click()

      expect(wrapper.vm.value).toBe('Apple')

      wrapper.unmount()
    })

    it('warns in dev when teleport and forceAbsolute are combined', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const wrapper = mountSelect(':teleport="true" forceAbsolute')

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Using teleport with forceAbsolute disables smart positioning'),
      )

      warnSpy.mockRestore()
      wrapper.unmount()
    })
  })
})

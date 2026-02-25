import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SelectRoot } from './SelectRoot'
import { SelectContent } from './SelectContent'
import { SelectOption } from './SelectOption'
import { SelectInput } from './SelectInput'
import { SelectControl } from './SelectControl'
import { SelectTag } from './SelectTag'
import { useSelectContext } from './selectContext'

const ContextProbe = defineComponent({
  name: 'ContextProbe',
  setup() {
    const ctx = useSelectContext<unknown>()
    return () =>
      h('div', {
        'data-open': ctx.isOpen.value ? '1' : '0',
        'data-query': ctx.query.value,
      })
  },
})

describe('SelectRoot', () => {
  it('provides context to children', () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, ContextProbe },
      template: '<SelectRoot><ContextProbe /></SelectRoot>',
    }))

    const probe = wrapper.find('[data-open]')
    expect(probe.exists()).toBe(true)
    expect(probe.attributes('data-open')).toBe('0')
  })

  it('exposes programmatic control', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, ContextProbe },
      setup() {
        const selectRef = ref<null | { open: () => void; close: () => void; toggle: () => void }>(
          null,
        )
        return { selectRef }
      },
      template: '<SelectRoot ref="selectRef"><ContextProbe /></SelectRoot>',
    }))

    const instance = wrapper.vm.selectRef as {
      open: () => void
      close: () => void
      toggle: () => void
    }

    const probe = wrapper.find('[data-open]')
    expect(probe.attributes('data-open')).toBe('0')
    instance.open()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-open]').attributes('data-open')).toBe('1')
    instance.toggle()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-open]').attributes('data-open')).toBe('0')
    instance.close()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-open]').attributes('data-open')).toBe('0')
  })

  it('emits array values with v-model in multi-select mode', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectContent, SelectOption },
      setup() {
        const value = ref<string[]>([])
        const options = [
          { id: 'a', value: 'Apple', label: 'Apple' },
          { id: 'b', value: 'Banana', label: 'Banana' },
        ]
        return { value, options }
      },
      template: `
        <SelectRoot v-model="value" multiple :defaultOpen="true" id="multi-select">
          <SelectContent>
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

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const options = wrapper.findAll('[role="option"]')
    expect(options).toHaveLength(2)

    await options[0].trigger('click')
    expect(wrapper.vm.value).toEqual(['Apple'])

    await options[1].trigger('click')
    expect(wrapper.vm.value).toEqual(['Apple', 'Banana'])
  })

  it('sets aria-multiselectable on listbox when multiple is true', () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectContent, SelectOption },
      template: `
        <SelectRoot multiple :defaultOpen="true" id="multi-select">
          <SelectContent>
            <SelectOption id="a" value="Apple" label="Apple" />
          </SelectContent>
        </SelectRoot>
      `,
    }))

    const listbox = wrapper.find('[role="listbox"]')
    expect(listbox.attributes('aria-multiselectable')).toBe('true')
  })

  it('renders dropdown with positioning styles when open', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectControl, SelectInput, SelectContent, SelectOption },
      setup() {
        const value = ref<string | null>(null)
        return { value }
      },
      template: `
        <SelectRoot v-model="value" id="positioning-select">
          <SelectControl>
            <SelectInput />
          </SelectControl>
          <SelectContent>
            <SelectOption id="a" value="Apple" label="Apple" />
          </SelectContent>
        </SelectRoot>
      `,
    }))

    const input = wrapper.find('input')
    await input.setValue('')

    const listbox = wrapper.find('[role="listbox"]').element as HTMLElement
    expect(listbox.style.position).toBe('absolute')
    expect(listbox.getAttribute('data-side')).toBe('bottom')
    expect(listbox.getAttribute('data-align')).toBe('start')
  })

  it('warns in dev when multiple is true and modelValue is not an array', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(SelectRoot, {
      props: {
        multiple: true,
        modelValue: 'not-an-array',
      },
    })

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('v-model must be an array'),
    )

    warnSpy.mockRestore()
  })

  it('warns in dev when max is used in single-select mode', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(SelectRoot, {
      props: {
        max: 2,
      },
    })

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('`max`'))

    warnSpy.mockRestore()
  })

  it('warns in dev when hideSelected is used in single-select mode', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(SelectRoot, {
      props: {
        hideSelected: true,
      },
    })

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('`hideSelected`'))

    warnSpy.mockRestore()
  })

  describe('Backspace removal', () => {
    it('removes the last selected value on Backspace when query is empty', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput },
        setup() {
          const value = ref(['Apple', 'Banana', 'Cherry'])
          return { value }
        },
        template: `
          <SelectRoot v-model="value" multiple id="multi-select">
            <SelectInput />
          </SelectRoot>
        `,
      }))

      const input = wrapper.find('input')
      await input.trigger('keydown', { key: 'Backspace' })

      expect(wrapper.vm.value).toEqual(['Apple', 'Banana'])
    })

    it('does not remove selected values on Backspace when query has text', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput },
        setup() {
          const value = ref(['Apple', 'Banana'])
          return { value }
        },
        template: `
          <SelectRoot v-model="value" multiple id="multi-select">
            <SelectInput />
          </SelectRoot>
        `,
      }))

      const input = wrapper.find('input')
      await input.setValue('ba')
      await input.trigger('keydown', { key: 'Backspace' })

      expect(wrapper.vm.value).toEqual(['Apple', 'Banana'])
    })
  })

  describe('dismiss behavior', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('closes dropdown on focusout to outside element', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref<string | null>(null)
          return { value }
        },
        template: `
          <div>
            <SelectRoot v-model="value" :defaultOpen="true" id="dismiss-test">
              <SelectInput />
              <SelectContent>
                <SelectOption id="a" value="Apple" label="Apple" />
              </SelectContent>
            </SelectRoot>
            <button id="outside">Outside</button>
          </div>
        `,
      }))

      await wrapper.vm.$nextTick()
      expect(wrapper.find('[role="listbox"]').exists()).toBe(true)

      const input = wrapper.find('input')
      const outsideBtn = wrapper.find('#outside').element

      await input.trigger('focusout', { relatedTarget: outsideBtn })
      vi.advanceTimersByTime(16)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    })

    it('clicking an option does not dismiss (selects and closes normally)', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref<string | null>(null)
          return { value }
        },
        template: `
          <SelectRoot v-model="value" :defaultOpen="true" id="click-opt-test">
            <SelectInput />
            <SelectContent>
              <SelectOption id="a" value="Apple" label="Apple" />
              <SelectOption id="b" value="Banana" label="Banana" />
            </SelectContent>
          </SelectRoot>
        `,
      }))

      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const options = wrapper.findAll('[role="option"]')
      expect(options).toHaveLength(2)

      await options[0].trigger('click')

      expect(wrapper.vm.value).toBe('Apple')
      expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    })

    it('focus loss preserves selected values in multi-select', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref<string[]>(['Apple', 'Banana'])
          return { value }
        },
        template: `
          <div>
            <SelectRoot v-model="value" multiple :defaultOpen="true" id="multi-dismiss">
              <SelectInput />
              <SelectContent>
                <SelectOption id="a" value="Apple" label="Apple" />
                <SelectOption id="b" value="Banana" label="Banana" />
                <SelectOption id="c" value="Cherry" label="Cherry" />
              </SelectContent>
            </SelectRoot>
            <button id="outside">Outside</button>
          </div>
        `,
      }))

      await wrapper.vm.$nextTick()
      const input = wrapper.find('input')
      const outsideBtn = wrapper.find('#outside').element

      await input.trigger('focusout', { relatedTarget: outsideBtn })
      vi.advanceTimersByTime(16)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
      expect(wrapper.vm.value).toEqual(['Apple', 'Banana'])
    })

    it('focus loss restores label in single-select', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref<string | null>(null)
          return { value }
        },
        template: `
          <div>
            <SelectRoot v-model="value" id="single-restore">
              <SelectInput />
              <SelectContent>
                <SelectOption id="a" value="Apple" label="Apple" />
                <SelectOption id="b" value="Banana" label="Banana" />
              </SelectContent>
            </SelectRoot>
            <button id="outside">Outside</button>
          </div>
        `,
      }))

      const input = wrapper.find('input')

      await input.setValue('')
      await wrapper.vm.$nextTick()

      const options = wrapper.findAll('[role="option"]')
      await options[0].trigger('click')
      expect(wrapper.vm.value).toBe('Apple')

      await input.setValue('')
      await wrapper.vm.$nextTick()

      await input.setValue('ban')
      await wrapper.vm.$nextTick()

      const outsideBtn = wrapper.find('#outside').element
      await input.trigger('focusout', { relatedTarget: outsideBtn })
      vi.advanceTimersByTime(16)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.value).toBe('Apple')
      expect(input.element.value).toBe('Apple')
    })

    it('dismiss does not select highlighted option', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref<string | null>(null)
          return { value }
        },
        template: `
          <div>
            <SelectRoot v-model="value" :defaultOpen="true" id="no-auto-select">
              <SelectInput />
              <SelectContent>
                <SelectOption id="a" value="Apple" label="Apple" />
                <SelectOption id="b" value="Banana" label="Banana" />
              </SelectContent>
            </SelectRoot>
            <button id="outside">Outside</button>
          </div>
        `,
      }))

      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const input = wrapper.find('input')
      await input.trigger('keydown', { key: 'ArrowDown' })

      const outsideBtn = wrapper.find('#outside').element
      await input.trigger('focusout', { relatedTarget: outsideBtn })
      vi.advanceTimersByTime(16)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.value).toBeNull()
      expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    })

    it('outside click closes after removing a tag with remove button', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectControl, SelectTag, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref<string[]>(['Apple', 'Banana'])
          return { value }
        },
        template: `
          <div>
            <SelectRoot v-model="value" multiple :defaultOpen="true" id="tag-dismiss">
              <SelectControl v-slot="{ selectedItems, removeItem }">
                <SelectTag
                  v-for="item in selectedItems"
                  :key="String(item.value)"
                  :value="item.value"
                  :label="item.label"
                  @remove="removeItem(item.value)"
                />
                <SelectInput />
              </SelectControl>
              <SelectContent>
                <SelectOption id="a" value="Apple" label="Apple" />
                <SelectOption id="b" value="Banana" label="Banana" />
                <SelectOption id="c" value="Cherry" label="Cherry" />
              </SelectContent>
            </SelectRoot>
            <button id="outside">Outside</button>
          </div>
        `,
      }))

      await wrapper.vm.$nextTick()
      expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
      expect(wrapper.findAll('[data-part="tag"]')).toHaveLength(2)

      const firstRemoveButton = wrapper.find('[data-part="remove"]')
      await firstRemoveButton.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.value).toEqual(['Banana'])
      expect(wrapper.findAll('[data-part="tag"]')).toHaveLength(1)

      const control = wrapper.find('#tag-dismiss')
      const outsideButton = wrapper.find('#outside').element
      await control.trigger('focusout', { relatedTarget: outsideButton })
      vi.advanceTimersByTime(16)
      await wrapper.vm.$nextTick()

      expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    })
  })

  describe('max and hideSelected', () => {
    it('keeps options visible but disables unselected ones at max', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref(['Apple', 'Banana'])
          const options = [
            { id: 'a', value: 'Apple', label: 'Apple' },
            { id: 'b', value: 'Banana', label: 'Banana' },
            { id: 'c', value: 'Cherry', label: 'Cherry' },
          ]
          return { value, options }
        },
        template: `
          <SelectRoot v-model="value" multiple :max="2" :defaultOpen="true" id="multi-select">
            <SelectInput />
            <SelectContent>
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

      await wrapper.vm.$nextTick()

      const options = wrapper.findAll('[role="option"]')
      expect(options).toHaveLength(3)

      const optionCherry = wrapper.find('#multi-select-option-c')
      expect(optionCherry.attributes('aria-disabled')).toBe('true')
      expect(optionCherry.attributes('data-disabled')).toBe('true')

      await optionCherry.trigger('click')
      expect(wrapper.vm.value).toEqual(['Apple', 'Banana'])
    })

    it('hides selected options when hideSelected is true', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref(['Apple'])
          const options = [
            { id: 'a', value: 'Apple', label: 'Apple' },
            { id: 'b', value: 'Banana', label: 'Banana' },
          ]
          return { value, options }
        },
        template: `
          <SelectRoot v-model="value" multiple hideSelected :defaultOpen="true" id="multi-select">
            <SelectInput />
            <SelectContent>
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

      await wrapper.vm.$nextTick()

      expect(wrapper.find('#multi-select-option-a').exists()).toBe(false)
      expect(wrapper.find('#multi-select-option-b').exists()).toBe(true)
    })

    it('reacts to hideSelected prop updates at runtime', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref(['Apple'])
          const hideSelected = ref(false)
          const options = [
            { id: 'a', value: 'Apple', label: 'Apple' },
            { id: 'b', value: 'Banana', label: 'Banana' },
          ]
          return { value, hideSelected, options }
        },
        template: `
          <SelectRoot
            v-model="value"
            multiple
            :hideSelected="hideSelected"
            :defaultOpen="true"
            id="multi-select"
          >
            <SelectInput />
            <SelectContent>
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

      await wrapper.vm.$nextTick()
      expect(wrapper.find('#multi-select-option-a').exists()).toBe(true)

      wrapper.vm.hideSelected = true
      await wrapper.vm.$nextTick()

      expect(wrapper.find('#multi-select-option-a').exists()).toBe(false)
      expect(wrapper.find('#multi-select-option-b').exists()).toBe(true)
    })
  })

  describe('items/key pipeline', () => {
    it('items prop renders options via v-for with correct labels', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref<number | null>(null)
          const items = [
            { id: 1, name: 'Apple' },
            { id: 2, name: 'Banana' },
          ]
          return { value, items }
        },
        template: `
          <SelectRoot
            v-model="value"
            :items="items"
            label-key="name"
            value-key="id"
            :defaultOpen="true"
            id="items-test"
          >
            <SelectInput />
            <SelectContent>
              <SelectOption
                v-for="item in items"
                :key="item.id"
                :value="item"
                :label="item.name"
              />
            </SelectContent>
          </SelectRoot>
        `,
      }))

      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const options = wrapper.findAll('[role="option"]')
      expect(options).toHaveLength(2)
      expect(options[0].text()).toContain('Apple')
      expect(options[1].text()).toContain('Banana')
    })

    it('label-key and value-key emit extracted field value on selection', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref<number | null>(null)
          const items = [
            { id: 1, name: 'Apple' },
            { id: 2, name: 'Banana' },
          ]
          return { value, items }
        },
        template: `
          <SelectRoot
            v-model="value"
            :items="items"
            label-key="name"
            value-key="id"
            :defaultOpen="true"
            id="key-test"
          >
            <SelectInput />
            <SelectContent>
              <SelectOption
                v-for="item in items"
                :key="item.id"
                :value="item"
                :label="item.name"
              />
            </SelectContent>
          </SelectRoot>
        `,
      }))

      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const options = wrapper.findAll('[role="option"]')
      await options[0].trigger('click')

      expect(wrapper.vm.value).toBe(1)
    })

    it('DX-05 warns when value-key does not exist on items', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      mount(SelectRoot, {
        props: {
          items: [{ id: 1, name: 'Apple' }],
          valueKey: 'nonexistent',
        },
      })

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('does not exist'),
      )

      warnSpy.mockRestore()
    })

    it('no DX-05 warning when value-key is valid', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      mount(SelectRoot, {
        props: {
          items: [{ id: 1, name: 'Apple' }],
          valueKey: 'id',
        },
      })

      const valueKeyWarnings = warnSpy.mock.calls.filter(
        (call) => typeof call[0] === 'string' && call[0].includes('value-key'),
      )
      expect(valueKeyWarnings).toHaveLength(0)

      warnSpy.mockRestore()
    })

    it('DX-05 warns when label-key does not exist on items', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      mount(SelectRoot, {
        props: {
          items: [{ id: 1, name: 'Apple' }],
          labelKey: 'nonexistent',
        },
      })

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('label-key'),
      )

      warnSpy.mockRestore()
    })

    it('primitive items work without key props', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref<string | null>(null)
          const items = ['a', 'b', 'c']
          return { value, items }
        },
        template: `
          <SelectRoot
            v-model="value"
            :items="items"
            :defaultOpen="true"
            id="primitive-test"
          >
            <SelectInput />
            <SelectContent>
              <SelectOption
                v-for="item in items"
                :key="item"
                :value="item"
                :label="item"
              />
            </SelectContent>
          </SelectRoot>
        `,
      }))

      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const options = wrapper.findAll('[role="option"]')
      await options[0].trigger('click')

      expect(wrapper.vm.value).toBe('a')
    })

    it('tags resolve labels from root items when content is closed', async () => {
      const ResolveProbe = defineComponent({
        name: 'ResolveProbe',
        setup() {
          const ctx = useSelectContext<unknown>()
          return () => {
            const values = Array.isArray(ctx.value.value) ? ctx.value.value : []
            return h('div', { 'data-part': 'tags' }, values.map((v: unknown) =>
              h(SelectTag, {
                key: String(v),
                value: v,
                label: ctx.resolveLabel(v) ?? String(v),
              }),
            ))
          }
        },
      })

      const wrapper = mount(defineComponent({
        components: { SelectRoot, ResolveProbe },
        setup() {
          const value = ref([1, 2])
          const items = [
            { id: 1, name: 'Apple' },
            { id: 2, name: 'Banana' },
            { id: 3, name: 'Cherry' },
          ]
          return { value, items }
        },
        template: `
          <SelectRoot
            v-model="value"
            multiple
            :items="items"
            label-key="name"
            value-key="id"
            id="tag-resolve"
          >
            <ResolveProbe />
          </SelectRoot>
        `,
      }))

      await wrapper.vm.$nextTick()

      const tags = wrapper.findAll('[data-part="tag"]')
      expect(tags).toHaveLength(2)
      expect(tags[0].text()).toContain('Apple')
      expect(tags[1].text()).toContain('Banana')
    })
  })

  describe('disabled state', () => {
    it('disabled prop disables input element', () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput },
        template: `
          <SelectRoot disabled id="disabled-test">
            <SelectInput />
          </SelectRoot>
        `,
      }))

      const input = wrapper.find('input')
      expect(input.attributes('disabled')).toBeDefined()
      expect(input.attributes('aria-disabled')).toBe('true')
    })

    it('disabled prop prevents dropdown from opening on click', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        template: `
          <SelectRoot disabled id="disabled-open-test">
            <SelectInput />
            <SelectContent>
              <SelectOption id="a" value="Apple" label="Apple" />
            </SelectContent>
          </SelectRoot>
        `,
      }))

      const input = wrapper.find('input')
      await input.trigger('mousedown')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    })
  })

  describe('placeholder prop', () => {
    it('placeholder prop renders on input', () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput },
        template: `
          <SelectRoot placeholder="Search..." id="ph-test">
            <SelectInput />
          </SelectRoot>
        `,
      }))

      const input = wrapper.find('input')
      expect(input.attributes('placeholder')).toBe('Search...')
    })
  })

  describe('expose', () => {
    it('expose includes clear and focus methods', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot },
        setup() {
          const selectRef = ref<Record<string, unknown> | null>(null)
          return { selectRef }
        },
        template: '<SelectRoot ref="selectRef" id="expose-test" />',
      }))

      const instance = wrapper.vm.selectRef as Record<string, unknown>
      expect(typeof instance.open).toBe('function')
      expect(typeof instance.close).toBe('function')
      expect(typeof instance.toggle).toBe('function')
      expect(typeof instance.clear).toBe('function')
      expect(typeof instance.focus).toBe('function')
    })
  })

  describe('selectOnTab', () => {
    it('selectOnTab selects highlighted option on Tab', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref<string | null>(null)
          return { value }
        },
        template: `
          <SelectRoot v-model="value" selectOnTab :defaultOpen="true" id="tab-test">
            <SelectInput />
            <SelectContent>
              <SelectOption id="a" value="Apple" label="Apple" />
              <SelectOption id="b" value="Banana" label="Banana" />
            </SelectContent>
          </SelectRoot>
        `,
      }))

      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const input = wrapper.find('input')
      await input.trigger('keydown', { key: 'Tab' })

      expect(wrapper.vm.value).toBe('Apple')
    })
  })

  describe('disabled + open dev warning', () => {
    it('warns in dev when disabled is true and open is true', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      mount(SelectRoot, {
        props: {
          disabled: true,
          open: true,
        },
      })

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cannot force open a disabled component'),
      )

      warnSpy.mockRestore()
    })

    it('does not warn when disabled is false and open is true', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      mount(SelectRoot, {
        props: {
          disabled: false,
          open: true,
        },
      })

      const disabledOpenWarnings = warnSpy.mock.calls.filter(
        (call) => typeof call[0] === 'string' && call[0].includes('Cannot force open'),
      )
      expect(disabledOpenWarnings).toHaveLength(0)

      warnSpy.mockRestore()
    })
  })

  describe('controlled open state via v-model:open', () => {
    it('reflects parent open changes in component', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref<string | null>(null)
          const open = ref(false)
          return { value, open }
        },
        template: `
          <SelectRoot v-model="value" v-model:open="open" id="controlled-open">
            <SelectInput />
            <SelectContent>
              <SelectOption id="a" value="Apple" label="Apple" />
            </SelectContent>
          </SelectRoot>
        `,
      }))

      expect(wrapper.find('[role="listbox"]').exists()).toBe(false)

      wrapper.vm.open = true
      await wrapper.vm.$nextTick()

      expect(wrapper.find('[role="listbox"]').exists()).toBe(true)

      wrapper.vm.open = false
      await wrapper.vm.$nextTick()

      expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    })

    it('emits update:open when component toggles', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref<string | null>(null)
          const open = ref(false)
          return { value, open }
        },
        template: `
          <SelectRoot v-model="value" v-model:open="open" id="controlled-open-emit">
            <SelectInput />
            <SelectContent>
              <SelectOption id="a" value="Apple" label="Apple" />
            </SelectContent>
          </SelectRoot>
        `,
      }))

      const input = wrapper.find('input')
      await input.setValue('')
      expect(wrapper.vm.open).toBe(true)

      await input.trigger('keydown', { key: 'Escape' })
      expect(wrapper.vm.open).toBe(false)
    })
  })

  describe('second Escape clears query', () => {
    it('second Escape clears query after dropdown closes', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref<string | null>(null)
          return { value }
        },
        template: `
          <SelectRoot v-model="value" id="esc2-test">
            <SelectInput />
            <SelectContent>
              <SelectOption id="a" value="Apple" label="Apple" />
            </SelectContent>
          </SelectRoot>
        `,
      }))

      const input = wrapper.find('input')

      await input.setValue('app')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('[role="listbox"]').exists()).toBe(true)

      await input.trigger('keydown', { key: 'Escape' })
      await wrapper.vm.$nextTick()

      expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
      expect(input.element.value).toBe('app')

      await input.trigger('keydown', { key: 'Escape' })
      await wrapper.vm.$nextTick()

      expect(input.element.value).toBe('')
    })
  })
})

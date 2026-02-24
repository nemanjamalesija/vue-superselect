import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { SelectRoot } from './SelectRoot'
import { SelectInput } from './SelectInput'
import { SelectContent } from './SelectContent'
import { SelectOption } from './SelectOption'
import { SelectLiveRegion } from './SelectLiveRegion'
import type { SelectMessages } from './selectTypes'

const options = [
  { id: 'a', value: 'Apple', label: 'Apple' },
  { id: 'b', value: 'Banana', label: 'Banana' },
]

describe('SelectLiveRegion', () => {
  it('announces result count and open/close', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectInput, SelectContent, SelectOption, SelectLiveRegion },
      setup() {
        const value = ref<string | null>(null)
        return { value, options }
      },
      template: `
        <SelectRoot v-model="value" id="select">
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
          <SelectLiveRegion />
        </SelectRoot>
      `,
    }))

    const input = wrapper.find('input')
    await input.setValue('')

    const liveRegion = wrapper.find('[aria-live]')
    expect(liveRegion.text()).toContain('2 results')

    await input.setValue('ap')
    expect(liveRegion.text()).toContain('1 result')

    await input.setValue('')
    expect(liveRegion.text()).toContain('2 results')
  })

  it('announces added and removed items in multi-select mode', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectInput, SelectContent, SelectOption, SelectLiveRegion },
      setup() {
        const value = ref<string[]>([])
        return { value, options }
      },
      template: `
        <SelectRoot v-model="value" multiple id="select">
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
          <SelectLiveRegion />
          <div data-value>{{ JSON.stringify(value) }}</div>
        </SelectRoot>
      `,
    }))

    const input = wrapper.find('input')
    await input.setValue('')

    const optionA = wrapper.find('#select-option-a')
    const optionB = wrapper.find('#select-option-b')
    const liveRegion = wrapper.find('[aria-live]')

    await optionA.trigger('mousedown')
    await optionA.trigger('click')
    expect(liveRegion.text()).toContain('Added Apple')

    await optionB.trigger('mousedown')
    await optionB.trigger('click')
    expect(liveRegion.text()).toContain('Added Banana')

    await optionB.trigger('mousedown')
    await optionB.trigger('click')
    expect(liveRegion.text()).toContain('Removed Banana')
  })

  it('does not announce add/remove strings in single-select mode', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectInput, SelectContent, SelectOption, SelectLiveRegion },
      setup() {
        const value = ref<string | null>(null)
        return { value, options }
      },
      template: `
        <SelectRoot v-model="value" id="select">
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
          <SelectLiveRegion />
        </SelectRoot>
      `,
    }))

    const input = wrapper.find('input')
    await input.setValue('')

    const optionA = wrapper.find('#select-option-a')
    await optionA.trigger('mousedown')
    await optionA.trigger('click')

    const liveRegion = wrapper.find('[aria-live]')
    expect(liveRegion.text()).not.toContain('Added')
    expect(liveRegion.text()).not.toContain('Removed')
  })

  it('uses resolveLabel when announcing removals with unmounted options', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectLiveRegion },
      setup() {
        const value = ref<string[]>(['a'])
        const resolveLabel = (selectedValue: unknown) =>
          String(selectedValue) === 'a' ? 'Apple' : undefined

        return { value, resolveLabel }
      },
      template: `
        <SelectRoot
          v-model="value"
          multiple
          id="select"
          :resolveLabel="resolveLabel"
        >
          <SelectLiveRegion />
        </SelectRoot>
      `,
    }))

    const liveRegion = wrapper.find('[aria-live]')

    wrapper.vm.value = []
    await wrapper.vm.$nextTick()

    expect(liveRegion.text()).toContain('Removed Apple')
  })

  describe('i18n messages prop', () => {
    it('uses default English messages when no messages prop', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectLiveRegion },
        setup() {
          const value = ref<string | null>(null)
          const selectRef = ref<{ open: () => void; close: () => void } | null>(null)
          return { value, selectRef }
        },
        template: `
          <SelectRoot v-model="value" ref="selectRef" id="i18n-default">
            <SelectLiveRegion />
          </SelectRoot>
        `,
      }))

      const liveRegion = wrapper.find('[aria-live]')
      const instance = wrapper.vm.selectRef as { open: () => void; close: () => void }

      instance.open()
      await wrapper.vm.$nextTick()
      expect(liveRegion.text()).toBe('List expanded')

      instance.close()
      await wrapper.vm.$nextTick()
      expect(liveRegion.text()).toBe('List collapsed')
    })

    it('uses custom listExpanded and listCollapsed messages', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectLiveRegion },
        setup() {
          const value = ref<string | null>(null)
          const selectRef = ref<{ open: () => void; close: () => void } | null>(null)
          const messages: Partial<SelectMessages> = {
            listExpanded: () => 'Menu ouvert',
            listCollapsed: () => 'Menu ferme',
          }
          return { value, selectRef, messages }
        },
        template: `
          <SelectRoot v-model="value" ref="selectRef" id="i18n-expand">
            <SelectLiveRegion :messages="messages" />
          </SelectRoot>
        `,
      }))

      const liveRegion = wrapper.find('[aria-live]')
      const instance = wrapper.vm.selectRef as { open: () => void; close: () => void }

      instance.open()
      await wrapper.vm.$nextTick()
      expect(liveRegion.text()).toBe('Menu ouvert')

      instance.close()
      await wrapper.vm.$nextTick()
      expect(liveRegion.text()).toBe('Menu ferme')
    })

    it('uses custom resultsCount message', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption, SelectLiveRegion },
        setup() {
          const value = ref<string | null>(null)
          const messages: Partial<SelectMessages> = {
            resultsCount: (n: number) => `${n} Ergebnisse`,
          }
          return { value, options, messages }
        },
        template: `
          <SelectRoot v-model="value" :defaultOpen="true" id="i18n-count">
            <SelectInput aria-label="Select" />
            <SelectContent>
              <SelectOption
                v-for="opt in options"
                :key="opt.id"
                :id="opt.id"
                :value="opt.value"
                :label="opt.label"
              />
            </SelectContent>
            <SelectLiveRegion :messages="messages" />
          </SelectRoot>
        `,
      }))

      await wrapper.vm.$nextTick()

      const liveRegion = wrapper.find('[aria-live]')
      expect(liveRegion.text()).toContain('2 Ergebnisse')
    })

    it('uses custom itemAdded message in multi-select', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption, SelectLiveRegion },
        setup() {
          const value = ref<string[]>([])
          const messages: Partial<SelectMessages> = {
            itemAdded: (label: string) => `Ajout: ${label}`,
          }
          return { value, options, messages }
        },
        template: `
          <SelectRoot v-model="value" multiple id="i18n-added">
            <SelectInput aria-label="Select" />
            <SelectContent>
              <SelectOption
                v-for="opt in options"
                :key="opt.id"
                :id="opt.id"
                :value="opt.value"
                :label="opt.label"
              />
            </SelectContent>
            <SelectLiveRegion :messages="messages" />
          </SelectRoot>
        `,
      }))

      const input = wrapper.find('input')
      await input.setValue('')

      const optionA = wrapper.find('#i18n-added-option-a')
      await optionA.trigger('mousedown')
      await optionA.trigger('click')

      const liveRegion = wrapper.find('[aria-live]')
      expect(liveRegion.text()).toContain('Ajout: Apple')
    })

    it('uses custom itemRemoved message in multi-select', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption, SelectLiveRegion },
        setup() {
          const value = ref<string[]>([])
          const messages: Partial<SelectMessages> = {
            itemRemoved: (label: string) => `Retir: ${label}`,
          }
          return { value, options, messages }
        },
        template: `
          <SelectRoot v-model="value" multiple id="i18n-removed">
            <SelectInput aria-label="Select" />
            <SelectContent>
              <SelectOption
                v-for="opt in options"
                :key="opt.id"
                :id="opt.id"
                :value="opt.value"
                :label="opt.label"
              />
            </SelectContent>
            <SelectLiveRegion :messages="messages" />
          </SelectRoot>
        `,
      }))

      const input = wrapper.find('input')
      await input.setValue('')

      const optionA = wrapper.find('#i18n-removed-option-a')
      await optionA.trigger('mousedown')
      await optionA.trigger('click')

      await optionA.trigger('mousedown')
      await optionA.trigger('click')

      const liveRegion = wrapper.find('[aria-live]')
      expect(liveRegion.text()).toContain('Retir: Apple')
    })

    it('partial messages merge with defaults', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption, SelectLiveRegion },
        setup() {
          const value = ref<string | null>(null)
          const messages: Partial<SelectMessages> = {
            listExpanded: () => 'Ouverte',
          }
          return { value, options, messages }
        },
        template: `
          <SelectRoot v-model="value" :defaultOpen="true" id="i18n-partial">
            <SelectInput aria-label="Select" />
            <SelectContent>
              <SelectOption
                v-for="opt in options"
                :key="opt.id"
                :id="opt.id"
                :value="opt.value"
                :label="opt.label"
              />
            </SelectContent>
            <SelectLiveRegion :messages="messages" />
          </SelectRoot>
        `,
      }))

      await wrapper.vm.$nextTick()

      const liveRegion = wrapper.find('[aria-live]')
      // The resultsCount should still use English default since only listExpanded was overridden
      expect(liveRegion.text()).toContain('2 result')
    })

    it('messages are reactive -- changing prop updates announcements', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption, SelectLiveRegion },
        setup() {
          const value = ref<string | null>(null)
          const messages = ref<Partial<SelectMessages>>({
            resultsCount: (n: number) => `${n} resultats`,
          })
          return { value, options, messages }
        },
        template: `
          <SelectRoot v-model="value" :defaultOpen="true" id="i18n-reactive">
            <SelectInput aria-label="Select" />
            <SelectContent>
              <SelectOption
                v-for="opt in options"
                :key="opt.id"
                :id="opt.id"
                :value="opt.value"
                :label="opt.label"
              />
            </SelectContent>
            <SelectLiveRegion :messages="messages" />
          </SelectRoot>
        `,
      }))

      await wrapper.vm.$nextTick()

      const liveRegion = wrapper.find('[aria-live]')
      expect(liveRegion.text()).toBe('2 resultats')

      // Change the messages prop
      wrapper.vm.messages = {
        resultsCount: (n: number) => `${n} Ergebnisse`,
      }
      await wrapper.vm.$nextTick()

      // Type to change the filter count, triggering resultsCount with new messages
      const input = wrapper.find('input')
      await input.setValue('ap')

      expect(liveRegion.text()).toBe('1 Ergebnisse')
    })
  })
})

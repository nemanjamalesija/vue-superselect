<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import {
  SelectRoot,
  SelectInput,
  SelectContent,
  SelectOption,
  SelectControl,
  SelectTrigger,
  SelectEmpty,
  SelectLiveRegion,
  useFloating,
} from 'vue-superselect'

/**
 * Example: Phase 5 positioning controls.
 *
 * Why this exists:
 * - Demonstrates `placement` and `forceAbsolute` on SelectContent.
 * - Shows `data-side` and `data-align` output for CSS targeting.
 * - Makes fallback vs smart positioning behavior easy to compare.
 */

type FrameworkOption = {
  id: string
  label: string
}

const options: FrameworkOption[] = [
  { id: 'vue', label: 'Vue' },
  { id: 'react', label: 'React' },
  { id: 'svelte', label: 'Svelte' },
  { id: 'solid', label: 'Solid' },
  { id: 'lit', label: 'Lit' },
  { id: 'alpine', label: 'Alpine' },
  { id: 'ember', label: 'Ember' },
  { id: 'qwik', label: 'Qwik' },
]

const placementOptions = [
  { value: 'bottom-start', label: 'bottom-start' },
  { value: 'bottom', label: 'bottom' },
  { value: 'bottom-end', label: 'bottom-end' },
  { value: 'top-start', label: 'top-start' },
  { value: 'top', label: 'top' },
  { value: 'top-end', label: 'top-end' },
  { value: 'right-start', label: 'right-start' },
  { value: 'right', label: 'right' },
  { value: 'right-end', label: 'right-end' },
  { value: 'left-start', label: 'left-start' },
  { value: 'left', label: 'left' },
  { value: 'left-end', label: 'left-end' },
]

const value = ref<string | null>('vue')
const open = ref(false)
const placement = ref('bottom-start')
const collisionStrategy = ref<'flip' | 'none'>('flip')
const forceAbsolute = ref(false)
const wideContent = ref(true)

const floatingProbeReference = ref<HTMLElement | null>(null)
const floatingProbeElement = ref<HTMLElement | null>(null)
const { isUsingFloatingUI: floatingUiAvailable } = useFloating({
  reference: floatingProbeReference,
  floating: floatingProbeElement,
})

const sideAttr = ref('closed')
const alignAttr = ref('closed')

const rootId = 'playground-phase5-placement'
const listboxId = `${rootId}-listbox`

const selectedLabel = computed(() => {
  const selected = options.find((option) => option.id === value.value)
  return selected?.label ?? 'Pick a framework'
})

const modeLabel = computed(() => (
  forceAbsolute.value
    ? 'CSS absolute fallback'
    : collisionStrategy.value === 'none'
      ? 'Floating UI (fixed at placement)'
      : 'Floating UI (flip + shift)'
))
const contentInstanceKey = computed(
  () => `${placement.value}-${collisionStrategy.value}-${forceAbsolute.value ? 'absolute' : 'floating'}-${wideContent.value ? 'wide' : 'normal'}`,
)

const syncPlacementAttrs = async () => {
  await nextTick()

  const listbox = document.getElementById(listboxId)
  if (!(listbox instanceof HTMLElement)) {
    sideAttr.value = 'closed'
    alignAttr.value = 'closed'
    return
  }

  sideAttr.value = listbox.dataset.side ?? 'missing'
  alignAttr.value = listbox.dataset.align ?? 'missing'
}

watch([open, placement, collisionStrategy, forceAbsolute, wideContent], () => {
  void syncPlacementAttrs()
}, { flush: 'post' })

onMounted(() => {
  void syncPlacementAttrs()
})
</script>

<template>
  <section class="card">
    <header>
      <h2>Phase 5: placement and fallback mode</h2>
      <p>
        Change <code>placement</code> and toggle <code>forceAbsolute</code> to
        compare smart positioning vs CSS fallback.
      </p>
    </header>

    <div class="toolbar">
      <label class="stacked-label">
        placement
        <select v-model="placement" class="select-field">
          <option
            v-for="option in placementOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </label>

      <label class="toggle">
        collision
        <select v-model="collisionStrategy" class="select-field">
          <option value="flip">auto (flip + shift)</option>
          <option value="none">fixed placement (no collision)</option>
        </select>
      </label>

      <label class="toggle">
        <input v-model="wideContent" type="checkbox">
        wider content (shows start/end)
      </label>

      <label class="toggle">
        <input v-model="forceAbsolute" type="checkbox">
        forceAbsolute
      </label>

      <button type="button" class="pill" @click="open = !open">
        {{ open ? 'Close' : 'Open' }} dropdown
      </button>
    </div>

    <div class="positioning-anchor">
      <SelectRoot :id="rootId" v-model="value" v-model:open="open">
        <SelectControl class="control">
          <SelectInput class="input" placeholder="Search frameworks" />
          <SelectTrigger class="trigger">{{ selectedLabel }}</SelectTrigger>
        </SelectControl>

        <SelectContent
          :key="contentInstanceKey"
          :placement="placement"
          :collision-strategy="collisionStrategy"
          :force-absolute="forceAbsolute"
          :class="['content phase5-content', { 'phase5-content-wide': wideContent }]"
        >
          <SelectOption
            v-for="option in options"
            :id="`phase5-placement-${option.id}`"
            :key="option.id"
            :value="option.id"
            :label="option.label"
            class="option"
          >
            {{ option.label }}
          </SelectOption>

          <SelectEmpty class="empty">No framework found</SelectEmpty>
        </SelectContent>

        <SelectLiveRegion />
      </SelectRoot>
    </div>

    <p class="note">
      This listbox uses <code>data-side</code> and <code>data-align</code> for
      visual cues. Set collision to <code>none</code> to keep content fixed to
      the chosen placement even near viewport edges.
    </p>
    <p v-if="!floatingUiAvailable" class="note warning-note">
      <code>@floating-ui/vue</code> is not installed in this workspace, so both
      modes use CSS fallback positioning.
    </p>

    <div class="meta">
      <div>Mode: {{ modeLabel }}</div>
      <div>Placement prop: {{ placement }}</div>
      <div>collisionStrategy: {{ collisionStrategy }}</div>
      <div>data-side: {{ sideAttr }}</div>
      <div>data-align: {{ alignAttr }}</div>
      <div>Open: {{ open }}</div>
    </div>
  </section>
</template>

<style scoped>
.stacked-label {
  display: inline-grid;
  gap: 4px;
  font-size: 0.88rem;
  color: var(--muted);
}

.select-field {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
  font-family: inherit;
  font-size: 0.9rem;
  padding: 6px 10px;
}

.positioning-anchor {
  position: relative;
  min-height: 320px;
  border: 1px dashed var(--border);
  border-radius: 12px;
  background: repeating-linear-gradient(
    135deg,
    #ffffff,
    #ffffff 10px,
    #fbfbfb 10px,
    #fbfbfb 20px
  );
  display: grid;
  place-items: center;
}

.positioning-anchor .control {
  width: 320px;
}

.phase5-content {
  margin-top: 0;
  width: var(--superselect-trigger-width, 100%);
  min-width: var(--superselect-trigger-width, 100%);
  max-height: min(260px, var(--superselect-content-available-height, 260px));
  overflow-y: auto;
}

.phase5-content-wide {
  width: calc(var(--superselect-trigger-width, 100%) + 120px);
}

.phase5-content[data-side='top'] {
  border-color: #0b6cff;
  box-shadow: inset 0 -2px 0 rgba(11, 108, 255, 0.32);
}

.phase5-content[data-side='bottom'] {
  box-shadow: inset 0 2px 0 rgba(11, 108, 255, 0.22);
}

.phase5-content[data-align='end'] {
  background: linear-gradient(180deg, #ffffff, #f9fbff);
}

.warning-note {
  color: #9b4d00;
}
</style>

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
 * Example: Teleport behavior in constrained layouts.
 *
 * Why this exists:
 * - Demonstrates `teleport` modes added in Phase 5.
 * - Shows inline clipping inside `overflow: hidden`.
 * - Shows body/custom-target rendering for overflow escape.
 */

type RegionOption = {
  id: string
  label: string
}

type TeleportMode = 'inline' | 'body' | 'custom'

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

const options: RegionOption[] = [
  { id: 'na', label: 'North America' },
  { id: 'sa', label: 'South America' },
  { id: 'eu', label: 'Europe' },
  { id: 'af', label: 'Africa' },
  { id: 'as', label: 'Asia' },
  { id: 'oc', label: 'Oceania' },
  { id: 'me', label: 'Middle East' },
  { id: 'ca', label: 'Central Asia' },
  { id: 'an', label: 'Antarctica' },
]

const value = ref<string | null>(null)
const open = ref(false)
const teleportMode = ref<TeleportMode>('inline')
const placement = ref('bottom-start')
const collisionStrategy = ref<'flip' | 'none'>('flip')

const floatingProbeReference = ref<HTMLElement | null>(null)
const floatingProbeElement = ref<HTMLElement | null>(null)
const { isUsingFloatingUI: floatingUiAvailable } = useFloating({
  reference: floatingProbeReference,
  floating: floatingProbeElement,
})

const rootId = 'playground-phase5-teleport'
const listboxId = `${rootId}-listbox`
const customTargetSelector = '#phase5-teleport-target'

const teleportProp = computed<boolean | string>(() => {
  if (teleportMode.value === 'inline') return false
  if (teleportMode.value === 'body') return true
  return customTargetSelector
})

const teleportContentClass = computed(() => {
  if (teleportMode.value === 'inline') return 'teleport-content-inline'
  if (teleportMode.value === 'body') return 'teleport-content-body'
  return 'teleport-content-custom'
})

const forceAbsoluteInCustomMode = computed(() => teleportMode.value === 'custom')
const contentInstanceKey = computed(
  () => `${teleportMode.value}-${placement.value}-${collisionStrategy.value}-${forceAbsoluteInCustomMode.value ? 'absolute' : 'floating'}`,
)

const selectedLabel = computed(() => {
  const selected = options.find((option) => option.id === value.value)
  return selected?.label ?? 'Pick a region'
})

const mountLocation = ref('closed')
const parentNodeLabel = ref('closed')
const bodyHasListbox = ref(false)
const customTargetHasListbox = ref(false)

const modeExplanation = computed(() => {
  if (teleportMode.value === 'inline') {
    return 'Inline mode: no teleport. Content stays in the overflow frame and can clip.'
  }

  if (teleportMode.value === 'body') {
    return collisionStrategy.value === 'none'
      ? 'Body mode: content is teleported to <body> and locked to the chosen placement (no collision flip/shift).'
      : 'Body mode: content is teleported to <body> and remains positioned by Floating UI near the input.'
  }

  return 'Custom mode: content is teleported to #phase5-teleport-target and this demo enables forceAbsolute, so it is positioned relative to that target panel (different location).'
})

const syncMountLocation = async () => {
  await nextTick()

  const target = document.querySelector(customTargetSelector)
  const listbox = document.getElementById(listboxId)
  if (!(listbox instanceof HTMLElement)) {
    mountLocation.value = 'closed'
    parentNodeLabel.value = 'closed'
    bodyHasListbox.value = false
    customTargetHasListbox.value = false
    return
  }

  const parent = listbox.parentElement
  parentNodeLabel.value = parent
    ? `${parent.tagName.toLowerCase()}${parent.id ? `#${parent.id}` : ''}`
    : 'none'
  bodyHasListbox.value = parent === document.body
  customTargetHasListbox.value = target instanceof HTMLElement
    ? target.contains(listbox)
    : false

  if (listbox.closest(customTargetSelector)) {
    mountLocation.value = 'custom target'
    return
  }

  if (listbox.parentElement === document.body) {
    mountLocation.value = 'body'
    return
  }

  mountLocation.value = 'inline container'
}

watch([open, teleportMode, placement, collisionStrategy], () => {
  void syncMountLocation()
}, { flush: 'post' })

onMounted(() => {
  void syncMountLocation()
})

const resetDemo = () => {
  teleportMode.value = 'inline'
  placement.value = 'bottom-start'
  collisionStrategy.value = 'flip'
  value.value = null
  open.value = false
}
</script>

<template>
  <section class="card">
    <header>
      <h2>Phase 5: teleport and overflow escape</h2>
      <p>
        The select sits near the bottom of an <code>overflow: hidden</code>
        frame. Switch teleport mode to compare clipping behavior.
      </p>
    </header>

    <div class="toolbar">
      <label class="stacked-label">
        teleport
        <select v-model="teleportMode" class="select-field">
          <option value="inline">false (inline)</option>
          <option value="body">true (body)</option>
          <option value="custom">#phase5-teleport-target</option>
        </select>
      </label>

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

      <label class="stacked-label">
        collision
        <select v-model="collisionStrategy" class="select-field">
          <option value="flip">auto (flip + shift)</option>
          <option value="none">fixed placement (no collision)</option>
        </select>
      </label>

      <button type="button" class="pill" @click="resetDemo">
        Reset demo
      </button>
    </div>

    <p class="note mode-note">{{ modeExplanation }}</p>
    <p class="note legend-note">
      Legend: <span class="chip chip-inline">inline</span>
      <span class="chip chip-body">body</span>
      <span class="chip chip-custom">custom</span>.
      Body and custom can stay in the same visual spot while still having
      different DOM parents.
    </p>

    <div class="clip-frame">
      <p class="frame-label">Overflow frame (content clips when inline)</p>
      <div class="clip-anchor">
        <SelectRoot :id="rootId" v-model="value" v-model:open="open">
          <SelectControl class="control">
            <SelectInput class="input" placeholder="Search regions" />
            <SelectTrigger class="trigger">{{ selectedLabel }}</SelectTrigger>
          </SelectControl>

          <SelectContent
            :key="contentInstanceKey"
            :teleport="teleportProp"
            :placement="placement"
            :collision-strategy="collisionStrategy"
            :force-absolute="forceAbsoluteInCustomMode"
            :class="['content teleport-content', teleportContentClass]"
          >
            <SelectOption
              v-for="option in options"
              :id="`phase5-teleport-${option.id}`"
              :key="option.id"
              :value="option.id"
              :label="option.label"
              class="option"
            >
              {{ option.label }}
            </SelectOption>

            <SelectEmpty class="empty">No region found</SelectEmpty>
          </SelectContent>

          <SelectLiveRegion />
        </SelectRoot>
      </div>
    </div>

    <section
      id="phase5-teleport-target"
      :class="['portal-target', { 'portal-target-active': customTargetHasListbox }]"
    >
      <h3>Custom teleport target</h3>
      <p class="note">
        When teleport mode uses a selector, the listbox mounts in this section.
        In this demo, custom mode also sets <code>forceAbsolute=true</code> so
        position follows this panel instead of the input.
      </p>
      <p class="probe">
        Contains listbox now: <strong>{{ customTargetHasListbox ? 'yes' : 'no' }}</strong>
      </p>
    </section>

    <div class="meta">
      <div>teleport prop: {{ teleportProp === false ? 'false' : teleportProp === true ? 'true' : teleportProp }}</div>
      <div>placement: {{ placement }}</div>
      <div>collisionStrategy: {{ collisionStrategy }}</div>
      <div>forceAbsolute (demo): {{ forceAbsoluteInCustomMode }}</div>
      <div>Mounted in: {{ mountLocation }}</div>
      <div>Parent node: {{ parentNodeLabel }}</div>
      <div>Body contains listbox: {{ bodyHasListbox }}</div>
      <div>Open: {{ open }}</div>
      <div>Value: {{ value ?? 'null' }}</div>
    </div>

    <p v-if="!floatingUiAvailable" class="note warning-note">
      <code>@floating-ui/vue</code> is not installed in this workspace, so body
      teleport uses CSS fallback positioning.
    </p>
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

.clip-frame {
  margin-top: 8px;
  border: 1px dashed var(--border);
  border-radius: 12px;
  height: 220px;
  overflow: hidden;
  position: relative;
  background: repeating-linear-gradient(
    135deg,
    #ffffff,
    #ffffff 8px,
    #fbfbfb 8px,
    #fbfbfb 16px
  );
}

.mode-note {
  margin-top: 8px;
}

.frame-label {
  margin: 0;
  padding: 10px 12px;
  font-size: 0.85rem;
  color: var(--muted);
  border-bottom: 1px dashed var(--border);
}

.clip-anchor {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 12px;
}

.teleport-content {
  margin-top: 0;
  min-width: var(--superselect-trigger-width, 100%);
  max-height: min(220px, var(--superselect-content-available-height, 220px));
  overflow-y: auto;
}

.legend-note {
  margin-top: 6px;
}

.chip {
  display: inline-block;
  border-radius: 999px;
  padding: 2px 8px;
  margin: 0 3px;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1px solid transparent;
}

.chip-inline {
  background: #f3f3f3;
  border-color: #d7d7d7;
}

.chip-body {
  background: rgba(11, 108, 255, 0.12);
  border-color: rgba(11, 108, 255, 0.4);
}

.chip-custom {
  background: rgba(255, 138, 0, 0.15);
  border-color: rgba(255, 138, 0, 0.45);
}

:deep(.teleport-content-inline) {
  border: 1px solid #cfcfcf;
}

:deep(.teleport-content-body) {
  border: 2px solid #0b6cff;
  box-shadow: 0 0 0 2px rgba(11, 108, 255, 0.12);
}

:deep(.teleport-content-custom) {
  border: 2px solid #ff8a00;
  box-shadow: 0 0 0 2px rgba(255, 138, 0, 0.16);
}

.portal-target {
  margin-top: 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  padding: 12px;
  min-height: 170px;
  position: relative;
  overflow: visible;
}

.portal-target-active {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-soft);
}

.portal-target h3 {
  margin: 0 0 6px;
}

.probe {
  margin: 8px 0 0;
  font-size: 0.88rem;
  color: var(--muted);
}

.warning-note {
  color: #9b4d00;
  margin-top: 12px;
}
</style>

<style>
/* Demonstration-only: keep visual distinction obvious with border only. */
.teleport-content.teleport-content-body {
  border: 2px solid #0b6cff !important;
}

#phase5-teleport-target .teleport-content.teleport-content-custom {
  border: 2px solid #ff8a00 !important;
  top: calc(100% + 8px) !important;
  left: 0 !important;
  transform: none !important;
  width: 100% !important;
  max-height: 180px !important;
}
</style>
